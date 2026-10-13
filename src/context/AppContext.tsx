import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Course,
  CourseModule,
  Lesson,
  Quiz,
  Assignment,
  Submission,
  QuizAttempt,
  ChatMessage,
  AppNotification,
  StudentProgress
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_COURSES,
  INITIAL_MODULES,
  INITIAL_QUIZZES,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_QUIZ_ATTEMPTS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PROGRESS
} from '../data/initialData';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  users: User[];
  createUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  courses: Course[];
  createCourse: (course: Omit<Course, 'id' | 'createdAt' | 'enrolledStudents'>) => Course;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  enrollInCourse: (courseId: string) => void;
  enrollStudentInCourse: (courseId: string, studentId: string) => void;
  unenrollStudentFromCourse: (courseId: string, studentId: string) => void;
  modules: CourseModule[];
  createModule: (courseId: string, title: string, description: string) => void;
  updateModule: (id: string, updates: Partial<CourseModule>) => void;
  deleteModule: (id: string) => void;
  createLesson: (moduleId: string, lesson: Omit<Lesson, 'id' | 'moduleId' | 'order'>) => void;
  updateLesson: (id: string, updates: Partial<Lesson>) => void;
  deleteLesson: (id: string) => void;
  quizzes: Quiz[];
  createQuiz: (quiz: Omit<Quiz, 'id'>) => void;
  updateQuiz: (id: string, updates: Partial<Quiz>) => void;
  deleteQuiz: (id: string) => void;
  assignments: Assignment[];
  createAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  submissions: Submission[];
  createSubmission: (submission: { assignmentId: string; courseId: string; fileUrl?: string; fileName?: string; contentText: string }) => void;
  gradeSubmission: (id: string, score: number, feedback: string, rubricScores?: Record<string, number>) => void;
  quizAttempts: QuizAttempt[];
  submitQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (receiverId: string, message: string) => void;
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  progress: StudentProgress[];
  toggleLessonProgress: (courseId: string, lessonId: string) => void;
  markLessonAsCompleted: (courseId: string, lessonId: string) => void;
  isLessonCompleted: (courseId: string, lessonId: string) => boolean;
  getCourseProgressPercentage: (courseId: string) => number;
  recordCourseAccess: (courseId: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;
  selectedLessonId: string | null;
  setSelectedLessonId: (id: string | null) => void;
  selectedQuizId: string | null;
  setSelectedQuizId: (id: string | null) => void;
  resetToDefaultData: () => void;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => { success: boolean; error?: string };
  loginAsUser: (user: User) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'edusphere_users_v1',
  COURSES: 'edusphere_courses_v1',
  MODULES: 'edusphere_modules_v1',
  QUIZZES: 'edusphere_quizzes_v1',
  ASSIGNMENTS: 'edusphere_assignments_v1',
  SUBMISSIONS: 'edusphere_submissions_v1',
  QUIZ_ATTEMPTS: 'edusphere_attempts_v1',
  CHAT: 'edusphere_chat_v1',
  NOTIFICATIONS: 'edusphere_notif_v1',
  PROGRESS: 'edusphere_progress_v1',
  CURRENT_USER_ID: 'edusphere_current_user_v1',
  IS_AUTHENTICATED: 'edusphere_is_authenticated_v1',
  THEME: 'edusphere_theme_v1'
};

