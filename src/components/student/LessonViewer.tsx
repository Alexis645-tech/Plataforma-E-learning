import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Course, CourseModule, Lesson, MediaResource, Assignment, Quiz } from '../../types';
import {
  ArrowLeft,
  CheckCircle,
  CheckCircle2,
  Circle,
  Video,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Download,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Smartphone,
  RotateCw,
  Award,
  Upload,
  X,
  FileCheck,
  AlertCircle,
  ListOrdered,
  HelpCircle,
  Paperclip
} from 'lucide-react';
import { MediaRenderer } from '../common/MediaRenderer';
import { QuizPlayer } from './QuizPlayer';
import { CertificateModal } from '../common/CertificateModal';

interface LessonViewerProps {
  course: Course;
  onBack: () => void;
  initialLessonId?: string;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({ course, onBack, initialLessonId }) => {
  const {
    modules,
    isLessonCompleted,
    toggleLessonProgress,
    markLessonAsCompleted,
    recordCourseAccess,
    getCourseProgressPercentage,
    assignments,
    quizzes,
    submissions,
    quizAttempts,
    currentUser,
    createSubmission
  } = useApp();

  const courseModules = modules.filter((m) => m.courseId === course.id);
  const allLessons: Lesson[] = [];
  courseModules.forEach((m) => allLessons.push(...m.lessons));

  const [activeLessonId, setActiveLessonId] = useState<string>(() => {
    if (initialLessonId && allLessons.some((l) => l.id === initialLessonId)) {
      return initialLessonId;
    }
    return allLessons[0]?.id || '';
  });

  useEffect(() => {
    if (initialLessonId && allLessons.some((l) => l.id === initialLessonId)) {
      setActiveLessonId(initialLessonId);
    }
  }, [initialLessonId]);

  const activeLesson = allLessons.find((l) => l.id === activeLessonId) || allLessons[0];
  const [activeResourceTab, setActiveResourceTab] = useState<number>(0);
  const [isMobileLandscape, setIsMobileLandscape] = useState<boolean>(false);

  // In-class Quiz state
  const [activeQuizToPlay, setActiveQuizToPlay] = useState<Quiz | null>(null);

  // In-class Assignment submission state
  const [activeAssignmentToSubmit, setActiveAssignmentToSubmit] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionFileName, setSubmissionFileName] = useState('');
  const [expandedRubricAsgId, setExpandedRubricAsgId] = useState<string | null>(null);

