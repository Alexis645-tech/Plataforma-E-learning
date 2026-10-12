import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import {
  GraduationCap,
  Shield,
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Sparkles,
  Users,
  ChevronRight,
  Check
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { users, login, loginAsUser, theme, toggleTheme } = useApp();

  // Selected tab for quick role access
  const [selectedRoleTab, setSelectedRoleTab] = useState<UserRole>('student');

  // Form state for manual login
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('edusphere123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filtered users by role for quick access
  const adminUsers = users.filter((u) => u.role === 'admin');
  const teacherUsers = users.filter((u) => u.role === 'teacher');
  const studentUsers = users.filter((u) => u.role === 'student');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!emailInput.trim()) {
      setErrorMessage('Por favor ingresa tu correo institucional.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = login(emailInput.trim(), passwordInput);
      setIsLoading(false);
      if (!result.success && result.error) {
        setErrorMessage(result.error);
      }
    }, 250);
  };

  const handleQuickLogin = (user: User) => {
    setIsLoading(true);
    setTimeout(() => {
      loginAsUser(user);
      setIsLoading(false);
    }, 150);
  };

  const selectUserIntoForm = (user: User) => {
    setEmailInput(user.email);
    setPasswordInput('edusphere123');
    setSelectedRoleTab(user.role);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Top Bar with Brand & Theme Toggle */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent flex items-center gap-2">
              EduSphere LMS
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Portal Institucional
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Campus Virtual de Aprendizaje Digital y Gestión Académica
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            aria-label="Alternar tema visual"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl space-y-6">
          {/* Welcome Header Banner */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Acceso Seguro para la Comunidad Universitaria
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Iniciar Sesión en el Campus Virtual
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Ingresa con tus credenciales institucionales o selecciona tu rol correspondiente para acceder a tu entorno de trabajo.
            </p>
          </div>

          {/* Quick Role Selection Tabs & Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* Administrator Card */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                selectedRoleTab === 'admin'
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800 ring-2 ring-rose-500/20 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    Control Total
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Rol Administrador
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                  Supervisión institucional, creación y edición de usuarios, control de roles y catálogo general.
                </p>

                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Cuentas de Administrador:
                  </div>
                  {adminUsers.map((admin) => (
                    <div
                      key={admin.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={admin.avatar}
                          alt={admin.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {admin.name}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {admin.email}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleQuickLogin(admin)}
                        disabled={isLoading}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1 shadow-2xs"
                        title="Ingresar directamente con este usuario"
                      >
                        Ingresar
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (adminUsers[0]) selectUserIntoForm(adminUsers[0]);
                }}
                className="mt-4 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                Cargar credenciales en el formulario →
              </button>
            </div>

            {/* Teacher Card */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                selectedRoleTab === 'teacher'
                  ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Planta Docente
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Rol Docente / Profesor
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                  Creación de lecciones, tareas integradas en clases, diseño de exámenes y libro de calificaciones.
                </p>

                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Docentes Disponibles:
                  </div>
                  {teacherUsers.slice(0, 2).map((teacher) => (
                    <div
                      key={teacher.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={teacher.avatar}
                          alt={teacher.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {teacher.name}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {teacher.department || teacher.email}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleQuickLogin(teacher)}
                        disabled={isLoading}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1 shadow-2xs"
                        title="Ingresar directamente con este docente"
                      >
                        Ingresar
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (teacherUsers[0]) selectUserIntoForm(teacherUsers[0]);
                }}
                className="mt-4 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Cargar docente en el formulario →
              </button>
            </div>

            {/* Student Card */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                selectedRoleTab === 'student'
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Alumno Regular
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Rol Estudiante / Alumno
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                  Aula virtual, lecciones en video, tareas y exámenes integrados por cada clase y calificaciones.
                </p>

                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Estudiantes Disponibles:
                  </div>
                  {studentUsers.slice(0, 2).map((student) => (
                    <div
                      key={student.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {student.name}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {student.email}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleQuickLogin(student)}
                        disabled={isLoading}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1 shadow-2xs"
                        title="Ingresar directamente con este estudiante"
                      >
                        Ingresar
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (studentUsers[0]) selectUserIntoForm(studentUsers[0]);
                }}
                className="mt-4 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                Cargar estudiante en el formulario →
              </button>
            </div>
          </div>

          {/* Traditional Login Form Box */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
            <div className="max-w-xl mx-auto space-y-5">
              <div className="text-center space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Ingreso Manual con Credenciales
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ingresa con cualquier correo institucional registrado en la base de datos de EduSphere.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleManualSubmit} className="space-y-4">
                {/* Email field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Correo Electrónico Institucional *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="usuario@edusphere.edu"
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        setErrorMessage(null);
                      }}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Contraseña *
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Demo por defecto: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">edusphere123</code>
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember me and helper */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Recordar mi sesión en este dispositivo</span>
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isLoading ? (
                    <span>Verificando credenciales...</span>
                  ) : (
                    <>
                      <span>Iniciar Sesión en EduSphere</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Preloaded accounts helper dropdown */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  O autocompleta el formulario con una cuenta de prueba:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => selectUserIntoForm(u)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                        emailInput === u.email
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {u.name} ({u.role === 'admin' ? 'Admin' : u.role === 'teacher' ? 'Docente' : 'Estudiante'})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-200/80 dark:border-slate-800/80">
        EduSphere LMS v1.2 · Plataforma Institucional de Aprendizaje · Conforme a WCAG AA
      </footer>
    </div>
  );
};
