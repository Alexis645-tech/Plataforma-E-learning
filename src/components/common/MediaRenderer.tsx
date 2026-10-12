import React, { useState, useRef, useEffect } from 'react';
import { MediaResource } from '../../types';
import { resolveMediaEmbedInfo } from '../../utils/mediaUtils';
import {
  ExternalLink,
  Download,
  AlertCircle,
  Video,
  FileText,
  Image as ImageIcon,
  Info,
  Smartphone,
  RotateCw,
  ArrowLeft,
  X,
  Maximize2
} from 'lucide-react';

interface MediaRendererProps {
  resource: MediaResource;
  className?: string;
  forceLandscape?: boolean;
  onLandscapeChange?: (active: boolean) => void;
}

export const MediaRenderer: React.FC<MediaRendererProps> = ({
  resource,
  className = '',
  forceLandscape = false,
  onLandscapeChange
}) => {
  const [imageFallbackIndex, setImageFallbackIndex] = useState(0);
  const [hasImageError, setHasImageError] = useState(false);
  const [isDriveIframeFallback, setIsDriveIframeFallback] = useState(false);

  // Mobile Horizontal (Landscape) mode state
  const [isLandscapeMode, setIsLandscapeMode] = useState(false);
  const [isRotated90, setIsRotated90] = useState(false);
  const landscapeContainerRef = useRef<HTMLDivElement>(null);

  // Sync external forceLandscape prop
  useEffect(() => {
    if (forceLandscape && !isLandscapeMode) {
      handleEnterLandscape();
    }
  }, [forceLandscape]);

  const handleEnterLandscape = () => {
    setIsLandscapeMode(true);
    if (onLandscapeChange) onLandscapeChange(true);

    // Auto-detect portrait view: if height > width (typical phone orientation),
    // enable 90deg CSS rotation by default so the video fills the screen in wide format!
    if (typeof window !== 'undefined' && window.innerHeight > window.innerWidth) {
      setIsRotated90(true);
    } else {
      setIsRotated90(false);
    }

    // Attempt Screen Orientation API lock if available
    try {
      if (typeof screen !== 'undefined' && screen.orientation && 'lock' in screen.orientation) {
        (screen.orientation as any).lock('landscape').catch(() => {
          // Gracefully ignore rejected lock
        });
      }
    } catch {
      // Ignore
    }
  };

  const handleExitLandscape = () => {
    setIsLandscapeMode(false);
    setIsRotated90(false);
    if (onLandscapeChange) onLandscapeChange(false);

    try {
      if (typeof document !== 'undefined' && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      if (typeof screen !== 'undefined' && screen.orientation && 'unlock' in screen.orientation) {
        (screen.orientation as any).unlock?.();
      }
    } catch {
      // Ignore
    }
  };

  const toggleRotation = () => {
    setIsRotated90((prev) => !prev);
  };

  const info = resolveMediaEmbedInfo(resource.url, resource.type);

  // Helper to render video player element
  const renderVideoElement = (isLandscapeView = false) => {
    if (info.isYouTube && info.youtubeId) {
      return (
        <iframe
          src={info.embedUrl}
          title={resource.title || 'Video de la clase'}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      );
    }

    if (info.isDrive && info.driveFileId) {
      return (
        <iframe
          src={info.embedUrl}
          title={resource.title || 'Video de Google Drive'}
          className="w-full h-full border-0"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
        />
      );
    }

    if (info.provider === 'vimeo') {
      return (
        <iframe
          src={info.embedUrl}
          title={resource.title || 'Video de Vimeo'}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    }

    // HTML5 native video
    return (
      <video
        key={resource.url}
        controls
        autoPlay={isLandscapeView}
        className="w-full h-full object-contain"
        src={resource.url}
        poster="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&auto=format&fit=crop&q=80"
      >
        Tu navegador no soporta reproducción de video HTML5.
      </video>
    );
  };

  // VIDEO RENDERING
  if (resource.type === 'video') {
    return (
      <>
        {/* Standard In-Page Player */}
        <div className={`relative w-full h-full flex flex-col bg-black ${className}`}>
          {/* Top Bar with Mobile Horizontal button & Source links */}
          <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between pointer-events-none">
            {/* Left badge if Google Drive */}
            {info.isDrive && info.driveFileId ? (
              <div className="pointer-events-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 text-emerald-400 text-[11px] font-medium backdrop-blur-xs border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Google Drive</span>
              </div>
            ) : (
              <div />
            )}

            {/* Right action buttons */}
            <div className="pointer-events-auto flex items-center gap-1.5">
              {/* Option to rotate video to horizontal for mobile users */}
              <button
                type="button"
                onClick={handleEnterLandscape}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-600/90 hover:bg-indigo-600 active:scale-95 text-white text-[11px] font-semibold backdrop-blur-xs transition-all shadow-md border border-indigo-400/40"
                title="Colocar video en horizontal (ideal para celulares y pantallas pequeñas)"
              >
                <Smartphone className="w-3.5 h-3.5 rotate-90" />
                <span>Horizontal Móvil</span>
              </button>

              {/* YouTube direct link */}
              {info.isYouTube && (
                <a
                  href={info.directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/70 hover:bg-black/90 text-white text-[11px] font-medium backdrop-blur-xs transition-colors border border-white/20"
                  title="Abrir en YouTube"
                >
                  <ExternalLink className="w-3 h-3 text-red-500" />
                  <span className="hidden sm:inline">YouTube</span>
                </a>
              )}

              {/* Drive direct link */}
              {info.isDrive && (
                <a
                  href={info.directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 hover:bg-slate-900 text-white text-[11px] font-medium backdrop-blur-xs transition-colors border border-white/20"
                  title="Abrir video en pestaña completa de Google Drive"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span className="hidden sm:inline">Drive</span>
                </a>
              )}
            </div>
          </div>

          {/* Video Player */}
          {renderVideoElement(false)}
        </div>

        {/* FULLSCREEN HORIZONTAL MODAL FOR MOBILE (AND DESKTOP THEATER) */}
        {isLandscapeMode && (
          <div
            ref={landscapeContainerRef}
            className="fixed inset-0 z-9999 bg-black flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Top Overlay Controls Bar */}
            <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
              {/* Back button */}
              <button
                type="button"
                onClick={handleExitLandscape}
                className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/85 hover:bg-black text-white text-xs font-semibold backdrop-blur-md border border-white/25 active:scale-95 transition-all shadow-xl"
              >
                <ArrowLeft className="w-4 h-4 text-indigo-400" />
                <span>Salir de Horizontal</span>
              </button>

              {/* Center notification */}
              <div className="hidden xs:inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900/80 text-slate-200 text-xs font-medium border border-slate-700 backdrop-blur-md">
                <Smartphone className="w-3.5 h-3.5 rotate-90 text-indigo-400" />
                <span>Modo Horizontal Activo</span>
              </div>

              {/* Right controls: Rotate 90° toggle & Close */}
              <div className="pointer-events-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleRotation}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md border transition-all shadow-xl active:scale-95 ${
                    isRotated90
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-600/30'
                      : 'bg-black/85 hover:bg-black text-white border-white/25'
                  }`}
                  title="Alternar entre rotación vertical y horizontal para móviles con bloqueo de rotación"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{isRotated90 ? 'Girar 90° (Móvil vertical)' : 'Horizontal Normal'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExitLandscape}
                  className="p-1.5 rounded-lg bg-black/85 hover:bg-black text-white border border-white/25 active:scale-95 transition-all shadow-xl"
                  title="Cerrar modo horizontal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Rotated or Full-viewport Video Container */}
            <div
              className="relative flex items-center justify-center transition-all duration-200 ease-out"
              style={
                isRotated90
                  ? {
                      width: '100dvh',
                      height: '100dvw',
                      transform: 'rotate(90deg)',
                      transformOrigin: 'center center',
                    }
                  : {
                      width: '100%',
                      height: '100%',
                    }
              }
            >
              {renderVideoElement(true)}
            </div>

            {/* Bottom Floating Info / Tip */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <span className="text-[11px] text-white/60 bg-black/60 backdrop-blur-xs px-3 py-1 rounded-full border border-white/10">
                {isRotated90
                  ? 'Rotación 90° activa: puedes sostener tu teléfono de forma vertical y ver en pantalla ancha.'
                  : 'Gira tu teléfono físicamente para la mejor experiencia, o pulsa "Girar 90°".'}
              </span>
            </div>
          </div>
        )}
      </>
    );
  }

  // IMAGE RENDERING
  if (resource.type === 'image') {
    // If it's a Google Drive Image
    if (info.isDrive && info.driveFileId) {
      const driveImageUrls = info.driveImageUrls || [
        `https://lh3.googleusercontent.com/d/${info.driveFileId}`,
        `https://drive.google.com/thumbnail?id=${info.driveFileId}&sz=w1600`
      ];

      const currentImageUrl = driveImageUrls[imageFallbackIndex] || driveImageUrls[0];

      if (isDriveIframeFallback) {
        return (
          <div className={`relative w-full h-full bg-slate-950 flex flex-col ${className}`}>
            <div className="absolute top-2 right-2 z-10">
              <a
                href={info.directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 hover:bg-slate-900 text-white text-[11px] font-medium backdrop-blur-xs border border-white/20"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Abrir en Drive</span>
              </a>
            </div>
            <iframe
              src={info.embedUrl}
              title={resource.title || 'Imagen de Google Drive'}
              className="w-full h-full border-0"
              allowFullScreen
            />
          </div>
        );
      }

      return (
        <div className={`relative w-full h-full flex flex-col items-center justify-center p-4 bg-slate-950 ${className}`}>
          <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
            <a
              href={info.directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/60 hover:bg-black/80 text-white text-[11px] font-medium border border-white/10 transition-colors"
              title="Abrir imagen en Google Drive"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Ver en Drive</span>
            </a>
          </div>

          <img
            src={currentImageUrl}
            alt={resource.title || 'Imagen de la clase'}
            className="max-h-[85%] max-w-full object-contain rounded-lg shadow-lg"
            onError={() => {
              if (imageFallbackIndex + 1 < driveImageUrls.length) {
                setImageFallbackIndex((prev) => prev + 1);
              } else {
                setIsDriveIframeFallback(true);
              }
            }}
          />

          <div className="text-slate-300 text-xs mt-2.5 font-medium flex items-center gap-2">
            <span>{resource.title}</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
              Google Drive
            </span>
          </div>
        </div>
      );
    }

    // Standard Direct Image
    return (
      <div className={`relative w-full h-full flex flex-col items-center justify-center p-4 bg-slate-950 ${className}`}>
        {hasImageError ? (
          <div className="text-center p-6 space-y-2 max-w-sm">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <div className="text-xs font-semibold text-white">No se pudo cargar la imagen directamente</div>
            <p className="text-[11px] text-slate-400">
              El enlace podría requerir permisos o estar restringido por el servidor.
            </p>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg mt-2"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Abrir Enlace de Imagen</span>
            </a>
          </div>
        ) : (
          <>
            <img
              src={resource.url}
              alt={resource.title || 'Imagen de la lección'}
              className="max-h-[85%] max-w-full object-contain rounded-lg"
              onError={() => setHasImageError(true)}
            />
            <div className="text-slate-300 text-xs mt-2 font-medium">
              {resource.title}
            </div>
          </>
        )}
      </div>
    );
  }

  // PDF RENDERING
  if (resource.type === 'pdf') {
    // If PDF is in Google Drive
    if (info.isDrive && info.driveFileId) {
      return (
        <div className={`relative w-full h-full bg-slate-950 flex flex-col ${className}`}>
          <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
            <a
              href={info.directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/70 hover:bg-black/90 text-white text-[11px] font-medium backdrop-blur-xs border border-white/20"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Abrir PDF en Drive</span>
            </a>
          </div>
          <iframe
            src={info.embedUrl}
            title={resource.title || 'Documento PDF'}
            className="w-full h-full border-0"
            allowFullScreen
          />
        </div>
      );
    }

    // Standard PDF preview & download
    return (
      <div className={`w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center ${className}`}>
        <div className="p-4 rounded-2xl bg-indigo-950/80 text-indigo-400 border border-indigo-800/50 mb-3">
          <FileText className="w-10 h-10" />
        </div>
        <h3 className="text-white text-sm font-bold max-w-md">
          {resource.title}
        </h3>
        <p className="text-slate-400 text-xs mt-1 max-w-md">
          {resource.description || 'Documento de lectura académica y especificación técnica en formato PDF.'}
        </p>
        <div className="flex items-center gap-2 mt-4">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Abrir PDF en Visor
          </a>
          <a
            href={resource.url}
            download
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Descargar Guía
          </a>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className={`p-8 text-center text-xs text-slate-400 ${className}`}>
      Visualizador preparado para este recurso multimedia.
    </div>
  );
};
