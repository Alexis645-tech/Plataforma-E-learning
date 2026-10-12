import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Shield,
  Sparkles,
  Save,
  Moon,
  Sun,
  Camera,
  Check,
  Mail,
  Building,
  RotateCcw
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
];

export const ProfileSettings: React.FC = () => {
  const { currentUser, updateUser, theme, toggleTheme, resetToDefaultData } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [bio, setBio] = useState(currentUser.bio);
  const [department, setDepartment] = useState(currentUser.department || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatar);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(currentUser.id, {
      name: name.trim(),
      email: email.trim(),
      bio: bio.trim(),
      department: department.trim() || undefined,
      avatar: selectedAvatar
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const getRoleLabel = () => {
    switch (currentUser.role) {
      case 'admin':
        return 'Administrador General';
      case 'teacher':
        return 'Docente Titular';
      case 'student':
        return 'Estudiante Regular';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-150">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Configuración y Perfil de Usuario
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Personaliza tu identidad académica, preferencias de apariencia y configuración del sistema.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card & Avatar Selector */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Foto de Perfil y Avatar
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <img
                src={selectedAvatar}
                alt={name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-500/20 shadow-md"
              />
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Selecciona un avatar predefinido:
              </span>
              <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
                {AVATAR_PRESETS.map((avUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(avUrl)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all ${
                      selectedAvatar === avUrl
                        ? 'border-indigo-600 ring-2 ring-indigo-500/50 scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={avUrl} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* General Information */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Información Académica
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Correo Electrónico *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Departamento o Facultad
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Facultad de Ingeniería / Ciencias"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rol del Sistema (Asignado por Administrador)
              </label>
              <div className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 font-semibold text-indigo-600 dark:text-indigo-400">
                {getRoleLabel()}
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Biografía / Resumen
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Appearance & Theme Settings */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Preferencia de Tema y Modo Oscuro
          </h2>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>Modo {theme === 'dark' ? 'Oscuro' : 'Claro'} Activo</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Optimiza el contraste y descanso visual según tus hábitos de estudio.
              </p>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold hover:border-indigo-500 transition-colors"
            >
              Cambiar a {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            </button>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-4">
          {savedSuccess ? (
            <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4" /> ¡Cambios guardados con éxito!
            </div>
          ) : (
            <div />
          )}

          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-600/30 flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};
