import {
  Student,
  Skill,
  StudentSkill,
  TeachingVideo,
  LearningRequest,
  Session,
  Feedback,
  SystemStats,
} from '../types';

const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = 'An unexpected error occurred';
    try {
      const data = await res.json();
      errorMsg = data.error || data.message || errorMsg;
    } catch {
      errorMsg = res.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Auth
  async register(data: {
    student_id_number: string;
    full_name: string;
    email: string;
    password: string;
    department: string;
    year_of_study: string;
    profile_photo?: string;
    bio?: string;
  }): Promise<{ message: string; student: Student }> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async login(data: { email: string; password: string }): Promise<{ message: string; user: Student; role: string }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Students
  async getStudents(filters?: {
    search?: string;
    department?: string;
    skill?: string;
    proficiency?: string;
    role?: string;
  }): Promise<Student[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.skill) params.append('skill', filters.skill);
    if (filters?.proficiency) params.append('proficiency', filters.proficiency);
    if (filters?.role) params.append('role', filters.role);

    const res = await fetch(`${BASE_URL}/students?${params.toString()}`);
    return handleResponse<Student[]>(res);
  },

  async getStudent(id: number): Promise<Student> {
    const res = await fetch(`${BASE_URL}/students/${id}`);
    return handleResponse<Student>(res);
  },

  async updateStudent(id: number, data: Partial<Student>): Promise<{ message: string; student: Student }> {
    const res = await fetch(`${BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteStudent(id: number): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/students/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Skills
  async getSkills(): Promise<Skill[]> {
    const res = await fetch(`${BASE_URL}/skills`);
    return handleResponse<Skill[]>(res);
  },

  async createSkill(data: { name: string; category: string; description?: string; icon_name?: string }): Promise<Skill> {
    const res = await fetch(`${BASE_URL}/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getStudentSkills(studentId: number): Promise<StudentSkill[]> {
    const res = await fetch(`${BASE_URL}/students/${studentId}/skills`);
    return handleResponse<StudentSkill[]>(res);
  },

  async addStudentSkill(
    studentId: number,
    data: {
      skill_id?: number;
      proficiency: string;
      role_type: string;
      notes?: string;
      new_skill_name?: string;
      new_skill_category?: string;
    }
  ): Promise<StudentSkill> {
    const res = await fetch(`${BASE_URL}/students/${studentId}/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateStudentSkill(
    studentId: number,
    studentSkillId: number,
    data: { proficiency?: string; role_type?: string; notes?: string }
  ): Promise<StudentSkill> {
    const res = await fetch(`${BASE_URL}/students/${studentId}/skills/${studentSkillId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteStudentSkill(studentId: number, studentSkillId: number): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/students/${studentId}/skills/${studentSkillId}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Teaching Videos
  async getVideos(params?: { search?: string; skill_id?: number; student_id?: number }): Promise<TeachingVideo[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.skill_id) query.append('skill_id', params.skill_id.toString());
    if (params?.student_id) query.append('student_id', params.student_id.toString());

    const res = await fetch(`${BASE_URL}/videos?${query.toString()}`);
    return handleResponse<TeachingVideo[]>(res);
  },

  async uploadVideo(formData: FormData): Promise<{ message: string; video: TeachingVideo }> {
    const res = await fetch(`${BASE_URL}/videos`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async incrementVideoView(id: number): Promise<{ views_count: number }> {
    const res = await fetch(`${BASE_URL}/videos/${id}/view`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async deleteVideo(id: number): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/videos/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Learning Requests
  async getRequests(studentId?: number, type?: 'sent' | 'received'): Promise<LearningRequest[]> {
    const query = new URLSearchParams();
    if (studentId) query.append('student_id', studentId.toString());
    if (type) query.append('type', type);

    const res = await fetch(`${BASE_URL}/requests?${query.toString()}`);
    return handleResponse<LearningRequest[]>(res);
  },

  async sendRequest(data: {
    learner_id: number;
    mentor_id: number;
    skill_id?: number | null;
    subject: string;
    message: string;
    preferred_date?: string;
    preferred_time?: string;
  }): Promise<{ message: string; request: LearningRequest }> {
    const res = await fetch(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async respondRequest(
    id: number,
    data: { status: 'accepted' | 'rejected'; response_note?: string; schedule_session?: boolean }
  ): Promise<{ message: string; request: LearningRequest }> {
    const res = await fetch(`${BASE_URL}/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Sessions
  async getSessions(studentId?: number, role_filter?: 'mentor' | 'learner'): Promise<Session[]> {
    const query = new URLSearchParams();
    if (studentId) query.append('student_id', studentId.toString());
    if (role_filter) query.append('role_filter', role_filter);

    const res = await fetch(`${BASE_URL}/sessions?${query.toString()}`);
    return handleResponse<Session[]>(res);
  },

  async bookSession(data: {
    mentor_id: number;
    learner_id: number;
    skill_id?: number | null;
    title: string;
    session_date: string;
    start_time: string;
    end_time: string;
    location_type?: string;
    meeting_link?: string;
    notes?: string;
  }): Promise<{ message: string; session: Session }> {
    const res = await fetch(`${BASE_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateSessionStatus(
    id: number,
    data: { status: 'Accepted' | 'Completed' | 'Cancelled'; notes?: string }
  ): Promise<{ message: string; session: Session }> {
    const res = await fetch(`${BASE_URL}/sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Feedback
  async getFeedback(recipientId?: number, sessionId?: number): Promise<Feedback[]> {
    const query = new URLSearchParams();
    if (recipientId) query.append('recipient_id', recipientId.toString());
    if (sessionId) query.append('session_id', sessionId.toString());

    const res = await fetch(`${BASE_URL}/feedback?${query.toString()}`);
    return handleResponse<Feedback[]>(res);
  },

  async submitFeedback(data: {
    session_id: number;
    reviewer_id: number;
    recipient_id: number;
    rating: number;
    review_text: string;
  }): Promise<{ message: string; feedback: Feedback }> {
    const res = await fetch(`${BASE_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Admin & System
  async getStats(): Promise<SystemStats> {
    const res = await fetch(`${BASE_URL}/admin/stats`);
    return handleResponse<SystemStats>(res);
  },

  async getDbStatus(): Promise<{
    connected: boolean;
    mode: string;
    host: string;
    database: string;
    port: number;
    error: string | null;
  }> {
    const res = await fetch(`${BASE_URL}/database/status`);
    return handleResponse(res);
  },

  async runSqlQuery(sql: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/database/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql }),
    });
    return handleResponse(res);
  },

  async resetDatabaseSeeds(): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/admin/reset-seeds`, {
      method: 'POST',
    });
    return handleResponse(res);
  },
};
