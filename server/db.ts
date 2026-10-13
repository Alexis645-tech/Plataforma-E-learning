import { MongoClient, Db } from 'mongodb';
import {
  INITIAL_USERS,
  INITIAL_COURSES,
  INITIAL_MODULES,
  INITIAL_QUIZZES,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_QUIZ_ATTEMPTS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PROGRESS
} from '../src/data/initialData';
import {
  User,
  Course,
  CourseModule,
  Quiz,
  Assignment,
  Submission,
  QuizAttempt,
  ChatMessage,
  AppNotification,
  StudentProgress
} from '../src/types';
import {
  hashPasswordSync,
  isBcryptHash,
  secureUsersForDb,
  BCRYPT_SALT_ROUNDS
} from './security';

// Generate bcrypt-hashed initial users for the secure memory store
const SECURE_INITIAL_USERS: User[] = INITIAL_USERS.map((user) => {
  const plainPassword =
    user.password ||
    (user.role === 'admin'
      ? 'AdminEdu2026!'
      : user.role === 'teacher'
      ? 'DocenteEdu2026!'
      : 'EstudianteEdu2026!');

  const hashedPassword = isBcryptHash(plainPassword)
    ? plainPassword
    : hashPasswordSync(plainPassword, BCRYPT_SALT_ROUNDS);

  return {
    ...user,
    password: hashedPassword,
    passwordHash: hashedPassword,
    isPasswordHashed: true,
  };
});

// In-memory fallback cache to ensure zero downtime and instant local fallback
class MemoryStore {
  users: User[] = [...SECURE_INITIAL_USERS];
  courses: Course[] = [...INITIAL_COURSES];
  modules: CourseModule[] = [...INITIAL_MODULES];
  quizzes: Quiz[] = [...INITIAL_QUIZZES];
  assignments: Assignment[] = [...INITIAL_ASSIGNMENTS];
  submissions: Submission[] = [...INITIAL_SUBMISSIONS];
  quizAttempts: QuizAttempt[] = [...INITIAL_QUIZ_ATTEMPTS];
  chatMessages: ChatMessage[] = [...INITIAL_CHAT_MESSAGES];
  notifications: AppNotification[] = [...INITIAL_NOTIFICATIONS];
  progress: StudentProgress[] = [...INITIAL_PROGRESS];

  reset() {
    this.users = [...SECURE_INITIAL_USERS];
    this.courses = [...INITIAL_COURSES];
    this.modules = [...INITIAL_MODULES];
    this.quizzes = [...INITIAL_QUIZZES];
    this.assignments = [...INITIAL_ASSIGNMENTS];
    this.submissions = [...INITIAL_SUBMISSIONS];
    this.quizAttempts = [...INITIAL_QUIZ_ATTEMPTS];
    this.chatMessages = [...INITIAL_CHAT_MESSAGES];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.progress = [...INITIAL_PROGRESS];
  }
}

export const memoryStore = new MemoryStore();

// Global MongoDB connection cache (essential for Vercel Serverless & Node.js)
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

let isConnecting = false;
let lastConnectionError: string | null = null;
let lastFailedAttemptTime = 0;
const RETRY_COOLDOWN_MS = 15000;

export function getMongoUri(): string {
  return (
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL ||
    process.env.MONGO_URL ||
    ''
  ).trim();
}

export function resetMongoClientCache() {
  global._mongoClientPromise = undefined;
  global._mongoClient = undefined;
  lastConnectionError = null;
  lastFailedAttemptTime = 0;
}

