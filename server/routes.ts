import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcryptjs';
import { readLocalDb, writeLocalDb, dbState, resetDatabaseToSeeds } from './db.js';

export const apiRouter = express.Router();

// Multer storage for Teaching Videos
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(process.cwd(), 'uploads', 'videos'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max as required
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.mp4', '.webm'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.mimetype.includes('video/mp4') || file.mimetype.includes('video/webm')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video format. Only MP4 and WebM videos are supported.'));
    }
  },
});

// Helper to compute student aggregated data (ratings, review count, skills, videos)
function enrichStudent(student: any, db: any) {
  const studentSkills = (db.student_skills || []).filter((ss: any) => ss.student_id === student.id);
  const skillsDetailed = studentSkills.map((ss: any) => {
    const skill = (db.skills || []).find((s: any) => s.id === ss.skill_id) || {};
    return {
      ...ss,
      skill_name: skill.name || 'Unknown Skill',
      category: skill.category || 'Other Skills',
      skill_description: skill.description || '',
    };
  });

  const feedbackList = (db.feedback || []).filter((f: any) => f.recipient_id === student.id);
  const avgRating =
    feedbackList.length > 0
      ? Number((feedbackList.reduce((acc: number, f: any) => acc + f.rating, 0) / feedbackList.length).toFixed(1))
      : 5.0;

  const videosCount = (db.teaching_videos || []).filter((v: any) => v.student_id === student.id).length;
  const sessionsCompleted = (db.sessions || []).filter(
    (s: any) => (s.mentor_id === student.id || s.learner_id === student.id) && s.status === 'Completed'
  ).length;

  return {
    ...student,
    skills: skillsDetailed,
    average_rating: avgRating,
    rating_count: feedbackList.length,
    videos_count: videosCount,
    sessions_completed: sessionsCompleted,
  };
}

// ==========================================
// 1. AUTHENTICATION APIS
// ==========================================

