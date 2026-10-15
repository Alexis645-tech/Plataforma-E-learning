import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Course, Assignment, Quiz, Submission } from '../../types';
import { LessonViewer } from './LessonViewer';
import { QuizPlayer } from './QuizPlayer';
import { CertificateModal } from '../common/CertificateModal';
import {
  BookOpen,
  PlayCircle,
  FileText,
  Award,
  Clock,
  CheckCircle2,
  Upload,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Compass,
  ArrowRight,
  MessageSquare,
  Lock,
  GraduationCap,
  Paperclip
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    courses,
    modules,
    assignments,
    quizzes,
    submissions,
    quizAttempts,
    createSubmission,
    getCourseProgressPercentage,
    getCourseCertificateEligibility,
    activeTab,
    setActiveTab
  } = useApp();

  // Active view filter: 'all' | 'courses' | 'assignments' | 'catalog'
  const [studentView, setStudentView] = useState<'all' | 'courses' | 'assignments' | 'catalog'>(() => {
    if (activeTab === 'assignments') return 'assignments';
    if (activeTab === 'catalog') return 'catalog';
    if (activeTab === 'courses') return 'courses';
    return 'all';
  });

  // Sync studentView with activeTab (from notifications or navigation)
  useEffect(() => {
    if (activeTab === 'assignments') {
      setStudentView('assignments');
    } else if (activeTab === 'catalog') {
      setStudentView('catalog');
    } else if (activeTab === 'courses') {
      setStudentView('courses');
    } else if (activeTab === 'dashboard') {
      setStudentView('all');
    }
  }, [activeTab]);

  // Active sub-views
  const [activeCourseToStudy, setActiveCourseToStudy] = useState<Course | null>(null);
  const [activeLessonToOpen, setActiveLessonToOpen] = useState<string | undefined>(undefined);
  const [activeQuizToTake, setActiveQuizToTake] = useState<Quiz | null>(null);
  const [activeAssignmentToSubmit, setActiveAssignmentToSubmit] = useState<Assignment | null>(null);
  const [certificateCourse, setCertificateCourse] = useState<Course | null>(null);

  // Submission Form State
  const [submissionText, setSubmissionText] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionFileName, setSubmissionFileName] = useState('');

  // Enrolled courses: synchronized bidirectionally between student profile and course enrollment lists
  const enrolledCourseIds = Array.from(
    new Set([
      ...(currentUser.coursesEnrolled || []),
      ...courses.filter((c) => (c.enrolledStudents || []).includes(currentUser.id)).map((c) => c.id)
    ])
  );
  const myCourses = courses.filter((c) => enrolledCourseIds.includes(c.id));
  const otherCourses = courses.filter((c) => !enrolledCourseIds.includes(c.id));

  // Filter tasks & quizzes strictly to courses where the student is enrolled by their teacher
  const myAssignments = assignments.filter((a) => enrolledCourseIds.includes(a.courseId));
  const myQuizzes = quizzes.filter((q) => enrolledCourseIds.includes(q.courseId));

  // My submissions
  const mySubmissions = submissions.filter((s) => s.studentId === currentUser.id);

  // If currently studying a course
  if (activeCourseToStudy) {
    return (
      <LessonViewer
        course={activeCourseToStudy}
        initialLessonId={activeLessonToOpen}
        onBack={() => {
          setActiveCourseToStudy(null);
          setActiveLessonToOpen(undefined);
        }}
      />
    );
  }

  // If taking a quiz
  if (activeQuizToTake) {
    return (
      <QuizPlayer
        quiz={activeQuizToTake}
        onBack={() => setActiveQuizToTake(null)}
      />
    );
  }

  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignmentToSubmit || !submissionText.trim()) return;

    createSubmission({
      assignmentId: activeAssignmentToSubmit.id,
      courseId: activeAssignmentToSubmit.courseId,
      contentText: submissionText.trim(),
      fileUrl: submissionUrl.trim() || undefined,
      fileName: submissionFileName.trim() || 'proyecto_entrega_final.zip'
    });

    setSubmissionText('');
    setSubmissionUrl('');
    setSubmissionFileName('');
    setActiveAssignmentToSubmit(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Welcome Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">
            Campus Virtual · Estudiante
          </span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mt-1 break-words">
            ¡Hola, {currentUser.name.split(' ')[0]}! Continúa tu ruta de aprendizaje
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100/80 mt-1.5 leading-relaxed break-words">
            {myCourses.length === 0
              ? 'Aún no tienes cursos activos. Tus docentes te matricularán para que puedas acceder al material y clases.'
              : `Tienes ${myCourses.length} ${myCourses.length === 1 ? 'curso activo matriculado' : 'cursos activos matriculados'} por tus docentes y material interactivo listo para cursar.`}
          </p>
        </div>
      </div>

      {/* Metrics Row - Responsive 2x2 on mobile, 4 columns on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-medium text-slate-500">
            <span className="truncate">Cursos Matriculados</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 shrink-0">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {myCourses.length}
          </div>
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-slate-400 truncate">
            Matrícula docente
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-medium text-slate-500">
            <span className="truncate">Tareas Enviadas</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {mySubmissions.length}
          </div>
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-slate-400 truncate">
            {mySubmissions.filter((s) => s.status === 'graded').length} con nota final
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-medium text-slate-500">
            <span className="truncate">Exámenes Rendidos</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-600 shrink-0">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {quizAttempts.filter((a) => a.studentId === currentUser.id).length}
          </div>
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-slate-400 truncate">
            Cuestionarios evaluados
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-medium text-slate-500">
            <span className="truncate">Promedio General</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 shrink-0">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums truncate">
            {(() => {
              const graded = mySubmissions.filter((s) => s.status === 'graded' && s.score !== undefined);
              const attempts = quizAttempts.filter((a) => a.studentId === currentUser.id && (a.percentage !== undefined || a.score !== undefined));
              const totalItems = graded.length + attempts.length;
              if (totalItems === 0) return '0.0 pts';
              const totalScore = graded.reduce((sum, s) => sum + (s.score || 0), 0) + attempts.reduce((sum, a) => sum + (a.percentage ?? a.score ?? 0), 0);
              return `${(totalScore / totalItems).toFixed(1)} pts`;
            })()}
          </div>
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-slate-400 truncate">
            {mySubmissions.filter((s) => s.status === 'graded').length + quizAttempts.filter((a) => a.studentId === currentUser.id).length === 0
              ? 'Sin evaluaciones aún'
              : 'Rendimiento'}
          </div>
        </div>
      </div>

      {/* Student Navigation Filter Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
        <button
          onClick={() => {
            setStudentView('all');
            setActiveTab('dashboard');
          }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            studentView === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Resumen Campus
        </button>

        <button
          onClick={() => {
            setStudentView('courses');
            setActiveTab('courses');
          }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            studentView === 'courses'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Mis Cursos ({myCourses.length})
        </button>

        <button
          onClick={() => {
            setStudentView('assignments');
            setActiveTab('assignments');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            studentView === 'assignments'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Tareas y Exámenes
          {myAssignments.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
              {myAssignments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setStudentView('catalog');
            setActiveTab('catalog');
          }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            studentView === 'catalog'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Catálogo Institucional ({otherCourses.length})
        </button>
      </div>

      {/* Context banner when navigated to assignments from a notification or menu */}
      {studentView === 'assignments' && (
        <div className="p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between gap-3 text-xs text-indigo-900 dark:text-indigo-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Mostrando tus <strong>Tareas y Evaluaciones Asignadas</strong>. Puedes subir tus entregas o resolver exámenes interactivos.</span>
          </div>
          <button
            onClick={() => {
              setStudentView('all');
              setActiveTab('dashboard');
            }}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
          >
            Ver todo el campus
          </button>
        </div>
      )}

      {/* Enrolled Courses Section */}
      {(studentView === 'all' || studentView === 'courses') && (
        <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Mis Cursos Matriculados
          </h2>
          <span className="text-xs text-slate-400">
            {myCourses.length} cursos activos
          </span>
        </div>

        {myCourses.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <GraduationCap className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <div className="font-semibold text-slate-700 dark:text-slate-300">
              Aún no has sido matriculado en ningún curso
            </div>
            <p className="max-w-md mx-auto text-[11px]">
              La matrícula es gestionada directamente por los docentes. Consulta el catálogo inferior para comunicarte con los profesores por el chat integrado.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myCourses.map((course) => {
              const progressPct = getCourseProgressPercentage(course.id);
              const courseMods = modules.filter((m) => m.courseId === course.id);
              let totalLessons = 0;
              courseMods.forEach((m) => (totalLessons += m.lessons.length));
              const teacher = users.find((u) => u.id === course.teacherId);

              return (
                <div
                  key={course.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className={`p-4 bg-gradient-to-tr ${course.bannerGradient} text-white`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">
                        {course.category}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/30 backdrop-blur-xs">
                        {course.level}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold mt-2 line-clamp-1">
                      {course.title}
                    </h3>
                  </div>

                  <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="space-y-2">
                      {/* Teacher label */}
                      {teacher && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <img
                            src={teacher.avatar}
                            alt={teacher.name}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span>Docente: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{teacher.name}</strong></span>
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          {progressPct === 100 ? 'Estado del curso' : 'Avance del estudiante'}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                          {progressPct === 100 && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                          {progressPct}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span>{courseMods.length} módulos</span>
                        <span>·</span>
                        <span>{totalLessons} clases</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      {progressPct === 100 ? (
                        (() => {
                          const certEligibility = getCourseCertificateEligibility(course.id);
                          return certEligibility.eligible ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setCertificateCourse(course)}
                                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                              >
                                <Award className="w-3.5 h-3.5" />
                                Ver Certificado Oficial
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveCourseToStudy(course)}
                                className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <PlayCircle className="w-3.5 h-3.5" />
                                Repasar Clases del Curso
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => setActiveCourseToStudy(course)}
                                className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                                title="Faltan tareas o evaluaciones con nota mínima aprobatoria para desbloquear el diploma"
                              >
                                <PlayCircle className="w-3.5 h-3.5" />
                                Clases 100% · Completar Tareas/Exámenes
                              </button>
                            </>
                          );
                        })()
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveCourseToStudy(course)}
                          className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          {progressPct > 0 ? 'Continuar Curso' : 'Iniciar Curso'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {/* Pending Assignments & Interactive Quizzes */}
      {(studentView === 'all' || studentView === 'assignments') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="student-assignments">
        {/* Assignments Card */}
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Tareas Pendientes y Entregas
            </h3>
          </div>

          <div className="space-y-3">
            {myAssignments.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No tienes tareas asignadas en tus cursos activos.
              </div>
            ) : (
              myAssignments.map((asg) => {
                const mySub = mySubmissions.find((s) => s.assignmentId === asg.id);
                const crs = courses.find((c) => c.id === asg.courseId);
                const linkedLesson = modules
                  .flatMap((m) => m.lessons)
                  .find((l) => l.id === asg.lessonId || l.assignmentIds?.includes(asg.id));

                return (
                  <div
                    key={asg.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{asg.title}</div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-400">{crs?.title}</span>
                          {linkedLesson ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (crs) {
                                  setActiveCourseToStudy(crs);
                                  setActiveLessonToOpen(linkedLesson.id);
                                }
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200/60 dark:border-indigo-900/60 transition-colors"
                              title={`Ir a la clase: ${linkedLesson.title}`}
                            >
                              <BookOpen className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[150px]">Clase: {linkedLesson.title}</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              · Tarea general del curso
                            </span>
                          )}
                        </div>
                      </div>
                      {mySub ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          mySub.status === 'graded'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                        }`}>
                          {mySub.status === 'graded' ? `Nota: ${mySub.score}/100` : 'Enviada (Pendiente)'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400 text-[10px] font-bold">
                          Por Entregar
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2">{asg.description}</p>

                    {asg.materials && asg.materials.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {asg.materials.map((mat) => (
                          <a
                            key={mat.id}
                            href={mat.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-medium transition-colors"
                          >
                            <Paperclip className="w-2.5 h-2.5 text-indigo-500" />
                            <span className="truncate max-w-[160px]">{mat.title}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-400">
                        Fecha límite: {new Date(asg.dueDate).toLocaleDateString()}
                      </span>

                      {!mySub ? (
                        <button
                          onClick={() => setActiveAssignmentToSubmit(asg)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
                        >
                          Subir Entrega
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Entrega enviada
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quizzes Card */}
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              Exámenes y Cuestionarios Interactivos
            </h3>
          </div>

          <div className="space-y-3">
            {myQuizzes.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No hay cuestionarios activos en tus cursos matriculados.
              </div>
            ) : (
              myQuizzes.map((quiz) => {
                const crs = courses.find((c) => c.id === quiz.courseId);
                const attempts = quizAttempts.filter(
                  (a) => a.quizId === quiz.id && a.studentId === currentUser.id
                );
                const lastAttempt = attempts[attempts.length - 1];
                const maxAttempts = quiz.maxAttempts ?? 'unlimited';
                const isUnlimited = maxAttempts === 'unlimited';
                const isExceeded = !isUnlimited && attempts.length >= (maxAttempts as number);
                const linkedLesson = modules
                  .flatMap((m) => m.lessons)
                  .find((l) => l.id === quiz.lessonId || l.quizIds?.includes(quiz.id));

                return (
                  <div
                    key={quiz.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{quiz.title}</div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-400">{crs?.title}</span>
                          {linkedLesson ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (crs) {
                                  setActiveCourseToStudy(crs);
                                  setActiveLessonToOpen(linkedLesson.id);
                                }
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-900/60 transition-colors"
                              title={`Ir a la clase: ${linkedLesson.title}`}
                            >
                              <BookOpen className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[150px]">Clase: {linkedLesson.title}</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              · Evaluación general del curso
                            </span>
                          )}
                        </div>
                      </div>
                      {lastAttempt ? (
                        <div className="text-right">
                          <span className="font-mono text-xs font-bold text-emerald-600 block">
                            {lastAttempt.score} / {lastAttempt.maxScore} pts ({lastAttempt.percentage}%)
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {lastAttempt.passed ? 'Aprobado' : 'No superado'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">
                          {quiz.questions.length} preguntas
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2">{quiz.description}</p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" /> {quiz.timeLimitMinutes} min
                        </span>
                        <span>·</span>
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-semibold ${
                            isExceeded
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {isUnlimited
                            ? 'Intentos: Siempre (Ilimitado)'
                            : `Intentos: ${attempts.length} de ${maxAttempts}`}
                        </span>
                      </div>

                      {isExceeded ? (
                        <button
                          disabled
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed flex items-center gap-1"
                        >
                          <Lock className="w-3 h-3" />
                          Intentos agotados
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveQuizToTake(quiz)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold shadow-2xs ${
                            attempts.length > 0
                              ? 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {attempts.length > 0
                            ? `Repetir Quiz (${attempts.length + 1}${isUnlimited ? '' : `/${maxAttempts}`})`
                            : 'Iniciar Examen'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      )}

      {/* Catalog / Other Courses Section (Informative with Teacher Enrollment Notice) */}
      {(studentView === 'all' || studentView === 'catalog') && otherCourses.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-600" />
                Catálogo de Otros Cursos en la Institución
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                La matrícula es gestionada exclusivamente por los docentes a cargo de cada materia.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
              <Lock className="w-3 h-3 text-indigo-500" />
              <span>Matrícula por Docente</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {otherCourses.map((c) => {
              const teacher = users.find((u) => u.id === c.teacherId);
              return (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                        {c.category} · {c.level}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {c.enrolledStudents.length} inscritos
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                      {c.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {c.description}
                    </p>

                    {teacher && (
                      <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                        <img
                          src={teacher.avatar}
                          alt={teacher.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <div className="text-slate-700 dark:text-slate-300 font-medium truncate">
                            {teacher.name}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 italic">
                      Requiere matrícula docente
                    </span>
                    <button
                      onClick={() => setActiveTab('chat')}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors"
                      title="Contactar al docente para solicitar acceso"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Contactar Docente</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: Submit Assignment */}
      {activeAssignmentToSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Subir Entrega de Tarea
                </h3>
                <p className="text-xs text-slate-400">{activeAssignmentToSubmit.title}</p>
              </div>
              <button
                onClick={() => setActiveAssignmentToSubmit(null)}
                className="text-slate-400"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAssignment} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción del Trabajo Desarrollado *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detalla cómo resolviste los requerimientos, arquitectura empleada, tecnologías y decisiones tomadas..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Enlace al Repositorio o Despliegue en Vivo
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/mi-usuario/proyecto-demo"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del Archivo Adjunto (ZIP / PDF / DOCX)
                </label>
                <input
                  type="text"
                  placeholder="proyecto_fullstack_final.zip"
                  value={submissionFileName}
                  onChange={(e) => setSubmissionFileName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveAssignmentToSubmit(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Enviar Entrega al Docente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {certificateCourse && (
        <CertificateModal
          course={certificateCourse}
          student={currentUser}
          score={getCourseCertificateEligibility(certificateCourse.id).averageScore}
          onClose={() => setCertificateCourse(null)}
        />
      )}
    </div>
  );
};