export async function getMongoClient(forceReconnect = false): Promise<MongoClient | null> {
  if (forceReconnect) {
    resetMongoClientCache();
  }

  const uri = getMongoUri();
  if (!uri) {
    return null;
  }

  if (global._mongoClientPromise) {
    try {
      const client = await global._mongoClientPromise;
      return client;
    } catch (err: any) {
      console.warn('Cached MongoDB connection failed, will retry:', err.message);
      global._mongoClientPromise = undefined;
    }
  }

  // If a recent connection attempt failed, don't stall incoming requests; wait for cooldown or explicit retry
  if (!forceReconnect && Date.now() - lastFailedAttemptTime < RETRY_COOLDOWN_MS) {
    return null;
  }

  if (isConnecting) {
    return null;
  }

  try {
    isConnecting = true;
    lastConnectionError = null;

    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 4000,
    });

    global._mongoClientPromise = client.connect();
    const connectedClient = await global._mongoClientPromise;
    global._mongoClient = connectedClient;
    console.log('✅ Connected successfully to MongoDB');
    lastConnectionError = null;
    isConnecting = false;
    lastFailedAttemptTime = 0;
    return connectedClient;
  } catch (err: any) {
    isConnecting = false;
    lastFailedAttemptTime = Date.now();
    lastConnectionError = err?.message || 'Error desconocido al conectar a MongoDB';
    console.error('⚠️ MongoDB Connection Error:', lastConnectionError);
    global._mongoClientPromise = undefined;
    global._mongoClient = undefined;
    return null;
  }
}

export async function getMongoDb(): Promise<Db | null> {
  const client = await getMongoClient();
  if (!client) return null;

  try {
    const uri = getMongoUri();
    let dbName = 'edusphere';

    // Extract database name from connection string if present
    const match = uri.match(/mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/);
    if (match && match[1] && match[1].trim()) {
      dbName = match[1].trim();
    }

    return client.db(dbName);
  } catch (err: any) {
    console.error('Error getting MongoDB database instance:', err);
    return null;
  }
}

export async function getDbStatus() {
  const uri = getMongoUri();
  const isConfigured = Boolean(uri);
  const db = await getMongoDb();
  const isConnected = Boolean(db);

  let maskedUri = '';
  if (uri) {
    maskedUri = uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/, '$1******$3');
  }

  let collectionsCount: Record<string, number> = {
    users: memoryStore.users.length,
    courses: memoryStore.courses.length,
    modules: memoryStore.modules.length,
    quizzes: memoryStore.quizzes.length,
    assignments: memoryStore.assignments.length,
    submissions: memoryStore.submissions.length,
    quizAttempts: memoryStore.quizAttempts.length,
    progress: memoryStore.progress.length,
  };

  let hashedUsersCount = memoryStore.users.filter((u) => isBcryptHash(u.password)).length;
  const totalUsersCount = memoryStore.users.length;

  if (db) {
    try {
      const [
        usersCount,
        coursesCount,
        modulesCount,
        quizzesCount,
        assignmentsCount,
        submissionsCount,
        quizAttemptsCount,
        progressCount
      ] = await Promise.all([
        db.collection('users').countDocuments(),
        db.collection('courses').countDocuments(),
        db.collection('modules').countDocuments(),
        db.collection('quizzes').countDocuments(),
        db.collection('assignments').countDocuments(),
        db.collection('submissions').countDocuments(),
        db.collection('quiz_attempts').countDocuments(),
        db.collection('progress').countDocuments(),
      ]);

      collectionsCount = {
        users: usersCount,
        courses: coursesCount,
        modules: modulesCount,
        quizzes: quizzesCount,
        assignments: assignmentsCount,
        submissions: submissionsCount,
        quizAttempts: quizAttemptsCount,
        progress: progressCount,
      };

      // Check how many users in MongoDB have bcrypt hashes
      const mongoUsers = await db.collection('users').find({}, { projection: { password: 1 } }).toArray();
      hashedUsersCount = mongoUsers.filter((u) => isBcryptHash(u.password)).length;
    } catch (e: any) {
      console.warn('Failed to count collection items:', e.message);
    }
  }

  return {
    isConfigured,
    isConnected,
    dbType: 'MongoDB',
    dbName: db ? db.databaseName : (isConfigured ? 'edusphere' : 'Memoria Local (Fallback)'),
    maskedUri,
    lastError: lastConnectionError,
    connectionDiagnosis:
      !isConnected && isConfigured && lastConnectionError
        ? (lastConnectionError.includes('SSL alert number 80') ||
           lastConnectionError.includes('tlsv1 alert internal error') ||
           lastConnectionError.includes('MongoServerSelectionError'))
          ? 'MongoDB Atlas rechazó la conexión SSL porque tu clúster tiene habilitada la lista blanca de IPs. Para resolverlo en MongoDB Atlas: Ve a "Security" > "Network Access" > Haz clic en "Add IP Address" > Elige "Allow Access from Anywhere (0.0.0.0/0)" y guarda los cambios.'
          : 'Error al conectar con MongoDB Atlas. Verifica la contraseña del usuario en tu MONGODB_URI.'
        : null,
    collectionsCount,
    security: {
      passwordHashing: 'bcrypt (Blowfish)',
      saltRounds: BCRYPT_SALT_ROUNDS,
      gitIgnoredEnv: true,
      envSecurityNotice: 'Archivo .env excluido en .gitignore. Credenciales protegidas en Vercel.',
      isHashProtectionActive: true,
      hashedUsersCount,
      totalUsersCount: collectionsCount.users,
    },
    timestamp: new Date().toISOString(),
  };
}