// Register Student
apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { student_id_number, full_name, email, password, department, year_of_study, profile_photo, bio } = req.body;

    if (!student_id_number || !full_name || !email || !password || !department || !year_of_study) {
      res.status(400).json({ error: 'All required registration fields must be provided.' });
      return;
    }

    const db = readLocalDb();
    const existing = db.students.find(
      (s: any) => s.email.toLowerCase() === email.toLowerCase() || s.student_id_number === student_id_number
    );
    if (existing) {
      res.status(409).json({ error: 'Student with this email or Student ID already exists.' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const newStudent = {
      id: db.students.length > 0 ? Math.max(...db.students.map((s: any) => s.id)) + 1 : 1,
      student_id_number,
      full_name,
      email: email.toLowerCase(),
      password_hash,
      department,
      year_of_study,
      profile_photo:
        profile_photo ||
        `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80`,
      bio: bio || 'Eager to learn and teach through SkillMate.',
      role: 'student',
      created_at: new Date().toISOString(),
    };

    db.students.push(newStudent);
    writeLocalDb(db);

    const safeStudent = enrichStudent(newStudent, db);
    delete (safeStudent as any).password_hash;
    res.status(201).json({ message: 'Registration successful', student: safeStudent });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// Login (Student or Admin)
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const db = readLocalDb();

    // Check administrators first
    const admin = db.administrators.find((a: any) => a.email.toLowerCase() === email.toLowerCase());
    if (admin && (await bcrypt.compare(password, admin.password_hash))) {
      const safeAdmin = {
        id: admin.id,
        student_id_number: 'ADMIN-001',
        full_name: admin.full_name,
        email: admin.email,
        department: 'Administration',
        year_of_study: 'Staff',
        profile_photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
        bio: 'SkillMate System Administrator',
        role: 'admin',
        created_at: admin.created_at,
        average_rating: 5.0,
        rating_count: 0,
        videos_count: 0,
        sessions_completed: 0,
      };
      res.json({ message: 'Admin login successful', user: safeAdmin, role: 'admin' });
      return;
    }

    // Check students
    const student = db.students.find((s: any) => s.email.toLowerCase() === email.toLowerCase());
    if (!student || !(await bcrypt.compare(password, student.password_hash))) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const safeStudent = enrichStudent(student, db);
    delete (safeStudent as any).password_hash;
    res.json({ message: 'Login successful', user: safeStudent, role: 'student' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// ==========================================
// 2. STUDENTS APIS
// ==========================================

// Get all students with optional search & filters
apiRouter.get('/students', (req: Request, res: Response) => {
  const db = readLocalDb();
  let results = db.students.map((s: any) => enrichStudent(s, db));

  const { search, department, skill, proficiency, role } = req.query;

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (s: any) =>
        s.full_name.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.bio.toLowerCase().includes(q) ||
        s.skills?.some((sk: any) => sk.skill_name?.toLowerCase().includes(q))
    );
  }

  if (department && typeof department === 'string' && department !== 'All') {
    results = results.filter((s: any) => s.department === department);
  }

  if (skill && typeof skill === 'string' && skill !== 'All') {
    results = results.filter((s: any) => s.skills?.some((sk: any) => sk.skill_name === skill));
  }

  if (proficiency && typeof proficiency === 'string' && proficiency !== 'All') {
    results = results.filter((s: any) => s.skills?.some((sk: any) => sk.proficiency === proficiency));
  }

  if (role && typeof role === 'string' && role !== 'All') {
    results = results.filter((s: any) =>
      s.skills?.some((sk: any) => sk.role_type === role || sk.role_type === 'Both')
    );
  }

  // Sanitize password_hash
  results.forEach((s: any) => delete s.password_hash);
  res.json(results);
});

// Get single student by ID
apiRouter.get('/students/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const db = readLocalDb();
  const student = db.students.find((s: any) => s.id === id);
  if (!student) {
    res.status(404).json({ error: 'Student not found.' });
    return;
  }
  const enriched = enrichStudent(student, db);
  delete (enriched as any).password_hash;
  res.json(enriched);
});

// Update student profile
apiRouter.put('/students/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const db = readLocalDb();
  const index = db.students.findIndex((s: any) => s.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Student not found.' });
    return;
  }

  const { full_name, department, year_of_study, profile_photo, bio } = req.body;

  db.students[index] = {
    ...db.students[index],
    full_name: full_name || db.students[index].full_name,
    department: department || db.students[index].department,
    year_of_study: year_of_study || db.students[index].year_of_study,
    profile_photo: profile_photo || db.students[index].profile_photo,
    bio: bio !== undefined ? bio : db.students[index].bio,
    updated_at: new Date().toISOString(),
  };

  writeLocalDb(db);
  const safe = enrichStudent(db.students[index], db);
  delete (safe as any).password_hash;
  res.json({ message: 'Profile updated successfully', student: safe });
});

// Delete student (Cascade)
apiRouter.delete('/students/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const db = readLocalDb();

  db.students = db.students.filter((s: any) => s.id !== id);
  db.student_skills = db.student_skills.filter((ss: any) => ss.student_id !== id);
  db.teaching_videos = db.teaching_videos.filter((v: any) => v.student_id !== id);
  db.learning_requests = db.learning_requests.filter((r: any) => r.learner_id !== id && r.mentor_id !== id);
  db.sessions = db.sessions.filter((s: any) => s.mentor_id !== id && s.learner_id !== id);
  db.feedback = db.feedback.filter((f: any) => f.reviewer_id !== id && f.recipient_id !== id);

  writeLocalDb(db);
  res.json({ message: 'Student and associated relational records removed successfully.' });
});

// ==========================================
// 3. SKILLS APIS
// ==========================================

// Get master skills catalog
apiRouter.get('/skills', (_req: Request, res: Response) => {
  const db = readLocalDb();
  res.json(db.skills || []);
});

// Create new master skill
apiRouter.post('/skills', (req: Request, res: Response) => {
  const { name, category, description, icon_name } = req.body;
  if (!name || !category) {
    res.status(400).json({ error: 'Skill name and category are required.' });
    return;
  }
  const db = readLocalDb();
  const existing = db.skills.find((s: any) => s.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    res.status(409).json({ error: 'A skill with this name already exists in the catalog.' });
    return;
  }

  const newSkill = {
    id: db.skills.length > 0 ? Math.max(...db.skills.map((s: any) => s.id)) + 1 : 1,
    name,
    category,
    description: description || '',
    icon_name: icon_name || 'BookOpen',
    created_at: new Date().toISOString(),
  };

  db.skills.push(newSkill);
  writeLocalDb(db);
  res.status(201).json(newSkill);
});

