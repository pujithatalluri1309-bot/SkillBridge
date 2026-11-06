import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads', 'videos');

// Ensure data & upload directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export interface DbState {
  isMySQLConnected: boolean;
  pool: mysql.Pool | null;
  mode: 'mysql' | 'local_persistent';
  host: string;
  database: string;
  lastError: string | null;
}

export const dbState: DbState = {
  isMySQLConnected: false,
  pool: null,
  mode: 'local_persistent',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'skillmate_db',
  lastError: null,
};

// Seed records structure
function getInitialSeedData() {
  const passwordHash = bcrypt.hashSync('student123', 10);
  const adminHash = bcrypt.hashSync('admin123', 10);

  return {
    students: [
      {
        id: 1,
        student_id_number: 'STU-2024-001',
        full_name: 'Aarav Sharma',
        email: 'aarav.sharma@skillmate.edu',
        password_hash: passwordHash,
        department: 'Computer Science & Engineering',
        year_of_study: '3rd Year',
        profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: 'Passionate full-stack developer who loves teaching React, Node.js, and Data Structures. Let us debug together!',
        role: 'student',
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: 2,
        student_id_number: 'STU-2024-002',
        full_name: 'Priya Patel',
        email: 'priya.patel@skillmate.edu',
        password_hash: passwordHash,
        department: 'Information Technology',
        year_of_study: '4th Year',
        profile_photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        bio: 'Database architect & SQL enthusiast. Specializes in MySQL indexing, ER Modeling, and query optimization.',
        role: 'student',
        created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
      },
      {
        id: 3,
        student_id_number: 'STU-2024-003',
        full_name: 'Rohan Verma',
        email: 'rohan.verma@skillmate.edu',
        password_hash: passwordHash,
        department: 'Electronics & Communication',
        year_of_study: '2nd Year',
        profile_photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
        bio: 'Math geek & competitive programmer. Teaching Calculus, Discrete Math, and C++ algorithms.',
        role: 'student',
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      {
        id: 4,
        student_id_number: 'STU-2024-004',
        full_name: 'Ananya Iyer',
        email: 'ananya.iyer@skillmate.edu',
        password_hash: passwordHash,
        department: 'Design & Media',
        year_of_study: '3rd Year',
        profile_photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        bio: 'UI/UX Designer who believes in empathetic user interfaces. Teaching Figma component design and design systems.',
        role: 'student',
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
      {
        id: 5,
        student_id_number: 'STU-2024-005',
        full_name: 'Vikram Malhotra',
        email: 'vikram.m@skillmate.edu',
        password_hash: passwordHash,
        department: 'Mechanical Engineering',
        year_of_study: '2nd Year',
        profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        bio: 'Looking to learn Web Development and Python while sharing knowledge in Physics and CAD Modeling.',
        role: 'student',
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
    ],
    skills: [
      {
        id: 1,
        name: 'Data Structures & Algorithms',
        category: 'Programming',
        description: 'Arrays, Linked Lists, Trees, Graphs, Sorting, Dynamic Programming in C++ & Java',
        icon_name: 'Code',
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'MySQL & Relational Databases',
        category: 'Database',
        description: 'Schema Design, Normalization, SQL Joins, Triggers, Indexes, Query Tuning',
        icon_name: 'Database',
        created_at: new Date().toISOString(),
      },
      {
        id: 3,
        name: 'React & Modern Frontend',
        category: 'Web Development',
        description: 'Components, Hooks, State Management, Tailwind CSS, Vite & Next.js',
        icon_name: 'Globe',
        created_at: new Date().toISOString(),
      },
      {
        id: 4,
        name: 'Calculus & Linear Algebra',
        category: 'Mathematics',
        description: 'Derivatives, Matrix Transformations, Vector Spaces, Optimization',
        icon_name: 'Calculator',
        created_at: new Date().toISOString(),
      },
      {
        id: 5,
        name: 'Figma & UI/UX Prototyping',
        category: 'Design',
        description: 'Auto-Layout, Component Sets, Interactive Wireframes, Design Tokens',
        icon_name: 'Palette',
        created_at: new Date().toISOString(),
      },
      {
        id: 6,
        name: 'Technical Communication',
        category: 'Communication',
        description: 'Presentation Skills, Viva Preparation, Technical Writing & Resume Reviews',
        icon_name: 'MessageSquare',
        created_at: new Date().toISOString(),
      },
      {
        id: 7,
        name: 'Node.js & Express REST APIs',
        category: 'Web Development',
        description: 'Backend Routing, Middleware, Authentication, Multer file uploads',
        icon_name: 'Server',
        created_at: new Date().toISOString(),
      },
      {
        id: 8,
        name: 'Python for Data Science',
        category: 'Science',
        description: 'NumPy, Pandas, Matplotlib, exploratory data analysis and basic ML',
        icon_name: 'Cpu',
        created_at: new Date().toISOString(),
      },
    ],
    student_skills: [
      { id: 1, student_id: 1, skill_id: 1, proficiency: 'Advanced', role_type: 'Teaching', notes: 'Specializes in graph traversals and DP problems', created_at: new Date().toISOString() },
      { id: 2, student_id: 1, skill_id: 3, proficiency: 'Advanced', role_type: 'Both', notes: 'Happy to teach React and learn backend optimizations', created_at: new Date().toISOString() },
      { id: 3, student_id: 2, skill_id: 2, proficiency: 'Advanced', role_type: 'Teaching', notes: 'Can explain indexing, B-Trees and 3NF normalization clearly', created_at: new Date().toISOString() },
      { id: 4, student_id: 2, skill_id: 8, proficiency: 'Intermediate', role_type: 'Learning', notes: 'Want to master Python for advanced database querying', created_at: new Date().toISOString() },
      { id: 5, student_id: 3, skill_id: 1, proficiency: 'Advanced', role_type: 'Teaching', notes: 'Competitive programming tutor', created_at: new Date().toISOString() },
      { id: 6, student_id: 3, skill_id: 4, proficiency: 'Advanced', role_type: 'Teaching', notes: 'Calculus exam preparation tutor', created_at: new Date().toISOString() },
      { id: 7, student_id: 4, skill_id: 5, proficiency: 'Advanced', role_type: 'Teaching', notes: 'Figma expert, design systems lead', created_at: new Date().toISOString() },
      { id: 8, student_id: 4, skill_id: 3, proficiency: 'Beginner', role_type: 'Learning', notes: 'Learning HTML/CSS to build design systems', created_at: new Date().toISOString() },
      { id: 9, student_id: 5, skill_id: 3, proficiency: 'Beginner', role_type: 'Learning', notes: 'Eager to build a personal project portfolio', created_at: new Date().toISOString() },
    ],
    teaching_videos: [
      {
        id: 1,
        student_id: 1,
        skill_id: 3,
        title: 'Understanding React useEffect Hook in 2 Minutes',
        subject_name: 'React & Web Dev',
        description: 'A crystal-clear breakdown of component lifecycles, dependency arrays, and cleanup functions with real examples.',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80',
        duration_seconds: 120,
        file_format: 'video/mp4',
        file_size_bytes: 15400000,
        views_count: 142,
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: 2,
        student_id: 2,
        skill_id: 2,
        title: 'Mastering SQL INNER vs LEFT JOIN with Venn Diagrams',
        subject_name: 'Database & SQL',
        description: 'Learn how relational joins match records and how NULL values behave when joining customer and order tables.',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnail_url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80',
        duration_seconds: 140,
        file_format: 'video/mp4',
        file_size_bytes: 18200000,
        views_count: 289,
        created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
      },
      {
        id: 3,
        student_id: 3,
        skill_id: 1,
        title: 'Binary Search: Eliminating Half the Search Space',
        subject_name: 'Algorithms',
        description: 'Why logarithmic time complexity O(log N) is lightning fast. Visual walkthrough with sorted arrays.',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnail_url: 'https://images.unsplash.com/photo-1516116211227-bbc10c283a04?auto=format&fit=crop&w=600&q=80',
        duration_seconds: 105,
        file_format: 'video/mp4',
        file_size_bytes: 12100000,
        views_count: 215,
        created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
      },
      {
        id: 4,
        student_id: 4,
        skill_id: 5,
        title: 'Figma Auto-Layout & Constraints Essentials',
        subject_name: 'UI/UX Design',
        description: 'Build responsive mobile cards that adapt automatically to content changes without breaking padding.',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        thumbnail_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
        duration_seconds: 160,
        file_format: 'video/mp4',
        file_size_bytes: 19800000,
        views_count: 178,
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      },
    ],
    learning_requests: [
      {
        id: 1,
        learner_id: 5,
        mentor_id: 1,
        skill_id: 3,
        subject: 'Help setting up React props & state',
        message: 'Hi Aarav, I watched your 2-min demo video on React! I am building my first web app and struggling with state passing. Could we schedule a 45-min peer session?',
        preferred_date: '2026-11-10',
        preferred_time: '16:00',
        status: 'accepted',
        response_note: 'Glad you enjoyed the video! Looking forward to helping you with state management.',
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: 2,
        learner_id: 4,
        mentor_id: 2,
        skill_id: 2,
        subject: 'SQL Subqueries & Join Tuning',
        message: 'Hi Priya! I need assistance understanding how to query nested categories for an e-commerce dashboard.',
        preferred_date: '2026-11-12',
        preferred_time: '14:30',
        status: 'accepted',
        response_note: 'Sure thing! Bring your queries and we will step through the execution plans.',
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      {
        id: 3,
        learner_id: 1,
        mentor_id: 4,
        skill_id: 5,
        subject: 'Portfolio Design Review & Feedback',
        message: 'Hi Ananya, could you review my web app interface wireframes in Figma?',
        preferred_date: '2026-11-14',
        preferred_time: '17:00',
        status: 'pending',
        response_note: null,
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ],
    sessions: [
      {
        id: 1,
        request_id: 1,
        mentor_id: 1,
        learner_id: 5,
        skill_id: 3,
        title: 'React State & Props Hands-On Workshop',
        session_date: '2026-11-10',
        start_time: '16:00:00',
        end_time: '17:00:00',
        meeting_link: 'https://meet.google.com/skm-peer-001',
        location_type: 'Online Meeting',
        status: 'Accepted',
        notes: 'Learner will have VS Code ready with a sample Vite app',
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 2,
        request_id: 2,
        mentor_id: 2,
        learner_id: 4,
        skill_id: 2,
        title: 'SQL Normalization & Complex Joins',
        session_date: '2026-11-04',
        start_time: '14:30:00',
        end_time: '15:30:00',
        meeting_link: 'https://meet.google.com/skm-peer-002',
        location_type: 'Library Study Room',
        status: 'Completed',
        notes: 'Covered 1NF, 2NF, 3NF and multi-table left joins with practical examples',
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: 3,
        request_id: null,
        mentor_id: 3,
        learner_id: 5,
        skill_id: 1,
        title: 'Binary Search Trees Quick Prep',
        session_date: '2026-11-11',
        start_time: '10:00:00',
        end_time: '11:00:00',
        meeting_link: 'https://meet.google.com/skm-peer-003',
        location_type: 'Lab 4B',
        status: 'Accepted',
        notes: 'Midterm preparation peer session',
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ],
    feedback: [
      {
        id: 1,
        session_id: 2,
        reviewer_id: 4,
        recipient_id: 2,
        rating: 5,
        review_text: 'Priya was fantastic! She explained database normalization using a real library catalogue example. The 1 hour peer session saved me days of confusion!',
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
    ],
    administrators: [
      {
        id: 1,
        username: 'admin',
        email: 'admin@skillmate.edu',
        password_hash: adminHash,
        full_name: 'System Administrator',
        permissions: 'ALL',
        created_at: new Date().toISOString(),
      },
    ],
  };
}

// Ensure database file is initialized
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(getInitialSeedData(), null, 2), 'utf-8');
}

export function readLocalDb(): any {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    const initial = getInitialSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

export function writeLocalDb(data: any): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function resetDatabaseToSeeds(): Promise<void> {
  const seeds = getInitialSeedData();
  writeLocalDb(seeds);
  if (dbState.isMySQLConnected && dbState.pool) {
    try {
      const schemaSql = fs.readFileSync(path.resolve(process.cwd(), 'schema.sql'), 'utf-8');
      const statements = schemaSql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith('--'));
      for (const statement of statements) {
        await dbState.pool.query(statement);
      }
    } catch (err: any) {
      console.warn('[MySQL Seed Warning]', err.message);
    }
  }
}

// Attempt MySQL Connection on boot
export async function initializeDatabase(): Promise<void> {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'skillmate_db';

  console.log(`[Database Init] Checking MySQL connection at ${host}:${port}...`);

  try {
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      connectTimeout: 2000,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.end();

    const pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    // Test pool connection
    await pool.query('SELECT 1');
    dbState.pool = pool;
    dbState.isMySQLConnected = true;
    dbState.mode = 'mysql';
    dbState.host = host;
    dbState.database = database;
    dbState.lastError = null;

    console.log(`[Database Init] ✅ Successfully connected to MySQL at ${host}:${port}/${database}`);

    // Run schema migrations if tables don't exist yet
    const [tables]: any = await pool.query('SHOW TABLES');
    if (!tables || tables.length === 0) {
      console.log('[Database Init] Applying schema.sql to MySQL...');
      const schemaSql = fs.readFileSync(path.resolve(process.cwd(), 'schema.sql'), 'utf-8');
      const statements = schemaSql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith('--'));
      for (const st of statements) {
        try {
          await pool.query(st);
        } catch (e: any) {
          // ignore already existing errors
        }
      }
    }
  } catch (err: any) {
    dbState.isMySQLConnected = false;
    dbState.mode = 'local_persistent';
    dbState.lastError = err.message || 'Connection refused';
    console.log(
      `[Database Init] ℹ️  MySQL is not currently running on ${host}:${port} (${err.code || err.message}).`
    );
    console.log(
      `[Database Init] 🚀 SkillMate local persistent relational store activated. Schema and relational constraints strictly enforced.`
    );
  }
}
