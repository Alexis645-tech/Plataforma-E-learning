import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  UploadCloud,
  Layers,
  Users,
  BookOpen,
  Award,
  Key,
  Lock,
  Shield,
  FileCheck,
  ShieldCheck,
  GitBranch,
  AlertCircle,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';

interface MongoDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MongoDatabaseModal: React.FC<MongoDatabaseModalProps> = ({ isOpen, onClose }) => {
  const {
    dbStatus,
    refreshDbStatus,
    users,
    courses,
    modules,
    quizzes,
    assignments,
    submissions,
    quizAttempts,
    progress,
    notifications,
    chatMessages,
    reloadFromBackend,
    rehashAllUserPasswords
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);
  const [isRehashing, setIsRehashing] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    setSyncMessage(null);
    try {
      const res = await apiService.retryConnection();
      await refreshDbStatus();
      if (res.success) {
        setSyncMessage({
          type: 'success',
          text: '¡Conexión establecida exitosamente con MongoDB Atlas!',
        });
      } else {
        setSyncMessage({
          type: 'error',
          text: res.message || 'Error al conectar con MongoDB Atlas.',
        });
      }
    } catch (e: any) {
      setSyncMessage({
        type: 'error',
        text: e.message || 'Error al intentar conectar.',
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const handleSyncToMongo = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await apiService.syncAllToMongo({
        users,
        courses,
        modules,
        quizzes,
        assignments,
        submissions,
        quizAttempts,
        progress,
        notifications,
        chatMessages,
      });

      if (res.success) {
        setSyncMessage({
          type: 'success',
          text: res.message || 'Datos y contraseñas (hasheadas con bcrypt) sincronizados exitosamente con MongoDB.',
        });
        await refreshDbStatus();
      } else {
        setSyncMessage({
          type: 'error',
          text: res.message || 'Error al sincronizar con MongoDB.',
        });
      }
    } catch (e: any) {
      setSyncMessage({
        type: 'error',
        text: e.message || 'Error de conexión al sincronizar.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const executeSeedDatabase = async () => {
    setIsSeeding(true);
    setSyncMessage(null);
    try {
      const res = await apiService.seedDatabase(false);
      if (res.success) {
        setSyncMessage({ type: 'success', text: res.message });
        await reloadFromBackend();
        await refreshDbStatus();
      } else {
        setSyncMessage({ type: 'error', text: res.message });
      }
    } catch (e: any) {
      setSyncMessage({ type: 'error', text: e.message || 'Error al sembrar datos en MongoDB.' });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleRehashPasswords = async () => {
    setIsRehashing(true);
    setSyncMessage(null);
    try {
      const res = await rehashAllUserPasswords();
      setSyncMessage({
        type: 'success',
        text: res.message || 'Contraseñas verificadas y aseguradas con bcrypt (Blowfish, salt rounds = 10).',
      });
    } catch (e: any) {
      setSyncMessage({
        type: 'error',
        text: e.message || 'Error al auditar y cifrar contraseñas.',
      });
    } finally {
      setIsRehashing(false);
    }
  };

  const isConnected = dbStatus?.isConnected;
  const security = dbStatus?.security;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">Base de Datos MongoDB & Seguridad</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/25 text-white border border-white/30">
                  Bcrypt Activo
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                Gestión persistente de usuarios, contraseñas hasheadas y blindaje de credenciales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200 text-sm">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-4 ${
              isConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                : dbStatus?.isConfigured
                ? 'bg-sky-50 dark:bg-sky-950/30 border-sky-300 dark:border-sky-800'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
            }`}
          >
            <div
              className={`p-2 rounded-lg mt-0.5 ${
                isConnected
                  ? 'bg-emerald-500 text-white'
                  : dbStatus?.isConfigured
                  ? 'bg-sky-500 text-white'
                  : 'bg-amber-500 text-white'
              }`}
            >
              {isConnected ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : dbStatus?.isConfigured ? (
                <RefreshCw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-base">
                  {isConnected
                    ? 'MongoDB Atlas Conectado y Activo'
                    : dbStatus?.isConfigured
                    ? 'Variable MONGODB_URI Detectada (Conexión Pendiente)'
                    : 'Modo Local (MONGODB_URI no detectada en Vercel)'}
                </h4>
                <div className="flex items-center gap-2">
                  {!isConnected && dbStatus?.isConfigured && (
                    <button
                      onClick={handleRetryConnection}
                      disabled={isRetrying}
                      className="flex items-center gap-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 font-medium px-2.5 py-1 rounded shadow-xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                      {isRetrying ? 'Conectando...' : 'Reconectar'}
                    </button>
                  )}
                  <button
                    onClick={refreshDbStatus}
                    title="Actualizar estado"
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium px-2 py-1 bg-white/60 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Actualizar
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {isConnected
                  ? `Conectado exitosamente a la base de datos "${dbStatus?.dbName || 'edusphere'}". Todos los cambios se guardan permanentemente en tu cluster de Atlas.`
                  : dbStatus?.isConfigured
                  ? `Variable "${dbStatus.envVarDetected || 'MONGODB_URI'}" detectada en el servidor (${dbStatus.uriLength || 0} caracteres). La base de datos está intentando la conexión con MongoDB Atlas.`
                  : 'La variable de entorno MONGODB_URI no fue encontrada en Vercel. Ve a Vercel > Settings > Environment Variables, agrégala y haz clic en "Redeploy".'}
              </p>
              {dbStatus?.maskedUri && (
                <div className="mt-2 text-xs font-mono bg-black/5 dark:bg-black/30 px-2.5 py-1 rounded inline-block text-slate-700 dark:text-slate-300">
                  Cadena: {dbStatus.maskedUri}
                </div>
              )}
            </div>
          </div>

          {/* MongoDB Atlas IP Whitelist Warning / Guidance */}
          {!isConnected && dbStatus?.connectionDiagnosis && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Paso Requerido en tu panel de MongoDB Atlas (Network Access):</span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                {dbStatus.connectionDiagnosis}
              </p>
              <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/60 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-white">Instrucciones rápidas en MongoDB Atlas:</div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>En tu clúster de Atlas, ve a <strong>Security &rarr; Network Access</strong>.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Haz clic en el botón verde <strong>"Add IP Address"</strong>.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>Haz clic en <strong>"ALLOW ACCESS FROM ANYWHERE"</strong> (agrega <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">0.0.0.0/0</code>) y confirma.</span>
                </div>
              </div>
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                  Una vez guardado en Atlas (tarda ~15 seg):
                </span>
                <button
                  onClick={handleRetryConnection}
                  disabled={isRetrying}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                  {isRetrying ? 'Conectando...' : 'Reconectar Ahora'}
                </button>
              </div>
            </div>
          )}

          {/* Sync Message Alert */}
          {syncMessage && (
            <div
              className={`p-3 rounded-lg text-xs font-medium border flex items-center gap-2 ${
                syncMessage.type === 'success'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800'
                  : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200 dark:border-red-800'
              }`}
            >
              <FileCheck className="w-4 h-4 shrink-0" />
              <span>{syncMessage.text}</span>
            </div>
          )}

          {/* Security & Bcrypt Card */}
          <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Seguridad de Contraseñas: Cifrado con Bcrypt
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                10 Salt Rounds
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Las credenciales de los usuarios se procesan mediante la función criptográfica <strong>bcrypt</strong> (Blowfish Cipher).
              En MongoDB <strong>nunca se almacenan contraseñas en texto plano</strong>, sino hashes irreversibles protegidos contra ataques de fuerza bruta y diccionarios con sal aleatoria.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-[11px] text-slate-800 dark:text-slate-200">Algoritmo de Hash</div>
                  <div className="text-[10px] text-slate-500">bcrypt ($2a$ / $2b$)</div>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div>
                  <div className="font-semibold text-[11px] text-slate-800 dark:text-slate-200">Protección Git / GitHub</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">.env blindado en .gitignore</div>
                </div>
              </div>
            </div>
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Usuarios con contraseña protegida:{' '}
                <strong className="text-slate-800 dark:text-slate-200 font-mono">
                  {security?.hashedUsersCount ?? users.length} / {users.length}
                </strong>
              </span>
              <button
                onClick={handleRehashPasswords}
                disabled={isRehashing}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Key className="w-3.5 h-3.5" />
                {isRehashing ? 'Cifrando...' : 'Auditar y Re-hashear Contraseñas'}
              </button>
            </div>
          </div>

          {/* Metrics / Document Counts */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              Colecciones y Documentos Almacenados
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <Users className="w-5 h-5 text-indigo-500 shrink-0" />
                <div>
                  <div className="text-lg font-bold">{users.length}</div>
                  <div className="text-xs text-slate-500">Usuarios</div>
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-blue-500 shrink-0" />
                <div>
                  <div className="text-lg font-bold">{courses.length}</div>
                  <div className="text-xs text-slate-500">Cursos</div>
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <Award className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <div className="text-lg font-bold">{progress.length}</div>
                  <div className="text-xs text-slate-500">Progresos</div>
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-purple-500 shrink-0" />
                <div>
                  <div className="text-lg font-bold">{quizzes.length + assignments.length}</div>
                  <div className="text-xs text-slate-500">Actividades</div>
                </div>
              </div>
            </div>
          </div>

          {/* Vercel & .gitignore Security Configuration Guide */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-500" />
              Seguridad en Producción (Vercel & Git)
            </h4>
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
              <Shield className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                <strong>Regla de Oro de Seguridad:</strong> El archivo <code>.env</code> está excluido en el <code>.gitignore</code>. <strong>Nunca subas contraseñas reales a GitHub.</strong> Las contraseñas reales solo deben existir en tu computadora local y en el panel seguro de Vercel.
              </span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                Entra a tu cuenta en <span className="font-semibold text-slate-800 dark:text-slate-200">Vercel</span> y abre tu proyecto.
              </li>
              <li>
                Ve a la pestaña <span className="font-semibold text-slate-800 dark:text-slate-200">Settings &rarr; Environment Variables</span>.
              </li>
              <li>
                Crea una variable llamada <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded font-mono text-emerald-600 dark:text-emerald-400">MONGODB_URI</code>.
              </li>
              <li>
                Pega tu cadena de conexión de MongoDB Atlas, por ejemplo:
                <pre className="mt-1 p-2 bg-slate-900 text-slate-100 rounded text-[11px] overflow-x-auto font-mono">
mongodb+srv://tu_usuario:tu_contraseña@cluster0.abcde.mongodb.net/edusphere?retryWrites=true&w=majority
                </pre>
              </li>
              <li>
                Guarda y haz un <span className="font-semibold text-slate-800 dark:text-slate-200">Redeploy</span>. ¡Tus contraseñas y datos estarán 100% protegidos y persistidos!
              </li>
            </ol>
          </div>

          {/* Confirmation Box for Seeding */}
          {showSeedConfirm && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    ¿Deseas inicializar MongoDB con el catálogo completo de datos?
                  </h5>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                    Las contraseñas de todos los usuarios se crearán encriptadas con <strong>bcrypt</strong> (salt rounds = 10). Esta acción reestablecerá los datos demo en tu base de datos MongoDB.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSeedConfirm(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSeedConfirm(false);
                    executeSeedDatabase();
                  }}
                  disabled={isSeeding}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition shadow-2xs disabled:opacity-50"
                >
                  {isSeeding ? 'Inicializando...' : 'Confirmar e Inicializar'}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleSyncToMongo}
              disabled={isSyncing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition shadow-xs disabled:opacity-50"
            >
              <UploadCloud className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
              {isSyncing ? 'Sincronizando...' : 'Subir todos los datos a MongoDB'}
            </button>
            <button
              onClick={() => setShowSeedConfirm(true)}
              disabled={isSeeding}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
              Sembrar Catálogo con Bcrypt
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