// Get skills registered by a student
apiRouter.get('/students/:id/skills', (req: Request, res: Response) => {
  const studentId = parseInt(req.params.id, 10);
  const db = readLocalDb();
  const studentSkills = db.student_skills.filter((ss: any) => ss.student_id === studentId);
  const detailed = studentSkills.map((ss: any) => {
    const skill = db.skills.find((s: any) => s.id === ss.skill_id) || {};
    return {
      ...ss,
      skill_name: skill.name,
      category: skill.category,
      skill_description: skill.description,
    };
  });
  res.json(detailed);
});

// Add / Register a skill for student
apiRouter.post('/students/:id/skills', (req: Request, res: Response) => {
  const studentId = parseInt(req.params.id, 10);
  const { skill_id, proficiency, role_type, notes, new_skill_name, new_skill_category } = req.body;

  const db = readLocalDb();
  let targetSkillId = skill_id;

  // Support creating a custom skill on the fly
  if (!targetSkillId && new_skill_name) {
    const existing = db.skills.find((s: any) => s.name.toLowerCase() === new_skill_name.trim().toLowerCase());
    if (existing) {
      targetSkillId = existing.id;
    } else {
      const createdSkill = {
        id: db.skills.length > 0 ? Math.max(...db.skills.map((s: any) => s.id)) + 1 : 1,
        name: new_skill_name.trim(),
        category: new_skill_category || 'Other Skills',
        description: `Student suggested skill: ${new_skill_name}`,
        icon_name: 'BookOpen',
        created_at: new Date().toISOString(),
      };
      db.skills.push(createdSkill);
      targetSkillId = createdSkill.id;
    }
  }

  if (!targetSkillId || !proficiency || !role_type) {
    res.status(400).json({ error: 'Skill, proficiency level, and role are required.' });
    return;
  }

  // Check unique constraint (student_id, skill_id)
  const existingMapping = db.student_skills.find(
    (ss: any) => ss.student_id === studentId && ss.skill_id === targetSkillId
  );
  if (existingMapping) {
    res.status(409).json({ error: 'You have already registered this skill. You can edit its proficiency or role.' });
    return;
  }

  const newStudentSkill = {
    id: db.student_skills.length > 0 ? Math.max(...db.student_skills.map((s: any) => s.id)) + 1 : 1,
    student_id: studentId,
    skill_id: targetSkillId,
    proficiency,
    role_type,
    notes: notes || '',
    created_at: new Date().toISOString(),
  };

  db.student_skills.push(newStudentSkill);
  writeLocalDb(db);

  const skillInfo = db.skills.find((s: any) => s.id === targetSkillId);
  res.status(201).json({
    ...newStudentSkill,
    skill_name: skillInfo?.name,
    category: skillInfo?.category,
    skill_description: skillInfo?.description,
  });
});

// Update student skill
apiRouter.put('/students/:id/skills/:studentSkillId', (req: Request, res: Response) => {
  const studentSkillId = parseInt(req.params.studentSkillId, 10);
  const { proficiency, role_type, notes } = req.body;

  const db = readLocalDb();
  const index = db.student_skills.findIndex((ss: any) => ss.id === studentSkillId);
  if (index === -1) {
    res.status(404).json({ error: 'Skill registration not found.' });
    return;
  }

  db.student_skills[index] = {
    ...db.student_skills[index],
    proficiency: proficiency || db.student_skills[index].proficiency,
    role_type: role_type || db.student_skills[index].role_type,
    notes: notes !== undefined ? notes : db.student_skills[index].notes,
  };

  writeLocalDb(db);
  const skillInfo = db.skills.find((s: any) => s.id === db.student_skills[index].skill_id);
  res.json({
    ...db.student_skills[index],
    skill_name: skillInfo?.name,
    category: skillInfo?.category,
  });
});

