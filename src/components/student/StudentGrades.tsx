import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Award, CheckCircle2, Clock, FileText, HelpCircle, MessageSquare, BookOpen, GraduationCap, AlertCircle } from 'lucide-react';
import { CertificateModal } from '../common/CertificateModal';
import { Course } from '../../types';

export const StudentGrades: React.FC = () => {
  const { currentUser, submissions, assignments, quizzes, quizAttempts, courses, modules, getCourseProgressPercentage, getCourseCertificateEligibility } = useApp();
  const [selectedCertCourse, setSelectedCertCourse] = useState<Course | null>(null);

  const mySubmissions = submissions.filter((s) => s.studentId === currentUser.id);
  const myQuizAttempts = quizAttempts.filter((a) => a.studentId === currentUser.id);

  // Compute stats
  const gradedSubs = mySubmissions.filter((s) => s.status === 'graded' && s.score !== undefined);
  const totalGradedCount = gradedSubs.length + myQuizAttempts.length;

  let totalScoreSum = 0;
  gradedSubs.forEach((s) => (totalScoreSum += s.score || 0));
  myQuizAttempts.forEach((q) => (totalScoreSum += q.percentage));

  const averageScore = totalGradedCount > 0 ? (totalScoreSum / totalGradedCount).toFixed(1) : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Boletín Académico y Calificaciones
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Historial de notas, rúbricas aplicadas y retroalimentación personalizada de tus docentes.
          </p>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Promedio Ponderado</div>
            <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {averageScore !== null ? `${averageScore} / 100` : 'Sin calificaciones'}
            </div>
          </div>
        </div>
      </div>

      {/* Assignments Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          Tareas y Entregas Calificadas
        </h2>

        {mySubmissions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            No tienes entregas registradas aún.
          </div>
        ) : (
          <div className="space-y-4">
            {mySubmissions.map((sub) => {
              const asg = assignments.find((a) => a.id === sub.assignmentId);
              const crs = courses.find((c) => c.id === sub.courseId);
              const linkedLesson = modules
                .flatMap((m) => m.lessons)
                .find((l) => l.id === asg?.lessonId || (asg && l.assignmentIds?.includes(asg.id)));

              return (
                <div
                  key={sub.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-slate-100 dark:border-slate-800 border-b">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                          {crs?.title}
                        </span>
                        {linkedLesson && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-900/50 text-[10px] font-semibold">
                            <BookOpen className="w-2.5 h-2.5" /> Clase: {linkedLesson.title}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {asg?.title || 'Tarea'}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400">
                        Entregado el: {new Date(sub.submittedAt).toLocaleDateString()}
                      </span>
                      {sub.status === 'graded' ? (
                        <div className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-mono text-xs font-bold tabular-nums">
                          {sub.score} / 100 pts
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-semibold">
                          En revisión
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rubric Breakdown if graded */}
                  {sub.status === 'graded' && asg?.rubric && asg.rubric.length > 0 && sub.rubricScores && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Puntuación por Criterios de la Rúbrica:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {asg.rubric.map((crit) => (
                          <div
                            key={crit.id}
                            className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                          >
                            <div className="text-[11px] text-slate-500 font-medium truncate">
                              {crit.title}
                            </div>
                            <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                              {sub.rubricScores?.[crit.id] ?? crit.maxPoints} / {crit.maxPoints} pts
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Teacher Feedback Note */}
                  {sub.feedback && (
                    <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-1">
                      <div className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Comentarios del Docente:
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                        "{sub.feedback}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quizzes Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-600" />
          Exámenes y Cuestionarios Autocalificados
        </h2>

        {myQuizAttempts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            Aún no has rendido ningún cuestionario interactivo.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myQuizAttempts.map((att) => {
              const quiz = quizzes.find((q) => q.id === att.quizId);
              const crs = courses.find((c) => c.id === att.courseId);
              const linkedLesson = modules
                .flatMap((m) => m.lessons)
                .find((l) => l.id === quiz?.lessonId || (quiz && l.quizIds?.includes(quiz.id)));

              return (
                <div
                  key={att.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                          {crs?.title}
                        </span>
                        {linkedLesson && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/50 text-[10px] font-semibold">
                            <BookOpen className="w-2.5 h-2.5" /> Clase: {linkedLesson.title}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                        {quiz?.title || 'Examen'}
                      </h4>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        att.passed
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {att.passed ? 'Aprobado' : 'No aprobado'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400">
                      Puntaje obtenido:
                    </span>
                    <span className="font-mono font-bold text-emerald-600 tabular-nums">
                      {att.score} / {att.maxScore} pts ({att.percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Certificates & Completed Courses Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          Certificados y Cursos Finalizados
        </h2>

        {(() => {
          const enrolledCourses = courses.filter(
            (c) =>
              (currentUser.coursesEnrolled || []).includes(c.id) ||
              (c.enrolledStudents || []).includes(currentUser.id)
          );
          const eligibleCourses = enrolledCourses
            .map((c) => ({
              course: c,
              eligibility: getCourseCertificateEligibility(c.id)
            }))
            .filter((item) => item.eligibility.eligible);

          if (eligibleCourses.length === 0) {
            return (
              <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <GraduationCap className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  Aún no tienes certificados acreditados disponibles
                </div>
                <p className="max-w-md mx-auto text-[11px] text-slate-500">
                  Para obtener tu diploma oficial debes completar el 100% de las clases, entregar todas las tareas y aprobar cada examen con una nota mínima de 7/10 o 70%.
                </p>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {eligibleCourses.map(({ course, eligibility }) => (
                <div
                  key={course.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Acreditado y Aprobado
                      </span>
                      <span className="text-[10px] text-slate-400">{course.level}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {course.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {course.description}
                    </p>
                    {typeof eligibility.averageScore === 'number' && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                        Promedio de Aprobación: <strong className="text-emerald-600">{eligibility.averageScore}/100</strong>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedCertCourse(course)}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5" />
                    Ver Certificado Oficial
                  </button>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Certificate Modal */}
      {selectedCertCourse && (
        <CertificateModal
          course={selectedCertCourse}
          student={currentUser}
          score={getCourseCertificateEligibility(selectedCertCourse.id).averageScore}
          onClose={() => setSelectedCertCourse(null)}
        />
      )}
    </div>
  );
};
