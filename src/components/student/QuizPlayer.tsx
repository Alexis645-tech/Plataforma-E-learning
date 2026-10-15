import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Quiz, QuizQuestion } from '../../types';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  AlertCircle,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Lock
} from 'lucide-react';

interface QuizPlayerProps {
  quiz: Quiz;
  onBack: () => void;
  isPreview?: boolean;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz, onBack, isPreview = false }) => {
  const { currentUser, submitQuizAttempt, quizAttempts } = useApp();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Check all previous attempts for this student and quiz
  const studentAttempts = quizAttempts.filter(
    (a) => a.quizId === quiz.id && a.studentId === currentUser.id
  );
  const maxAttempts = quiz.maxAttempts ?? 'unlimited';
  const isUnlimited = maxAttempts === 'unlimited';
  const canRetry = isUnlimited || studentAttempts.length < (maxAttempts as number);

  const questions = quiz.questions || [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const maxScore = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const calculateResults = () => {
    let earnedScore = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        earnedScore += q.points || 0;
      }
    });
    const percentage = maxScore > 0 ? Math.round((earnedScore / maxScore) * 100) : 0;
    const passed = percentage >= 70;

    return { earnedScore, percentage, passed };
  };

  const handleSubmitQuiz = () => {
    if (!isPreview) {
      const { earnedScore, percentage, passed } = calculateResults();
      submitQuizAttempt({
        quizId: quiz.id,
        courseId: quiz.courseId,
        studentId: currentUser.id,
        answers: selectedAnswers,
        score: earnedScore,
        maxScore,
        percentage,
        passed
      });
    }

    setIsSubmitted(true);
  };

  const results = isSubmitted ? calculateResults() : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-150">
      {isPreview && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Modo Vista Previa de Docente: Estás probando este examen tal como lo responderá el estudiante. Las respuestas no alterarán las notas oficiales.</span>
          </div>
          <button
            onClick={onBack}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shrink-0"
          >
            Cerrar Vista Previa
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {isPreview ? 'Volver al Panel Docente' : 'Volver'}
        </button>

        <div className="flex items-center gap-2.5 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {isUnlimited ? (
              <span>Intentos: Siempre (Ilimitado)</span>
            ) : (
              <span>Intentos: {Math.min(studentAttempts.length + (isSubmitted ? 0 : 1), maxAttempts as number)} de {maxAttempts}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>{quiz.timeLimitMinutes} min límite</span>
          </div>
        </div>
      </div>

      {/* Main Quiz Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
            Evaluación Interactiva
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {quiz.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {quiz.description}
          </p>
        </div>

        {totalQuestions === 0 ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Cuestionario en preparación
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Este cuestionario aún no contiene preguntas asignadas por el docente.
              </p>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
            >
              Volver al Curso
            </button>
          </div>
        ) : isSubmitted && results ? (
          <div className="space-y-6 animate-in zoom-in-95 duration-200">
            <div
              className={`p-6 rounded-2xl border text-center space-y-3 ${
                results.passed
                  ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800'
                  : 'bg-rose-50/70 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800'
              }`}
            >
              <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center bg-white dark:bg-slate-900 shadow-sm">
                {results.passed ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                ) : (
                  <XCircle className="w-7 h-7 text-rose-600" />
                )}
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {results.passed ? '¡Felicitaciones! Has Aprobado' : 'No has alcanzado el puntaje mínimo'}
                </h2>
                <div className="text-3xl font-bold font-mono mt-1 text-slate-900 dark:text-white tabular-nums">
                  {results.earnedScore} / {maxScore} pts ({results.percentage}%)
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {results.passed
                    ? 'Excelente asimilación de los contenidos interactivos.'
                    : 'Te recomendamos repasar las lecciones anteriores e intentar nuevamente.'}
                </p>
              </div>
            </div>

            {/* Questions Review */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Revisión Detallada de Respuestas
              </h3>

              {quiz.questions.map((q, idx) => {
                const studentAns = selectedAnswers[q.id];
                const isCorrect = studentAns === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      isCorrect
                        ? 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                        : 'border-rose-200 bg-rose-50/30 dark:border-rose-900/40 dark:bg-rose-950/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {idx + 1}. {q.prompt}
                      </span>
                      <span
                        className={`font-mono font-bold shrink-0 ${
                          isCorrect ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isCorrect ? `+${q.points} pts` : '0 pts'}
                      </span>
                    </div>

                    <div className="space-y-1 pt-1">
                      {q.options.map((opt, oIdx) => {
                        const isChosen = studentAns === oIdx;
                        const isTheCorrectOne = q.correctIndex === oIdx;

                        return (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-lg flex items-center justify-between text-[11px] ${
                              isTheCorrectOne
                                ? 'bg-emerald-100/70 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100 font-semibold'
                                : isChosen && !isCorrect
                                ? 'bg-rose-100/70 text-rose-900 dark:bg-rose-900/50 dark:text-rose-100 line-through'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span>{opt}</span>
                            {isTheCorrectOne && (
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">
                                Respuesta Correcta
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                      <strong>Explicación:</strong> {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Attempt limit notice */}
            {!isUnlimited && studentAttempts.length >= (maxAttempts as number) && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                <Lock className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  Has completado todos los intentos permitidos para este cuestionario ({studentAttempts.length} de {maxAttempts}). Tu calificación final ha sido registrada en el sistema.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              {(isUnlimited || studentAttempts.length < (maxAttempts as number)) && (
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setSelectedAnswers({});
                    setCurrentQuestionIndex(0);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reintentar Cuestionario
                </button>
              )}
              <button
                onClick={onBack}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
              >
                Continuar con el Curso
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE QUESTIONS QUESTIONNAIRE */
          <div className="space-y-6">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span>Pregunta {currentQuestionIndex + 1} de {totalQuestions}</span>
              <span className="font-mono text-indigo-600 font-semibold">{currentQuestion?.points || 0} puntos</span>
            </div>

            {/* Question prompt */}
            <div className="space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQuestion?.prompt}
              </h2>

              {/* Options */}
              <div className="space-y-2">
                {currentQuestion?.options?.map((option, idx) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(currentQuestion.id, idx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs transition-colors flex items-center gap-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 dark:bg-indigo-950/40 dark:text-white font-medium shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-40"
              >
                Anterior
              </button>

              <div className="flex items-center gap-2">
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                  >
                    Siguiente Pregunta
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length === 0}
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                  >
                    Finalizar y Calificar Examen
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