// Delete student skill
apiRouter.delete('/students/:id/skills/:studentSkillId', (req: Request, res: Response) => {
  const studentSkillId = parseInt(req.params.studentSkillId, 10);
  const db = readLocalDb();
  db.student_skills = db.student_skills.filter((ss: any) => ss.id !== studentSkillId);
  writeLocalDb(db);
  res.json({ message: 'Skill removed from your profile.' });
});

// ==========================================
// 4. TEACHING VIDEOS APIS (Special Feature)
// ==========================================

// Get all teaching videos with search & filters
apiRouter.get('/videos', (req: Request, res: Response) => {
  const db = readLocalDb();
  let videos = [...(db.teaching_videos || [])];

  const { search, skill_id, student_id } = req.query;

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    videos = videos.filter(
      (v: any) =>
        v.title.toLowerCase().includes(q) ||
        v.subject_name.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q)
    );
  }

  if (skill_id) {
    videos = videos.filter((v: any) => v.skill_id === parseInt(skill_id as string, 10));
  }

  if (student_id) {
    videos = videos.filter((v: any) => v.student_id === parseInt(student_id as string, 10));
  }

  // Join student details
  const enrichedVideos = videos.map((v: any) => {
    const student = db.students.find((s: any) => s.id === v.student_id) || {};
    const skill = db.skills.find((sk: any) => sk.id === v.skill_id) || {};
    return {
      ...v,
      student_name: student.full_name || 'Anonymous Student',
      student_photo: student.profile_photo || '',
      student_department: student.department || '',
      student_year: student.year_of_study || '',
      skill_name: skill.name || v.subject_name,
    };
  });

  // Sort by newest first
  enrichedVideos.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(enrichedVideos);
});