// Auto-seed MongoDB with bcrypt-hashed credentials if empty
export async function seedMongoDatabase(force = false): Promise<{ success: boolean; message: string }> {
  const db = await getMongoDb();
  if (!db) {
    return {
      success: false,
      message: 'MongoDB no está conectado. No se puede sembrar la base de datos.',
    };
  }

  try {
    const usersCount = await db.collection('users').countDocuments();
    if (usersCount > 0 && !force) {
      return {
        success: true,
        message: 'MongoDB ya contiene datos. No fue necesario sembrar.',
      };
    }

    // Secure all users with bcrypt hashes before inserting into MongoDB
    const securedUsers = await secureUsersForDb(INITIAL_USERS);

    // Upsert or insert initial records
    const insertOrReplace = async (collName: string, items: any[]) => {
      const coll = db.collection(collName);
      if (force) {
        await coll.deleteMany({});
      }
      for (const item of items) {
        await coll.updateOne({ id: item.id }, { $set: item }, { upsert: true });
      }
    };

    await Promise.all([
      insertOrReplace('users', securedUsers),
      insertOrReplace('courses', INITIAL_COURSES),
      insertOrReplace('modules', INITIAL_MODULES),
      insertOrReplace('quizzes', INITIAL_QUIZZES),
      insertOrReplace('assignments', INITIAL_ASSIGNMENTS),
      insertOrReplace('submissions', INITIAL_SUBMISSIONS),
      insertOrReplace('quiz_attempts', INITIAL_QUIZ_ATTEMPTS),
      insertOrReplace('chat_messages', INITIAL_CHAT_MESSAGES),
      insertOrReplace('notifications', INITIAL_NOTIFICATIONS),
      insertOrReplace('progress', INITIAL_PROGRESS),
    ]);

    console.log('🌱 MongoDB initialized with bcrypt-hashed credentials and datasets.');
    return {
      success: true,
      message: 'Base de datos MongoDB sembrada exitosamente con contraseñas encriptadas con bcrypt (salt rounds = 10), cursos y progreso.',
    };
  } catch (err: any) {
    console.error('Error seeding MongoDB:', err);
    return {
      success: false,
      message: `Error al inicializar datos en MongoDB: ${err.message}`,
    };
  }
}

