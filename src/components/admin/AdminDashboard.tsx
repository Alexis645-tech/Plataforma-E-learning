import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import {
  Users,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  UserPlus,
  Search,
  Trash2,
  Edit2,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  FileCheck,
  Check,
  AlertTriangle,
  X
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    users,
    createUser,
    deleteUser,
    updateUser,
    courses,
    submissions,
    activeTab,
    setActiveTab,
    currentUser
  } = useApp();

  // Active sub-view for Administrator: 'all' | 'users' | 'courses'
  const [adminView, setAdminView] = useState<'all' | 'users' | 'courses'>(() => {
    if (activeTab === 'users') return 'users';
    if (activeTab === 'courses') return 'courses';
    return 'all';
  });

  // Keep adminView in sync with activeTab changes (from notifications or sidebar)
  useEffect(() => {
    if (activeTab === 'users') {
      setAdminView('users');
    } else if (activeTab === 'courses') {
      setAdminView('courses');
    } else if (activeTab === 'dashboard') {
      setAdminView('all');
    }
  }, [activeTab]);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // User deletion modal state
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // User editing modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('student');
  const [editDepartment, setEditDepartment] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  // In-dashboard notification banner
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  // Create user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'teacher' | 'student'>('student');
  const [newDepartment, setNewDepartment] = useState('');
  const [newBio, setNewBio] = useState('');

  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalTeachers = users.filter((u) => u.role === 'teacher').length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;
  const totalCourses = courses.length;
  const gradedSubmissions = submissions.filter((s) => s.status === 'graded').length;

  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditDepartment(user.department || '');
    setEditBio(user.bio || '');
    setEditAvatar(user.avatar || '');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editName.trim() || !editEmail.trim()) return;

    updateUser(editingUser.id, {
      name: editName.trim(),
      email: editEmail.trim(),
      role: editRole,
      department: editDepartment.trim() || undefined,
      bio: editBio.trim() || undefined,
      avatar: editAvatar.trim() || editingUser.avatar
    });

    setFeedbackMessage({
      text: `Usuario "${editName.trim()}" actualizado con éxito.`,
      type: 'success'
    });
    setEditingUser(null);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    const name = userToDelete.name;
    deleteUser(userToDelete.id);
    setUserToDelete(null);
    setFeedbackMessage({
      text: `Usuario "${name}" eliminado exitosamente de la plataforma.`,
      type: 'success'
    });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    createUser({
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      department: newDepartment.trim() || undefined,
      bio: newBio.trim() || (newRole === 'teacher' ? 'Docente en EduSphere LMS' : 'Estudiante activo en EduSphere LMS'),
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 500)}?w=150&auto=format&fit=crop&q=80`
    });

    // Reset form
    setNewName('');
    setNewEmail('');
    setNewRole('student');
    setNewDepartment('');
    setNewBio('');
    setIsCreateModalOpen(false);

    setFeedbackMessage({
      text: `Usuario "${newName.trim()}" creado exitosamente.`,
      type: 'success'
    });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* In-dashboard feedback notification */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-medium animate-in fade-in duration-150 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="p-1 hover:opacity-75 rounded"
            aria-label="Cerrar notificación"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Panel de Control Institucional
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestión centralizada de usuarios, supervisión de oferta académica y métricas operativas.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-600/30 transition-colors whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          Crear Nuevo Usuario
        </button>
      </div>

      {/* Admin Quick View Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => {
            setAdminView('all');
            setActiveTab('dashboard');
          }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            adminView === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Panel General (KPIs y Resumen)
        </button>

        <button
          onClick={() => {
            setAdminView('users');
            setActiveTab('users');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            adminView === 'users'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Gestión de Usuarios ({users.length})
        </button>

        <button
          onClick={() => {
            setAdminView('courses');
            setActiveTab('courses');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            adminView === 'courses'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Directorio de Cursos ({courses.length})
        </button>
      </div>

      {adminView === 'users' && (
        <div className="p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between gap-3 text-xs text-indigo-900 dark:text-indigo-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Mostrando la sección <strong>Gestión y Directorio de Usuarios</strong>. Puedes crear nuevos usuarios, editar roles y administrar cuentas.</span>
          </div>
          <button
            onClick={() => {
              setAdminView('all');
              setActiveTab('dashboard');
            }}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
          >
            Ver panel general
          </button>
        </div>
      )}

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Estudiantes</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {totalStudents}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-emerald-600 font-medium">Activos</span> en la plataforma
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Docentes</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {totalTeachers}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Responsables de contenido
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Cursos Publicados</span>
            <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {totalCourses}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Con módulos y material activo
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tareas Calificadas</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {gradedSubmissions} / {submissions.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Tasa de revisión: {submissions.length > 0 ? Math.round((gradedSubmissions / submissions.length) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* User Management Section (Administrator privilege) */}
      {(adminView === 'all' || adminView === 'users') && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden" id="admin-users">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Directorio y Gestión de Usuarios
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Privilegio exclusivo de Administrador: Creación, asignación de roles, edición y control de acceso.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  roleFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Todos ({users.length})
              </button>
              <button
                onClick={() => setRoleFilter('teacher')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  roleFilter === 'teacher'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Docentes ({totalTeachers})
              </button>
              <button
                onClick={() => setRoleFilter('student')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  roleFilter === 'student'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Estudiantes ({totalStudents})
              </button>
              <button
                onClick={() => setRoleFilter('admin')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  roleFilter === 'admin'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Admins ({totalAdmins})
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Usuario</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Departamento / Carrera</th>
                <th className="px-4 py-3">Fecha de Alta</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((user) => {
                const isCurrentUser = user.id === currentUser?.id;
                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900 dark:text-white">{user.name}</span>
                            {isCurrentUser && (
                              <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-medium">
                                Tú
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          user.role === 'admin'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                            : user.role === 'teacher'
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                        }`}
                      >
                        {user.role === 'admin' ? 'Administrador' : user.role === 'teacher' ? 'Docente' : 'Estudiante'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                      {user.department || 'General'}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500">
                      {user.createdAt}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Switch role toggle for teachers/students */}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => {
                              const newR = user.role === 'teacher' ? 'student' : 'teacher';
                              updateUser(user.id, { role: newR });
                              setFeedbackMessage({
                                text: `Rol de ${user.name} cambiado a ${newR === 'teacher' ? 'Docente' : 'Estudiante'}.`,
                                type: 'success'
                              });
                              setTimeout(() => setFeedbackMessage(null), 3000);
                            }}
                            className="px-2 py-1 text-[10px] font-medium rounded text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 transition-colors"
                            title="Alternar rol Docente / Estudiante"
                          >
                            Hacer {user.role === 'teacher' ? 'Estudiante' : 'Docente'}
                          </button>
                        )}

                        {/* Edit User Button */}
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                          title={`Editar datos de ${user.name}`}
                          aria-label={`Editar usuario ${user.name}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete User Button */}
                        {isCurrentUser ? (
                          <span
                            className="p-1.5 text-slate-300 dark:text-slate-600 cursor-not-allowed inline-flex"
                            title="No puedes eliminar tu propia cuenta activa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <button
                            onClick={() => setUserToDelete(user)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                            title={`Eliminar usuario ${user.name}`}
                            aria-label={`Eliminar usuario ${user.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Courses Overview Section */}
      {(adminView === 'all' || adminView === 'courses') && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs" id="admin-courses">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Cursos Activos en la Institución
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Supervisión de contenido didáctico desarrollado por la planta docente.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courses.map((course) => {
            const teacher = users.find((u) => u.id === course.teacherId);
            return (
              <div
                key={course.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between"
              >
                <div>
                  <div className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                    {course.category} · {course.level}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {course.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <img
                      src={teacher?.avatar}
                      alt={teacher?.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="truncate max-w-[120px] text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      {teacher?.name}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-600 font-semibold">
                    {course.enrolledStudents.length} inscritos
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* Modal: Create User (Exclusivo Administrador) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Crear Nuevo Usuario
                </h3>
                <p className="text-xs text-slate-400">
                  Solo el administrador tiene autorización para dar de alta usuarios.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Lic. Andrés Palacios"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico Institucional *
                </label>
                <input
                  type="email"
                  required
                  placeholder="usuario@edusphere.edu"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rol Asignado *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRole('student')}
                    className={`p-2.5 rounded-lg border text-left transition-colors ${
                      newRole === 'student'
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-semibold">Estudiante</div>
                    <div className="text-[10px] opacity-80">Clases y tareas</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewRole('teacher')}
                    className={`p-2.5 rounded-lg border text-left transition-colors ${
                      newRole === 'teacher'
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-semibold">Docente</div>
                    <div className="text-[10px] opacity-80">Cursos y notas</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewRole('admin')}
                    className={`p-2.5 rounded-lg border text-left transition-colors ${
                      newRole === 'admin'
                        ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-semibold">Administrador</div>
                    <div className="text-[10px] opacity-80">Gestión global</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Departamento o Carrera
                </label>
                <input
                  type="text"
                  placeholder="Ej: Ingeniería de Sistemas / Diseño"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Biografía / Perfil
                </label>
                <textarea
                  rows={2}
                  placeholder="Breve descripción del usuario..."
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Registrar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Editar Usuario
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Modifica los datos personales, rol y departamento de este usuario.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold p-1"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico Institucional *
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rol Asignado *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditRole('student')}
                    className={`p-2.5 rounded-lg border text-left transition-colors ${
                      editRole === 'student'
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-semibold text-xs">Estudiante</div>
                    <div className="text-[10px] opacity-80">Clases y tareas</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditRole('teacher')}
                    className={`p-2.5 rounded-lg border text-left transition-colors ${
                      editRole === 'teacher'
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-semibold text-xs">Docente</div>
                    <div className="text-[10px] opacity-80">Cursos y notas</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditRole('admin')}
                    className={`p-2.5 rounded-lg border text-left transition-colors ${
                      editRole === 'admin'
                        ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-semibold text-xs">Administrador</div>
                    <div className="text-[10px] opacity-80">Gestión global</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Departamento o Carrera
                </label>
                <input
                  type="text"
                  placeholder="Ej: Ingeniería de Sistemas, Diseño, Idiomas"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Biografía / Perfil
                </label>
                <textarea
                  rows={2}
                  placeholder="Breve descripción profesional o académica..."
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Foto de Perfil (Avatar)
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={editAvatar || editingUser.avatar}
                    alt={editName}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="https://..."
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const rand = 1534528741775 + Math.floor(Math.random() * 800);
                      setEditAvatar(`https://images.unsplash.com/photo-${rand}?w=150&auto=format&fit=crop&q=80`);
                    }}
                    className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
                  >
                    Cambiar foto
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  ¿Eliminar usuario del sistema?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Esta acción eliminará de forma permanente al usuario y revocará todos sus accesos.
                </p>
              </div>
            </div>

            {/* User summary card */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
              <img
                src={userToDelete.avatar}
                alt={userToDelete.name}
                className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                  {userToDelete.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {userToDelete.email}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase tracking-wider ${
                      userToDelete.role === 'admin'
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                        : userToDelete.role === 'teacher'
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    }`}
                  >
                    {userToDelete.role === 'admin' ? 'Administrador' : userToDelete.role === 'teacher' ? 'Docente' : 'Estudiante'}
                  </span>
                  {userToDelete.department && (
                    <span className="text-[10px] text-slate-400 truncate">
                      · {userToDelete.department}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Sí, Eliminar Usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