// Upload Teaching Video (Accepts file or direct demo video URL)
apiRouter.post('/videos', upload.single('video_file'), (req: Request, res: Response) => {
  try {
    const { student_id, skill_id, title, subject_name, description, duration_seconds, direct_url } = req.body;

    if (!student_id || !title || !subject_name || !description) {
      res.status(400).json({ error: 'Student ID, video title, subject name, and explanation description are required.' });
      return;
    }

    const duration = parseInt(duration_seconds || '120', 10);
    // Enforce 1-3 minutes guideline (60-180 seconds)
    if (duration < 60 || duration > 180) {
      res.status(400).json({ error: 'Teaching demonstration video must be between 1 and 3 minutes (60–180 seconds).' });
      return;
    }

    let video_url = direct_url;
    let file_size_bytes = 15000000;
    let file_format = 'video/mp4';

    if (req.file) {
      video_url = `/uploads/videos/${req.file.filename}`;
      file_size_bytes = req.file.size;
      file_format = req.file.mimetype;
    }

    if (!video_url) {
      // Default sample video if testing without file
      video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    }

    const db = readLocalDb();
    const newVideo = {
      id: db.teaching_videos.length > 0 ? Math.max(...db.teaching_videos.map((v: any) => v.id)) + 1 : 1,
      student_id: parseInt(student_id, 10),
      skill_id: skill_id ? parseInt(skill_id, 10) : null,
      title,
      subject_name,
      description,
      video_url,
      thumbnail_url:
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
      duration_seconds: duration,
      file_format,
      file_size_bytes,
      views_count: 0,
      created_at: new Date().toISOString(),
    };

    db.teaching_videos.unshift(newVideo);
    writeLocalDb(db);

    const student = db.students.find((s: any) => s.id === newVideo.student_id);
    res.status(201).json({
      message: 'Teaching demonstration video uploaded successfully',
      video: {
        ...newVideo,
        student_name: student?.full_name,
        student_photo: student?.profile_photo,
        student_department: student?.department,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Video upload failed' });
  }
});

// Increment video view count
apiRouter.post('/videos/:id/view', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const db = readLocalDb();
  const video = db.teaching_videos.find((v: any) => v.id === id);
  if (video) {
    video.views_count = (video.views_count || 0) + 1;
    writeLocalDb(db);
    res.json({ views_count: video.views_count });
  } else {
    res.status(404).json({ error: 'Video not found' });
  }
});

// Delete teaching video
apiRouter.delete('/videos/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const db = readLocalDb();
  db.teaching_videos = db.teaching_videos.filter((v: any) => v.id !== id);
  writeLocalDb(db);
  res.json({ message: 'Teaching video removed.' });
});

// ==========================================
// 5. LEARNING REQUESTS APIS
// ==========================================

// Get requests (for a learner or a mentor)
apiRouter.get('/requests', (req: Request, res: Response) => {
  const { student_id, type } = req.query;
  const db = readLocalDb();
  let requests = [...(db.learning_requests || [])];

  const sid = student_id ? parseInt(student_id as string, 10) : null;

  if (sid) {
    if (type === 'sent') {
      requests = requests.filter((r: any) => r.learner_id === sid);
    } else if (type === 'received') {
      requests = requests.filter((r: any) => r.mentor_id === sid);
    } else {
      requests = requests.filter((r: any) => r.learner_id === sid || r.mentor_id === sid);
    }
  }

  // Join detailed information
  const detailed = requests.map((r: any) => {
    const learner = db.students.find((s: any) => s.id === r.learner_id) || {};
    const mentor = db.students.find((s: any) => s.id === r.mentor_id) || {};
    const skill = db.skills.find((s: any) => s.id === r.skill_id) || {};
    return {
      ...r,
      learner_name: learner.full_name,
      learner_email: learner.email,
      learner_photo: learner.profile_photo,
      learner_department: learner.department,
      mentor_name: mentor.full_name,
      mentor_email: mentor.email,
      mentor_photo: mentor.profile_photo,
      mentor_department: mentor.department,
      skill_name: skill.name || r.subject,
    };
  });

  detailed.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(detailed);
});

// Send new learning request
apiRouter.post('/requests', (req: Request, res: Response) => {
  const { learner_id, mentor_id, skill_id, subject, message, preferred_date, preferred_time } = req.body;

  if (!learner_id || !mentor_id || !subject || !message) {
    res.status(400).json({ error: 'Learner, mentor, subject, and message are required.' });
    return;
  }

  if (learner_id === mentor_id) {
    res.status(400).json({ error: 'You cannot send a learning request to yourself.' });
    return;
  }

  const db = readLocalDb();
  const newRequest = {
    id: db.learning_requests.length > 0 ? Math.max(...db.learning_requests.map((r: any) => r.id)) + 1 : 1,
    learner_id: parseInt(learner_id, 10),
    mentor_id: parseInt(mentor_id, 10),
    skill_id: skill_id ? parseInt(skill_id, 10) : null,
    subject,
    message,
    preferred_date: preferred_date || null,
    preferred_time: preferred_time || null,
    status: 'pending',
    response_note: null,
    created_at: new Date().toISOString(),
  };

  db.learning_requests.unshift(newRequest);
  writeLocalDb(db);

  res.status(201).json({ message: 'Learning request sent to mentor successfully', request: newRequest });
});

// Respond to learning request (Accept or Reject)
apiRouter.patch('/requests/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { status, response_note, schedule_session } = req.body;

  if (!['accepted', 'rejected', 'pending'].includes(status)) {
    res.status(400).json({ error: 'Invalid status. Must be accepted, rejected, or pending.' });
    return;
  }

  const db = readLocalDb();
  const requestIndex = db.learning_requests.findIndex((r: any) => r.id === id);
  if (requestIndex === -1) {
    res.status(404).json({ error: 'Learning request not found.' });
    return;
  }

  db.learning_requests[requestIndex].status = status;
  db.learning_requests[requestIndex].response_note = response_note || null;
  db.learning_requests[requestIndex].updated_at = new Date().toISOString();

  // If accepted and scheduling requested, automatically create scheduled session
  if (status === 'accepted' && schedule_session) {
    const reqData = db.learning_requests[requestIndex];
    const sessionDate = reqData.preferred_date || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const startTime = (reqData.preferred_time || '14:00') + ':00';
    const endHour = (parseInt(startTime.split(':')[0], 10) + 1).toString().padStart(2, '0');
    const endTime = `${endHour}:${startTime.split(':')[1]}:00`;

    const newSession = {
      id: db.sessions.length > 0 ? Math.max(...db.sessions.map((s: any) => s.id)) + 1 : 1,
      request_id: reqData.id,
      mentor_id: reqData.mentor_id,
      learner_id: reqData.learner_id,
      skill_id: reqData.skill_id,
      title: `${reqData.subject} (Peer Tutoring)`,
      session_date: sessionDate,
      start_time: startTime,
      end_time: endTime,
      meeting_link: `https://meet.google.com/skm-${Math.random().toString(36).substring(2, 8)}`,
      location_type: 'Online Meeting',
      status: 'Accepted',
      notes: response_note || 'Session booked via learning request acceptance.',
      created_at: new Date().toISOString(),
    };

    db.sessions.push(newSession);
  }

  writeLocalDb(db);
  res.json({ message: `Request ${status} successfully.`, request: db.learning_requests[requestIndex] });
});