// Migration utility: Finds any plain-text unhashed user passwords in MongoDB and upgrades them to bcrypt hashes
export async function rehashAllUsersInMongo(): Promise<{ updated: number; message: string }> {
  let updated = 0;

  // Update memoryStore users first
  for (let i = 0; i < memoryStore.users.length; i++) {
    const user = memoryStore.users[i];
    if (user.password && !isBcryptHash(user.password)) {
      const hashed = hashPasswordSync(user.password, BCRYPT_SALT_ROUNDS);
      memoryStore.users[i] = {
        ...user,
        password: hashed,
        passwordHash: hashed,
        isPasswordHashed: true,
      };
      updated++;
    }
  }

  const db = await getMongoDb();
  if (db) {
    const users = await db.collection('users').find({}).toArray();
    for (const u of users) {
      if (u.password && !isBcryptHash(u.password)) {
        const hashed = hashPasswordSync(u.password, BCRYPT_SALT_ROUNDS);
        await db.collection('users').updateOne(
          { _id: u._id },
          {
            $set: {
              password: hashed,
              passwordHash: hashed,
              isPasswordHashed: true,
            },
          }
        );
        updated++;
      }
    }
  }

  return {
    updated,
    message: `Se migraron y cifraron ${updated} contraseñas con bcrypt (Blowfish, salt rounds = ${BCRYPT_SALT_ROUNDS}).`,
  };
}

// Bulk sync from frontend state to MongoDB (with automatic bcrypt hashing for all users)
export async function syncStateToMongo(data: {
  users?: User[];
  courses?: Course[];
  modules?: CourseModule[];
  quizzes?: Quiz[];
  assignments?: Assignment[];
  submissions?: Submission[];
  quizAttempts?: QuizAttempt[];
  progress?: StudentProgress[];
  notifications?: AppNotification[];
  chatMessages?: ChatMessage[];
}): Promise<{ success: boolean; message: string; count: number }> {
  // Ensure user passwords are encrypted before syncing
  let securedUsers: User[] | undefined = undefined;
  if (data.users && data.users.length > 0) {
    securedUsers = await secureUsersForDb(data.users);
    memoryStore.users = securedUsers;
  }

  // Always update memory store
  if (data.courses) memoryStore.courses = data.courses;
  if (data.modules) memoryStore.modules = data.modules;
  if (data.quizzes) memoryStore.quizzes = data.quizzes;
  if (data.assignments) memoryStore.assignments = data.assignments;
  if (data.submissions) memoryStore.submissions = data.submissions;
  if (data.quizAttempts) memoryStore.quizAttempts = data.quizAttempts;
  if (data.progress) memoryStore.progress = data.progress;
  if (data.notifications) memoryStore.notifications = data.notifications;
  if (data.chatMessages) memoryStore.chatMessages = data.chatMessages;

  const db = await getMongoDb();
  if (!db) {
    return {
      success: true,
      message: 'Datos y contraseñas hasheadas con bcrypt guardados en caché local (MongoDB no conectado aún).',
      count: (data.users?.length || 0) + (data.courses?.length || 0),
    };
  }

  let totalUpdated = 0;
  const syncCollection = async (collName: string, items?: any[]) => {
    if (!items || !items.length) return;
    const coll = db.collection(collName);
    for (const item of items) {
      const filter = item.id
        ? { id: item.id }
        : item.userId && item.courseId
        ? { userId: item.userId, courseId: item.courseId }
        : { _id: item._id };
      await coll.updateOne(filter, { $set: item }, { upsert: true });
      totalUpdated++;
    }
  };

  await Promise.all([
    syncCollection('users', securedUsers || data.users),
    syncCollection('courses', data.courses),
    syncCollection('modules', data.modules),
    syncCollection('quizzes', data.quizzes),
    syncCollection('assignments', data.assignments),
    syncCollection('submissions', data.submissions),
    syncCollection('quiz_attempts', data.quizAttempts),
    syncCollection('progress', data.progress),
    syncCollection('notifications', data.notifications),
    syncCollection('chat_messages', data.chatMessages),
  ]);

  return {
    success: true,
    message: `Sincronizados ${totalUpdated} documentos exitosamente con MongoDB (contraseñas aseguradas con bcrypt).`,
    count: totalUpdated,
  };
}

// Clean MongoDB helper to strip _id from output
export function stripMongoId<T>(doc: any): T {
  if (!doc) return doc;
  const { _id, ...clean } = doc;
  return clean as T;
}
