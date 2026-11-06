export type SkillCategory =
  | 'Programming'
  | 'Database'
  | 'Web Development'
  | 'Mathematics'
  | 'Science'
  | 'Communication'
  | 'Design'
  | 'Other Skills';

export type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type SkillRole = 'Teaching' | 'Learning' | 'Both';

export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export type SessionStatus = 'Requested' | 'Accepted' | 'Completed' | 'Cancelled';

export interface Student {
  id: number;
  student_id_number: string;
  full_name: string;
  email: string;
  department: string;
  year_of_study: string;
  profile_photo: string;
  bio: string;
  role: 'student' | 'admin';
  created_at: string;
  updated_at?: string;
  // Computed / Joined fields
  skills?: StudentSkill[];
  average_rating?: number;
  rating_count?: number;
  videos_count?: number;
  sessions_completed?: number;
}

export interface Skill {
  id: number;
  name: string;
  category: SkillCategory;
  description: string;
  icon_name: string;
  created_at?: string;
}

export interface StudentSkill {
  id: number;
  student_id: number;
  skill_id: number;
  proficiency: ProficiencyLevel;
  role_type: SkillRole;
  notes?: string;
  created_at?: string;
  // Joined skill details
  skill_name?: string;
  category?: SkillCategory;
  skill_description?: string;
}

export interface TeachingVideo {
  id: number;
  student_id: number;
  skill_id?: number | null;
  title: string;
  subject_name: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  duration_seconds: number;
  file_format: string;
  file_size_bytes: number;
  views_count: number;
  created_at: string;
  // Joined student info
  student_name?: string;
  student_photo?: string;
  student_department?: string;
  student_year?: string;
  skill_name?: string;
}

export interface LearningRequest {
  id: number;
  learner_id: number;
  mentor_id: number;
  skill_id?: number | null;
  subject: string;
  message: string;
  preferred_date?: string;
  preferred_time?: string;
  status: RequestStatus;
  response_note?: string;
  created_at: string;
  updated_at?: string;
  // Joined fields
  learner_name?: string;
  learner_email?: string;
  learner_photo?: string;
  learner_department?: string;
  mentor_name?: string;
  mentor_email?: string;
  mentor_photo?: string;
  mentor_department?: string;
  skill_name?: string;
}

export interface Session {
  id: number;
  request_id?: number | null;
  mentor_id: number;
  learner_id: number;
  skill_id?: number | null;
  title: string;
  session_date: string;
  start_time: string;
  end_time: string;
  meeting_link?: string;
  location_type: 'Online Meeting' | 'Library Study Room' | 'Lab 4B' | 'Campus Lounge';
  status: SessionStatus;
  notes?: string;
  created_at: string;
  // Joined fields
  mentor_name?: string;
  mentor_photo?: string;
  mentor_department?: string;
  learner_name?: string;
  learner_photo?: string;
  learner_department?: string;
  skill_name?: string;
  has_feedback?: boolean;
}

export interface Feedback {
  id: number;
  session_id: number;
  reviewer_id: number;
  recipient_id: number;
  rating: number; // 1 to 5
  review_text: string;
  created_at: string;
  // Joined fields
  reviewer_name?: string;
  reviewer_photo?: string;
  recipient_name?: string;
  session_title?: string;
}

export interface Administrator {
  id: number;
  username: string;
  email: string;
  full_name: string;
  permissions: string;
  created_at: string;
}

export interface SystemStats {
  total_students: number;
  total_skills: number;
  total_videos: number;
  total_requests: number;
  total_sessions: number;
  completed_sessions: number;
  total_feedback: number;
  average_system_rating: number;
  db_mode: 'mysql' | 'local_persistent';
  db_host: string;
  db_name: string;
  db_status_message: string;
}
