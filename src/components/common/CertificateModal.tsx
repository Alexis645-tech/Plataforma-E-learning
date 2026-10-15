import React, { useRef } from 'react';
import { Course, User } from '../../types';
import { Award, CheckCircle2, Download, Printer, X, Sparkles, ShieldCheck, Calendar, BookOpen } from 'lucide-react';

interface CertificateModalProps {
  course: Course;
  student: User;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ course, student, onClose }) => {
  const certRef = useRef<HTMLDivElement>(null);
  const issueDate = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const certCode = `ACA-${course.id.replace('crs_', '').toUpperCase()}-${student.id.replace('usr_', '').toUpperCase()}-${new Date().getFullYear()}`;

  const handlePrint = () => {
    // Open print dialog with isolation styling active
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold tracking-wide">
              Certificado Oficial de Aprobación · Alexis Castro Academy
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              title="Guardar o Imprimir solo el certificado en PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Guardar Certificado PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-md transition-colors text-slate-300 hover:text-white"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas */}
        <div id="printable-certificate-root" className="p-6 sm:p-8 bg-slate-100 dark:bg-slate-950/80">
          <div
            id="printable-certificate-canvas"
            ref={certRef}
            className="relative bg-white dark:bg-slate-900 rounded-xl border-4 border-double border-amber-600/40 dark:border-amber-500/30 p-8 sm:p-10 shadow-lg text-center space-y-6 overflow-hidden"
          >
            {/* Watermark / Corner Ornaments */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-amber-500/40 pointer-events-none" />
            <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-amber-500/40 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-amber-500/40 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-amber-500/40 pointer-events-none" />

            {/* Institution Header */}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold tracking-widest text-xs uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Alexis Castro Academy
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-slate-900 dark:text-white uppercase">
                Certificado de Aprobación
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans tracking-wider uppercase">
                Acreditación Académica y Culminación de Estudios
              </p>
            </div>

            {/* Distinction line */}
            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto" />

            {/* Body Text */}
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-sans">
                Por cuanto ha demostrado dedicación, dominio y aprobación del 100% de los contenidos lectivos, se otorga el presente reconocimiento a:
              </p>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-slate-950 dark:text-amber-400 tracking-tight py-1 border-b-2 border-slate-200 dark:border-slate-800 max-w-md mx-auto">
                {student.name}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-sans pt-1">
                Por haber completado con excelencia académica el curso integral:
              </p>
              <div className="text-base sm:text-lg font-bold text-indigo-900 dark:text-indigo-300 font-sans max-w-lg mx-auto">
                &ldquo;{course.title}&rdquo;
              </div>
              <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                <span>Nivel: <strong className="text-slate-700 dark:text-slate-300">{course.level}</strong></span>
                <span>·</span>
                <span>Área: <strong className="text-slate-700 dark:text-slate-300">{course.category}</strong></span>
                <span>·</span>
                <span>Calificación: <strong className="text-emerald-600">Completado 100%</strong></span>
              </div>
            </div>

            {/* Signatures & Verification Badge */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-4 items-end text-center">
              <div className="space-y-1">
                <div className="font-serif italic text-base text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-700 pb-1">
                  Alexis Castro
                </div>
                <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Alexis Castro
                </div>
                <div className="text-[9px] text-slate-400">
                  Director Académico
                </div>
              </div>

              {/* Seal in Center */}
              <div className="hidden sm:flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-500/80 bg-amber-50 dark:bg-amber-950/40 flex flex-col items-center justify-center text-amber-700 dark:text-amber-400 shadow-inner">
                  <ShieldCheck className="w-6 h-6" />
                  <span className="text-[8px] font-bold uppercase tracking-tighter">Validado</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-mono text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-700 pb-1 flex items-center justify-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {issueDate}
                </div>
                <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Fecha de Emisión
                </div>
                <div className="text-[9px] text-slate-400 font-mono truncate" title={certCode}>
                  ID: {certCode}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer (Hidden on print) */}
        <div className="no-print p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>El progreso de este curso está guardado en el campus virtual.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors cursor-pointer"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