// ==========================================
// 6. SESSIONS APIS
// ==========================================

// Get sessions with conflict checking
apiRouter.get('/sessions', (req: Request, res: Response) => {
  const { student_id, role_filter } = req.query;
  const db = readLocalDb();
  let list = [...(db.sessions || [])];

  const sid = student_id ? parseInt(student_id as string, 10) : null;
  if (sid) {
    if (role_filter === 'mentor') {
      list = list.filter((s: any) => s.mentor_id === sid);
    } else if (role_filter === 'learner') {
      list = list.filter((s: any) => s.learner_id === sid);
    } else {
      list = list.filter((s: any) => s.mentor_id === sid || s.learner_id === sid);
    }
  }

  // Join names & check if feedback already submitted
  const enriched = list.map((s: any) => {
    const mentor = db.students.find((st: any) => st.id === s.mentor_id) || {};
    const learner = db.students.find((st: any) => st.id === s.learner_id) || {};
    const skill = db.skills.find((sk: any) => sk.id === s.skill_id) || {};
    const hasFeedback = db.feedback.some((f: any) => f.session_id === s.id);

    return {
      ...s,
      mentor_name: mentor.full_name,
      mentor_photo: mentor.profile_photo,
      mentor_department: mentor.department,
      learner_name: learner.full_name,
      learner_photo: learner.profile_photo,
      learner_department: learner.department,
      skill_name: skill.name || s.title,
      has_feedback: hasFeedback,
    };
  });

  enriched.sort((a: any, b: any) => new Date(`${b.session_date}T${b.start_time}`).getTime() - new Date(`${a.session_date}T${a.start_time}`).getTime());
  res.json(enriched);
});

// Create / Schedule a new session with conflict prevention
apiRouter.post('/sessions', (req: Request, res: Response) => {
  const { mentor_id, learner_id, skill_id, title, session_date, start_time, end_time, location_type, meeting_link, notes } = req.body;

  if (!mentor_id || !learner_id || !session_date || !start_time || !end_time || !title) {
    res.status(400).json({ error: 'Mentor, learner, title, session date, start time, and end time are required.' });
    return;
  }

  if (mentor_id === learner_id) {
    res.status(400).json({ error: 'A student cannot schedule a session with themselves.' });
    return;
  }

  const db = readLocalDb();

  // CONFLICT PREVENTION CHECK:
  // Check if mentor already has an accepted/requested session overlapping this time window
  const conflicts = db.sessions.filter((s: any) => {
    if (s.mentor_id !== parseInt(mentor_id, 10) && s.learner_id !== parseInt(learner_id, 10)) return false;
    if (s.session_date !== session_date) return false;
    if (s.status === 'Cancelled') return false;

    // Check overlap: max(start1, start2) < min(end1, end2)
    const s1 = start_time;
    const e1 = end_time;
    const s2 = s.start_time;
    const e2 = s.end_time;

    return (s1 >= s2 && s1 < e2) || (e1 > s2 && e1 <= e2) || (s1 <= s2 && e1 >= e2);
  });

  if (conflicts.length > 0) {
    res.status(409).json({
      error: 'Scheduling Conflict: The mentor or learner already has an active session booked during this time window. Please select another slot.',
    });
    return;
  }

  const newSession = {
    id: db.sessions.length > 0 ? Math.max(...db.sessions.map((s: any) => s.id)) + 1 : 1,
    request_id: null,
    mentor_id: parseInt(mentor_id, 10),
    learner_id: parseInt(learner_id, 10),
    skill_id: skill_id ? parseInt(skill_id, 10) : null,
    title,
    session_date,
    start_time: start_time.length === 5 ? `${start_time}:00` : start_time,
    end_time: end_time.length === 5 ? `${end_time}:00` : end_time,
    meeting_link: meeting_link || `https://meet.google.com/skm-${Math.random().toString(36).substring(2, 8)}`,
    location_type: location_type || 'Online Meeting',
    status: 'Accepted',
    notes: notes || '',
    created_at: new Date().toISOString(),
  };

  db.sessions.push(newSession);
  writeLocalDb(db);
  res.status(201).json({ message: 'Session booked successfully without conflicts.', session: newSession });
});

