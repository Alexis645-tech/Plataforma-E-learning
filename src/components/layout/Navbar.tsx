import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, AppNotification } from '../../types';
import {
  GraduationCap,
  Bell,
  Sun,
  Moon,
  Shield,
  UserCheck,
  BookOpen,
  ChevronDown,
  Check,
  MessageSquare,
  Award,
  Sparkles,
  Menu,
  X,
  LogOut,
  FileText,
  Users,
  ArrowRight,
  RefreshCw,
  WifiOff
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const {
    currentUser,
    users,
    theme,
    toggleTheme,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveTab,
    setSelectedChatContactId,
    logout,
    isMongoConnected
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter((n) => n.userId === currentUser.id && !n.read);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50';
      case 'teacher':
        return 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/50';
      case 'student':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'teacher':
        return 'Docente';
      case 'student':
        return 'Estudiante';
    }
  };

  const handleNotificationClick = (n: AppNotification) => {
    markNotificationAsRead(n.id);
    setIsNotifOpen(false);

    let targetTab = n.linkAction;

    // Normalize legacy or specific aliases
    if (targetTab === 'admin_dashboard') {
      targetTab = 'dashboard';
    }

    if (!targetTab) {
      if (n.type === 'chat') {
        targetTab = 'chat';
      } else if (n.type === 'grade') {
        targetTab = currentUser.role === 'teacher' ? 'grading' : 'grades';
      } else if (n.type === 'assignment') {
        targetTab = currentUser.role === 'teacher' ? 'grading' : 'assignments';
      } else if (n.type === 'system') {
        targetTab = currentUser.role === 'admin' ? 'dashboard' : 'dashboard';
      } else {
        targetTab = 'dashboard';
      }
    }

    // Role-specific mapping adjustments
    if (currentUser.role === 'teacher') {
      if (targetTab === 'assignments') {
        targetTab = 'evaluations';
      }
    } else if (currentUser.role === 'student') {
      if (targetTab === 'grading') {
        targetTab = 'grades';
      }
    }

    // Direct redirection to the conversation contact for chat notifications
    if (targetTab === 'chat' || n.type === 'chat') {
      let contactId = n.senderId || n.relatedId || n.targetId;
      if (!contactId && n.title) {
        // Fallback: match by sender name in title (e.g., "Mensaje de Kevin Prado")
        const prefixMatch = n.title.match(/Mensaje de (.+)/i);
        if (prefixMatch && prefixMatch[1]) {
          const senderName = prefixMatch[1].trim().toLowerCase();
          const found = users.find((u) => u.name.toLowerCase() === senderName || u.name.toLowerCase().includes(senderName));
          if (found) {
            contactId = found.id;
          }
        }
      }
      if (contactId) {
        setSelectedChatContactId(contactId);
      }
    }

    setActiveTab(targetTab);
  };

  const getNotifIcon = (n: AppNotification) => {
    switch (n.type) {
      case 'grade':
        return <Award className="w-4 h-4 text-emerald-500" />;
      case 'assignment':
        return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-sky-500" />;
      case 'system':
      default:
        if (n.linkAction === 'users') {
          return <Users className="w-4 h-4 text-violet-500" />;
        }
        return <Bell className="w-4 h-4 text-amber-500" />;
    }
  };

  const getNotifDestinationInfo = (n: AppNotification) => {
    const action = n.linkAction;
    if (action === 'grades' || n.type === 'grade') {
      if (currentUser.role === 'teacher') {
        return { label: 'Ir a Calificar', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60' };
      }
      return { label: 'Ver Mis Calificaciones', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60' };
    }
    if (action === 'grading') {
      return { label: 'Centro de Calificaciones', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60' };
    }
    if (action === 'assignments' || action === 'evaluations' || n.type === 'assignment') {
      if (currentUser.role === 'teacher') {
        return { label: 'Revisar Tareas', color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60' };
      }
      return { label: 'Ver Tareas Asignadas', color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60' };
    }
    if (action === 'chat' || n.type === 'chat') {
      return { label: 'Abrir Chat Directo', color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60' };
    }
    if (action === 'users') {
      return { label: 'Gestión de Usuarios', color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60' };
    }
    if (action === 'courses' || action === 'catalog') {
      return { label: 'Directorio de Cursos', color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60' };
    }
    if (action === 'profile') {
      return { label: 'Mi Perfil', color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800' };
    }
    return { label: 'Ir al Panel', color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800' };
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-8 h-16 gap-2 sm:gap-4 max-w-full">
        {/* Left Zone: Brand and Mobile toggle */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 sm:p-2 -ml-1 sm:-ml-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg lg:hidden shrink-0"
            aria-label="Alternar menú lateral"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }} className="flex items-center gap-2 group min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-white font-sans truncate">
                <span className="inline sm:hidden">Alexis Castro</span>
                <span className="hidden sm:inline">Alexis Castro Academy</span>
                <span className="text-indigo-600 dark:text-indigo-400">.</span>
              </span>
            </div>
          </a>
        </div>

        {/* Center Zone: Authenticated Role Status (Read-only) & DB Reconnection Indicator */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-2xs">
            <span className="text-slate-400 dark:text-slate-500">Sesión activa:</span>
            <span className={`px-2 py-0.5 rounded font-semibold border ${getRoleBadgeStyle(currentUser.role)}`}>
              {getRoleLabel(currentUser.role)}
            </span>
          </div>

          {!isMongoConnected && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-[11px] font-semibold text-amber-700 dark:text-amber-300 shadow-2xs animate-pulse"
              title="La base de datos se está reconectando en segundo plano. Tu sesión, rol y datos están 100% resguardados en este dispositivo."
            >
              <RefreshCw className="w-3 h-3 animate-spin text-amber-600 dark:text-amber-400" />
              <span>Modo protegido (reintentando BD...)</span>
            </div>
          )}
        </div>

        {/* Right Zone: Controls & Profile */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300 transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-1.5 sm:p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Notificaciones"
              aria-label="Notificaciones"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900"></span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">Notificaciones</span>
                    {unreadNotifs.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                        {unreadNotifs.length}
                      </span>
                    )}
                  </div>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      Marcar leídas
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2 pr-0.5">
                  {notifications.filter((n) => n.userId === currentUser.id).length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 space-y-1">
                      <Bell className="w-6 h-6 mx-auto opacity-30 text-slate-400" />
                      <p className="font-medium text-slate-600 dark:text-slate-400">No tienes notificaciones pendientes</p>
                      <p className="text-[11px] text-slate-400">Las novedades de tus cursos, tareas y mensajes aparecerán aquí.</p>
                    </div>
                  ) : (
                    notifications
                      .filter((n) => n.userId === currentUser.id)
                      .slice(0, 8)
                      .map((n) => {
                        const dest = getNotifDestinationInfo(n);
                        return (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3 rounded-xl text-xs cursor-pointer transition-all border group ${
                              n.read
                                ? 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-200 dark:hover:border-slate-800 text-slate-600 dark:text-slate-400'
                                : 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-800 dark:text-slate-200 font-medium shadow-2xs'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="mt-0.5 p-1.5 rounded-lg shrink-0 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                                {getNotifIcon(n)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-1.5">
                                  <span className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                                    {n.title}
                                  </span>
                                  <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap">
                                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-[11px] mt-0.5 leading-snug line-clamp-2 text-slate-500 dark:text-slate-400">
                                  {n.message}
                                </p>
                                <div className="mt-2 flex items-center justify-between">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-transform ${dest.color}`}>
                                    <span>{dest.label}</span>
                                    <ArrowRight className="w-2.5 h-2.5 transition-transform group-hover:translate-x-0.5" />
                                  </span>
                                  {!n.read && (
                                    <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" title="No leída"></span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 pr-1.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden md:inline max-w-[100px] truncate">
                {currentUser.name.split(' ')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-2 border-b border-slate-100 dark:border-slate-800 mb-1.5">
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{currentUser.email}</div>
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-0.5 text-[10px] rounded border font-semibold ${getRoleBadgeStyle(currentUser.role)}`}>
                      {getRoleLabel(currentUser.role)}
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                  >
                    Mi Perfil y Preferencias
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('chat');
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                  >
                    Mensajes y Chat
                  </button>
                </div>

                <div className="pt-2 mt-1.5 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      logout();
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Cerrar Sesión / Cambiar de Rol
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