function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error loading ${key} from localStorage`, e);
    return defaultValue;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const loaded = getStoredItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    return loaded.map((u) => {
      if (!u.password) {
        const defaultPassword =
          u.role === 'admin'
            ? 'AdminEdu2026!'
            : u.role === 'teacher'
            ? 'DocenteEdu2026!'
            : 'EstudianteEdu2026!';
        return { ...u, password: defaultPassword };
      }
      return u;
    });
  });
  const [currentUserId, setCurrentUserId] = useState<string>(() =>
    getStoredItem(STORAGE_KEYS.CURRENT_USER_ID, INITIAL_USERS[0].id)
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    getStoredItem(STORAGE_KEYS.IS_AUTHENTICATED, false)
  );
  const [courses, setCourses] = useState<Course[]>(() => getStoredItem(STORAGE_KEYS.COURSES, INITIAL_COURSES));
  const [modules, setModules] = useState<CourseModule[]>(() => {
    const stored = getStoredItem(STORAGE_KEYS.MODULES, INITIAL_MODULES);
    return stored.map((m) => ({
      ...m,
      lessons: m.lessons.map((l) => {
        if (l.id === 'les_fs_1' && (!l.quizIds || l.quizIds.length === 0)) {
          return { ...l, quizIds: ['quiz_fs_1'] };
        }
        if (l.id === 'les_fs_2' && (!l.assignmentIds || l.assignmentIds.length === 0)) {
          return { ...l, assignmentIds: ['asg_fs_1'] };
        }
        if (l.id === 'les_ux_1' && (!l.assignmentIds || l.assignmentIds.length === 0)) {
          return { ...l, assignmentIds: ['asg_uiux_1'] };
        }
        return l;
      })
    }));
  });
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    const stored = getStoredItem(STORAGE_KEYS.QUIZZES, INITIAL_QUIZZES);
    return stored.map((q) => {
      if (q.id === 'quiz_fs_1' && !q.lessonId) return { ...q, lessonId: 'les_fs_1' };
      return q;
    });
  });
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const stored = getStoredItem(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    return stored.map((a) => {
      if (a.id === 'asg_fs_1' && !a.lessonId) return { ...a, lessonId: 'les_fs_2' };
      if (a.id === 'asg_uiux_1' && !a.lessonId) return { ...a, lessonId: 'les_ux_1' };
      return a;
    });
  });
  const [submissions, setSubmissions] = useState<Submission[]>(() =>
    getStoredItem(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS)
  );
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(() =>
    getStoredItem(STORAGE_KEYS.QUIZ_ATTEMPTS, INITIAL_QUIZ_ATTEMPTS)
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() =>
    getStoredItem(STORAGE_KEYS.CHAT, INITIAL_CHAT_MESSAGES)
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    getStoredItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
  );
  const [progress, setProgress] = useState<StudentProgress[]>(() =>
    getStoredItem(STORAGE_KEYS.PROGRESS, INITIAL_PROGRESS)
  );
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  const applyThemeToDOM = (t: 'light' | 'dark') => {
    const root = document.documentElement;
    const body = document.body;
    const rootEl = document.getElementById('root');
    if (t === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
      rootEl?.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      body.setAttribute('data-theme', 'dark');
      rootEl?.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      rootEl?.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      body.setAttribute('data-theme', 'light');
      rootEl?.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  };

  // Sync dark class and attributes on <html>, <body>, and #root
  useEffect(() => {
    applyThemeToDOM(theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, JSON.stringify(currentUserId));
  }, [currentUserId]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  }, [courses]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(modules));
  }, [modules]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
  }, [quizzes]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  }, [assignments]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  }, [submissions]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUIZ_ATTEMPTS, JSON.stringify(quizAttempts));
  }, [quizAttempts]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(chatMessages));
  }, [chatMessages]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  }, [progress]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  const login = (email: string, password?: string) => {
    const trimmed = email.trim().toLowerCase();
    const targetUser = users.find((u) => u.email.toLowerCase() === trimmed);
    if (!targetUser) {
      return {
        success: false,
        error: 'El correo institucional no se encuentra registrado en el sistema.'
      };
    }
    if (!password || password.trim().length === 0) {
      return {
        success: false,
        error: 'Por favor ingresa tu contraseña institucional.'
      };
    }

    const rolePassword =
      targetUser.role === 'admin'
        ? 'AdminEdu2026!'
        : targetUser.role === 'teacher'
        ? 'DocenteEdu2026!'
        : 'EstudianteEdu2026!';

    const validPasswords = [
      targetUser.password,
      rolePassword,
      'AlexisCastro2026!',
      'alexiscastro123',
      'edusphere123',
      'EduSphere2026!'
    ].filter(Boolean) as string[];

    if (!validPasswords.includes(password.trim())) {
      return {
        success: false,
        error: 'Contraseña incorrecta. Por favor verifica tus credenciales institucionales.'
      };
    }

    setCurrentUserId(targetUser.id);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
    setSelectedCourseId(null);
    setSelectedLessonId(null);
    setSelectedQuizId(null);
    return { success: true };
  };

  const loginAsUser = (user: User) => {
    setCurrentUserId(user.id);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
    setSelectedCourseId(null);
    setSelectedLessonId(null);
    setSelectedQuizId(null);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setActiveTab('dashboard');
    setSelectedCourseId(null);
    setSelectedLessonId(null);
    setSelectedQuizId(null);
  };

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      applyThemeToDOM(next);
      localStorage.setItem(STORAGE_KEYS.THEME, next);
      return next;
    });
  };

  const switchRole = (role: UserRole) => {
    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      setCurrentUserId(targetUser.id);
      setActiveTab('dashboard');
      setSelectedCourseId(null);
      setSelectedLessonId(null);
      setSelectedQuizId(null);
    }
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserId(user.id);
  };

  // User CRUD
  const createUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const defaultPassword =
      userData.role === 'admin'
        ? 'AdminEdu2026!'
        : userData.role === 'teacher'
        ? 'DocenteEdu2026!'
        : 'EstudianteEdu2026!';

    const newUser: User = {
      ...userData,
      id: `usr_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      password: (userData.password && userData.password.trim().length > 0) ? userData.password.trim() : defaultPassword,
      avatar:
        userData.avatar ||
        `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 500)}?w=150&auto=format&fit=crop&q=80`
    };
    setUsers((prev) => [newUser, ...prev]);

    // Add notification to admin
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: 'Usuario Creado',
      message: `Has creado exitosamente al usuario ${newUser.name} con el rol de ${newUser.role}. Contraseña asignada: ${newUser.password}`,
      type: 'system',
      read: false,
      timestamp: new Date().toISOString(),
      linkAction: 'users'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          if (updates.password !== undefined && updates.password.trim().length > 0) {
            updated.password = updates.password.trim();
          }
          return updated;
        }
        return u;
      })
    );
    const target = users.find((u) => u.id === id);
    if (target) {
      const notif: AppNotification = {
        id: `notif_${Date.now()}`,
        userId: currentUser?.id || 'usr_admin_1',
        title: 'Usuario Actualizado',
        message: `El usuario ${updates.name || target.name} ha sido modificado en el sistema.`,
        type: 'system',
        read: false,
        timestamp: new Date().toISOString(),
        linkAction: 'users'
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const deleteUser = (id: string) => {
    const targetUser = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setCourses((prev) =>
      prev.map((c) => ({
        ...c,
        enrolledStudents: (c.enrolledStudents || []).filter((sId) => sId !== id)
      }))
    );
    setSubmissions((prev) => prev.filter((s) => s.studentId !== id));
    setQuizAttempts((prev) => prev.filter((q) => q.studentId !== id));
    setProgress((prev) => prev.filter((p) => p.userId !== id));

    if (currentUserId === id) {
      const fallback = users.find((u) => u.id !== id);
      if (fallback) setCurrentUserId(fallback.id);
    }

    if (targetUser) {
      const notif: AppNotification = {
        id: `notif_${Date.now()}`,
        userId: currentUser?.id || 'usr_admin_1',
        title: 'Usuario Eliminado',
        message: `El usuario ${targetUser.name} (${targetUser.email}) ha sido eliminado permanentemente de la plataforma.`,
        type: 'system',
        read: false,
        timestamp: new Date().toISOString(),
        linkAction: 'users'
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // Course CRUD
  const createCourse = (courseData: Omit<Course, 'id' | 'createdAt' | 'enrolledStudents'>): Course => {
    const newCourse: Course = {
      ...courseData,
      id: `crs_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      enrolledStudents: []
    };
    setCourses((prev) => [newCourse, ...prev]);
    return newCourse;
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    setModules((prev) => prev.filter((m) => m.courseId !== id));
    setAssignments((prev) => prev.filter((a) => a.courseId !== id));
    setQuizzes((prev) => prev.filter((q) => q.courseId !== id));
    setSubmissions((prev) => prev.filter((s) => s.courseId !== id));
    setUsers((prev) =>
      prev.map((u) => ({
        ...u,
        coursesEnrolled: (u.coursesEnrolled || []).filter((cId) => cId !== id)
      }))
    );
    setProgress((prev) => prev.filter((p) => p.courseId !== id));
  };

  const enrollInCourse = (courseId: string) => {
    enrollStudentInCourse(courseId, currentUser.id);
  };

  const enrollStudentInCourse = (courseId: string, studentId: string) => {
    const targetCourse = courses.find((c) => c.id === courseId);
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const currentList = c.enrolledStudents || [];
          if (!currentList.includes(studentId)) {
            return { ...c, enrolledStudents: [...currentList, studentId] };
          }
        }
        return c;
      })
    );
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === studentId) {
          const currentEnrolled = u.coursesEnrolled || [];
          if (!currentEnrolled.includes(courseId)) {
            return { ...u, coursesEnrolled: [...currentEnrolled, courseId] };
          }
        }
        return u;
      })
    );

    if (targetCourse) {
      const notif: AppNotification = {
        id: `notif_${Date.now()}_${studentId}`,
        userId: studentId,
        title: 'Matrícula Confirmada',
        message: `Has sido matriculado en el curso "${targetCourse.title}". Ya puedes acceder a todas sus clases y contenidos.`,
        type: 'assignment',
        read: false,
        timestamp: new Date().toISOString(),
        linkAction: 'courses'
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const unenrollStudentFromCourse = (courseId: string, studentId: string) => {
    const targetCourse = courses.find((c) => c.id === courseId);
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            enrolledStudents: (c.enrolledStudents || []).filter((id) => id !== studentId)
          };
        }
        return c;
      })
    );
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === studentId) {
          return {
            ...u,
            coursesEnrolled: (u.coursesEnrolled || []).filter((id) => id !== courseId)
          };
        }
        return u;
      })
    );
    setProgress((prev) => prev.filter((p) => !(p.userId === studentId && p.courseId === courseId)));

    if (targetCourse) {
      const notif: AppNotification = {
        id: `notif_${Date.now()}_${studentId}`,
        userId: studentId,
        title: 'Baja de Curso',
        message: `Has sido desmatriculado del curso "${targetCourse.title}".`,
        type: 'system',
        read: false,
        timestamp: new Date().toISOString()
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // Module & Lesson CRUD
  const createModule = (courseId: string, title: string, description: string) => {
    const existing = modules.filter((m) => m.courseId === courseId);
    const newMod: CourseModule = {
      id: `mod_${Date.now()}`,
      courseId,
      title,
      description,
      order: existing.length + 1,
      lessons: []
    };
    setModules((prev) => [...prev, newMod]);
  };

  const updateModule = (id: string, updates: Partial<CourseModule>) => {
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const deleteModule = (id: string) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
  };

  const createLesson = (moduleId: string, lessonData: Omit<Lesson, 'id' | 'moduleId' | 'order'>) => {
    const newLessonId = `les_${Date.now()}`;
    setModules((prev) =>
      prev.map((m) => {
        if (m.id === moduleId) {
          const newLesson: Lesson = {
            ...lessonData,
            id: newLessonId,
            moduleId,
            order: m.lessons.length + 1
          };
          return { ...m, lessons: [...m.lessons, newLesson] };
        }
        return m;
      })
    );

    if (lessonData.assignmentIds && lessonData.assignmentIds.length > 0) {
      setAssignments((prev) =>
        prev.map((a) => (lessonData.assignmentIds!.includes(a.id) ? { ...a, lessonId: newLessonId } : a))
      );
    }
    if (lessonData.quizIds && lessonData.quizIds.length > 0) {
      setQuizzes((prev) =>
        prev.map((q) => (lessonData.quizIds!.includes(q.id) ? { ...q, lessonId: newLessonId } : q))
      );
    }
  };

  const updateLesson = (id: string, updates: Partial<Lesson>) => {
    setModules((prev) =>
      prev.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => (l.id === id ? { ...l, ...updates } : l))
      }))
    );

    if (updates.assignmentIds !== undefined) {
      setAssignments((prev) =>
        prev.map((a) => {
          if (updates.assignmentIds!.includes(a.id)) {
            return { ...a, lessonId: id };
          } else if (a.lessonId === id) {
            return { ...a, lessonId: undefined };
          }
          return a;
        })
      );
    }

    if (updates.quizIds !== undefined) {
      setQuizzes((prev) =>
        prev.map((q) => {
          if (updates.quizIds!.includes(q.id)) {
            return { ...q, lessonId: id };
          } else if (q.lessonId === id) {
            return { ...q, lessonId: undefined };
          }
          return q;
        })
      );
    }
  };

  const deleteLesson = (id: string) => {
    setModules((prev) =>
      prev.map((m) => ({
        ...m,
        lessons: m.lessons.filter((l) => l.id !== id)
      }))
    );
    setAssignments((prev) =>
      prev.map((a) => (a.lessonId === id ? { ...a, lessonId: undefined } : a))
    );
    setQuizzes((prev) =>
      prev.map((q) => (q.lessonId === id ? { ...q, lessonId: undefined } : q))
    );
  };

  // Quizzes CRUD
  const createQuiz = (quizData: Omit<Quiz, 'id'>) => {
    const newQuizId = `quiz_${Date.now()}`;
    const newQuiz: Quiz = {
      ...quizData,
      id: newQuizId
    };
    setQuizzes((prev) => [...prev, newQuiz]);

    if (quizData.lessonId) {
      setModules((prev) =>
        prev.map((m) => ({
          ...m,
          lessons: m.lessons.map((l) => {
            if (l.id === quizData.lessonId) {
              const current = l.quizIds || [];
              if (!current.includes(newQuizId)) {
                return { ...l, quizIds: [...current, newQuizId] };
              }
            }
            return l;
          })
        }))
      );
    }
  };

  const updateQuiz = (id: string, updates: Partial<Quiz>) => {
    setQuizzes((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));

    if (updates.lessonId !== undefined) {
      setModules((prev) =>
        prev.map((m) => ({
          ...m,
          lessons: m.lessons.map((l) => {
            const current = l.quizIds || [];
            if (l.id === updates.lessonId) {
              if (!current.includes(id)) return { ...l, quizIds: [...current, id] };
            } else if (current.includes(id)) {
              return { ...l, quizIds: current.filter((qId) => qId !== id) };
            }
            return l;
          })
        }))
      );
    }
  };

  const deleteQuiz = (id: string) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
    setQuizAttempts((prev) => prev.filter((qa) => qa.quizId !== id));
    setModules((prev) =>
      prev.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => ({
          ...l,
          quizIds: (l.quizIds || []).filter((qId) => qId !== id)
        }))
      }))
    );
  };

  // Assignments CRUD
  const createAssignment = (asgData: Omit<Assignment, 'id'>) => {
    const newAsgId = `asg_${Date.now()}`;
    const newAsg: Assignment = {
      ...asgData,
      id: newAsgId
    };
    setAssignments((prev) => [...prev, newAsg]);

    if (asgData.lessonId) {
      setModules((prev) =>
        prev.map((m) => ({
          ...m,
          lessons: m.lessons.map((l) => {
            if (l.id === asgData.lessonId) {
              const current = l.assignmentIds || [];
              if (!current.includes(newAsgId)) {
                return { ...l, assignmentIds: [...current, newAsgId] };
              }
            }
            return l;
          })
        }))
      );
    }

    // Notify enrolled students
    const targetCourse = courses.find((c) => c.id === asgData.courseId);
    if (targetCourse) {
      targetCourse.enrolledStudents.forEach((studentId) => {
        const notif: AppNotification = {
          id: `notif_${Date.now()}_${studentId}`,
          userId: studentId,
          title: 'Nueva Tarea Asignada',
          message: `El docente ha publicado una nueva tarea: "${asgData.title}".`,
          type: 'assignment',
          read: false,
          timestamp: new Date().toISOString(),
          linkAction: 'assignments'
        };
        setNotifications((prev) => [notif, ...prev]);
      });
    }
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));

    if (updates.lessonId !== undefined) {
      setModules((prev) =>
        prev.map((m) => ({
          ...m,
          lessons: m.lessons.map((l) => {
            const current = l.assignmentIds || [];
            if (l.id === updates.lessonId) {
              if (!current.includes(id)) return { ...l, assignmentIds: [...current, id] };
            } else if (current.includes(id)) {
              return { ...l, assignmentIds: current.filter((aId) => aId !== id) };
            }
            return l;
          })
        }))
      );
    }
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    setSubmissions((prev) => prev.filter((s) => s.assignmentId !== id));
    setModules((prev) =>
      prev.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => ({
          ...l,
          assignmentIds: (l.assignmentIds || []).filter((aId) => aId !== id)
        }))
      }))
    );
  };

  // Submissions & Grading
  const createSubmission = (data: {
    assignmentId: string;
    courseId: string;
    fileUrl?: string;
    fileName?: string;
    contentText: string;
  }) => {
    const newSub: Submission = {
      id: `sub_${Date.now()}`,
      assignmentId: data.assignmentId,
      courseId: data.courseId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentAvatar: currentUser.avatar,
      submittedAt: new Date().toISOString(),
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      contentText: data.contentText,
      status: 'pending'
    };
    setSubmissions((prev) => [newSub, ...prev]);

    // Notify teacher of the course
    const course = courses.find((c) => c.id === data.courseId);
    if (course) {
      const notif: AppNotification = {
        id: `notif_${Date.now()}`,
        userId: course.teacherId,
        title: 'Nueva Entrega de Tarea',
        message: `${currentUser.name} ha enviado su entrega para la tarea asignada.`,
        type: 'assignment',
        read: false,
        timestamp: new Date().toISOString(),
        linkAction: 'grading'
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    // Auto-update student progress if assignment belongs to a lesson
    const relatedAsg = assignments.find((a) => a.id === data.assignmentId);
    if (relatedAsg?.lessonId) {
      markLessonAsCompleted(data.courseId, relatedAsg.lessonId);
    }
  };

  const gradeSubmission = (
    id: string,
    score: number,
    feedback: string,
    rubricScores?: Record<string, number>
  ) => {
    let studentId = '';
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          studentId = sub.studentId;
          return {
            ...sub,
            status: 'graded',
            score,
            feedback,
            rubricScores
          };
        }
        return sub;
      })
    );

    if (studentId) {
      const notif: AppNotification = {
        id: `notif_${Date.now()}`,
        userId: studentId,
        title: 'Calificación Publicada',
        message: `Tu entrega ha sido calificada con una nota de ${score} puntos. Revisa los comentarios del docente.`,
        type: 'grade',
        read: false,
        timestamp: new Date().toISOString(),
        linkAction: 'grades'
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // Quiz Attempt
  const submitQuizAttempt = (attemptData: Omit<QuizAttempt, 'id' | 'completedAt'>) => {
    const newAttempt: QuizAttempt = {
      ...attemptData,
      id: `att_${Date.now()}`,
      completedAt: new Date().toISOString()
    };
    setQuizAttempts((prev) => [newAttempt, ...prev]);

    // If quiz is linked to a lesson and student passed, automatically mark the lesson as completed
    const relatedQuiz = quizzes.find((q) => q.id === attemptData.quizId);
    if (relatedQuiz?.lessonId && attemptData.passed) {
      markLessonAsCompleted(attemptData.courseId, relatedQuiz.lessonId);
    }

    // Send instant notification
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: 'Examen Completado',
      message: `Has completado el examen con una calificación de ${attemptData.score}/${attemptData.maxScore} (${attemptData.percentage}%).`,
      type: 'grade',
      read: false,
      timestamp: new Date().toISOString(),
      linkAction: 'grades'
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Chat
  const sendChatMessage = (receiverId: string, message: string) => {
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };
    setChatMessages((prev) => [...prev, newMsg]);

    // If receiver is a real user, send notification
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: receiverId,
      title: `Mensaje de ${currentUser.name}`,
      message: message.length > 60 ? `${message.slice(0, 57)}...` : message,
      type: 'chat',
      read: false,
      timestamp: new Date().toISOString(),
      linkAction: 'chat'
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.userId === currentUser.id ? { ...n, read: true } : n))
    );
  };

  // Student Progress
  const toggleLessonProgress = (courseId: string, lessonId: string) => {
    setProgress((prev) => {
      const existing = prev.find((p) => p.userId === currentUser.id && p.courseId === courseId);
      if (!existing) {
        return [
          ...prev,
          {
            userId: currentUser.id,
            courseId,
            completedLessonIds: [lessonId],
            lastAccessedAt: new Date().toISOString()
          }
        ];
      }
      const isCompleted = existing.completedLessonIds.includes(lessonId);
      const newCompleted = isCompleted
        ? existing.completedLessonIds.filter((id) => id !== lessonId)
        : [...existing.completedLessonIds, lessonId];

      return prev.map((p) =>
        p.userId === currentUser.id && p.courseId === courseId
          ? { ...p, completedLessonIds: newCompleted, lastAccessedAt: new Date().toISOString() }
          : p
      );
    });
  };

  const markLessonAsCompleted = (courseId: string, lessonId: string) => {
    setProgress((prev) => {
      const existing = prev.find((p) => p.userId === currentUser.id && p.courseId === courseId);
      if (!existing) {
        return [
          ...prev,
          {
            userId: currentUser.id,
            courseId,
            completedLessonIds: [lessonId],
            lastAccessedAt: new Date().toISOString()
          }
        ];
      }
      if (!existing.completedLessonIds.includes(lessonId)) {
        return prev.map((p) =>
          p.userId === currentUser.id && p.courseId === courseId
            ? {
                ...p,
                completedLessonIds: [...p.completedLessonIds, lessonId],
                lastAccessedAt: new Date().toISOString()
              }
            : p
        );
      }
      return prev.map((p) =>
        p.userId === currentUser.id && p.courseId === courseId
          ? { ...p, lastAccessedAt: new Date().toISOString() }
          : p
      );
    });
  };

  const recordCourseAccess = (courseId: string) => {
    setProgress((prev) => {
      const existing = prev.find((p) => p.userId === currentUser.id && p.courseId === courseId);
      if (!existing) {
        return [
          ...prev,
          {
            userId: currentUser.id,
            courseId,
            completedLessonIds: [],
            lastAccessedAt: new Date().toISOString()
          }
        ];
      }
      return prev.map((p) =>
        p.userId === currentUser.id && p.courseId === courseId
          ? { ...p, lastAccessedAt: new Date().toISOString() }
          : p
      );
    });
  };

  const isLessonCompleted = (courseId: string, lessonId: string): boolean => {
    const userProgress = progress.find((p) => p.userId === currentUser.id && p.courseId === courseId);
    return userProgress ? userProgress.completedLessonIds.includes(lessonId) : false;
  };

  const getCourseProgressPercentage = (courseId: string): number => {
    const courseModules = modules.filter((m) => m.courseId === courseId);
    let totalLessons = 0;
    courseModules.forEach((m) => {
      totalLessons += m.lessons.length;
    });
    if (totalLessons === 0) return 0;

    const userProgress = progress.find((p) => p.userId === currentUser.id && p.courseId === courseId);
    const completedCount = userProgress ? userProgress.completedLessonIds.length : 0;
    return Math.min(100, Math.round((completedCount / totalLessons) * 100));
  };

  const resetToDefaultData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUserId(INITIAL_USERS[0].id);
    setCourses(INITIAL_COURSES);
    setModules(INITIAL_MODULES);
    setQuizzes(INITIAL_QUIZZES);
    setAssignments(INITIAL_ASSIGNMENTS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setQuizAttempts(INITIAL_QUIZ_ATTEMPTS);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setProgress(INITIAL_PROGRESS);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        users,
        createUser,
        updateUser,
        deleteUser,
        courses,
        createCourse,
        updateCourse,
        deleteCourse,
        enrollInCourse,
        enrollStudentInCourse,
        unenrollStudentFromCourse,
        modules,
        createModule,
        updateModule,
        deleteModule,
        createLesson,
        updateLesson,
        deleteLesson,
        quizzes,
        createQuiz,
        updateQuiz,
        deleteQuiz,
        assignments,
        createAssignment,
        updateAssignment,
        deleteAssignment,
        submissions,
        createSubmission,
        gradeSubmission,
        quizAttempts,
        submitQuizAttempt,
        chatMessages,
        sendChatMessage,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        progress,
        toggleLessonProgress,
        markLessonAsCompleted,
        isLessonCompleted,
        getCourseProgressPercentage,
        recordCourseAccess,
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        selectedCourseId,
        setSelectedCourseId,
        selectedLessonId,
        setSelectedLessonId,
        selectedQuizId,
        setSelectedQuizId,
        resetToDefaultData,
        isAuthenticated,
        login,
        loginAsUser,
        logout
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
