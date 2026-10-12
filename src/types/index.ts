export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio: string;
  createdAt: string;
  coursesEnrolled?: string[];
  department?: string;
}

export type MediaContentType = 'video' | 'pdf' | 'image' | 'article';

export interface MediaResource {
  id: string;
  type: MediaContentType;
  title: string;
  url: string;
  description?: string;
  durationMinutes?: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  order: number;
  resources: MediaResource[];
  contentHtml?: string;
  durationMinutes: number;
  assignmentIds?: string[];
  quizIds?: string[];
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  questions: QuizQuestion[];
  maxAttempts?: 1 | 2 | 3 | 'unlimited';
}

export interface RubricCriterion {
  id: string;
  title: string;
  description: string;
  maxPoints: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  rubric: RubricCriterion[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  category: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  bannerGradient: string;
  bannerIcon: string;
  published: boolean;
  enrolledStudents: string[];
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  courseId: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  submittedAt: string;
  fileName?: string;
  fileUrl?: string;
  contentText: string;
  status: 'pending' | 'graded';
  score?: number;
  feedback?: string;
  rubricScores?: Record<string, number>;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  courseId: string;
  studentId: string;
  answers: Record<string, number>; // questionId -> optionIndex
  score: number;
  maxScore: number;
  percentage: number;
  completedAt: string;
  passed: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string; // or 'course_{courseId}'
  message: string;
  timestamp: string;
  read: boolean;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'assignment' | 'grade' | 'chat' | 'system';
  read: boolean;
  timestamp: string;
  linkAction?: string;
}

export interface StudentProgress {
  userId: string;
  courseId: string;
  completedLessonIds: string[];
  lastAccessedAt: string;
}