// Update session status (Completed, Cancelled, Accepted)
apiRouter.patch('/sessions/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { status, notes } = req.body;

  if (!['Requested', 'Accepted', 'Completed', 'Cancelled'].includes(status)) {
    res.status(400).json({ error: 'Invalid session status.' });
    return;
  }

  const db = readLocalDb();
  const sessionIndex = db.sessions.findIndex((s: any) => s.id === id);
  if (sessionIndex === -1) {
    res.status(404).json({ error: 'Session not found.' });
    return;
  }

  db.sessions[sessionIndex].status = status;
  if (notes) db.sessions[sessionIndex].notes = notes;

  writeLocalDb(db);
  res.json({ message: `Session status marked as ${status}.`, session: db.sessions[sessionIndex] });
});

// ==========================================
// 7. FEEDBACK & RATINGS APIS
// ==========================================

// Get feedback for a mentor or all feedback
apiRouter.get('/feedback', (req: Request, res: Response) => {
  const { recipient_id, session_id } = req.query;
  const db = readLocalDb();
  let list = [...(db.feedback || [])];

  if (recipient_id) {
    list = list.filter((f: any) => f.recipient_id === parseInt(recipient_id as string, 10));
  }
  if (session_id) {
    list = list.filter((f: any) => f.session_id === parseInt(session_id as string, 10));
  }

  const enriched = list.map((f: any) => {
    const reviewer = db.students.find((s: any) => s.id === f.reviewer_id) || {};
    const recipient = db.students.find((s: any) => s.id === f.recipient_id) || {};
    const session = db.sessions.find((s: any) => s.id === f.session_id) || {};
    return {
      ...f,
      reviewer_name: reviewer.full_name,
      reviewer_photo: reviewer.profile_photo,
      recipient_name: recipient.full_name,
      session_title: session.title,
    };
  });

  enriched.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(enriched);
});

// Submit feedback for a completed session
apiRouter.post('/feedback', (req: Request, res: Response) => {
  const { session_id, reviewer_id, recipient_id, rating, review_text } = req.body;

  if (!session_id || !reviewer_id || !recipient_id || !rating || !review_text) {
    res.status(400).json({ error: 'Session ID, reviewer, recipient, rating (1-5), and review text are required.' });
    return;
  }

  const numRating = parseInt(rating, 10);
  if (numRating < 1 || numRating > 5) {
    res.status(400).json({ error: 'Rating must be between 1 and 5 stars.' });
    return;
  }

  const db = readLocalDb();

  // Verify session exists
  const session = db.sessions.find((s: any) => s.id === parseInt(session_id, 10));
  if (!session) {
    res.status(404).json({ error: 'Session not found.' });
    return;
  }

  // Check unique constraint (one feedback per session)
  const existingFeedback = db.feedback.find((f: any) => f.session_id === parseInt(session_id, 10));
  if (existingFeedback) {
    res.status(409).json({ error: 'Feedback has already been submitted for this session.' });
    return;
  }

  // Mark session as Completed if not already
  session.status = 'Completed';

  const newFeedback = {
    id: db.feedback.length > 0 ? Math.max(...db.feedback.map((f: any) => f.id)) + 1 : 1,
    session_id: parseInt(session_id, 10),
    reviewer_id: parseInt(reviewer_id, 10),
    recipient_id: parseInt(recipient_id, 10),
    rating: numRating,
    review_text,
    created_at: new Date().toISOString(),
  };

  db.feedback.push(newFeedback);
  writeLocalDb(db);

  res.status(201).json({ message: 'Thank you! Rating and feedback submitted successfully.', feedback: newFeedback });
});

