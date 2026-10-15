import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Course, CourseModule, Lesson, Submission, Assignment, AssignmentMaterial, Quiz, QuizQuestion, MediaContentType, User } from '../../types';
import {
  BookOpen,
  Plus,
  Video,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  ChevronRight,
  ChevronDown,
  Trash2,
  Edit3,
  Award,
  Users,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Layers,
  FileCheck,
  UserCheck,
  UserMinus,
  UserPlus,
  Search,
  HelpCircle,
  RotateCcw,
  Eye,
  Link2,
  Paperclip,
  RefreshCw,
  Lock
} from 'lucide-react';
import { MediaRenderer } from '../common/MediaRenderer';
import { resolveMediaEmbedInfo } from '../../utils/mediaUtils';
import { RichTextEditor } from '../common/RichTextEditor';
import { QuizPlayer } from '../student/QuizPlayer';

export const TeacherDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    courses,
    createCourse,
    updateCourse,
    deleteCourse,
    modules,
    createModule,
    updateModule,
    deleteModule,
    createLesson,
    updateLesson,
    deleteLesson,
    enrollStudentInCourse,
    unenrollStudentFromCourse,
    submissions,
    gradeSubmission,
    assignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    quizzes,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    setActiveTab,
    activeTab,
    reloadFromBackend
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);

  // Active view within Teacher: 'courses' | 'grading' | 'assignments'
  const [teacherView, setTeacherView] = useState<'courses' | 'grading' | 'assignments'>(() => {
    if (activeTab === 'grading') return 'grading';
    if (activeTab === 'assignments' || activeTab === 'evaluations') return 'assignments';
    return 'courses';
  });

  // Keep teacherView in sync with activeTab changes (from notifications or sidebar)
  useEffect(() => {
    if (activeTab === 'grading') {
      setTeacherView('grading');
    } else if (activeTab === 'assignments' || activeTab === 'evaluations') {
      setTeacherView('assignments');
    } else if (activeTab === 'courses' || activeTab === 'dashboard') {
      setTeacherView('courses');
    }
  }, [activeTab]);

  // Modals visibility
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [isNewModuleModalOpen, setIsNewModuleModalOpen] = useState(false);
  const [isEditModuleModalOpen, setIsEditModuleModalOpen] = useState(false);
  const [isNewLessonModalOpen, setIsNewLessonModalOpen] = useState(false);
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [isNewAssignmentModalOpen, setIsNewAssignmentModalOpen] = useState(false);
  const [isEditAssignmentModalOpen, setIsEditAssignmentModalOpen] = useState(false);
  const [isNewQuizModalOpen, setIsNewQuizModalOpen] = useState(false);
  const [isEditQuizModalOpen, setIsEditQuizModalOpen] = useState(false);

  // In-app Confirmation Dialog (Never blocked by iframe sandbox)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirmar',
    isDestructive: false,
    onConfirm: () => {}
  });

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Selection states
  const [activeCourseId, setActiveCourseId] = useState<string>(
    courses.find((c) => c.teacherId === currentUser.id)?.id || courses[0]?.id || ''
  );
  const [courseFilter, setCourseFilter] = useState<'my' | 'all'>('my');
  const [activeModuleId, setActiveModuleId] = useState<string>('');
  const [activeLessonId, setActiveLessonId] = useState<string>('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Preview States for Teacher (Lesson, Assignment, Quiz)
  const [previewingLesson, setPreviewingLesson] = useState<Lesson | null>(null);
  const [previewResourceIdx, setPreviewResourceIdx] = useState<number>(0);
  const [previewingAssignment, setPreviewingAssignment] = useState<Assignment | null>(null);
  const [previewingQuiz, setPreviewingQuiz] = useState<Quiz | null>(null);

  // Course Form States
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseCategory, setCourseCategory] = useState('Programación');
  const [courseLevel, setCourseLevel] = useState<'Principiante' | 'Intermedio' | 'Avanzado'>('Intermedio');

  // Module Form States
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');

  // Lesson Form States
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonDuration, setLessonDuration] = useState(20);
  const [mediaType, setMediaType] = useState<MediaContentType>('video');
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [lessonRichText, setLessonRichText] = useState('');
  const [selectedLessonAssignmentIds, setSelectedLessonAssignmentIds] = useState<string[]>([]);
  const [selectedLessonQuizIds, setSelectedLessonQuizIds] = useState<string[]>([]);
  const [asgLessonId, setAsgLessonId] = useState('');
  const [asgEditLessonId, setAsgEditLessonId] = useState('');
  const [quizLessonId, setQuizLessonId] = useState('');

  // Grading Form
  const [gradeScore, setGradeScore] = useState<number>(90);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({});

  // New Assignment Form
  const [asgTitle, setAsgTitle] = useState('');
  const [asgDescription, setAsgDescription] = useState('');
  const [asgDueDate, setAsgDueDate] = useState('2026-11-15T23:59');
  const [asgCourseId, setAsgCourseId] = useState(activeCourseId);
  const [asgMaterials, setAsgMaterials] = useState<AssignmentMaterial[]>([]);
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialUrl, setNewMaterialUrl] = useState('');

  // Edit Assignment Form
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [asgEditTitle, setAsgEditTitle] = useState('');
  const [asgEditDescription, setAsgEditDescription] = useState('');
  const [asgEditDueDate, setAsgEditDueDate] = useState('');
  const [asgEditCourseId, setAsgEditCourseId] = useState('');
  const [asgEditMaxScore, setAsgEditMaxScore] = useState(100);
  const [asgEditMaterials, setAsgEditMaterials] = useState<AssignmentMaterial[]>([]);
  const [newEditMaterialTitle, setNewEditMaterialTitle] = useState('');
  const [newEditMaterialUrl, setNewEditMaterialUrl] = useState('');

  // Quiz Form (New & Edit)
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [quizCourseId, setQuizCourseId] = useState('');
  const [quizTimeLimit, setQuizTimeLimit] = useState(15);
  const [quizMaxAttempts, setQuizMaxAttempts] = useState<1 | 2 | 3 | 'unlimited'>('unlimited');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  // Helper to determine if the active user can edit/delete/manage a specific course
  // (Only the teacher who created the course or an administrator)
  const canEditCourse = (c?: Course | null) => {
    if (!c) return false;
    return currentUser.role === 'admin' || c.teacherId === currentUser.id;
  };

  // Teacher courses
  const myCourses = courses.filter((c) => c.teacherId === currentUser.id);
  const displayedCourses = courseFilter === 'my' ? myCourses : courses;
  const activeCourse = courses.find((c) => c.id === activeCourseId) || displayedCourses[0] || myCourses[0] || courses[0];
  const courseModules = modules.filter((m) => m.courseId === activeCourse?.id);
  const canManageActiveCourse = Boolean(activeCourse && canEditCourse(activeCourse));
  const activeCourseTeacher = users.find((u) => u.id === activeCourse?.teacherId);

  // Courses the current user can assign new items/evaluations to
  const manageableCourses = currentUser.role === 'admin' ? courses : myCourses;

  // Submissions for my courses
  const myCourseIds = myCourses.map((c) => c.id);
  const mySubmissions = submissions.filter((s) => myCourseIds.includes(s.courseId));
  const pendingSubmissions = mySubmissions.filter((s) => s.status === 'pending');
  const gradedSubmissions = mySubmissions.filter((s) => s.status === 'graded');

  // Students list for enrollment manager - synchronized across course.enrolledStudents and student.coursesEnrolled
  const allStudents = users.filter((u) => u.role === 'student');
  const enrolledStudentIds = activeCourse?.enrolledStudents || [];
  const enrolledStudents = allStudents.filter(
    (s) => enrolledStudentIds.includes(s.id) || (s.coursesEnrolled || []).includes(activeCourse?.id || '')
  );
  const availableStudents = allStudents.filter(
    (s) => !enrolledStudentIds.includes(s.id) && !(s.coursesEnrolled || []).includes(activeCourse?.id || '')
  );

  const filteredEnrolledStudents = enrolledStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearchQuery.toLowerCase())
  );
  const filteredAvailableStudents = availableStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearchQuery.toLowerCase())
  );

  // --- Handlers for COURSE ---
  const handleCreateCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) return;

    const newC = createCourse({
      title: courseTitle.trim(),
      description: courseDescription.trim(),
      category: courseCategory,
      level: courseLevel,
      teacherId: currentUser.id,
      published: true,
      bannerGradient: 'from-indigo-600 via-indigo-700 to-slate-900',
      bannerIcon: 'Layers'
    });

    createModule(newC.id, 'Módulo 1: Introducción y Fundamentos', 'Bienvenida al curso y conceptos iniciales.');

    setCourseTitle('');
    setCourseDescription('');
    setIsNewCourseModalOpen(false);
    setActiveCourseId(newC.id);
    showToast(`Curso "${newC.title}" creado exitosamente.`);
  };

  const openEditCourseModal = (course: Course) => {
    if (!canEditCourse(course)) {
      showToast('Solo el docente titular o un administrador pueden editar este curso.');
      return;
    }
    setActiveCourseId(course.id);
    setCourseTitle(course.title);
    setCourseDescription(course.description);
    setCourseCategory(course.category);
    setCourseLevel(course.level);
    setIsEditCourseModalOpen(true);
  };

  const handleEditCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourse || !courseTitle.trim()) return;
    if (!canEditCourse(activeCourse)) {
      showToast('No tienes permisos para modificar este curso.');
      return;
    }

    updateCourse(activeCourse.id, {
      title: courseTitle.trim(),
      description: courseDescription.trim(),
      category: courseCategory,
      level: courseLevel
    });

    setIsEditCourseModalOpen(false);
    showToast(`Curso "${courseTitle.trim()}" actualizado exitosamente.`);
  };

  const handleDeleteCourse = (course: Course) => {
    if (!canEditCourse(course)) {
      showToast('Solo el docente titular o un administrador pueden eliminar este curso.');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: `Eliminar Curso: "${course.title}"`,
      message: `¿Estás seguro de que deseas eliminar permanentemente este curso? Se eliminarán todos sus módulos (${
        modules.filter((m) => m.courseId === course.id).length
      }), todas sus clases y tareas asociadas. Los alumnos perderán la matrícula en este curso. Esta acción no se puede deshacer.`,
      confirmLabel: 'Sí, eliminar curso definitivamente',
      isDestructive: true,
      onConfirm: () => {
        deleteCourse(course.id);
        const remaining = courses.filter((c) => c.id !== course.id);
        if (remaining.length > 0) {
          setActiveCourseId(remaining[0].id);
        } else {
          setActiveCourseId('');
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast(`Curso "${course.title}" eliminado correctamente.`);
      }
    });
  };

  // --- Handlers for MODULE ---
  const handleCreateModuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle.trim() || !activeCourse) return;
    if (!canManageActiveCourse) {
      showToast('No tienes permisos para añadir módulos a este curso.');
      return;
    }

    createModule(activeCourse.id, moduleTitle.trim(), moduleDescription.trim());
    showToast(`Módulo "${moduleTitle.trim()}" creado exitosamente.`);
    setModuleTitle('');
    setModuleDescription('');
    setIsNewModuleModalOpen(false);
  };

  const openEditModuleModal = (module: CourseModule) => {
    if (!canManageActiveCourse) {
      showToast('No tienes permisos para editar módulos en este curso.');
      return;
    }
    setActiveModuleId(module.id);
    setModuleTitle(module.title);
    setModuleDescription(module.description);
    setIsEditModuleModalOpen(true);
  };

  const handleEditModuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModuleId || !moduleTitle.trim()) return;
    if (!canManageActiveCourse) {
      showToast('No tienes permisos para modificar módulos en este curso.');
      return;
    }

    updateModule(activeModuleId, {
      title: moduleTitle.trim(),
      description: moduleDescription.trim()
    });

    setIsEditModuleModalOpen(false);
    showToast(`Módulo "${moduleTitle.trim()}" actualizado exitosamente.`);
  };

  const handleDeleteModule = (module: CourseModule) => {
    if (!canManageActiveCourse) {
      showToast('No tienes permisos para eliminar módulos en este curso.');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: `Eliminar Módulo: "${module.title}"`,
      message: `¿Estás seguro de que deseas eliminar este módulo? Se eliminarán todas sus clases asociadas (${module.lessons.length} clases). Esta acción no se puede deshacer.`,
      confirmLabel: 'Sí, eliminar módulo',
      isDestructive: true,
      onConfirm: () => {
        deleteModule(module.id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast(`Módulo "${module.title}" eliminado exitosamente.`);
      }
    });
  };

  // --- Handlers for LESSON ---
  const handleCreateLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !activeModuleId) return;
    if (!canManageActiveCourse) {
      showToast('No tienes permisos para crear clases en este curso.');
      return;
    }

    createLesson(activeModuleId, {
      title: lessonTitle.trim(),
      description: lessonDescription.trim(),
      durationMinutes: Number(lessonDuration) || 15,
      contentHtml: lessonRichText.trim() || `<p>${lessonDescription.trim()}</p>`,
      assignmentIds: selectedLessonAssignmentIds,
      quizIds: selectedLessonQuizIds,
      resources: mediaUrl.trim()
        ? [
            {
              id: `res_${Date.now()}`,
              type: mediaType,
              title: mediaTitle.trim() || lessonTitle.trim(),
              url: mediaUrl.trim(),
              description: `Material complementario en ${mediaType.toUpperCase()}`,
              durationMinutes: mediaType === 'video' ? Number(lessonDuration) : undefined
            }
          ]
        : []
    });

    showToast(`Clase "${lessonTitle.trim()}" creada con ${selectedLessonAssignmentIds.length} tareas y ${selectedLessonQuizIds.length} evaluaciones integradas.`);
    setLessonTitle('');
    setLessonDescription('');
    setMediaTitle('');
    setMediaUrl('');
    setLessonRichText('');
    setSelectedLessonAssignmentIds([]);
    setSelectedLessonQuizIds([]);
    setIsNewLessonModalOpen(false);
  };

  const openEditLessonModal = (lesson: Lesson, moduleId: string) => {
    if (!canManageActiveCourse) {
      showToast('No tienes permisos para editar clases en este curso.');
      return;
    }
    setActiveLessonId(lesson.id);
    setActiveModuleId(moduleId);
    setLessonTitle(lesson.title);
    setLessonDescription(lesson.description);
    setLessonDuration(lesson.durationMinutes || 20);

    const firstRes = lesson.resources[0];
    if (firstRes) {
      setMediaType(firstRes.type);
      setMediaTitle(firstRes.title);
      setMediaUrl(firstRes.url);
    } else {
      setMediaType('video');
      setMediaTitle('');
      setMediaUrl('');
    }

    setLessonRichText(lesson.contentHtml || '');

    // Gather integrated assignments and quizzes
    const currentAsgIds = lesson.assignmentIds || assignments.filter((a) => a.lessonId === lesson.id).map((a) => a.id);
    setSelectedLessonAssignmentIds(currentAsgIds);

    const currentQuizIds = lesson.quizIds || quizzes.filter((q) => q.lessonId === lesson.id).map((q) => q.id);
    setSelectedLessonQuizIds(currentQuizIds);

    setIsEditLessonModalOpen(true);
  };

  const handleEditLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLessonId || !lessonTitle.trim()) return;
    if (!canManageActiveCourse) {
      showToast('No tienes permisos para editar clases en este curso.');
      return;
    }

    updateLesson(activeLessonId, {
      title: lessonTitle.trim(),
      description: lessonDescription.trim(),
      durationMinutes: Number(lessonDuration) || 15,
      contentHtml: lessonRichText.trim() || `<p>${lessonDescription.trim()}</p>`,
      assignmentIds: selectedLessonAssignmentIds,
      quizIds: selectedLessonQuizIds,
      resources: mediaUrl.trim()
        ? [
            {
              id: `res_${Date.now()}`,
              type: mediaType,
              title: mediaTitle.trim() || lessonTitle.trim(),
              url: mediaUrl.trim(),
              description: `Material complementario en ${mediaType.toUpperCase()}`,
              durationMinutes: mediaType === 'video' ? Number(lessonDuration) : undefined
            }
          ]
        : []
    });

    setIsEditLessonModalOpen(false);
    showToast(`Clase "${lessonTitle.trim()}" actualizada con éxito.`);
  };

  const handleDeleteLesson = (lesson: Lesson) => {
    if (!canManageActiveCourse) {
      showToast('No tienes permisos para eliminar clases en este curso.');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: `Eliminar Clase: "${lesson.title}"`,
      message: `¿Estás seguro de que deseas eliminar permanentemente la clase "${lesson.title}" y su contenido multimedia?`,
      confirmLabel: 'Sí, eliminar clase',
      isDestructive: true,
      onConfirm: () => {
        deleteLesson(lesson.id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast(`Clase "${lesson.title}" eliminada exitosamente.`);
      }
    });
  };

  const handleUnenrollStudent = (student: User) => {
    if (!activeCourse || !canManageActiveCourse) {
      showToast('No tienes permisos para gestionar la matrícula de este curso.');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Desmatricular Estudiante',
      message: `¿Estás seguro de que deseas desmatricular a "${student.name}" del curso "${activeCourse.title}"? El alumno perderá acceso inmediato a las clases y tareas.`,
      confirmLabel: 'Sí, desmatricular',
      isDestructive: true,
      onConfirm: () => {
        unenrollStudentFromCourse(activeCourse.id, student.id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  // --- Handlers for GRADING ---
  const openGradeModal = (sub: Submission) => {
    setSelectedSubmission(sub);
    const relatedAsg = assignments.find((a) => a.id === sub.assignmentId);
    setGradeScore(sub.score || 90);
    setGradeFeedback(sub.feedback || 'Buen trabajo en el desarrollo del proyecto.');

    if (relatedAsg?.rubric) {
      const initialRubric: Record<string, number> = {};
      relatedAsg.rubric.forEach((crit) => {
        initialRubric[crit.id] = sub.rubricScores?.[crit.id] ?? Math.round(crit.maxPoints * 0.9);
      });
      setRubricScores(initialRubric);
    }
    setIsGradeModalOpen(true);
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    const totalRubricScore = Object.values(rubricScores).reduce((a, b) => a + b, 0);
    const finalScore = Object.keys(rubricScores).length > 0 ? totalRubricScore : gradeScore;

    gradeSubmission(selectedSubmission.id, finalScore, gradeFeedback, rubricScores);
    setIsGradeModalOpen(false);
    setSelectedSubmission(null);
  };

  // --- Handlers for ASSIGNMENTS & QUIZZES ---
  const handleCreateAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle.trim() || !asgCourseId) return;

    // Auto-include pending material input if typed
    let finalMaterials = [...asgMaterials];
    if (newMaterialUrl.trim()) {
      finalMaterials.push({
        title: newMaterialTitle.trim() || 'Material de apoyo',
        url: newMaterialUrl.trim()
      });
    }

    createAssignment({
      courseId: asgCourseId,
      lessonId: asgLessonId || undefined,
      title: asgTitle.trim(),
      description: asgDescription.trim(),
      dueDate: asgDueDate,
      maxScore: 100,
      materials: finalMaterials.length > 0 ? finalMaterials : undefined,
      rubric: [
        {
          id: `rub_${Date.now()}_1`,
          title: 'Cumplimiento de Requisitos y Arquitectura',
          description: 'Estructura general y solución completa del problema.',
          maxPoints: 50
        },
        {
          id: `rub_${Date.now()}_2`,
          title: 'Calidad, Documentación y Buenas Prácticas',
          description: 'Legibilidad, claridad y justificación de decisiones.',
          maxPoints: 50
        }
      ]
    });

    setAsgTitle('');
    setAsgDescription('');
    setAsgLessonId('');
    setAsgMaterials([]);
    setNewMaterialTitle('');
    setNewMaterialUrl('');
    setIsNewAssignmentModalOpen(false);
    showToast(`Tarea "${asgTitle.trim()}" publicada exitosamente.`);
  };

  const openEditAssignmentModal = (asg: Assignment) => {
    const crs = courses.find((c) => c.id === asg.courseId);
    if (!canEditCourse(crs)) {
      showToast('Solo el docente titular o un administrador pueden editar esta tarea.');
      return;
    }
    setEditingAssignment(asg);
    setAsgEditTitle(asg.title);
    setAsgEditDescription(asg.description);
    setAsgEditDueDate(asg.dueDate);
    setAsgEditCourseId(asg.courseId);
    setAsgEditMaxScore(asg.maxScore || 100);
    setAsgEditLessonId(asg.lessonId || '');
    setAsgEditMaterials(asg.materials ? [...asg.materials] : []);
    setNewEditMaterialTitle('');
    setNewEditMaterialUrl('');
    setIsEditAssignmentModalOpen(true);
  };

  const handleEditAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment || !asgEditTitle.trim()) return;

    const crs = courses.find((c) => c.id === editingAssignment.courseId);
    if (!canEditCourse(crs)) {
      showToast('No tienes permisos para modificar esta tarea.');
      return;
    }

    let finalEditMaterials = [...asgEditMaterials];
    if (newEditMaterialUrl.trim()) {
      finalEditMaterials.push({
        title: newEditMaterialTitle.trim() || 'Material de apoyo',
        url: newEditMaterialUrl.trim()
      });
    }

    updateAssignment(editingAssignment.id, {
      title: asgEditTitle.trim(),
      description: asgEditDescription.trim(),
      dueDate: asgEditDueDate,
      courseId: asgEditCourseId,
      lessonId: asgEditLessonId || undefined,
      maxScore: asgEditMaxScore,
      materials: finalEditMaterials.length > 0 ? finalEditMaterials : undefined
    });

    setIsEditAssignmentModalOpen(false);
    setEditingAssignment(null);
    setAsgEditMaterials([]);
    setNewEditMaterialTitle('');
    setNewEditMaterialUrl('');
    showToast(`Tarea "${asgEditTitle.trim()}" actualizada exitosamente.`);
  };

  const handleDeleteAssignment = (asg: Assignment) => {
    const crs = courses.find((c) => c.id === asg.courseId);
    if (!canEditCourse(crs)) {
      showToast('Solo el docente titular o un administrador pueden eliminar esta tarea.');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: `Eliminar Tarea: "${asg.title}"`,
      message: `¿Estás seguro de que deseas eliminar permanentemente esta tarea? Todas las entregas enviadas por los estudiantes para esta tarea serán eliminadas.`,
      confirmLabel: 'Sí, eliminar tarea',
      isDestructive: true,
      onConfirm: () => {
        deleteAssignment(asg.id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast(`Tarea "${asg.title}" eliminada exitosamente.`);
      }
    });
  };

  // --- QUIZZES HANDLERS ---
  const openNewQuizModal = () => {
    const targetCourseId = (canManageActiveCourse ? activeCourse?.id : manageableCourses[0]?.id) || '';
    setEditingQuiz(null);
    setQuizTitle('');
    setQuizDescription('');
    setQuizCourseId(targetCourseId);
    setQuizTimeLimit(15);
    setQuizMaxAttempts('unlimited');
    setQuizLessonId('');
    setQuizQuestions([
      {
        id: `q_${Date.now()}_1`,
        prompt: 'Pregunta 1: Enunciado del problema o concepto a evaluar...',
        options: [
          'Opción A (Respuesta Correcta)',
          'Opción B (Distractor)',
          'Opción C (Distractor)',
          'Opción D (Distractor)'
        ],
        correctIndex: 0,
        points: 25,
        explanation: 'Justificación pedagógica que fundamenta la respuesta correcta.'
      },
      {
        id: `q_${Date.now()}_2`,
        prompt: 'Pregunta 2: Enunciado del segundo problema o concepto a evaluar...',
        options: [
          'Opción A (Distractor)',
          'Opción B (Respuesta Correcta)',
          'Opción C (Distractor)',
          'Opción D (Distractor)'
        ],
        correctIndex: 1,
        points: 25,
        explanation: 'Explicación detallada de la solución para retroalimentación.'
      }
    ]);
    setIsNewQuizModalOpen(true);
  };

  const openEditQuizModal = (quiz: Quiz) => {
    const crs = courses.find((c) => c.id === quiz.courseId);
    if (!canEditCourse(crs)) {
      showToast('Solo el docente titular o un administrador pueden editar este cuestionario.');
      return;
    }
    setEditingQuiz(quiz);
    setQuizTitle(quiz.title);
    setQuizDescription(quiz.description);
    setQuizCourseId(quiz.courseId);
    setQuizTimeLimit(quiz.timeLimitMinutes || 15);
    setQuizMaxAttempts(quiz.maxAttempts ?? 'unlimited');
    setQuizLessonId(quiz.lessonId || '');
    setQuizQuestions(
      quiz.questions && quiz.questions.length > 0
        ? JSON.parse(JSON.stringify(quiz.questions))
        : [
            {
              id: `q_${Date.now()}_1`,
              prompt: 'Pregunta 1...',
              options: ['Opción 1', 'Opción 2', 'Opción 3', 'Opción 4'],
              correctIndex: 0,
              points: 20,
              explanation: 'Explicación de la respuesta.'
            }
          ]
    );
    setIsEditQuizModalOpen(true);
  };

  const handleCreateQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim() || !quizCourseId) {
      showToast('Por favor ingresa un título y selecciona un curso.');
      return;
    }
    if (quizQuestions.length === 0) {
      showToast('El examen debe tener al menos una pregunta.');
      return;
    }

    createQuiz({
      courseId: quizCourseId,
      lessonId: quizLessonId || undefined,
      title: quizTitle.trim(),
      description: quizDescription.trim(),
      timeLimitMinutes: Number(quizTimeLimit) || 15,
      maxAttempts: quizMaxAttempts,
      questions: quizQuestions
    });

    setQuizLessonId('');
    setIsNewQuizModalOpen(false);
    showToast(`Cuestionario "${quizTitle.trim()}" publicado exitosamente.`);
  };

  const handleEditQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuiz || !quizTitle.trim() || !quizCourseId) return;
    const crs = courses.find((c) => c.id === editingQuiz.courseId);
    if (!canEditCourse(crs)) {
      showToast('No tienes permisos para modificar este cuestionario.');
      return;
    }
    if (quizQuestions.length === 0) {
      showToast('El examen debe tener al menos una pregunta.');
      return;
    }

    updateQuiz(editingQuiz.id, {
      courseId: quizCourseId,
      lessonId: quizLessonId || undefined,
      title: quizTitle.trim(),
      description: quizDescription.trim(),
      timeLimitMinutes: Number(quizTimeLimit) || 15,
      maxAttempts: quizMaxAttempts,
      questions: quizQuestions
    });

    setIsEditQuizModalOpen(false);
    setEditingQuiz(null);
    showToast(`Cuestionario "${quizTitle.trim()}" actualizado exitosamente.`);
  };

  const handleDeleteQuiz = (quiz: Quiz) => {
    const crs = courses.find((c) => c.id === quiz.courseId);
    if (!canEditCourse(crs)) {
      showToast('Solo el docente titular o un administrador pueden eliminar este cuestionario.');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: `Eliminar Cuestionario: "${quiz.title}"`,
      message: `¿Estás seguro de que deseas eliminar permanentemente este cuestionario interactivo? Se borrarán todos los intentos e historiales de los estudiantes.`,
      confirmLabel: 'Sí, eliminar cuestionario',
      isDestructive: true,
      onConfirm: () => {
        deleteQuiz(quiz.id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast(`Cuestionario "${quiz.title}" eliminado exitosamente.`);
      }
    });
  };

  const handleAddQuestion = () => {
    const newQ: QuizQuestion = {
      id: `q_${Date.now()}_${quizQuestions.length + 1}`,
      prompt: `Pregunta ${quizQuestions.length + 1}: Escribe el enunciado aquí...`,
      options: ['Opción A (Correcta)', 'Opción B', 'Opción C', 'Opción D'],
      correctIndex: 0,
      points: 20,
      explanation: 'Explicación que visualizará el alumno al revisar la prueba.'
    };
    setQuizQuestions((prev) => [...prev, newQ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (quizQuestions.length <= 1) {
      showToast('El cuestionario debe tener como mínimo 1 pregunta.');
      return;
    }
    setQuizQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateQuestion = (idx: number, field: keyof QuizQuestion, val: any) => {
    setQuizQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: val } : q))
    );
  };

  const handleUpdateOption = (qIdx: number, optIdx: number, val: string) => {
    setQuizQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const newOpts = [...q.options];
        newOpts[optIdx] = val;
        return { ...q, options: newOpts };
      })
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            <span>Docente Titular</span>
            <span>·</span>
            <span>{currentUser.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Estudio Docente y Gestión de Contenido
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Crea, edita o elimina cursos, módulos y clases; gestiona la matrícula de estudiantes y califica entregas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={async () => {
              setIsSyncing(true);
              await reloadFromBackend();
              setIsSyncing(false);
              showToast('Plataforma sincronizada en tiempo real con MongoDB Atlas.');
            }}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-2xs border border-slate-200 dark:border-slate-700 disabled:opacity-50"
            title="Sincronizar datos con MongoDB Atlas"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600 dark:text-indigo-400' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
          </button>
          <button
            onClick={() => setIsNewCourseModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-600/30 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Crear Curso
          </button>
          <button
            onClick={() => {
              if (manageableCourses.length === 0) {
                showToast('Primero debes crear un curso propio para poder asignarle tareas.');
                setIsNewCourseModalOpen(true);
                return;
              }
              const defaultCourseId = (canManageActiveCourse ? activeCourse?.id : manageableCourses[0]?.id) || '';
              setAsgTitle('');
              setAsgDescription('');
              setAsgLessonId('');
              setAsgMaterials([]);
              setNewMaterialTitle('');
              setNewMaterialUrl('');
              setAsgDueDate('2026-11-15T23:59');
              setAsgCourseId(defaultCourseId);
              setIsNewAssignmentModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            Nueva Tarea
          </button>
          <button
            onClick={() => {
              if (manageableCourses.length === 0) {
                showToast('Primero debes crear un curso propio para poder asignarle cuestionarios.');
                setIsNewCourseModalOpen(true);
                return;
              }
              openNewQuizModal();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-emerald-600/30 transition-colors whitespace-nowrap"
          >
            <Award className="w-3.5 h-3.5" />
            Nuevo Cuestionario
          </button>
        </div>
      </div>

      {/* KPI Cards for Teacher - Responsive 2x2 on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-medium text-slate-500">
            <span className="truncate">Mis Cursos Activos</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 shrink-0">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {myCourses.length}
          </div>
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-slate-400 truncate">
            Cursos creados
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-medium text-slate-500">
            <span className="truncate">Alumnos Matriculados</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 shrink-0">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {myCourses.reduce((sum, c) => sum + c.enrolledStudents.length, 0)}
          </div>
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-slate-400 truncate">
            Bajo tu gestión
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-medium text-slate-500">
            <span className="truncate">Entregas Pendientes</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
            {pendingSubmissions.length}
          </div>
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-slate-400 truncate">
            Por calificar
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-medium text-slate-500">
            <span className="truncate">Tareas Calificadas</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 shrink-0">
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            {gradedSubmissions.length}
          </div>
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-slate-400 truncate">
            Con nota enviada
          </div>
        </div>
      </div>

      {/* Internal Navigation Tabs for Teacher */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
        <button
          onClick={() => {
            setTeacherView('courses');
            setActiveTab('courses');
          }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            teacherView === 'courses'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Gestor de Cursos, Módulos y Clases ({myCourses.length})
        </button>

        <button
          onClick={() => {
            setTeacherView('grading');
            setActiveTab('grading');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            teacherView === 'grading'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Centro de Calificaciones
          {pendingSubmissions.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
              {pendingSubmissions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setTeacherView('assignments');
            setActiveTab('evaluations');
          }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            teacherView === 'assignments'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Tareas y Exámenes Publicados
        </button>
      </div>

      {/* VIEW 1: Courses, Curriculum & Enrollment Management */}
      {teacherView === 'courses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Courses List Column */}
          <div className="space-y-3 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Cursos ({displayedCourses.length})
              </span>
              <button
                onClick={() => setIsNewCourseModalOpen(true)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                + Nuevo Curso
              </button>
            </div>

            {/* Filter buttons: Mis Cursos vs Todos */}
            {courses.length > 0 && (
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setCourseFilter('my')}
                  className={`flex-1 py-1 rounded-md text-center transition-colors ${
                    courseFilter === 'my'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Mis Cursos ({myCourses.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCourseFilter('all')}
                  className={`flex-1 py-1 rounded-md text-center transition-colors ${
                    courseFilter === 'all'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Todos ({courses.length})
                </button>
              </div>
            )}

            <div className="space-y-2">
              {displayedCourses.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <p>No tienes cursos asignados a tu usuario ({currentUser.name}) en esta vista.</p>
                  {courses.length > 0 && courseFilter === 'my' && (
                    <button
                      type="button"
                      onClick={() => setCourseFilter('all')}
                      className="inline-block px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 font-semibold text-xs hover:underline"
                    >
                      Ver todos los cursos del campus ({courses.length})
                    </button>
                  )}
                </div>
              ) : (
                displayedCourses.map((c) => {
                  const isSelected = c.id === activeCourse?.id;
                  const mods = modules.filter((m) => m.courseId === c.id);
                  let lessonCount = 0;
                  mods.forEach((m) => (lessonCount += m.lessons.length));
                  const studentCount = (c.enrolledStudents || []).length;
                  const courseTeacher = users.find((u) => u.id === c.teacherId);

                  return (
                    <div
                      key={c.id}
                      onClick={() => setActiveCourseId(c.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all group ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                          {c.category}
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {c.level}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
                        {c.title}
                      </h3>
                      {courseFilter === 'all' && (
                        <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                          Docente: <span className="font-semibold text-slate-700 dark:text-slate-200">{courseTeacher?.name || 'Docente Asignado'}</span>
                        </div>
                      )}
                      <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{mods.length} mód.</span>
                          <span>·</span>
                          <span>{lessonCount} clases</span>
                        </div>
                        <span className="text-emerald-600 font-semibold font-mono text-[10px]">
                          {studentCount} alumnos
                        </span>
                      </div>

                      {/* Course Card Action Buttons */}
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        {canEditCourse(c) ? (
                          <div className="flex items-center justify-end gap-1 w-full">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditCourseModal(c);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                              title="Editar información de este curso"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Editar</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCourse(c);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                              title="Eliminar este curso"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded">
                              <Lock className="w-2.5 h-2.5 text-slate-400" />
                              <span>Solo lectura</span>
                            </span>
                            <span className="text-[10px] text-slate-400 italic">
                              {courseTeacher?.name ? `De: ${courseTeacher.name}` : 'Otro docente'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Curriculum & Course Manager Column */}
          <div className="lg:col-span-2 space-y-4">
            {activeCourse ? (
              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                {/* Course Header with Edit, Delete & Enrollment Manager */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                        {activeCourse.category} · {activeCourse.level}
                      </span>
                      {!canManageActiveCourse && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50 px-2 py-0.5 rounded">
                          <Lock className="w-2.5 h-2.5" />
                          Modo Consulta
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {activeCourse.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-xl">
                      {activeCourse.description}
                    </p>
                    {activeCourseTeacher && (
                      <div className="text-[11px] text-slate-400 pt-0.5">
                        Docente titular: <span className="font-semibold text-slate-700 dark:text-slate-200">{activeCourseTeacher.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Course Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                    {canManageActiveCourse ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsEnrollmentModalOpen(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs font-semibold rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors whitespace-nowrap shadow-2xs"
                          title="Matricular o desmatricular estudiantes en este curso"
                        >
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Matricular Alumnos ({enrolledStudents.length})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditCourseModal(activeCourse)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 transition-colors whitespace-nowrap"
                          title="Editar información general del curso"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Editar Curso</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCourse(activeCourse)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-lg border border-rose-200 dark:border-rose-800 transition-colors whitespace-nowrap shadow-2xs"
                          title="Eliminar curso completo"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Eliminar Curso</span>
                        </button>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700">
                        <Lock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Solo Lectura (Titular: {activeCourseTeacher?.name || 'Otro Docente'})</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Read-Only Notice Banner when viewing another teacher's course */}
                {!canManageActiveCourse && (
                  <div className="mt-4 p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 flex items-start gap-3">
                    <div className="p-1 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                      <p className="font-bold">Modo Consulta Curricular (Solo Lectura)</p>
                      <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 mt-0.5">
                        Este curso pertenece a <span className="font-semibold underline">{activeCourseTeacher?.name || 'otro docente'}</span>.
                        Como colega docente puedes explorar los contenidos curriculares y previsualizar las clases, pero la edición, eliminación, adición de módulos y matriculación están restringidas exclusivamente al docente titular y a los administradores.
                      </p>
                    </div>
                  </div>
                )}

                {/* Modules Toolbar */}
                <div className="flex items-center justify-between pt-4 pb-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Estructura Curricular ({courseModules.length} Módulos)
                  </h3>

                  {canManageActiveCourse && (
                    <button
                      onClick={() => setIsNewModuleModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-semibold rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Añadir Módulo
                    </button>
                  )}
                </div>

                {/* Modules & Lessons List */}
                <div className="space-y-4 mt-2">
                  {courseModules.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      Este curso aún no tiene módulos. Haz clic en "Añadir Módulo" para organizar tus lecciones.
                    </div>
                  ) : (
                    courseModules.map((module) => (
                      <div
                        key={module.id}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 space-y-3"
                      >
                        {/* Module Header with Edit & Delete */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {module.title}
                            </span>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {module.description}
                            </p>
                          </div>

                          {canManageActiveCourse ? (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => {
                                  setActiveModuleId(module.id);
                                  setIsNewLessonModalOpen(true);
                                }}
                                className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-2xs transition-colors flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" /> Crear Clase
                              </button>

                              <button
                                onClick={() => openEditModuleModal(module)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-900 rounded-md transition-colors"
                                title="Editar módulo"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteModule(module)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-900 rounded-md transition-colors"
                                title="Eliminar módulo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80">
                              {module.lessons.length} clase(s)
                            </span>
                          )}
                        </div>

                        {/* Lessons in this module */}
                        <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
                          {module.lessons.length === 0 ? (
                            <div className="text-[11px] text-slate-400 italic py-2">
                              Sin clases aún. Haz clic en "Crear Clase" para añadir videos, lecturas o archivos PDF.
                            </div>
                          ) : (
                            module.lessons.map((lesson) => {
                              const linkedAsgs = assignments.filter((a) => a.lessonId === lesson.id || lesson.assignmentIds?.includes(a.id));
                              const linkedQuizzes = quizzes.filter((q) => q.lessonId === lesson.id || lesson.quizIds?.includes(q.id));

                              return (
                                <div
                                  key={lesson.id}
                                  className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 shrink-0">
                                      {lesson.resources.some((r) => r.type === 'video') ? (
                                        <Video className="w-3.5 h-3.5" />
                                      ) : lesson.resources.some((r) => r.type === 'pdf') ? (
                                        <FileText className="w-3.5 h-3.5" />
                                      ) : (
                                        <ImageIcon className="w-3.5 h-3.5" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                                        {lesson.title}
                                      </div>
                                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                        <span>{lesson.durationMinutes} min</span>
                                        <span>·</span>
                                        <span>{lesson.resources.length} recurso(s)</span>
                                      </div>

                                      {/* Integrated tasks & quizzes chips */}
                                      {(linkedAsgs.length > 0 || linkedQuizzes.length > 0) && (
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                          {linkedAsgs.map((asg) => (
                                            <span
                                              key={asg.id}
                                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/60 text-[10px] font-medium"
                                              title={`Tarea integrada: ${asg.title}`}
                                            >
                                              <FileText className="w-2.5 h-2.5" />
                                              <span className="truncate max-w-[130px]">{asg.title}</span>
                                            </span>
                                          ))}
                                          {linkedQuizzes.map((quiz) => (
                                            <span
                                              key={quiz.id}
                                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/60 text-[10px] font-medium"
                                              title={`Evaluación integrada: ${quiz.title}`}
                                            >
                                              <Award className="w-2.5 h-2.5" />
                                              <span className="truncate max-w-[130px]">{quiz.title}</span>
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => {
                                        setPreviewingLesson(lesson);
                                        setPreviewResourceIdx(0);
                                      }}
                                      className="p-1 text-slate-500 hover:text-emerald-600 rounded transition-colors"
                                      title="Vista previa de la clase (como la ve el estudiante)"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>

                                    {canManageActiveCourse && (
                                      <>
                                        <button
                                          onClick={() => openEditLessonModal(lesson, module.id)}
                                          className="p-1 text-slate-500 hover:text-indigo-600 rounded transition-colors"
                                          title="Editar clase, multimedia y tareas/exámenes integrados"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                          onClick={() => handleDeleteLesson(lesson)}
                                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                          title="Eliminar clase"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                Selecciona o crea un curso para comenzar a editar su currículo.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: Grading Center */}
      {teacherView === 'grading' && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Centro de Calificaciones de Tareas
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Revisa los trabajos enviados por los estudiantes, aplica rúbricas de evaluación y emite retroalimentación.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500">Filtrar:</span>
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 font-bold">
                {pendingSubmissions.length} pendientes
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold">
                {gradedSubmissions.length} calificadas
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3">Estudiante</th>
                  <th className="px-4 py-3">Tarea / Curso</th>
                  <th className="px-4 py-3">Fecha de Entrega</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Nota</th>
                  <th className="px-5 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mySubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-xs text-slate-400">
                      No hay entregas registradas en tus cursos aún.
                    </td>
                  </tr>
                ) : (
                  mySubmissions.map((sub) => {
                    const asg = assignments.find((a) => a.id === sub.assignmentId);
                    const crs = courses.find((c) => c.id === sub.courseId);
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={sub.studentAvatar}
                              alt={sub.studentName}
                              className="w-7 h-7 rounded-full object-cover shrink-0"
                            />
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {sub.studentName}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-slate-900 dark:text-white line-clamp-1">
                            {asg?.title || 'Tarea'}
                          </div>
                          <div className="text-[10px] text-slate-400">{crs?.title}</div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500">
                          {new Date(sub.submittedAt).toLocaleDateString()} ·{' '}
                          {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3.5">
                          {sub.status === 'pending' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                              <Clock className="w-3 h-3" /> Pendiente
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                              <CheckCircle className="w-3 h-3" /> Calificada
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs font-bold tabular-nums">
                          {sub.score !== undefined ? (
                            <span className="text-emerald-600 dark:text-emerald-400">{sub.score} / 100</span>
                          ) : (
                            <span className="text-slate-400">--</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => openGradeModal(sub)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-2xs"
                          >
                            {sub.status === 'pending' ? 'Evaluar Tarea' : 'Modificar Nota'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: Assignments and Quizzes Overview */}
      {teacherView === 'assignments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assignments List */}
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Tareas Asignadas
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {assignments.length} tareas publicadas en tus asignaturas
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (manageableCourses.length === 0) {
                      showToast('Primero debes crear un curso propio para poder asignarle tareas.');
                      setIsNewCourseModalOpen(true);
                      return;
                    }
                    const defaultCourseId = (canManageActiveCourse ? activeCourse?.id : manageableCourses[0]?.id) || '';
                    setAsgTitle('');
                    setAsgDescription('');
                    setAsgLessonId('');
                    setAsgMaterials([]);
                    setNewMaterialTitle('');
                    setNewMaterialUrl('');
                    setAsgDueDate('2026-11-15T23:59');
                    setAsgCourseId(defaultCourseId);
                    setIsNewAssignmentModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Nueva Tarea</span>
                </button>
              </div>

              <div className="space-y-3">
                {assignments.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No hay tareas asignadas creadas aún. Haz clic en "+ Nueva Tarea" para comenzar.
                  </div>
                ) : (
                  assignments.map((asg) => {
                    const crs = courses.find((c) => c.id === asg.courseId);
                    const canManageAsg = currentUser.role === 'admin' || (crs && crs.teacherId === currentUser.id);
                    const relatedSubs = submissions.filter((s) => s.assignmentId === asg.id);
                    const linkedLesson = modules
                      .flatMap((m) => m.lessons)
                      .find((l) => l.id === asg.lessonId || l.assignmentIds?.includes(asg.id));

                    return (
                      <div
                        key={asg.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-3 hover:border-indigo-300 dark:hover:border-indigo-900/60 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="font-bold text-slate-900 dark:text-white text-sm">{asg.title}</div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">{crs?.title}</span>
                              {linkedLesson ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold">
                                  <BookOpen className="w-3 h-3 text-indigo-500" />
                                  Clase: {linkedLesson.title}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">
                                  · General del curso
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/50 shrink-0">
                            Max: {asg.maxScore} pts
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {asg.description}
                        </p>

                        <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-3 text-[10px] text-slate-400">
                            <span>Límite: {new Date(asg.dueDate).toLocaleDateString()} · {new Date(asg.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>·</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {relatedSubs.length} entregas
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewingAssignment(asg)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/60 dark:border-emerald-900/60 rounded-lg transition-colors shadow-2xs"
                              title="Vista previa de la tarea (como la ve el estudiante)"
                            >
                              <Eye className="w-3 h-3 text-emerald-600" />
                              <span>Vista Previa</span>
                            </button>

                            {canManageAsg ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openEditAssignmentModal(asg)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors shadow-2xs"
                                  title="Editar consigna de la tarea"
                                >
                                  <Edit3 className="w-3 h-3 text-indigo-500" />
                                  <span>Editar</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAssignment(asg)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border border-rose-200/60 dark:border-rose-900/50 rounded-lg transition-colors"
                                  title="Eliminar tarea permanentemente"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Eliminar</span>
                                </button>
                              </>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                <Lock className="w-2.5 h-2.5 text-slate-400" />
                                Solo lectura
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quizzes List */}
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    Cuestionarios y Exámenes Interactivos
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {quizzes.length} evaluaciones configuradas
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (manageableCourses.length === 0) {
                      showToast('Primero debes crear un curso propio para poder asignarle cuestionarios.');
                      setIsNewCourseModalOpen(true);
                      return;
                    }
                    openNewQuizModal();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Nuevo Cuestionario</span>
                </button>
              </div>

              <div className="space-y-3">
                {quizzes.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No hay cuestionarios creados aún. Haz clic en "+ Nuevo Cuestionario" para crear uno.
                  </div>
                ) : (
                  quizzes.map((quiz) => {
                    const crs = courses.find((c) => c.id === quiz.courseId);
                    const canManageQuiz = currentUser.role === 'admin' || (crs && crs.teacherId === currentUser.id);
                    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
                    const linkedLesson = modules
                      .flatMap((m) => m.lessons)
                      .find((l) => l.id === quiz.lessonId || l.quizIds?.includes(quiz.id));

                    return (
                      <div
                        key={quiz.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-3 hover:border-emerald-300 dark:hover:border-emerald-900/60 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="font-bold text-slate-900 dark:text-white text-sm">{quiz.title}</div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">{crs?.title}</span>
                              {linkedLesson ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold">
                                  <BookOpen className="w-3 h-3 text-emerald-500" />
                                  Clase: {linkedLesson.title}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">
                                  · General del curso
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/50 shrink-0">
                            {totalPoints} pts totales
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {quiz.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                            <RotateCcw className="w-3 h-3 text-emerald-500" />
                            {quiz.maxAttempts === 1
                              ? '1 intento (Examen único)'
                              : quiz.maxAttempts === 2
                              ? '2 intentos permitidos'
                              : quiz.maxAttempts === 3
                              ? '3 intentos permitidos'
                              : 'Intentos: Siempre (Sin límite)'}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {quiz.timeLimitMinutes} min límite
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {quiz.questions.length} preguntas
                          </span>
                        </div>

                        <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400">
                            Configuración académica
                          </span>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewingQuiz(quiz)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/60 dark:border-emerald-900/60 rounded-lg transition-colors shadow-2xs"
                              title="Vista previa del examen (como lo responderá el estudiante)"
                            >
                              <Eye className="w-3 h-3 text-emerald-600" />
                              <span>Vista Previa</span>
                            </button>

                            {canManageQuiz ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openEditQuizModal(quiz)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors shadow-2xs"
                                  title="Editar cuestionario y preguntas"
                                >
                                  <Edit3 className="w-3 h-3 text-emerald-500" />
                                  <span>Editar</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteQuiz(quiz)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border border-rose-200/60 dark:border-rose-900/50 rounded-lg transition-colors"
                                  title="Eliminar cuestionario permanentemente"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Eliminar</span>
                                </button>
                              </>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                <Lock className="w-2.5 h-2.5 text-slate-400" />
                                Solo lectura
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create Course */}
      {isNewCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Crear Nuevo Curso
              </h3>
              <button onClick={() => setIsNewCourseModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateCourseSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Título del Curso *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Fundamentos de Arquitectura Cloud"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Descripción del Curso</label>
                <textarea
                  rows={3}
                  placeholder="Objetivos pedagógicos, competencias a desarrollar..."
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Categoría</label>
                  <select
                    value={courseCategory}
                    onChange={(e) => setCourseCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Programación">Programación</option>
                    <option value="Inteligencia Artificial">Inteligencia Artificial</option>
                    <option value="Diseño Digital">Diseño Digital</option>
                    <option value="Negocios y Marketing">Negocios y Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nivel</label>
                  <select
                    value={courseLevel}
                    onChange={(e) => setCourseLevel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewCourseModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Publicar Curso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Course */}
      {isEditCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Editar Información del Curso
              </h3>
              <button onClick={() => setIsEditCourseModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleEditCourseSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Título del Curso *</label>
                <input
                  type="text"
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Descripción del Curso</label>
                <textarea
                  rows={3}
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Categoría</label>
                  <select
                    value={courseCategory}
                    onChange={(e) => setCourseCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Programación">Programación</option>
                    <option value="Inteligencia Artificial">Inteligencia Artificial</option>
                    <option value="Diseño Digital">Diseño Digital</option>
                    <option value="Negocios y Marketing">Negocios y Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nivel</label>
                  <select
                    value={courseLevel}
                    onChange={(e) => setCourseLevel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditCourseModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Manage Student Enrollment (Solo Docentes) */}
      {isEnrollmentModalOpen && activeCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Gestión de Matrícula de Estudiantes
                </h3>
                <p className="text-xs text-slate-400">
                  Curso: <span className="text-slate-700 dark:text-slate-200 font-semibold">{activeCourse.title}</span> (Gestión exclusiva del docente)
                </p>
              </div>
              <button onClick={() => setIsEnrollmentModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {/* Search filter */}
            <div className="py-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar alumno por nombre o correo..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Content: Enrolled & Available Students */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs">
              {/* Section 1: Enrolled students */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    Estudiantes Matriculados ({enrolledStudents.length})
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Tienen acceso completo al curso
                  </span>
                </div>

                {filteredEnrolledStudents.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
                    {enrolledStudents.length === 0
                      ? 'No hay estudiantes matriculados en este curso todavía.'
                      : 'Ningún estudiante matriculado coincide con la búsqueda.'}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {filteredEnrolledStudents.map((student) => (
                      <div
                        key={student.id}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 dark:text-white truncate">
                              {student.name}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {student.email} · {student.department || 'Estudiante'}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            unenrollStudentFromCourse(activeCourse.id, student.id);
                            showToast(`"${student.name}" ha sido desmatriculado del curso.`);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 rounded-lg transition-colors shrink-0 shadow-2xs"
                          title="Dar de baja / Desmatricular alumno de este curso"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          <span>Desmatricular</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 2: Available students to enroll */}
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    Estudiantes Disponibles para Matricular ({availableStudents.length})
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Alumnos registrados en la institución
                  </span>
                </div>

                {filteredAvailableStudents.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
                    {availableStudents.length === 0
                      ? 'Todos los estudiantes registrados ya se encuentran matriculados en este curso.'
                      : 'Ningún estudiante disponible coincide con la búsqueda.'}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {filteredAvailableStudents.map((student) => (
                      <div
                        key={student.id}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 dark:text-white truncate">
                              {student.name}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {student.email} · {student.department || 'Estudiante'}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            enrollStudentInCourse(activeCourse.id, student.id);
                            showToast(`"${student.name}" ha sido matriculado en el curso.`);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition-colors shrink-0"
                          title="Matricular alumno en este curso"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Matricular</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setIsEnrollmentModalOpen(false)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create Module */}
      {isNewModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Añadir Módulo Temático
              </h3>
              <button onClick={() => setIsNewModuleModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreateModuleSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Título del Módulo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Módulo 2: Autenticación Segura y JWT"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Descripción del Módulo</label>
                <textarea
                  rows={2}
                  placeholder="Resumen de lo que se cubrirá en este módulo..."
                  value={moduleDescription}
                  onChange={(e) => setModuleDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewModuleModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Guardar Módulo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Module */}
      {isEditModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Editar Módulo
              </h3>
              <button onClick={() => setIsEditModuleModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleEditModuleSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Título del Módulo *</label>
                <input
                  type="text"
                  required
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Descripción del Módulo</label>
                <textarea
                  rows={2}
                  value={moduleDescription}
                  onChange={(e) => setModuleDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModuleModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Actualizar Módulo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create Lesson with Media */}
      {isNewLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Crear Nueva Clase / Lección
                </h3>
                <p className="text-xs text-slate-400">
                  Integra contenido multimedia (videos, PDFs o imágenes) para enriquecer el aprendizaje.
                </p>
              </div>
              <button onClick={() => setIsNewLessonModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreateLessonSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nombre de la Clase *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 2.1 Configuración de Tokens y Cookies HTTP-Only"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Duración Estimada (min)</label>
                  <input
                    type="number"
                    min={1}
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo de Multimedia</label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="video">Video Didáctico (MP4 / WebM / Stream)</option>
                    <option value="pdf">Documento de Lectura en PDF</option>
                    <option value="image">Diagrama / Infografía de Imagen</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Enlace al Recurso Multimedia ({mediaType.toUpperCase()})
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Soporta YouTube, Google Drive y enlaces directos
                  </span>
                </div>
                <input
                  type="url"
                  placeholder={
                    mediaType === 'video'
                      ? 'https://www.youtube.com/watch?v=... o https://drive.google.com/file/d/...'
                      : mediaType === 'pdf'
                      ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
                      : 'https://drive.google.com/file/d/... o https://images.unsplash.com/...'
                  }
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                />

                {/* Real-time media link detection hint */}
                {mediaUrl.trim() && (() => {
                  const embed = resolveMediaEmbedInfo(mediaUrl, mediaType);
                  if (embed.isYouTube) {
                    return (
                      <div className="mt-1.5 p-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center justify-between text-[11px] text-red-700 dark:text-red-300">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Video className="w-3.5 h-3.5 text-red-600" />
                          Video de YouTube detectado (ID: {embed.youtubeId})
                        </span>
                        <a href={embed.directUrl} target="_blank" rel="noopener noreferrer" className="underline flex items-center gap-0.5">
                          Probar <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    );
                  }
                  if (embed.isDrive) {
                    return (
                      <div className="mt-1.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex flex-col gap-1 text-[11px] text-emerald-800 dark:text-emerald-300">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-medium">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            {mediaType === 'video' ? 'Video' : 'Imagen/Documento'} de Google Drive detectado
                          </span>
                          <a href={embed.directUrl} target="_blank" rel="noopener noreferrer" className="underline flex items-center gap-0.5">
                            Ver en Drive <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          Recuerda configurar en Drive el permiso: "Cualquier persona con el enlace puede ver" para que los alumnos lo vean sin restricción.
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                      Enlace web directo configurado.
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Título del Recurso</label>
                <input
                  type="text"
                  placeholder="Ej: Guía de Arquitectura de Seguridad"
                  value={mediaTitle}
                  onChange={(e) => setMediaTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <RichTextEditor
                label="Contenido Escrito / Explicación Teórica"
                placeholder="Redacta la explicación de la lección, notas clave y puntos a recordar..."
                value={lessonRichText}
                onChange={setLessonRichText}
                rows={4}
              />

              {/* Integrar Tareas y Evaluaciones creadas */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-700/80">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Integrar Tareas y Evaluaciones a esta Clase
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Selecciona qué tareas y evaluaciones pertenecerán a esta lección para que los estudiantes las vean aquí.
                    </p>
                  </div>
                </div>

                {/* Tareas */}
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[11px]">
                      <FileText className="w-3 h-3 text-indigo-500" /> Tareas del Curso ({selectedLessonAssignmentIds.length} seleccionadas)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {assignments.filter((a) => a.courseId === (activeCourse?.id || activeCourseId)).length} disponibles
                    </span>
                  </div>

                  {assignments.filter((a) => a.courseId === (activeCourse?.id || activeCourseId)).length === 0 ? (
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 italic">
                      No hay tareas creadas para este curso aún. Podrás crearlas en la pestaña "Tareas y Evaluaciones" y vincularlas en cualquier momento.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {assignments
                        .filter((a) => a.courseId === (activeCourse?.id || activeCourseId))
                        .map((asg) => {
                          const isSelected = selectedLessonAssignmentIds.includes(asg.id);
                          return (
                            <label
                              key={asg.id}
                              className={`flex items-start gap-2.5 p-2 rounded-lg border text-[11px] cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 font-medium'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedLessonAssignmentIds((prev) => [...prev, asg.id]);
                                  } else {
                                    setSelectedLessonAssignmentIds((prev) => prev.filter((id) => id !== asg.id));
                                  }
                                }}
                                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold truncate">{asg.title}</div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                  <span>Máx: {asg.maxScore} pts</span>
                                  <span>·</span>
                                  <span>Límite: {new Date(asg.dueDate).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Evaluaciones */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Award className="w-3 h-3 text-emerald-500" /> Evaluaciones y Cuestionarios ({selectedLessonQuizIds.length} seleccionados)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {quizzes.filter((q) => q.courseId === (activeCourse?.id || activeCourseId)).length} disponibles
                    </span>
                  </div>

                  {quizzes.filter((q) => q.courseId === (activeCourse?.id || activeCourseId)).length === 0 ? (
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 italic">
                      No hay cuestionarios creados para este curso aún. Podrás crearlos en la pestaña "Tareas y Evaluaciones" y vincularlos en cualquier momento.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {quizzes
                        .filter((q) => q.courseId === (activeCourse?.id || activeCourseId))
                        .map((quiz) => {
                          const isSelected = selectedLessonQuizIds.includes(quiz.id);
                          return (
                            <label
                              key={quiz.id}
                              className={`flex items-start gap-2.5 p-2 rounded-lg border text-[11px] cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 font-medium'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedLessonQuizIds((prev) => [...prev, quiz.id]);
                                  } else {
                                    setSelectedLessonQuizIds((prev) => prev.filter((id) => id !== quiz.id));
                                  }
                                }}
                                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold truncate">{quiz.title}</div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                  <span>{quiz.questions.length} preguntas</span>
                                  <span>·</span>
                                  <span>{quiz.timeLimitMinutes} min</span>
                                  <span>·</span>
                                  <span>Intentos: {quiz.maxAttempts === 'unlimited' ? 'Ilimitados' : quiz.maxAttempts}</span>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewLessonModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Publicar Clase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Lesson */}
      {isEditLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Editar Clase / Lección
                </h3>
                <p className="text-xs text-slate-400">
                  Modifica el título, duración o los recursos multimedia de la sesión.
                </p>
              </div>
              <button onClick={() => setIsEditLessonModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleEditLessonSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nombre de la Clase *</label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Duración Estimada (min)</label>
                  <input
                    type="number"
                    min={1}
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo de Multimedia</label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="video">Video Didáctico (MP4 / WebM / Stream)</option>
                    <option value="pdf">Documento de Lectura en PDF</option>
                    <option value="image">Diagrama / Infografía de Imagen</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Enlace al Recurso Multimedia ({mediaType.toUpperCase()})
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Soporta YouTube, Google Drive y enlaces directos
                  </span>
                </div>
                <input
                  type="url"
                  placeholder={
                    mediaType === 'video'
                      ? 'https://www.youtube.com/watch?v=... o https://drive.google.com/file/d/...'
                      : mediaType === 'pdf'
                      ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
                      : 'https://drive.google.com/file/d/... o https://images.unsplash.com/...'
                  }
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                />

                {/* Real-time media link detection hint */}
                {mediaUrl.trim() && (() => {
                  const embed = resolveMediaEmbedInfo(mediaUrl, mediaType);
                  if (embed.isYouTube) {
                    return (
                      <div className="mt-1.5 p-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center justify-between text-[11px] text-red-700 dark:text-red-300">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Video className="w-3.5 h-3.5 text-red-600" />
                          Video de YouTube detectado (ID: {embed.youtubeId})
                        </span>
                        <a href={embed.directUrl} target="_blank" rel="noopener noreferrer" className="underline flex items-center gap-0.5">
                          Probar <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    );
                  }
                  if (embed.isDrive) {
                    return (
                      <div className="mt-1.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex flex-col gap-1 text-[11px] text-emerald-800 dark:text-emerald-300">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-medium">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            {mediaType === 'video' ? 'Video' : 'Imagen/Documento'} de Google Drive detectado
                          </span>
                          <a href={embed.directUrl} target="_blank" rel="noopener noreferrer" className="underline flex items-center gap-0.5">
                            Ver en Drive <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          Recuerda configurar en Drive el permiso: "Cualquier persona con el enlace puede ver" para que los alumnos lo vean sin restricción.
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                      Enlace web directo configurado.
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Título del Recurso</label>
                <input
                  type="text"
                  value={mediaTitle}
                  onChange={(e) => setMediaTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <RichTextEditor
                label="Contenido Escrito / Explicación Teórica"
                placeholder="Redacta la explicación de la lección, notas clave y puntos a recordar..."
                value={lessonRichText}
                onChange={setLessonRichText}
                rows={4}
              />

              {/* Integrar Tareas y Evaluaciones creadas */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-700/80">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Integrar Tareas y Evaluaciones a esta Clase
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Selecciona qué tareas y evaluaciones pertenecerán a esta lección para que los estudiantes las vean aquí.
                    </p>
                  </div>
                </div>

                {/* Tareas */}
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[11px]">
                      <FileText className="w-3 h-3 text-indigo-500" /> Tareas del Curso ({selectedLessonAssignmentIds.length} seleccionadas)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {assignments.filter((a) => a.courseId === (activeCourse?.id || activeCourseId)).length} disponibles
                    </span>
                  </div>

                  {assignments.filter((a) => a.courseId === (activeCourse?.id || activeCourseId)).length === 0 ? (
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 italic">
                      No hay tareas creadas para este curso aún. Podrás crearlas en la pestaña "Tareas y Evaluaciones" y vincularlas en cualquier momento.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {assignments
                        .filter((a) => a.courseId === (activeCourse?.id || activeCourseId))
                        .map((asg) => {
                          const isSelected = selectedLessonAssignmentIds.includes(asg.id);
                          return (
                            <label
                              key={asg.id}
                              className={`flex items-start gap-2.5 p-2 rounded-lg border text-[11px] cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 font-medium'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedLessonAssignmentIds((prev) => [...prev, asg.id]);
                                  } else {
                                    setSelectedLessonAssignmentIds((prev) => prev.filter((id) => id !== asg.id));
                                  }
                                }}
                                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold truncate">{asg.title}</div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                  <span>Máx: {asg.maxScore} pts</span>
                                  <span>·</span>
                                  <span>Límite: {new Date(asg.dueDate).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Evaluaciones */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Award className="w-3 h-3 text-emerald-500" /> Evaluaciones y Cuestionarios ({selectedLessonQuizIds.length} seleccionados)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {quizzes.filter((q) => q.courseId === (activeCourse?.id || activeCourseId)).length} disponibles
                    </span>
                  </div>

                  {quizzes.filter((q) => q.courseId === (activeCourse?.id || activeCourseId)).length === 0 ? (
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 italic">
                      No hay cuestionarios creados para este curso aún. Podrás crearlos en la pestaña "Tareas y Evaluaciones" y vincularlas en cualquier momento.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {quizzes
                        .filter((q) => q.courseId === (activeCourse?.id || activeCourseId))
                        .map((quiz) => {
                          const isSelected = selectedLessonQuizIds.includes(quiz.id);
                          return (
                            <label
                              key={quiz.id}
                              className={`flex items-start gap-2.5 p-2 rounded-lg border text-[11px] cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 font-medium'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedLessonQuizIds((prev) => [...prev, quiz.id]);
                                  } else {
                                    setSelectedLessonQuizIds((prev) => prev.filter((id) => id !== quiz.id));
                                  }
                                }}
                                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold truncate">{quiz.title}</div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                  <span>{quiz.questions.length} preguntas</span>
                                  <span>·</span>
                                  <span>{quiz.timeLimitMinutes} min</span>
                                  <span>·</span>
                                  <span>Intentos: {quiz.maxAttempts === 'unlimited' ? 'Ilimitados' : quiz.maxAttempts}</span>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditLessonModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Actualizar Clase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Grade Student Submission with Rubrics */}
      {isGradeModalOpen && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Evaluar Entrega de Estudiante
                </h3>
                <p className="text-xs text-slate-400">
                  Estudiante: {selectedSubmission.studentName}
                </p>
              </div>
              <button onClick={() => setIsGradeModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4 mt-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Resumen de la Entrega:
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] whitespace-pre-wrap">
                  {selectedSubmission.contentText}
                </p>
                {selectedSubmission.fileUrl && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {selectedSubmission.fileName || 'Archivo adjunto'}
                    </span>
                    <a
                      href={selectedSubmission.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-[11px] font-semibold"
                    >
                      <ExternalLink className="w-3 h-3" /> Ver Entrega / Repositorio
                    </a>
                  </div>
                )}
              </div>

              {(() => {
                const asg = assignments.find((a) => a.id === selectedSubmission.assignmentId);
                if (asg && asg.rubric && asg.rubric.length > 0) {
                  return (
                    <div className="space-y-3">
                      <div className="font-bold text-slate-900 dark:text-white text-xs">
                        Rúbrica de Evaluación ({asg.rubric.length} criterios):
                      </div>
                      {asg.rubric.map((crit) => {
                        const currentVal = rubricScores[crit.id] ?? crit.maxPoints;
                        return (
                          <div
                            key={crit.id}
                            className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {crit.title}
                              </span>
                              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                {currentVal} / {crit.maxPoints} pts
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400">{crit.description}</p>
                            <input
                              type="range"
                              min={0}
                              max={crit.maxPoints}
                              value={currentVal}
                              onChange={(e) =>
                                setRubricScores((prev) => ({
                                  ...prev,
                                  [crit.id]: Number(e.target.value)
                                }))
                              }
                              className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                return (
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Calificación Numérica (0 - 100 pts)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={gradeScore}
                      onChange={(e) => setGradeScore(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-sm font-bold text-indigo-600"
                    />
                  </div>
                );
              })()}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Retroalimentación Pedagógica para el Estudiante *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalla las fortalezas del trabajo y aspectos a mejorar para el próximo hito..."
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGradeModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                >
                  Guardar y Notificar al Estudiante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create Assignment */}
      {isNewAssignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Publicar Nueva Tarea Académica
              </h3>
              <button onClick={() => setIsNewAssignmentModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreateAssignmentSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Título de la Tarea *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Proyecto Integrador: Diseño de API con Auth"
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Curso Asignado</label>
                <select
                  value={asgCourseId}
                  onChange={(e) => setAsgCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {manageableCourses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Clase / Lección Vinculada (Opcional)
                </label>
                <select
                  value={asgLessonId}
                  onChange={(e) => setAsgLessonId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">-- Sin clase vinculada (general del curso) --</option>
                  {modules
                    .filter((m) => m.courseId === asgCourseId)
                    .map((mod) => (
                      <optgroup key={mod.id} label={mod.title}>
                        {mod.lessons.map((les) => (
                          <option key={les.id} value={les.id}>
                            {les.title}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Al vincularla a una clase específica, los estudiantes la verán integrada dentro de esa clase.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Instrucciones y Requerimientos</label>
                <textarea
                  rows={3}
                  placeholder="Describe las consignas de entrega, formato de archivos..."
                  value={asgDescription}
                  onChange={(e) => setAsgDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Fecha y Hora Límite</label>
                <input
                  type="datetime-local"
                  value={asgDueDate}
                  onChange={(e) => setAsgDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewAssignmentModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Publicar Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Assignment */}
      {isEditAssignmentModalOpen && editingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Editar Tarea Asignada
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsEditAssignmentModalOpen(false);
                  setEditingAssignment(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditAssignmentSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Título de la Tarea *</label>
                <input
                  type="text"
                  required
                  value={asgEditTitle}
                  onChange={(e) => setAsgEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Curso Asignado</label>
                  <select
                    value={asgEditCourseId}
                    onChange={(e) => setAsgEditCourseId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {manageableCourses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Puntaje Máximo</label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={asgEditMaxScore}
                    onChange={(e) => setAsgEditMaxScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Clase / Lección Vinculada (Opcional)
                </label>
                <select
                  value={asgEditLessonId}
                  onChange={(e) => setAsgEditLessonId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">-- Sin clase vinculada (general del curso) --</option>
                  {modules
                    .filter((m) => m.courseId === asgEditCourseId)
                    .map((mod) => (
                      <optgroup key={mod.id} label={mod.title}>
                        {mod.lessons.map((les) => (
                          <option key={les.id} value={les.id}>
                            {les.title}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Al vincularla a una clase específica, los estudiantes la verán integrada dentro de esa clase.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Instrucciones y Requerimientos</label>
                <textarea
                  rows={3}
                  value={asgEditDescription}
                  onChange={(e) => setAsgEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Fecha y Hora Límite</label>
                <input
                  type="datetime-local"
                  value={asgEditDueDate}
                  onChange={(e) => setAsgEditDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditAssignmentModalOpen(false);
                    setEditingAssignment(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create New Quiz */}
      {isNewQuizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Crear Nuevo Cuestionario Interactivo
                  </h3>
                  <p className="text-xs text-slate-400">
                    Define preguntas, alternativas de respuesta y el límite de intentos para los estudiantes
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewQuizModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuizSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Título del Cuestionario *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Evaluación Parcial: Arquitectura de Componentes"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Curso Asignado *</label>
                  <select
                    value={quizCourseId}
                    onChange={(e) => setQuizCourseId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {manageableCourses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Clase Vinculada (Opcional)</label>
                  <select
                    value={quizLessonId}
                    onChange={(e) => setQuizLessonId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Sin clase (general) --</option>
                    {modules
                      .filter((m) => m.courseId === quizCourseId)
                      .map((mod) => (
                        <optgroup key={mod.id} label={mod.title}>
                          {mod.lessons.map((les) => (
                            <option key={les.id} value={les.id}>{les.title}</option>
                          ))}
                        </optgroup>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Descripción / Objetivos del Examen</label>
                <textarea
                  rows={2}
                  placeholder="Detalla los objetivos pedagógicos o instrucciones previas para responder..."
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tiempo Límite (Minutos)
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={120}
                    value={quizTimeLimit}
                    onChange={(e) => setQuizTimeLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                {/* ATTEMPTS CONFIGURATION: 1 - 2 - 3 - SIEMPRE */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Límite de Intentos (Estudiantes) *</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { val: 1, label: '1', sub: 'Único' },
                      { val: 2, label: '2', sub: 'Recup.' },
                      { val: 3, label: '3', sub: '3 veces' },
                      { val: 'unlimited', label: 'Siempre', sub: 'Sin límite' }
                    ].map((item) => {
                      const active = quizMaxAttempts === item.val;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setQuizMaxAttempts(item.val as 1 | 2 | 3 | 'unlimited')}
                          className={`p-2 rounded-lg border text-center transition-all ${
                            active
                              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20 font-bold'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          <div className="text-xs">{item.label}</div>
                          <div className="text-[9px] text-slate-400 font-normal">{item.sub}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* QUESTIONS LIST */}
              <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-600" />
                    <span>Preguntas del Cuestionario ({quizQuestions.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Pregunta</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {quizQuestions.map((q, qIdx) => (
                    <div
                      key={q.id || qIdx}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                          Pregunta #{qIdx + 1}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-400">Puntos:</span>
                            <input
                              type="number"
                              min={5}
                              max={100}
                              value={q.points}
                              onChange={(e) => handleUpdateQuestion(qIdx, 'points', Number(e.target.value))}
                              className="w-16 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-center text-xs"
                            />
                          </div>
                          {quizQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(qIdx)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                              title="Eliminar pregunta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                          Enunciado / Pregunta *
                        </label>
                        <input
                          type="text"
                          required
                          value={q.prompt}
                          onChange={(e) => handleUpdateQuestion(qIdx, 'prompt', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[11px] text-slate-500 dark:text-slate-400">
                          Opciones de respuesta (Marca el botón circular en la opción correcta):
                        </label>
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = q.correctIndex === optIdx;
                          return (
                            <div key={optIdx} className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleUpdateQuestion(qIdx, 'correctIndex', optIdx)}
                                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                  isCorrect
                                    ? 'border-emerald-600 bg-emerald-600 text-white ring-2 ring-emerald-500/20'
                                    : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                                }`}
                                title={isCorrect ? 'Respuesta Correcta' : 'Hacer respuesta correcta'}
                              >
                                {isCorrect && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </button>
                              <input
                                type="text"
                                required
                                value={opt}
                                onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                                className={`flex-1 px-3 py-1 rounded-lg border text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                                  isCorrect
                                    ? 'border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/20'
                                    : 'border-slate-200 dark:border-slate-700'
                                }`}
                                placeholder={`Opción ${String.fromCharCode(65 + optIdx)}`}
                              />
                              {isCorrect && (
                                <span className="text-[10px] text-emerald-600 font-bold shrink-0">
                                  Correcta ✓
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                          Explicación pedagógica (visible tras la corrección)
                        </label>
                        <input
                          type="text"
                          value={q.explanation}
                          onChange={(e) => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                          placeholder="Por qué esta es la respuesta correcta..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900 pb-2">
                <button
                  type="button"
                  onClick={() => setIsNewQuizModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                >
                  Publicar Cuestionario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Quiz */}
      {isEditQuizModalOpen && editingQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Editar Cuestionario Interactivo
                  </h3>
                  <p className="text-xs text-slate-400">
                    Modifica título, límites de intentos (1, 2, 3 o siempre) y preguntas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditQuizModalOpen(false);
                  setEditingQuiz(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditQuizSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Título del Cuestionario *</label>
                  <input
                    type="text"
                    required
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Curso Asignado *</label>
                  <select
                    value={quizCourseId}
                    onChange={(e) => setQuizCourseId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {manageableCourses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Clase Vinculada (Opcional)</label>
                  <select
                    value={quizLessonId}
                    onChange={(e) => setQuizLessonId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Sin clase (general) --</option>
                    {modules
                      .filter((m) => m.courseId === quizCourseId)
                      .map((mod) => (
                        <optgroup key={mod.id} label={mod.title}>
                          {mod.lessons.map((les) => (
                            <option key={les.id} value={les.id}>{les.title}</option>
                          ))}
                        </optgroup>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Descripción / Objetivos del Examen</label>
                <textarea
                  rows={2}
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tiempo Límite (Minutos)
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={120}
                    value={quizTimeLimit}
                    onChange={(e) => setQuizTimeLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                {/* ATTEMPTS CONFIGURATION: 1 - 2 - 3 - SIEMPRE */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Límite de Intentos (Estudiantes) *</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { val: 1, label: '1', sub: 'Único' },
                      { val: 2, label: '2', sub: 'Recup.' },
                      { val: 3, label: '3', sub: '3 veces' },
                      { val: 'unlimited', label: 'Siempre', sub: 'Sin límite' }
                    ].map((item) => {
                      const active = quizMaxAttempts === item.val;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setQuizMaxAttempts(item.val as 1 | 2 | 3 | 'unlimited')}
                          className={`p-2 rounded-lg border text-center transition-all ${
                            active
                              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20 font-bold'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          <div className="text-xs">{item.label}</div>
                          <div className="text-[9px] text-slate-400 font-normal">{item.sub}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* QUESTIONS LIST */}
              <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-600" />
                    <span>Preguntas del Cuestionario ({quizQuestions.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Pregunta</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {quizQuestions.map((q, qIdx) => (
                    <div
                      key={q.id || qIdx}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                          Pregunta #{qIdx + 1}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-400">Puntos:</span>
                            <input
                              type="number"
                              min={5}
                              max={100}
                              value={q.points}
                              onChange={(e) => handleUpdateQuestion(qIdx, 'points', Number(e.target.value))}
                              className="w-16 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-center text-xs"
                            />
                          </div>
                          {quizQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(qIdx)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                              title="Eliminar pregunta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                          Enunciado / Pregunta *
                        </label>
                        <input
                          type="text"
                          required
                          value={q.prompt}
                          onChange={(e) => handleUpdateQuestion(qIdx, 'prompt', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[11px] text-slate-500 dark:text-slate-400">
                          Opciones de respuesta (Marca el botón circular en la opción correcta):
                        </label>
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = q.correctIndex === optIdx;
                          return (
                            <div key={optIdx} className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleUpdateQuestion(qIdx, 'correctIndex', optIdx)}
                                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                  isCorrect
                                    ? 'border-emerald-600 bg-emerald-600 text-white ring-2 ring-emerald-500/20'
                                    : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                                }`}
                                title={isCorrect ? 'Respuesta Correcta' : 'Hacer respuesta correcta'}
                              >
                                {isCorrect && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </button>
                              <input
                                type="text"
                                required
                                value={opt}
                                onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                                className={`flex-1 px-3 py-1 rounded-lg border text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                                  isCorrect
                                    ? 'border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/20'
                                    : 'border-slate-200 dark:border-slate-700'
                                }`}
                                placeholder={`Opción ${String.fromCharCode(65 + optIdx)}`}
                              />
                              {isCorrect && (
                                <span className="text-[10px] text-emerald-600 font-bold shrink-0">
                                  Correcta ✓
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                          Explicación pedagógica (visible tras la corrección)
                        </label>
                        <input
                          type="text"
                          value={q.explanation}
                          onChange={(e) => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                          placeholder="Por qué esta es la respuesta correcta..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900 pb-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditQuizModalOpen(false);
                    setEditingQuiz(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IN-APP CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {confirmModal.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Confirmación de acción docente
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => confirmModal.onConfirm()}
                className={`px-4 py-2 rounded-lg text-white text-xs font-semibold shadow-xs transition-colors ${
                  confirmModal.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {confirmModal.confirmLabel || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Lesson Preview for Teacher */}
      {previewingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                    Vista Previa de Estudiante
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {previewingLesson.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewingLesson(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Informative teacher banner */}
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-between gap-3 text-xs text-indigo-900 dark:text-indigo-200">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    Así visualizan los estudiantes esta clase y sus recursos multimedia (YouTube, Google Drive o directos).
                  </span>
                </span>
                <span className="text-[10px] font-mono font-semibold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 shrink-0">
                  {previewingLesson.durationMinutes} min
                </span>
              </div>

              {/* Resource Tabs if multiple */}
              {previewingLesson.resources.length > 1 && (
                <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs overflow-x-auto">
                  {previewingLesson.resources.map((res, idx) => (
                    <button
                      key={res.id || idx}
                      onClick={() => setPreviewResourceIdx(idx)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                        previewResourceIdx === idx
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {res.type === 'video' ? (
                        <Video className="w-3.5 h-3.5" />
                      ) : res.type === 'pdf' ? (
                        <FileText className="w-3.5 h-3.5" />
                      ) : (
                        <ImageIcon className="w-3.5 h-3.5" />
                      )}
                      <span>{res.title || `Recurso ${idx + 1}`}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Media Container */}
              <div className="bg-slate-950 rounded-xl aspect-video overflow-hidden shadow-inner flex items-center justify-center">
                {previewingLesson.resources.length > 0 ? (
                  <MediaRenderer
                    resource={previewingLesson.resources[previewResourceIdx] || previewingLesson.resources[0]}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="text-slate-400 text-xs p-6 text-center">
                    Esta clase no tiene recursos multimedia asignados aún.
                  </div>
                )}
              </div>

              {/* Theory text / explanation */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs">
                <div className="font-bold text-slate-900 dark:text-white">
                  Descripción pedagógica y contenido escrito:
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {previewingLesson.description}
                </p>
                {previewingLesson.contentHtml && (
                  <div
                    className="pt-2 border-t border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300"
                    dangerouslySetInnerHTML={{ __html: previewingLesson.contentHtml }}
                  />
                )}
              </div>

              {/* Integrated Tasks & Evaluations (Preview) */}
              {(() => {
                const linkedAsgs = assignments.filter((a) => a.lessonId === previewingLesson.id || previewingLesson.assignmentIds?.includes(a.id));
                const linkedQuizzes = quizzes.filter((q) => q.lessonId === previewingLesson.id || previewingLesson.quizIds?.includes(q.id));

                return (
                  <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        Tareas y Evaluaciones Integradas en esta Clase ({linkedAsgs.length + linkedQuizzes.length})
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Visible para estudiantes dentro de la clase
                      </span>
                    </div>

                    {linkedAsgs.length === 0 && linkedQuizzes.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">
                        No hay tareas ni exámenes integrados en esta clase actualmente. Puedes integrarlos editando esta clase o desde la pestaña "Tareas y Evaluaciones".
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {linkedAsgs.map((asg) => (
                          <div key={asg.id} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold shrink-0">
                                Tarea
                              </span>
                              <span className="font-semibold text-slate-900 dark:text-white truncate">{asg.title}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-slate-400 font-mono">Máx: {asg.maxScore} pts</span>
                              <button
                                type="button"
                                onClick={() => setPreviewingAssignment(asg)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold transition-colors"
                                title="Ver vista previa de esta tarea"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Ver</span>
                              </button>
                            </div>
                          </div>
                        ))}
                        {linkedQuizzes.map((quiz) => (
                          <div key={quiz.id} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold shrink-0">
                                Evaluación
                              </span>
                              <span className="font-semibold text-slate-900 dark:text-white truncate">{quiz.title}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-slate-400 font-mono">{quiz.questions.length} preguntas · {quiz.timeLimitMinutes} min</span>
                              <button
                                type="button"
                                onClick={() => setPreviewingQuiz(quiz)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold transition-colors"
                                title="Probar examen en vista previa"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Probar</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {previewingLesson.resources.length} recurso(s) en esta clase
              </span>
              <button
                type="button"
                onClick={() => setPreviewingLesson(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold rounded-lg transition-colors"
              >
                Cerrar Vista Previa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Assignment Preview for Teacher */}
      {previewingAssignment && (() => {
        const asgCourse = courses.find((c) => c.id === previewingAssignment.courseId);
        const asgLesson = modules
          .flatMap((m) => m.lessons)
          .find((l) => l.id === previewingAssignment.lessonId || l.assignmentIds?.includes(previewingAssignment.id));

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                      Vista Previa de Tarea · Modo Estudiante
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {previewingAssignment.title}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewingAssignment(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                {/* Informative Banner */}
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-between gap-3 text-indigo-900 dark:text-indigo-200">
                  <span className="flex items-center gap-2 font-medium">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Esta es la visualización exacta que tiene el estudiante dentro de su aula de clase.</span>
                  </span>
                  <span className="px-2.5 py-1 rounded bg-indigo-600 text-white text-[10px] font-bold shrink-0 font-mono">
                    Máx: {previewingAssignment.maxScore} pts
                  </span>
                </div>

                {/* EXACT Student Classroom Container View */}
                <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-50/40 to-white dark:from-indigo-950/20 dark:to-slate-900 text-xs space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                          Tarea de la Clase
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                          {previewingAssignment.title}
                        </h4>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                        <span>Puntaje máximo: <strong className="text-slate-600 dark:text-slate-300">{previewingAssignment.maxScore} pts</strong></span>
                        <span>·</span>
                        <span>Fecha límite: {new Date(previewingAssignment.dueDate).toLocaleDateString()}</span>
                        {asgCourse && (
                          <>
                            <span>·</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium">{asgCourse.title}</span>
                          </>
                        )}
                        {asgLesson && (
                          <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1 text-slate-500">
                              <BookOpen className="w-3 h-3 text-indigo-500" /> Clase: {asgLesson.title}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-[11px] font-bold shrink-0 self-start">
                      Pendiente de Entrega
                    </span>
                  </div>

                  {/* Consigna e Instrucciones */}
                  <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Consigna e Instrucciones
                    </div>
                    <div className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {previewingAssignment.description}
                    </div>
                  </div>

                  {/* Attached Materials */}
                  {previewingAssignment.materials && previewingAssignment.materials.length > 0 && (
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
                        Materiales y Recursos de Apoyo ({previewingAssignment.materials.length})
                      </div>
                      <div className="space-y-1.5">
                        {previewingAssignment.materials.map((mat) => (
                          <a
                            key={mat.id}
                            href={mat.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 text-indigo-600 dark:text-indigo-400 transition-colors"
                          >
                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{mat.title}</span>
                            <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 shrink-0 font-medium">
                              Abrir recurso <ExternalLink className="w-3 h-3" />
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rubric section */}
                  {previewingAssignment.rubric && previewingAssignment.rubric.length > 0 && (
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 bg-white/70 dark:bg-slate-900/60">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        Rúbrica de Evaluación ({previewingAssignment.rubric.length} criterios)
                      </div>
                      <div className="space-y-1.5">
                        {previewingAssignment.rubric.map((crit) => (
                          <div
                            key={crit.id}
                            className="flex items-start justify-between gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-[10px]"
                          >
                            <div>
                              <div className="font-bold text-slate-800 dark:text-slate-200">
                                {crit.title}
                              </div>
                              <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                                {crit.description}
                              </div>
                            </div>
                            <span className="font-mono font-bold text-indigo-600 shrink-0">
                              {crit.maxPoints} pts
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action button as seen by student */}
                  <div className="pt-2 border-t border-indigo-100 dark:border-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 italic">
                      El estudiante presiona este botón para adjuntar sus archivos o enlaces de entrega
                    </span>
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold shadow-2xs opacity-90 cursor-default self-start sm:self-auto"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Subir Entrega de esta Clase
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Vista previa de estudiante activa
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewingAssignment(null)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
                >
                  Cerrar Vista Previa
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: Quiz Preview for Teacher */}
      {previewingQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl my-8">
            <QuizPlayer
              quiz={previewingQuiz}
              onBack={() => setPreviewingQuiz(null)}
              isPreview={true}
            />
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[120] flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold rounded-xl shadow-2xl border border-slate-700 dark:border-slate-200 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
