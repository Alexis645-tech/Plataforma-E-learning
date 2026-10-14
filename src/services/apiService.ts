import {
  User,
  Course,
  CourseModule,
  Quiz,
  Assignment,
  Submission,
  QuizAttempt,
  StudentProgress,
  AppNotification,
  ChatMessage
} from '../types';

export interface DbSecurityStatus {
  passwordHashing: string;
  saltRounds: number;
  gitIgnoredEnv: boolean;
  envSecurityNotice: string;
  isHashProtectionActive: boolean;
  hashedUsersCount: number;
  totalUsersCount: number;
}

export interface DbStatusResponse {
  isConfigured: boolean;
  isConnected: boolean;
  envVarDetected?: string | null;
  uriLength?: number;
  dbType: string;
  dbName: string;
  maskedUri: string;
  lastError: string | null;
  connectionDiagnosis?: string | null;
  collectionsCount: Record<string, number>;
  security?: DbSecurityStatus;
  timestamp: string;
}

export interface BootstrapResponse {
  users: User[];
  courses: Course[];
  modules: CourseModule[];
  quizzes: Quiz[];
  assignments: Assignment[];
  submissions: Submission[];
  quizAttempts: QuizAttempt[];
  progress: StudentProgress[];
  notifications: AppNotification[];
  chatMessages: ChatMessage[];
  dbStatus: DbStatusResponse;
}

class ApiService {
  private baseUrl = '/api';

  async getHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async getDbStatus(): Promise<DbStatusResponse | null> {
    try {
      const res = await fetch(`${this.baseUrl}/db/status`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async fetchBootstrap(): Promise<BootstrapResponse | null> {
    try {
      const res = await fetch(`${this.baseUrl}/bootstrap`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('Backend API bootstrap unavailable, falling back to local state:', e);
      return null;
    }
  }

  async seedDatabase(force = false): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/db/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message || 'Error al conectar con el servidor' };
    }
  }

  async syncAllToMongo(data: {
    users?: User[];
    courses?: Course[];
    modules?: CourseModule[];
    quizzes?: Quiz[];
    assignments?: Assignment[];
    submissions?: Submission[];
    quizAttempts?: QuizAttempt[];
    progress?: StudentProgress[];
    notifications?: AppNotification[];
    chatMessages?: ChatMessage[];
  }): Promise<{ success: boolean; message: string; count?: number }> {
    try {
      const res = await fetch(`${this.baseUrl}/db/sync-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message || 'Error al sincronizar con MongoDB' };
    }
  }

  // Authentication & Security (bcrypt)
  async login(email: string, password: string): Promise<{
    success: boolean;
    user?: User;
    error?: string;
    security?: { method: string; saltRounds: number; isPasswordHashed: boolean };
  }> {
    try {
      const res = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Error de conexión con el servicio de autenticación' };
    }
  }

  async rehashAllUsers(): Promise<{ updated: number; message: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/auth/rehash-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return await res.json();
    } catch (e: any) {
      return { updated: 0, message: e.message || 'Error al actualizar cifrado de contraseñas' };
    }
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    department?: string;
    bio?: string;
  }): Promise<{ success: boolean; user?: User; error?: string; message?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Error de conexión con el servicio de registro' };
    }
  }

  async retryConnection(): Promise<{ success: boolean; status: DbStatusResponse; message: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/db/retry`, {
        method: 'POST',
      });
      return await res.json();
    } catch (e: any) {
      const current = (await this.getDbStatus()) as DbStatusResponse;
      return {
        success: false,
        status: current,
        message: e.message || 'Error al conectar',
      };
    }
  }

  // Users
  async saveUser(user: User): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/users/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Courses
  async saveCourse(course: Course): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async updateCourse(id: string, updates: Partial<Course>): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async deleteCourse(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/courses/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Modules
  async saveModule(moduleItem: CourseModule): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moduleItem),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async updateModule(id: string, updates: Partial<CourseModule>): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/modules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async deleteModule(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/modules/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Progress
  async saveProgress(progressItem: StudentProgress): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progressItem),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Quizzes & Attempts
  async saveQuiz(quiz: Quiz): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quiz),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async updateQuiz(id: string, updates: Partial<Quiz>): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/quizzes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async deleteQuiz(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/quizzes/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }

  async saveQuizAttempt(attempt: QuizAttempt): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/quiz-attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attempt),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Assignments & Submissions
  async saveAssignment(assignment: Assignment): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignment),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async updateAssignment(id: string, updates: Partial<Assignment>): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/assignments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async deleteAssignment(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/assignments/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }

  async saveSubmission(submission: Submission): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async updateSubmission(id: string, updates: Partial<Submission>): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/submissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async deleteSubmission(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/submissions/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Notifications
  async saveNotification(notif: AppNotification): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notif),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async deleteNotification(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/notifications/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Chat
  async saveChatMessage(msg: ChatMessage): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