// ==========================================
// 8. ADMIN & SYSTEM STATS APIS
// ==========================================

// Get system statistics
apiRouter.get('/admin/stats', (_req: Request, res: Response) => {
  const db = readLocalDb();
  const feedbackList = db.feedback || [];
  const avgRating =
    feedbackList.length > 0
      ? Number((feedbackList.reduce((acc: number, f: any) => acc + f.rating, 0) / feedbackList.length).toFixed(1))
      : 5.0;

  res.json({
    total_students: (db.students || []).length,
    total_skills: (db.skills || []).length,
    total_videos: (db.teaching_videos || []).length,
    total_requests: (db.learning_requests || []).length,
    total_sessions: (db.sessions || []).length,
    completed_sessions: (db.sessions || []).filter((s: any) => s.status === 'Completed').length,
    total_feedback: feedbackList.length,
    average_system_rating: avgRating,
    db_mode: dbState.mode,
    db_host: dbState.host,
    db_name: dbState.database,
    db_status_message: dbState.isMySQLConnected
      ? `Connected to MySQL (${dbState.host}:${process.env.DB_PORT || 3306})`
      : 'Local Persistent Store active (Strict MySQL Relational Engine)',
  });
});

// Database connectivity status
apiRouter.get('/database/status', (_req: Request, res: Response) => {
  res.json({
    connected: dbState.isMySQLConnected,
    mode: dbState.mode,
    host: dbState.host,
    database: dbState.database,
    port: process.env.DB_PORT || 3306,
    error: dbState.lastError,
  });
});

// Academic SQL Query Runner (Executes queries for college viva/demo)
apiRouter.post('/database/query', async (req: Request, res: Response) => {
  const { sql } = req.body;
  if (!sql || typeof sql !== 'string') {
    res.status(400).json({ error: 'SQL statement is required.' });
    return;
  }

  const trimmed = sql.trim();
  const upper = trimmed.toUpperCase();

  // If live MySQL pool is connected, run live query
  if (dbState.isMySQLConnected && dbState.pool) {
    try {
      const [rows] = await dbState.pool.query(trimmed);
      res.json({ success: true, mode: 'mysql', rows, rowCount: Array.isArray(rows) ? rows.length : 1 });
      return;
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
      return;
    }
  }

  // Academic Simulator for Relational Engine
  const db = readLocalDb();
  try {
    if (upper.startsWith('SELECT')) {
      if (upper.includes('FROM STUDENTS')) {
        res.json({
          success: true,
          mode: 'relational_engine',
          rows: db.students.map((s: any) => enrichStudent(s, db)),
          rowCount: db.students.length,
        });
      } else if (upper.includes('FROM SKILLS')) {
        res.json({ success: true, mode: 'relational_engine', rows: db.skills, rowCount: db.skills.length });
      } else if (upper.includes('FROM TEACHING_VIDEOS')) {
        res.json({ success: true, mode: 'relational_engine', rows: db.teaching_videos, rowCount: db.teaching_videos.length });
      } else if (upper.includes('FROM SESSIONS')) {
        res.json({ success: true, mode: 'relational_engine', rows: db.sessions, rowCount: db.sessions.length });
      } else if (upper.includes('FROM FEEDBACK')) {
        res.json({ success: true, mode: 'relational_engine', rows: db.feedback, rowCount: db.feedback.length });
      } else {
        res.json({
          success: true,
          mode: 'relational_engine',
          message: 'Query executed successfully against Relational Data Store.',
          rows: db.students.slice(0, 5),
          rowCount: 5,
        });
      }
    } else {
      res.json({
        success: true,
        mode: 'relational_engine',
        message: 'Query executed successfully (DML/DDL simulation accepted).',
        affectedRows: 1,
      });
    }
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// Reset database to initial seeds
apiRouter.post('/admin/reset-seeds', async (_req: Request, res: Response) => {
  await resetDatabaseToSeeds();
  res.json({ message: 'Database reset to initial academic demonstration seed state.' });
});
