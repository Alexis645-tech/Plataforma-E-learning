import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Highlighter,
  Lightbulb,
  AlertTriangle,
  Sparkles,
  Eye,
  Edit3,
  RotateCcw,
  X,
  ExternalLink,
  Check
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  label?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Redacta la explicación de la lección, notas clave y puntos a recordar...',
  rows = 4,
  className = '',
  label = 'Contenido Escrito / Explicación Teórica'
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkOpenNewTab, setLinkOpenNewTab] = useState(true);
  const [linkSelectionRange, setLinkSelectionRange] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper to wrap selected text or insert snippet at cursor
  const insertFormatting = (before: string, after: string, defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultText;
    const replacement = `${before}${selectedText}${after}`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    // Re-focus and set selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(start + before.length, newCursorPos);
    }, 0);
  };

  // Quick insertion helpers
  const handleBold = () => insertFormatting('<b>', '</b>', 'Texto en negrita');
  const handleItalic = () => insertFormatting('<i>', '</i>', 'Texto en cursiva');
  const handleUnderline = () => insertFormatting('<u>', '</u>', 'Texto subrayado');
  const handleStrikethrough = () => insertFormatting('<s>', '</s>', 'Texto tachado');
  const handleH2 = () => insertFormatting('\n<h2>', '</h2>\n', 'Título de la Sección');
  const handleH3 = () => insertFormatting('\n<h3>', '</h3>\n', 'Subtítulo');
  const handleBulletList = () =>
    insertFormatting('\n<ul>\n  <li>', '</li>\n  <li>Elemento 2</li>\n</ul>\n', 'Elemento 1');
  const handleNumberedList = () =>
    insertFormatting('\n<ol>\n  <li>', '</li>\n  <li>Paso 2</li>\n</ol>\n', 'Paso 1');
  const handleQuote = () =>
    insertFormatting(
      '\n<blockquote class="border-l-4 border-indigo-500 pl-3 my-2 italic text-slate-600 dark:text-slate-300">\n  ',
      '\n</blockquote>\n',
      'Cita o idea clave destacada'
    );
  const handleCode = () =>
    insertFormatting(
      '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400 font-mono text-xs">',
      '</code>',
      'código o comando'
    );

  const handleOpenLinkModal = () => {
    const textarea = textareaRef.current;
    let selected = '';
    let start = 0;
    let end = 0;
    if (textarea) {
      start = textarea.selectionStart;
      end = textarea.selectionEnd;
      selected = value.substring(start, end);
    } else {
      start = value.length;
      end = value.length;
    }
    setLinkSelectionRange({ start, end });
    setLinkText(selected);
    setLinkUrl('');
    setLinkOpenNewTab(true);
    setShowLinkModal(true);
  };

  const handleConfirmLink = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    let cleanUrl = linkUrl.trim();
    if (!cleanUrl) return;
    if (
      !cleanUrl.startsWith('http://') &&
      !cleanUrl.startsWith('https://') &&
      !cleanUrl.startsWith('mailto:') &&
      !cleanUrl.startsWith('#')
    ) {
      cleanUrl = `https://${cleanUrl}`;
    }
    const displayText = linkText.trim() || cleanUrl;
    const targetAttr = linkOpenNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
    const htmlLink = `<a href="${cleanUrl}"${targetAttr} class="text-indigo-600 dark:text-indigo-400 underline font-medium hover:text-indigo-700">${displayText}</a>`;

    const start = linkSelectionRange.start;
    const end = linkSelectionRange.end;
    const newValue = value.substring(0, start) + htmlLink + value.substring(end);
    onChange(newValue);
    setShowLinkModal(false);

    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus();
        const newPos = start + htmlLink.length;
        textarea.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  // Highlight colors
  const handleHighlight = (color: 'amber' | 'emerald' | 'sky' | 'pink') => {
    const colorClasses = {
      amber: 'bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 px-1 py-0.5 rounded',
      emerald: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200 px-1 py-0.5 rounded',
      sky: 'bg-sky-100 dark:bg-sky-900/50 text-sky-900 dark:text-sky-200 px-1 py-0.5 rounded',
      pink: 'bg-pink-100 dark:bg-pink-900/50 text-pink-900 dark:text-pink-200 px-1 py-0.5 rounded'
    }[color];

    insertFormatting(`<mark class="${colorClasses}">`, '</mark>', 'Texto resaltado');
    setShowColorPicker(false);
  };

  // Educational Callouts
  const handleCallout = (type: 'tip' | 'key' | 'warning') => {
    if (type === 'tip') {
      insertFormatting(
        '\n<div class="p-3 my-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 text-amber-900 dark:text-amber-200 text-xs">\n  <strong>💡 Consejo Docente:</strong> ',
        '\n</div>\n',
        'Escribe aquí una recomendación práctica para el estudiante.'
      );
    } else if (type === 'key') {
      insertFormatting(
        '\n<div class="p-3 my-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border-l-4 border-indigo-500 text-indigo-900 dark:text-indigo-200 text-xs">\n  <strong>📌 Punto Clave:</strong> ',
        '\n</div>\n',
        'Escribe aquí el concepto fundamental que no deben olvidar.'
      );
    } else if (type === 'warning') {
      insertFormatting(
        '\n<div class="p-3 my-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border-l-4 border-rose-500 text-rose-900 dark:text-rose-200 text-xs">\n  <strong>⚠️ Importante:</strong> ',
        '\n</div>\n',
        'Atención con este error común o precaución técnica.'
      );
    }
  };

  // Templates
  const handleTemplate = (templateKey: 'lessonStructure' | 'qa' | 'glossary') => {
    let templateHtml = '';
    if (templateKey === 'lessonStructure') {
      templateHtml = `<h2>🎯 Objetivo de la Clase</h2>
<p>Al finalizar esta lección, el estudiante podrá comprender y aplicar los conceptos principales de esta sesión.</p>

<h2>📖 Desarrollo Teórico</h2>
<p>Explica aquí el tema con fundamentos claros, ejemplos y analogías.</p>

<div class="p-3 my-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border-l-4 border-indigo-500 text-indigo-900 dark:text-indigo-200 text-xs">
  <strong>📌 Punto Clave:</strong> Recuerda que la práctica constante refuerza la teoría vista.
</div>

<h2>💻 Ejercicio Práctico</h2>
<ul>
  <li><strong>Paso 1:</strong> Revisar el material audiovisual y recursos complementarios.</li>
  <li><strong>Paso 2:</strong> Implementar el código o resolver la guía propuesta.</li>
</ul>`;
    } else if (templateKey === 'qa') {
      templateHtml = `<h2>❓ Preguntas Clave para el Debate</h2>
<ul>
  <li>¿Cuál es la diferencia principal entre los enfoques explicados?</li>
  <li>¿En qué escenarios reales aplicarías esta solución técnica?</li>
</ul>
<div class="p-3 my-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 text-amber-900 dark:text-amber-200 text-xs">
  <strong>💡 Tip Docente:</strong> Reflexiona sobre cómo optimizar el rendimiento antes de escribir código.
</div>`;
    } else if (templateKey === 'glossary') {
      templateHtml = `<h2>📚 Glosario de Conceptos</h2>
<ul>
  <li><strong>Término A:</strong> Definición concisa y aplicación práctica.</li>
  <li><strong>Término B:</strong> Concepto relacionado y mejores prácticas recomendadas.</li>
</ul>`;
    }

    onChange(value ? `${value}\n\n${templateHtml}` : templateHtml);
    setShowTemplatePicker(false);
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all ${className}`}
    >
      {/* 1. Header Bar with Label & Tab Switcher */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700">
        <label className="block font-semibold text-slate-700 dark:text-slate-300 text-xs">
          {label}
        </label>
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'editor'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'preview'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Vista Previa</span>
          </button>
        </div>
      </div>

      {/* 2. Formatting Toolbar */}
      {activeTab === 'editor' && (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-xs">
          {/* Typography */}
          <div className="flex items-center gap-0.5 bg-white dark:bg-slate-900 p-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs">
            <button
              type="button"
              onClick={handleBold}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600"
              title="Negrita (<b>)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleItalic}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600"
              title="Cursiva (<i>)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleUnderline}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600"
              title="Subrayado (<u>)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleStrikethrough}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600"
              title="Tachado (<s>)"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-0.5 bg-white dark:bg-slate-900 p-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs">
            <button
              type="button"
              onClick={handleH2}
              className="px-1.5 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[11px] hover:text-indigo-600 flex items-center gap-0.5"
              title="Título H2"
            >
              <Heading2 className="w-3.5 h-3.5" />
              <span>H2</span>
            </button>
            <button
              type="button"
              onClick={handleH3}
              className="px-1.5 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[11px] hover:text-indigo-600 flex items-center gap-0.5"
              title="Subtítulo H3"
            >
              <Heading3 className="w-3.5 h-3.5" />
              <span>H3</span>
            </button>
          </div>

          {/* Lists & Quotes */}
          <div className="flex items-center gap-0.5 bg-white dark:bg-slate-900 p-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs">
            <button
              type="button"
              onClick={handleBulletList}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600"
              title="Lista con viñetas"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNumberedList}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600"
              title="Lista numerada"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleQuote}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600"
              title="Cita destacada"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleCode}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600"
              title="Código en línea"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleOpenLinkModal}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600"
              title="Insertar enlace"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Highlight Colors Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker((prev) => !prev)}
              className={`p-1.5 rounded-md border flex items-center gap-1 shadow-2xs transition-colors ${
                showColorPicker
                  ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Resaltador de texto"
            >
              <Highlighter className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] font-semibold">Resaltar</span>
            </button>

            {showColorPicker && (
              <div className="absolute left-0 mt-1 z-30 flex items-center gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => handleHighlight('amber')}
                  className="w-5 h-5 rounded-full bg-amber-300 hover:scale-110 transition-transform shadow-2xs"
                  title="Resaltado Amarillo"
                />
                <button
                  type="button"
                  onClick={() => handleHighlight('emerald')}
                  className="w-5 h-5 rounded-full bg-emerald-300 hover:scale-110 transition-transform shadow-2xs"
                  title="Resaltado Verde menta"
                />
                <button
                  type="button"
                  onClick={() => handleHighlight('sky')}
                  className="w-5 h-5 rounded-full bg-sky-300 hover:scale-110 transition-transform shadow-2xs"
                  title="Resaltado Azul cielo"
                />
                <button
                  type="button"
                  onClick={() => handleHighlight('pink')}
                  className="w-5 h-5 rounded-full bg-pink-300 hover:scale-110 transition-transform shadow-2xs"
                  title="Resaltado Rosa"
                />
              </div>
            )}
          </div>

          {/* Quick Pedagogical Boxes */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleCallout('tip')}
              className="px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-semibold text-[10px] flex items-center gap-1"
              title="Insertar caja de Consejo Docente"
            >
              <Lightbulb className="w-3 h-3 text-amber-600" />
              <span>Tip Docente</span>
            </button>
            <button
              type="button"
              onClick={() => handleCallout('key')}
              className="px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 font-semibold text-[10px] flex items-center gap-1"
              title="Insertar caja de Punto Clave"
            >
              <span>📌 Punto Clave</span>
            </button>
            <button
              type="button"
              onClick={() => handleCallout('warning')}
              className="px-2 py-1 rounded-md bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 font-semibold text-[10px] flex items-center gap-1"
              title="Insertar advertencia o error común"
            >
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              <span>Alerta</span>
            </button>
          </div>

          {/* Template Dropdown */}
          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() => setShowTemplatePicker((prev) => !prev)}
              className="px-2 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[10px] flex items-center gap-1 shadow-2xs"
              title="Insertar plantillas pedagógicas listas para usar"
            >
              <Sparkles className="w-3 h-3 text-yellow-300" />
              <span>Plantilla Rápida</span>
            </button>

            {showTemplatePicker && (
              <div className="absolute right-0 mt-1 z-30 w-52 p-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Plantillas de Clase
                </div>
                <button
                  type="button"
                  onClick={() => handleTemplate('lessonStructure')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                >
                  🎯 Estructura Completa
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplate('qa')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                >
                  ❓ Preguntas de Debate
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplate('glossary')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                >
                  📚 Glosario de Conceptos
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. The Textarea element (direct child of the root div!) */}
      <textarea
        ref={textareaRef}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs leading-relaxed focus:outline-none resize-y min-h-[110px] font-sans ${
          activeTab === 'preview' ? 'hidden' : 'block'
        }`}
      />

      {/* 4. Preview View (rendered if activeTab === 'preview') */}
      {activeTab === 'preview' && (
        <div className="p-4 bg-white dark:bg-slate-900 min-h-[140px] max-h-[300px] overflow-y-auto">
          {value.trim() ? (
            <div
              className="prose dark:prose-invert prose-xs text-xs text-slate-700 dark:text-slate-200 leading-relaxed space-y-2"
              dangerouslySetInnerHTML={{ __html: value }}
            />
          ) : (
            <div className="text-slate-400 text-xs italic text-center py-6">
              Sin contenido aún. Utiliza el editor o inserta una plantilla para visualizar el formato aquí.
            </div>
          )}
        </div>
      )}

      {/* 5. Bottom Status Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700/60 text-[10px] text-slate-400">
        <div className="flex items-center gap-2">
          <span>{wordCount} palabras</span>
          <span>•</span>
          <span>{charCount} caracteres</span>
          <span>•</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-medium">Formato Enriquecido Activo</span>
        </div>
        {value.trim() && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1"
            title="Borrar todo el texto"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* 6. In-place Link Insertion Modal */}
      {showLinkModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowLinkModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Insertar Enlace Web o Recurso
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Añade hipervínculos a páginas web, videos de Drive/YouTube o lecturas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dirección URL del enlace <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    placeholder="https://ejemplo.com o link de Google Drive / YouTube"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleConfirmLink();
                      } else if (e.key === 'Escape') {
                        setShowLinkModal(false);
                      }
                    }}
                    className="w-full px-3.5 py-2 pl-9 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                  />
                  <ExternalLink className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Texto visible del enlace
                </label>
                <input
                  type="text"
                  placeholder="Ej: Ver guía en PDF o consultar video complementario"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleConfirmLink();
                    } else if (e.key === 'Escape') {
                      setShowLinkModal(false);
                    }
                  }}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Si dejas este campo vacío, se usará la URL como texto del enlace.
                </p>
              </div>

              {/* Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-slate-600 dark:text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={linkOpenNewTab}
                  onChange={(e) => setLinkOpenNewTab(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 w-4 h-4 cursor-pointer"
                />
                <span>Abrir enlace en una pestaña nueva (recomendado)</span>
              </label>

              {/* Quick suggestions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1.5 font-medium">Ejemplos rápidos:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (!linkUrl) setLinkUrl('https://drive.google.com/');
                      if (!linkText) setLinkText('Abrir recurso en Google Drive');
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    📁 Google Drive
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!linkUrl) setLinkUrl('https://youtube.com/');
                      if (!linkText) setLinkText('Ver video en YouTube');
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    ▶️ YouTube
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!linkUrl) setLinkUrl('https://');
                      if (!linkText) setLinkText('Lectura complementaria');
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    🌐 Sitio Web
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleConfirmLink()}
                disabled={!linkUrl.trim()}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                  linkUrl.trim()
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-95'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Insertar Enlace</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