  const completed = activeLesson ? isLessonCompleted(course.id, activeLesson.id) : false;
  const progressPct = getCourseProgressPercentage(course.id);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);

  useEffect(() => {
    recordCourseAccess(course.id);
  }, [course.id, activeLessonId, recordCourseAccess]);

  const currentLessonIndex = allLessons.findIndex((l) => l.id === activeLesson?.id);
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1
      ? allLessons[currentLessonIndex + 1]
      : null;

  const handleNextLessonWithCompletion = () => {
    if (activeLesson) {
      markLessonAsCompleted(course.id, activeLesson.id);
    }
    if (nextLesson) {
      setActiveLessonId(nextLesson.id);
      setActiveResourceTab(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevLesson = () => {
    if (prevLesson) {
      setActiveLessonId(prevLesson.id);
      setActiveResourceTab(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!activeLesson) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        Este curso aún no tiene clases disponibles.
        <div className="mt-3">
          <button onClick={onBack} className="text-indigo-600 font-semibold hover:underline">
            Volver a mis cursos
          </button>
        </div>
      </div>
    );
  }

  // Linked assignments and quizzes for the currently active lesson
  const linkedAssignments = assignments.filter(
    (a) => a.courseId === course.id && (a.lessonId === activeLesson.id || activeLesson.assignmentIds?.includes(a.id))
  );

  const linkedQuizzes = quizzes.filter(
    (q) => q.courseId === course.id && (q.lessonId === activeLesson.id || activeLesson.quizIds?.includes(q.id))
  );

  const currentResource = activeLesson.resources[activeResourceTab] || activeLesson.resources[0];

  const handleSubmitAssignmentForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignmentToSubmit || !submissionText.trim()) return;

    createSubmission({
      assignmentId: activeAssignmentToSubmit.id,
      courseId: activeAssignmentToSubmit.courseId,
      contentText: submissionText.trim(),
      fileUrl: submissionUrl.trim() || undefined,
      fileName: submissionFileName.trim() || 'entrega_clase.zip'
    });

    setSubmissionText('');
    setSubmissionUrl('');
    setSubmissionFileName('');
    setActiveAssignmentToSubmit(null);
  };

  // If student is currently taking a quiz directly from inside this lesson
  if (activeQuizToPlay) {
    return (
      <div className="space-y-4 animate-in fade-in duration-150">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveQuizToPlay(null)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Volver a la clase"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                Evaluación vinculada a: {activeLesson.title}
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {activeQuizToPlay.title}
              </h2>
            </div>
          </div>
          <button
            onClick={() => setActiveQuizToPlay(null)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold transition-colors"
          >
            Regresar a la clase
          </button>
        </div>

        <QuizPlayer
          quiz={activeQuizToPlay}
          onBack={() => setActiveQuizToPlay(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Top Classroom Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Volver"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
              {course.title}
            </div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {activeLesson.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[11px] text-slate-400">Progreso del curso:</span>
            <span className="font-mono text-xs font-bold text-emerald-600">{progressPct}% completado</span>
          </div>

          <button
            onClick={() => toggleLessonProgress(course.id, activeLesson.id)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              completed
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
            }`}
          >
            {completed ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Clase Completada
              </>
            ) : (
              <>
                <Circle className="w-4 h-4" />
                Marcar como Completada
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Classroom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stage (Media Player, Content & Integrated Tasks/Evaluations) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Media Player Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            {/* Resource Tabs if multiple resources */}
            {activeLesson.resources.length > 1 && (
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs overflow-x-auto">
                {activeLesson.resources.map((res, idx) => (
                  <button
                    key={res.id}
                    onClick={() => setActiveResourceTab(idx)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      activeResourceTab === idx
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
                    {res.title}
                  </button>
                ))}
              </div>
            )}

            {/* Mobile Video Horizontal Banner */}
            {currentResource?.type === 'video' && (
              <div className="flex sm:hidden items-center justify-between px-3.5 py-2 bg-gradient-to-r from-indigo-50 to-indigo-100/60 dark:from-indigo-950/40 dark:to-slate-900 border-b border-indigo-100 dark:border-indigo-900/40 text-xs">
                <div className="flex items-center gap-1.5 text-indigo-900 dark:text-indigo-200 font-medium">
                  <Smartphone className="w-3.5 h-3.5 rotate-90 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>¿Estás en celular?</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileLandscape(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] shadow-2xs active:scale-95 transition-all"
                  title="Girar video a horizontal"
                >
                  <RotateCw className="w-3 h-3" />
                  Girar a Horizontal
                </button>
              </div>
            )}

            {/* Stage Viewport */}
            <div className="bg-slate-950 aspect-video flex items-center justify-center relative overflow-hidden">
              {currentResource ? (
                <MediaRenderer
                  resource={currentResource}
                  className="w-full h-full"
                  forceLandscape={isMobileLandscape}
                  onLandscapeChange={setIsMobileLandscape}
                />
              ) : (
                <div className="text-slate-400 text-xs p-8">
                  Visualizador de contenido preparado para esta sesión.
                </div>
              )}
            </div>

            {/* Description & Rich Text */}
            <div className="p-5 space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Contenido Didáctico y Notas de la Clase
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {activeLesson.description}
                </p>
              </div>

              {activeLesson.contentHtml && (
                <div
                  className="prose dark:prose-invert prose-xs text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-3 border-t border-slate-100 dark:border-slate-800"
                  dangerouslySetInnerHTML={{ __html: activeLesson.contentHtml }}
                />
              )}
            </div>
          </div>

          {/* INTEGRATED TASKS & ASSESSMENTS SECTION FOR THIS CLASS */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Tareas y Evaluaciones de esta Clase
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Actividades académicas integradas por el docente para esta sesión lectiva.
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 text-[10px] font-semibold flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {linkedAssignments.length} {linkedAssignments.length === 1 ? 'tarea' : 'tareas'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 text-[10px] font-semibold flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {linkedQuizzes.length} {linkedQuizzes.length === 1 ? 'evaluación' : 'evaluaciones'}
                </span>
              </div>
            </div>

            {/* Empty state if teacher hasn't linked any task/quiz to this class */}
            {linkedAssignments.length === 0 && linkedQuizzes.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-xs font-bold">
                  ✓
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Esta clase no tiene tareas ni exámenes pendientes
                </div>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Enfócate en revisar el contenido audiovisual y las notas de estudio. Si el docente añade una actividad a esta clase, aparecerá directamente aquí.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 1. Linked Assignments */}
                {linkedAssignments.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      Tareas Asignadas a esta Lección
                    </div>

                    <div className="space-y-3">
                      {linkedAssignments.map((asg) => {
                        const mySub = submissions.find(
                          (s) => s.assignmentId === asg.id && s.studentId === currentUser.id
                        );
                        const isRubricExpanded = expandedRubricAsgId === asg.id;

                        return (
                          <div
                            key={asg.id}
                            className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-50/40 to-white dark:from-indigo-950/20 dark:to-slate-900 text-xs space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                    Tarea de la Clase
                                  </span>
                                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                                    {asg.title}
                                  </h4>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                                  <span>Puntaje máximo: <strong className="text-slate-600 dark:text-slate-300">{asg.maxScore} pts</strong></span>
                                  <span>·</span>
                                  <span>Fecha límite: {new Date(asg.dueDate).toLocaleDateString()}</span>
                                </div>
                              </div>

                              {mySub ? (
                                <span
                                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold shrink-0 self-start ${
                                    mySub.status === 'graded'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                  }`}
                                >
                                  {mySub.status === 'graded'
                                    ? `Calificada: ${mySub.score}/${asg.maxScore} pts`
                                    : 'Entrega Enviada (Pendiente de Calificar)'}
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-[11px] font-bold shrink-0 self-start">
                                  Pendiente de Entrega
                                </span>
                              )}
                            </div>

                            {/* Consigna e Instrucciones formatted with paragraph breaks */}
                            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Consigna e Instrucciones
                              </div>
                              <div className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {asg.description}
                              </div>
                            </div>

                            {/* Attached Materials */}
                            {asg.materials && asg.materials.length > 0 && (
                              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                  <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
                                  Materiales y Recursos de Apoyo ({asg.materials.length})
                                </div>
                                <div className="space-y-1.5">
                                  {asg.materials.map((mat) => (
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

                            {/* Rubric View Toggle */}
                            {asg.rubric && asg.rubric.length > 0 && (
                              <div className="pt-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedRubricAsgId(isRubricExpanded ? null : asg.id)
                                  }
                                  className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1"
                                >
                                  <ListOrdered className="w-3 h-3" />
                                  {isRubricExpanded ? 'Ocultar rúbrica de evaluación' : `Ver rúbrica (${asg.rubric.length} criterios)`}
                                  {isRubricExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                </button>

                                {isRubricExpanded && (
                                  <div className="mt-2 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 animate-in fade-in duration-100">
                                    {asg.rubric.map((crit) => (
                                      <div
                                        key={crit.id}
                                        className="flex items-start justify-between gap-2 p-1.5 rounded bg-slate-50 dark:bg-slate-800/50 text-[10px]"
                                      >
                                        <div>
                                          <div className="font-bold text-slate-800 dark:text-slate-200">
                                            {crit.title}
                                          </div>
                                          <div className="text-slate-500 dark:text-slate-400">
                                            {crit.description}
                                          </div>
                                        </div>
                                        <span className="font-mono font-bold text-indigo-600 shrink-0">
                                          {crit.maxPoints} pts
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Submission details or action button */}
                            <div className="pt-2 border-t border-indigo-100 dark:border-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              {mySub ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                                    <FileCheck className="w-3.5 h-3.5" />
                                    <span>Entregado: {new Date(mySub.submittedAt).toLocaleDateString()} a las {new Date(mySub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  {mySub.fileName && (
                                    <div className="text-[10px] text-slate-500 font-mono">
                                      Archivo adjunto: {mySub.fileName}
                                    </div>
                                  )}
                                  {mySub.feedback && (
                                    <div className="mt-1 p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-[11px] text-emerald-900 dark:text-emerald-200">
                                      <strong>Devolución del Docente:</strong> "{mySub.feedback}"
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveAssignmentToSubmit(asg);
                                    setSubmissionText('');
                                    setSubmissionUrl('');
                                    setSubmissionFileName('');
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors self-start sm:self-auto"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  Subir Entrega de esta Clase
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Linked Quizzes */}
                {linkedQuizzes.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      Evaluaciones y Exámenes de esta Lección
                    </div>

                    <div className="space-y-3">
                      {linkedQuizzes.map((quiz) => {
                        const attempts = quizAttempts.filter(
                          (a) => a.quizId === quiz.id && a.studentId === currentUser.id
                        );
                        const lastAttempt = attempts[attempts.length - 1];
                        const maxAttempts = quiz.maxAttempts ?? 'unlimited';
                        const isUnlimited = maxAttempts === 'unlimited';
                        const isExceeded = !isUnlimited && attempts.length >= (maxAttempts as number);

                        return (
                          <div
                            key={quiz.id}
                            className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50 bg-gradient-to-r from-emerald-50/40 to-white dark:from-emerald-950/20 dark:to-slate-900 text-xs space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                                    Examen de la Clase
                                  </span>
                                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                                    {quiz.title}
                                  </h4>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                                  <span className="flex items-center gap-1">
                                    <HelpCircle className="w-3 h-3 text-emerald-600" /> {quiz.questions.length} preguntas
                                  </span>
                                  <span>·</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {quiz.timeLimitMinutes} min
                                  </span>
                                  <span>·</span>
                                  <span>
                                    {isUnlimited ? 'Intentos ilimitados' : `Máximo: ${maxAttempts} intento(s)`}
                                  </span>
                                </div>
                              </div>

                              {lastAttempt ? (
                                <div className="text-right shrink-0">
                                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                                    {lastAttempt.score} / {lastAttempt.maxScore} pts ({lastAttempt.percentage}%)
                                  </span>
                                  <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded inline-block mt-0.5 ${
                                      lastAttempt.passed
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                    }`}
                                  >
                                    {lastAttempt.passed ? 'Aprobado' : 'No Aprobado'}
                                  </span>
                                </div>
                              ) : (
                                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[11px] font-bold shrink-0 self-start">
                                  Sin Realizar
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                              {quiz.description}
                            </p>

                            {/* Quiz launch action */}
                            <div className="pt-2 border-t border-emerald-100 dark:border-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                {attempts.length > 0 ? (
                                  <span>Has realizado {attempts.length} {attempts.length === 1 ? 'intento' : 'intentos'}.</span>
                                ) : (
                                  <span>Prueba tus conocimientos adquiridos en este video.</span>
                                )}
                              </div>

                              <button
                                type="button"
                                disabled={isExceeded}
                                onClick={() => setActiveQuizToPlay(quiz)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-colors self-start sm:self-auto ${
                                  isExceeded
                                    ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                              >
                                <Award className="w-3.5 h-3.5" />
                                {attempts.length > 0 ? (isExceeded ? 'Intentos Agotados' : 'Reintentar Evaluación') : 'Realizar Evaluación de esta Clase'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Classroom Navigation Bar */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
            {/* Completion Banner if 100% */}
            {progressPct === 100 && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      ¡Felicitaciones! Has completado el 100% del curso
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Todo tu progreso está guardado y tu certificado oficial de aprobación está listo.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCertificateModal(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
                >
                  <Award className="w-3.5 h-3.5" />
                  Ver Certificado Oficial
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              {/* Previous Lesson Button */}
              {prevLesson ? (
                <button
                  type="button"
                  onClick={handlePrevLesson}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Anterior: <strong className="font-normal opacity-80">{prevLesson.title}</strong></span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {/* Complete current toggle */}
                <button
                  type="button"
                  onClick={() => toggleLessonProgress(course.id, activeLesson.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    completed
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {completed ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Clase Completada
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 text-slate-400" />
                      Marcar Clase como Completada
                    </>
                  )}
                </button>

                {/* Next Lesson / Completion Action */}
                {nextLesson ? (
                  <button
                    type="button"
                    onClick={handleNextLessonWithCompletion}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <span>Completar y Siguiente</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!completed) {
                        markLessonAsCompleted(course.id, activeLesson.id);
                      }
                      setShowCertificateModal(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <Award className="w-4 h-4" />
                    <span>Finalizar Curso y Ver Diploma</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Course Outline & Modules Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                Índice del Curso
              </h3>
              <span className="font-mono text-[11px] font-semibold text-emerald-600">
                {progressPct}%
              </span>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {courseModules.map((module) => (
                <div key={module.id} className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {module.title}
                  </div>

                  <div className="space-y-1">
                    {module.lessons.map((lesson) => {
                      const isSelected = lesson.id === activeLesson.id;
                      const isDone = isLessonCompleted(course.id, lesson.id);

                      // Count linked tasks and evaluations for this lesson item
                      const lessonAsgCount = assignments.filter(
                        (a) => a.courseId === course.id && (a.lessonId === lesson.id || lesson.assignmentIds?.includes(a.id))
                      ).length;
                      const lessonQuizCount = quizzes.filter(
                        (q) => q.courseId === course.id && (q.lessonId === lesson.id || lesson.quizIds?.includes(q.id))
                      ).length;

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => {
                            setActiveLessonId(lesson.id);
                            setActiveResourceTab(0);
                          }}
                          className={`p-2 rounded-lg text-xs flex flex-col gap-1 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              {isDone ? (
                                <CheckCircle
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isSelected ? 'text-white' : 'text-emerald-500'
                                  }`}
                                />
                              ) : (
                                <Circle className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                              )}
                              <span className="truncate">{lesson.title}</span>
                            </div>
                            <span
                              className={`text-[10px] font-mono shrink-0 ${
                                isSelected ? 'text-indigo-200' : 'text-slate-400'
                              }`}
                            >
                              {lesson.durationMinutes}m
                            </span>
                          </div>

                          {/* Chips indicating assignments and quizzes in this lesson */}
                          {(lessonAsgCount > 0 || lessonQuizCount > 0) && (
                            <div className="flex items-center gap-1.5 pl-5.5">
                              {lessonAsgCount > 0 && (
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-semibold flex items-center gap-0.5 ${
                                    isSelected
                                      ? 'bg-white/20 text-white'
                                      : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-900/50'
                                  }`}
                                  title={`${lessonAsgCount} tarea(s) vinculada(s)`}
                                >
                                  <FileText className="w-2.5 h-2.5" />
                                  {lessonAsgCount} {lessonAsgCount === 1 ? 'tarea' : 'tareas'}
                                </span>
                              )}
                              {lessonQuizCount > 0 && (
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-semibold flex items-center gap-0.5 ${
                                    isSelected
                                      ? 'bg-white/20 text-white'
                                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/50'
                                  }`}
                                  title={`${lessonQuizCount} evaluación(es) vinculada(s)`}
                                >
                                  <Award className="w-2.5 h-2.5" />
                                  {lessonQuizCount} {lessonQuizCount === 1 ? 'eval' : 'evals'}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* In-Class Submission Modal */}
      {activeAssignmentToSubmit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                  Entrega de Tarea · Clase actual
                </span>
                <h3 className="text-sm font-bold truncate">{activeAssignmentToSubmit.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveAssignmentToSubmit(null)}
                className="p-1 hover:bg-white/20 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAssignmentForm} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Respuesta o Informe de la Tarea <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Escribe tu análisis, desarrollo del problema o comentarios sobre esta entrega..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Enlace al Proyecto o Repositorio (Google Drive, GitHub, etc.)
                </label>
                <input
                  type="url"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  placeholder="https://drive.google.com/... o https://github.com/..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del Archivo Adjunto (Opcional)
                </label>
                <input
                  type="text"
                  value={submissionFileName}
                  onChange={(e) => setSubmissionFileName(e.target.value)}
                  placeholder="ej: solucion_clase_1.pdf"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveAssignmentToSubmit(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Enviar Entrega al Docente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificateModal && (
        <CertificateModal
          course={course}
          student={currentUser}
          onClose={() => setShowCertificateModal(false)}
        />
      )}
    </div>
  );
};
