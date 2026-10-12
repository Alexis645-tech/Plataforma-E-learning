import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CheckSquare,
  FileText,
  MessageSquare,
  User,
  GraduationCap,
  Sparkles,
  RotateCcw,
  Compass,
  Award,
  Layers,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    resetToDefaultData,
    courses,
    submissions,
    notifications,
    logout
  } = useApp();

  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  const unreadChatNotifs = notifications.filter(
    (n) => n.userId === currentUser.id && n.type === 'chat' && !n.read
  ).length;

  const pendingSubmissions = submissions.filter((s) => s.status === 'pending').length;

  const getNavItems = (): NavItem[] => {
    switch (currentUser.role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Panel General', icon: LayoutDashboard },
          { id: 'users', label: 'Gestión de Usuarios', icon: Users, badge: 'Exclusivo' },
          { id: 'courses', label: 'Directorio de Cursos', icon: BookOpen },
          { id: 'chat', label: 'Mensajería', icon: MessageSquare, count: unreadChatNotifs },
          { id: 'profile', label: 'Mi Perfil', icon: User }
        ];
      case 'teacher':
        return [
          { id: 'dashboard', label: 'Resumen Docente', icon: LayoutDashboard },
          { id: 'courses', label: 'Mis Cursos y Contenidos', icon: Layers },
          {
            id: 'grading',
            label: 'Calificar Entregas',
            icon: CheckSquare,
            count: pendingSubmissions > 0 ? pendingSubmissions : undefined
          },
          { id: 'evaluations', label: 'Exámenes y Tareas', icon: FileText },
          { id: 'chat', label: 'Chat con Alumnos', icon: MessageSquare, count: unreadChatNotifs },
          { id: 'profile', label: 'Mi Perfil', icon: User }
        ];
      case 'student':
        return [
          { id: 'dashboard', label: 'Mi Campus', icon: LayoutDashboard },
          { id: 'catalog', label: 'Explorar Cursos', icon: Compass },
          { id: 'assignments', label: 'Tareas y Evaluaciones', icon: FileText },
          { id: 'grades', label: 'Mis Calificaciones', icon: Award },
          { id: 'chat', label: 'Chat Directo', icon: MessageSquare, count: unreadChatNotifs },
          { id: 'profile', label: 'Mi Perfil', icon: User }
        ];
    }
  };

  const navItems = getNavItems();

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* User Role Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                  Rol: {currentUser.role === 'admin' ? 'Administrador' : currentUser.role === 'teacher' ? 'Docente' : 'Estudiante'}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <div className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Navegación
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id ||
                (item.id === 'evaluations' && activeTab === 'assignments') ||
                (item.id === 'dashboard' && (activeTab === 'admin_dashboard' || (currentUser.role === 'student' && activeTab === 'courses')));
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-white text-indigo-700'
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                  {item.badge && !isActive && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-medium bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer with Logout and Reset Data options */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <button
            onClick={() => {
              logout();
              if (onClose) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar Sesión / Cambiar Rol
          </button>

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar datos de muestra
            </button>
          )}
          <div className="text-[10px] text-center text-slate-400 dark:text-slate-500">
            EduSphere v1.2 · Conforme a WCAG AA
          </div>
        </div>
      </aside>

      {/* Confirmation Modal for Resetting Demo Data */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  ¿Restaurar datos iniciales?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Se restablecerán todos los cursos, usuarios y tareas demo originales.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetToDefaultData();
                  setShowResetConfirm(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-xs"
              >
                Sí, Restaurar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
