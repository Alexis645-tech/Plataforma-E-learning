import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole, Course } from '../../types';
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
  X,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Plus,
  Key,
  FolderPlus,
  Database,
  ShieldCheck
} from 'lucide-react';
import { MongoDatabaseModal } from './MongoDatabaseModal';
import { isBcryptHash } from '../../utils/security';

export const AdminDashboard: React.FC = () => {
  const {
    users,
    createUser,
    deleteUser,
    updateUser,
    courses,
    createCourse,
    updateCourse,
    deleteCourse,
    createModule,
    submissions,
    activeTab,
    setActiveTab,
    currentUser,
    dbStatus,
    isMongoConnected
  } = useApp();

  const [isMongoModalOpen, setIsMongoModalOpen] = useState(false);

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
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);

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
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Password visibility toggle per user in the table
  const [visiblePasswordUserIds, setVisiblePasswordUserIds] = useState<string[]>([]);

  // Course Management states
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState('Programación');
  const [newCourseLevel, setNewCourseLevel] = useState<'Principiante' | 'Intermedio' | 'Avanzado'>('Intermedio');
  const [newCourseTeacherId, setNewCourseTeacherId] = useState('');

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editCourseTitle, setEditCourseTitle] = useState('');
  const [editCourseDescription, setEditCourseDescription] = useState('');
  const [editCourseCategory, setEditCourseCategory] = useState('');
  const [editCourseLevel, setEditCourseLevel] = useState<'Principiante' | 'Intermedio' | 'Avanzado'>('Principiante');
  const [editCourseTeacherId, setEditCourseTeacherId] = useState('');

  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

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

  const generateDefaultPassword = (role: UserRole) => {
    return role === 'admin'
      ? 'AdminEdu2026!'
      : role === 'teacher'
      ? 'DocenteEdu2026!'
      : 'EstudianteEdu2026!';
  };

  const generateSecureRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res + '!';
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswordUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const copyCredentials = (user: User) => {
    const pass = user.password || generateDefaultPassword(user.role);
    const textToCopy = `Alexis Castro Academy LMS\nUsuario: ${user.name}\nCorreo: ${user.email}\nContraseña: ${pass}\nRol: ${user.role}`;
    navigator.clipboard.writeText(textToCopy);
    setFeedbackMessage({
      text: `Credenciales de "${user.name}" copiadas al portapapeles.`,
      type: 'success'
    });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditDepartment(user.department || '');
    setEditBio(user.bio || '');
    setEditAvatar(user.avatar || '');
    setEditPassword(user.password || generateDefaultPassword(user.role));
    setShowEditPassword(false);
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
      avatar: editAvatar.trim() || editingUser.avatar,
      password: editPassword.trim() || undefined
    });

    setFeedbackMessage({
      text: `Usuario "${editName.trim()}" y credenciales actualizados con éxito.`,
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

    const assignedPassword = newPassword.trim() || generateDefaultPassword(newRole);

    createUser({
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      password: assignedPassword,
      department: newDepartment.trim() || undefined,
      bio: newBio.trim() || (newRole === 'teacher' ? 'Docente en Alexis Castro Academy' : 'Estudiante activo en Alexis Castro Academy'),
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 500)}?w=150&auto=format&fit=crop&q=80`
    });

    // Reset form
    setNewName('');
    setNewEmail('');
    setNewRole('student');
    setNewDepartment('');
    setNewBio('');
    setNewPassword('');
    setShowNewPassword(false);
    setIsCreateModalOpen(false);

    setFeedbackMessage({
      text: `Usuario "${newName.trim()}" creado exitosamente con contraseña "${assignedPassword}".`,
      type: 'success'
    });
    setTimeout(() => setFeedbackMessage(null), 4500);
  };

  // Course handlers
  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    setEditCourseTitle(course.title);
    setEditCourseDescription(course.description);
    setEditCourseCategory(course.category);
    setEditCourseLevel(course.level);
    setEditCourseTeacherId(course.teacherId);
  };

  const handleEditCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !editCourseTitle.trim()) return;

    updateCourse(editingCourse.id, {
      title: editCourseTitle.trim(),
      description: editCourseDescription.trim(),
      category: editCourseCategory,
      level: editCourseLevel,
      teacherId: editCourseTeacherId
    });

    setEditingCourse(null);
    setFeedbackMessage({
      text: `Curso "${editCourseTitle.trim()}" actualizado correctamente.`,
      type: 'success'
    });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleCreateCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;

    const teacherToAssign =
      newCourseTeacherId ||
      users.find((u) => u.role === 'teacher')?.id ||
      currentUser.id;

    const newC = createCourse({
      title: newCourseTitle.trim(),
      description: newCourseDescription.trim() || 'Curso de especialización académica en Alexis Castro Academy.',
      category: newCourseCategory,
      level: newCourseLevel,
      teacherId: teacherToAssign,
      published: true,
      bannerGradient: 'from-indigo-600 via-indigo-700 to-slate-900',
      bannerIcon: 'BookOpen'
    });

    createModule(newC.id, 'Módulo 1: Introducción y Fundamentos', 'Bienvenida al curso y conceptos iniciales.');

    setNewCourseTitle('');
    setNewCourseDescription('');
    setNewCourseCategory('Programación');
    setNewCourseLevel('Intermedio');
    setNewCourseTeacherId('');
    setIsCreateCourseModalOpen(false);

    setFeedbackMessage({
      text: `Curso "${newC.title}" creado exitosamente y asignado a su docente.`,
      type: 'success'
    });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleConfirmDeleteCourse = () => {
    if (!courseToDelete) return;
    const title = courseToDelete.title;
    deleteCourse(courseToDelete.id);
    setCourseToDelete(null);
    setFeedbackMessage({
      text: `Curso "${title}" eliminado de la plataforma.`,
      type: 'success'
    });
    setTimeout(() => setFeedbackMessage(null), 3500);
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsMongoModalOpen(true)}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shadow-xs ${
              isMongoConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50'
            }`}
            title="Conexión y sincronización con base de datos MongoDB"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isMongoConnected ? 'MongoDB Conectado' : 'MongoDB (Configurar)'}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isMongoConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
          </button>
          <button
            onClick={() => setIsCreateCourseModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow-xs border border-slate-700 dark:border-slate-700 transition-colors whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Crear Curso
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-600/30 transition-colors whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            Crear Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Admin Quick View Navigation Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
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

      {/* Primary KPI Metrics - Responsive 2x2 on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Total Estudiantes</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 shrink-0">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {totalStudents}
          </div>
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-slate-400 truncate">
            <span className="text-emerald-600 font-medium">Activos</span> en campus
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Total Docentes</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 shrink-0">
              <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {totalTeachers}
          </div>
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-slate-400 truncate">
            Profesores activos
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Cursos Publicados</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-600 shrink-0">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {totalCourses}
          </div>
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-slate-400 truncate">
            Módulos activos
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Tareas Calificadas</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 shrink-0">
              <FileCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums truncate">
            {gradedSubmissions} / {submissions.length}
          </div>
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-slate-400 truncate">
            Revisión: {submissions.length > 0 ? Math.round((gradedSubmissions / submissions.length) * 100) : 0}%
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
                <th className="px-4 py-3">Credenciales</th>
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
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 select-all max-w-[160px] truncate" title={user.password}>
                            {visiblePasswordUserIds.includes(user.id)
                              ? user.password || generateDefaultPassword(user.role)
                              : '••••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(user.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
                            title={visiblePasswordUserIds.includes(user.id) ? 'Ocultar contraseña' : 'Ver contraseña'}
                            aria-label="Alternar visibilidad de contraseña"
                          >
                            {visiblePasswordUserIds.includes(user.id) ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyCredentials(user)}
                            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"
                            title="Copiar credenciales completas"
                            aria-label="Copiar credenciales completas"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          {isBcryptHash(user.password) ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-900/40">
                              <ShieldCheck className="w-3 h-3 text-emerald-500" />
                              <span>bcrypt hash</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.2 rounded border border-indigo-200 dark:border-indigo-900/40">
                              <Lock className="w-3 h-3 text-indigo-500" />
                              <span>protegida</span>
                            </span>
                          )}
                        </div>
                      </div>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Cursos Activos en la Institución ({courses.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supervisión, edición y creación directa de la oferta académica de Alexis Castro Academy.
              </p>
            </div>
            <button
              onClick={() => setIsCreateCourseModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              Crear Nuevo Curso
            </button>
          </div>

          {courses.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
              <BookOpen className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No hay cursos registrados en el sistema.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 mb-3">
                Crea el primer curso para comenzar a estructurar el plan de estudios.
              </p>
              <button
                onClick={() => setIsCreateCourseModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Crear Primer Curso
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => {
                const teacher = users.find((u) => u.id === course.teacherId);
                return (
                  <div
                    key={course.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                          {course.category} · {course.level}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCourse(course)}
                            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded transition-colors"
                            title="Editar curso"
                            aria-label={`Editar curso ${course.title}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCourseToDelete(course)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                            title="Eliminar curso"
                            aria-label={`Eliminar curso ${course.title}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
                          src={teacher?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={teacher?.name || 'Docente'}
                          referrerPolicy="no-referrer"
                          className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <span className="truncate max-w-[120px] text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          {teacher?.name || 'Docente Asignado'}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        {(course.enrolledStudents || []).length} inscritos
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                  placeholder="usuario@alexiscastroacademy.vercel.app"
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

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Contraseña de Acceso Institucional *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const generated = generateSecureRandomPassword();
                      setNewPassword(generated);
                      setShowNewPassword(true);
                    }}
                    className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Key className="w-3 h-3" />
                    Generar segura
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder={`Por defecto: ${generateDefaultPassword(newRole)}`}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    title={showNewPassword ? 'Ocultar' : 'Ver'}
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                  Si la dejas vacía, se asignará automáticamente{' '}
                  <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                    {generateDefaultPassword(newRole)}
                  </span>
                  .
                </p>
                <div className="mt-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-[10px] text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span>
                    <strong>Seguridad activa:</strong> La contraseña se encriptará con hash criptográfico <strong>bcrypt</strong> (salt rounds = 10) antes de guardarse en MongoDB.
                  </span>
                </div>
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

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Contraseña / Restablecer Contraseña Institucional *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const generated = generateSecureRandomPassword();
                      setEditPassword(generated);
                      setShowEditPassword(true);
                    }}
                    className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Key className="w-3 h-3" />
                    Generar nueva
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    required
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    title={showEditPassword ? 'Ocultar' : 'Ver'}
                  >
                    {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                  Puedes conservar la contraseña actual o ingresar una nueva para que el usuario pueda iniciar sesión inmediatamente.
                </p>
                <div className="mt-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-[10px] text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span>
                    La contraseña actualizada se encriptará con <strong>bcrypt</strong> al guardar.
                  </span>
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

      {/* Modal: Create Course (Administrador) */}
      {isCreateCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Crear Nuevo Curso Institucional
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Añade un nuevo curso al catálogo académico y asígnalo al docente correspondiente.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateCourseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold p-1"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourseSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Título del Curso *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Fundamentos de Ciberseguridad y Redes"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción del Curso *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe los objetivos formativos, contenidos clave y competencias..."
                  value={newCourseDescription}
                  onChange={(e) => setNewCourseDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Categoría Académica *
                  </label>
                  <select
                    value={newCourseCategory}
                    onChange={(e) => setNewCourseCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Programación">Programación</option>
                    <option value="Inteligencia Artificial">Inteligencia Artificial</option>
                    <option value="Diseño Digital">Diseño Digital</option>
                    <option value="Ciberseguridad">Ciberseguridad</option>
                    <option value="Negocios y Gestión">Negocios y Gestión</option>
                    <option value="Ciencias Básicas">Ciencias Básicas</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nivel *
                  </label>
                  <select
                    value={newCourseLevel}
                    onChange={(e) => setNewCourseLevel(e.target.value as 'Principiante' | 'Intermedio' | 'Avanzado')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Docente Titular Asignado *
                </label>
                <select
                  value={newCourseTeacherId}
                  onChange={(e) => setNewCourseTeacherId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- Seleccionar Docente --</option>
                  {users
                    .filter((u) => u.role === 'teacher' || u.role === 'admin')
                    .map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} ({teacher.role === 'admin' ? 'Administrador' : 'Docente'} - {teacher.email})
                      </option>
                    ))}
                </select>
                <p className="mt-1 text-[10px] text-slate-400">
                  El docente seleccionado tendrá acceso inmediato para gestionar módulos, lecciones y tareas.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateCourseModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Crear Curso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Course (Administrador) */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Editar Curso Institucional
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Modifica los datos del curso y el docente asignado.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingCourse(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold p-1"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditCourseSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Título del Curso *
                </label>
                <input
                  type="text"
                  required
                  value={editCourseTitle}
                  onChange={(e) => setEditCourseTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción del Curso *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editCourseDescription}
                  onChange={(e) => setEditCourseDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Categoría Académica *
                  </label>
                  <select
                    value={editCourseCategory}
                    onChange={(e) => setEditCourseCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Programación">Programación</option>
                    <option value="Inteligencia Artificial">Inteligencia Artificial</option>
                    <option value="Diseño Digital">Diseño Digital</option>
                    <option value="Ciberseguridad">Ciberseguridad</option>
                    <option value="Negocios y Gestión">Negocios y Gestión</option>
                    <option value="Ciencias Básicas">Ciencias Básicas</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nivel *
                  </label>
                  <select
                    value={editCourseLevel}
                    onChange={(e) => setEditCourseLevel(e.target.value as 'Principiante' | 'Intermedio' | 'Avanzado')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Docente Titular Asignado *
                </label>
                <select
                  value={editCourseTeacherId}
                  onChange={(e) => setEditCourseTeacherId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {users
                    .filter((u) => u.role === 'teacher' || u.role === 'admin')
                    .map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} ({teacher.role === 'admin' ? 'Administrador' : 'Docente'} - {teacher.email})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Course Confirmation */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  ¿Eliminar curso del catálogo?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Se eliminará el curso <strong>&ldquo;{courseToDelete.title}&rdquo;</strong> junto con sus módulos, lecciones y tareas vinculadas.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCourse}
                className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Sí, Eliminar Curso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MongoDB Database Configuration & Sync Modal */}
      <MongoDatabaseModal
        isOpen={isMongoModalOpen}
        onClose={() => setIsMongoModalOpen(false)}
      />
    </div>
  );
};
