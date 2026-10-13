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
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin_1',
    name: 'Carlos Mendoza',
    email: 'admin@edusphere.edu',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Director Académico y Administrador General de Alexis Castro Academy.',
    createdAt: '2026-01-15',
    department: 'Dirección de Tecnología Educativa',
    password: 'AdminEdu2026!'
  },
  {
    id: 'usr_teacher_1',
    name: 'Dra. Elena Ramos',
    email: 'elena.ramos@edusphere.edu',
    role: 'teacher',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bio: 'Especialista en Desarrollo de Software Full Stack y Arquitectura de Sistemas Web.',
    createdAt: '2026-02-01',
    department: 'Facultad de Ingeniería y Computación',
    password: 'DocenteEdu2026!'
  },
  {
    id: 'usr_teacher_2',
    name: 'Prof. Mateo Silva',
    email: 'mateo.silva@edusphere.edu',
    role: 'teacher',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Investigador en Inteligencia Artificial, Ciencia de Datos y Machine Learning.',
    createdAt: '2026-02-10',
    department: 'Facultad de Ciencias Exactas',
    password: 'DocenteEdu2026!'
  },
  {
    id: 'usr_student_1',
    name: 'Sofía Morales',
    email: 'sofia.morales@edusphere.edu',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Estudiante de 4to ciclo de Ingeniería de Software con pasión por el Frontend y UX.',
    createdAt: '2026-03-01',
    coursesEnrolled: ['crs_fullstack_1', 'crs_datascience_2', 'crs_uiux_3'],
    password: 'EstudianteEdu2026!'
  },
  {
    id: 'usr_student_2',
    name: 'Lucas Benítez',
    email: 'lucas.benitez@edusphere.edu',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'Apasionado del desarrollo Backend, bases de datos distribuidas y microservicios.',
    createdAt: '2026-03-05',
    coursesEnrolled: ['crs_fullstack_1'],
    password: 'EstudianteEdu2026!'
  },
  {
    id: 'usr_student_3',
    name: 'Valeria Ortiz',
    email: 'valeria.ortiz@edusphere.edu',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    bio: 'Diseñadora gráfica en transición a diseño de interfaces de producto interactivo.',
    createdAt: '2026-03-10',
    coursesEnrolled: ['crs_uiux_3'],
    password: 'EstudianteEdu2026!'
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'crs_fullstack_1',
    title: 'Desarrollo Web Full Stack con React y Node.js',
    description: 'Aprende a diseñar y construir aplicaciones web escalables de principio a fin utilizando React 19, TypeScript, Express y arquitectura de microservicios.',
    teacherId: 'usr_teacher_1',
    category: 'Programación',
    level: 'Intermedio',
    bannerGradient: 'from-indigo-600 via-indigo-700 to-slate-900',
    bannerIcon: 'Code2',
    published: true,
    enrolledStudents: ['usr_student_1', 'usr_student_2'],
    createdAt: '2026-02-15'
  },
  {
    id: 'crs_datascience_2',
    title: 'Ciencia de Datos y Machine Learning Aplicado',
    description: 'Domina el análisis exploratorio de datos, visualización avanzada, ingeniería de características y modelos predictivos supervisados y no supervisados.',
    teacherId: 'usr_teacher_2',
    category: 'Inteligencia Artificial',
    level: 'Avanzado',
    bannerGradient: 'from-emerald-600 via-teal-700 to-slate-900',
    bannerIcon: 'BrainCircuit',
    published: true,
    enrolledStudents: ['usr_student_1'],
    createdAt: '2026-02-20'
  },
  {
    id: 'crs_uiux_3',
    title: 'Diseño UI/UX y Sistemas de Diseño Escalables',
    description: 'Principios de teoría del color, tipografía de alta jerarquía, usabilidad según heurísticas de Nielsen y creación de componentes accesibles WCAG AA.',
    teacherId: 'usr_teacher_1',
    category: 'Diseño Digital',
    level: 'Principiante',
    bannerGradient: 'from-violet-600 via-purple-700 to-slate-900',
    bannerIcon: 'Palette',
    published: true,
    enrolledStudents: ['usr_student_1', 'usr_student_3'],
    createdAt: '2026-02-25'
  }
];

export const INITIAL_MODULES: CourseModule[] = [
  // Modules for Course 1
  {
    id: 'mod_fs_1',
    courseId: 'crs_fullstack_1',
    title: 'Módulo 1: Fundamentos de Arquitectura Reactiva y Hooks',
    description: 'Principios de reconciliación de componentes, gestión de ciclo de vida e inmutabilidad en TypeScript.',
    order: 1,
    lessons: [
      {
        id: 'les_fs_1',
        moduleId: 'mod_fs_1',
        title: '1.1 Arquitectura de Componentes Funcionales y Pureza',
        description: 'Explicación exhaustiva del renderizado idempotente y control de re-renders innecesarios.',
        order: 1,
        durationMinutes: 24,
        quizIds: ['quiz_fs_1'],
        contentHtml: `<p>En esta lección exploramos los pilares fundamentales del modelo mental de React:</p><ul><li><strong>Funciones Puras:</strong> Los componentes deben ser funciones idempotentes que dado un conjunto de props devuelvan siempre el mismo JSX.</li><li><strong>Flujo de datos unidireccional:</strong> La información desciende en cascada y los eventos ascienden mediante callbacks estructurados.</li><li><strong>Inmutabilidad:</strong> Modificar el estado directamente produce inconsistencias en el Virtual DOM.</li></ul>`,
        resources: [
          {
            id: 'res_fs_1_vid',
            type: 'video',
            title: 'Masterclass: Renderizado y Virtual DOM en React 19 (YouTube)',
            url: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
            description: 'Video explicativo con diagramación en vivo del ciclo de vida de los componentes transmitido desde YouTube.',
            durationMinutes: 18
          },
          {
            id: 'res_fs_1_pdf',
            type: 'pdf',
            title: 'Guía Técnica: Mejores Prácticas en TypeScript y React',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            description: 'Manual de referencia en PDF con ejemplos de tipado seguro para props y eventos.'
          }
        ]
      },
      {
        id: 'les_fs_2',
        moduleId: 'mod_fs_1',
        title: '1.2 Gestión de Estado con Custom Hooks y Context',
        description: 'Cómo desacoplar la lógica de negocio de la capa de presentación mediante composición.',
        order: 2,
        durationMinutes: 30,
        assignmentIds: ['asg_fs_1'],
        contentHtml: `<p>Aprenderemos a diseñar custom hooks limpios y reutilizables:</p><ol><li>Encapsulamiento de llamadas asíncronas con estados de carga y error.</li><li>Evitar el <em>prop drilling</em> con React Context sin generar re-renders globales.</li><li>Patrón Reducer para estados complejos con múltiples transiciones.</li></ol>`,
        resources: [
          {
            id: 'res_fs_2_img',
            type: 'image',
            title: 'Infografía: Diagrama de Flujo de Datos y Hooks',
            url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
            description: 'Esquema de alto contraste sobre la separación de estado local versus compartido.'
          },
          {
            id: 'res_fs_2_vid',
            type: 'video',
            title: 'Codificación en Vivo: Creación de un Hook de Suscripción',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            description: 'Desarrollo paso a paso de un hook para consumir eventos en tiempo real.',
            durationMinutes: 20
          }
        ]
      }
    ]
  },
  {
    id: 'mod_fs_2',
    courseId: 'crs_fullstack_1',
    title: 'Módulo 2: Servidores RESTful con Node.js y Express',
    description: 'Diseño de endpoints robustos, validación de esquemas, middleware de seguridad y persistencia.',
    order: 2,
    lessons: [
      {
        id: 'les_fs_3',
        moduleId: 'mod_fs_2',
        title: '2.1 Enrutamiento y Middlewares en Express',
        description: 'Estructuración de rutas escalables y manejo centralizado de excepciones.',
        order: 1,
        durationMinutes: 28,
        contentHtml: `<p>El diseño de una API REST profesional requiere:</p><ul><li>Uso adecuado de los verbos HTTP (GET, POST, PUT, DELETE, PATCH).</li><li>Códigos de estado estandarizados (200, 201, 400, 401, 403, 404, 500).</li><li>Capa intermedia de autenticación por tokens y sanitización de entradas.</li></ul>`,
        resources: [
          {
            id: 'res_fs_3_pdf',
            type: 'pdf',
            title: 'Especificación de Arquitectura RESTful en PDF',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            description: 'Documento normativo de convenciones para endpoints y payloads JSON.'
          }
        ]
      }
    ]
  },
  // Modules for Course 2
  {
    id: 'mod_ds_1',
    courseId: 'crs_datascience_2',
    title: 'Módulo 1: Fundamentos de Análisis Estadístico',
    description: 'Exploración de datos numéricos y categóricos con distribuciones e inferencia.',
    order: 1,
    lessons: [
      {
        id: 'les_ds_1',
        moduleId: 'mod_ds_1',
        title: '1.1 Distribuciones de Probabilidad y Métricas Centrales',
        description: 'Comprender la media, mediana, varianza y desviación típica en conjuntos asimétricos.',
        order: 1,
        durationMinutes: 25,
        contentHtml: `<p>Conceptos esenciales para el preprocesamiento de variables cuantitativas:</p><ul><li>Detección de valores atípicos mediante el rango intercuartílico (IQR).</li><li>Normalización Min-Max vs estandarización Z-Score.</li><li>Manejo riguroso de valores nulos o imputación guiada.</li></ul>`,
        resources: [
          {
            id: 'res_ds_1_vid',
            type: 'video',
            title: 'Visualización de Distribuciones en Python',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            description: 'Demostración de histogramas y diagramas de caja con Matplotlib y Seaborn.',
            durationMinutes: 15
          }
        ]
      }
    ]
  },
  // Modules for Course 3
  {
    id: 'mod_ux_1',
    courseId: 'crs_uiux_3',
    title: 'Módulo 1: Psicología del Color y Accesibilidad',
    description: 'Cómo aplicar la teoría cromática para guiar la atención sin sobrecargar cognitivamente al usuario.',
    order: 1,
    lessons: [
      {
        id: 'les_ux_1',
        moduleId: 'mod_ux_1',
        title: '1.1 Regla del 60-30-10 y Ratios de Contraste WCAG',
        description: 'Construcción de paletas con color dominante, secundario estructural y acento intencional.',
        order: 1,
        durationMinutes: 22,
        assignmentIds: ['asg_uiux_1'],
        contentHtml: `<p>Principios de accesibilidad y psicología visual aplicados:</p><ul><li><strong>60% Color Dominante:</strong> Generalmente el fondo neutro que genera el espacio respirable.</li><li><strong>30% Estructural:</strong> Superficies de tarjetas, bordes sutiles y texto secundario.</li><li><strong>10% Acento:</strong> Reservado estrictamente para llamadas a la acción primarias y estados de éxito.</li><li><strong>Nunca comunicar estado únicamente con color:</strong> Siempre añadir texto o icono aclaratorio.</li></ul>`,
        resources: [
          {
            id: 'res_ux_1_img',
            type: 'image',
            title: 'Guía Visual: Rueda Cromática y Armonías Complementarias',
            url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80',
            description: 'Matriz visual de tonalidades recomendadas para paneles y plataformas SaaS.'
          }
        ]
      }
    ]
  }
];

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'quiz_fs_1',
    courseId: 'crs_fullstack_1',
    moduleId: 'mod_fs_1',
    lessonId: 'les_fs_1',
    title: 'Cuestionario Interactivo: Fundamentos de React y Arquitectura',
    description: 'Evalúa tu comprensión sobre renderizado, custom hooks y gestión de estados inmutables.',
    timeLimitMinutes: 15,
    maxAttempts: 'unlimited',
    questions: [
      {
        id: 'q1',
        prompt: '¿Por qué se considera una mala práctica modificar el estado de React directamente (ej: state.count = 5)?',
        options: [
          'Porque causa un error sintáctico de JavaScript y detiene el navegador.',
          'Porque React detecta cambios mediante comparación superficial (referencial) y no disparará el re-render.',
          'Porque TypeScript no permite variables mutables en ningún contexto.',
          'Porque el servidor rechaza automáticamente las peticiones mutables.'
        ],
        correctIndex: 1,
        explanation: 'React optimiza el renderizado comparando referencias de memoria. Si mutas el objeto en lugar de crear uno nuevo, React asume que no hubo cambio y el componente no se actualiza en el DOM.',
        points: 20
      },
      {
        id: 'q2',
        prompt: '¿Cuál es la función primordial del hook useEffect cuando devuelve una función de limpieza (cleanup function)?',
        options: [
          'Guardar automáticamente el componente en la memoria caché del navegador.',
          'Cancelar suscripciones activas, temporizadores o listeners para prevenir fugas de memoria.',
          'Transformar el componente funcional en un componente de clase de JavaScript.',
          'Redirigir al usuario a la página de inicio cuando finalice la petición.'
        ],
        correctIndex: 1,
        explanation: 'La función de limpieza de useEffect se ejecuta antes del siguiente ciclo o al desmontarse el componente, evitando fugas de memoria por intervalos o suscripciones abiertas.',
        points: 20
      },
      {
        id: 'q3',
        prompt: 'En el diseño de Custom Hooks, ¿cuál de las siguientes opciones representa la regla arquitectónica correcta?',
        options: [
          'Deben comenzar con el prefijo "use" y pueden invocar internamente otros hooks de React.',
          'Deben ejecutarse únicamente dentro de bucles "for" o sentencias condicionales "if".',
          'Solo pueden devolver cadenas de texto simples y nunca funciones o tuplas.',
          'Deben contener código exclusivo de backend y base de datos.'
        ],
        correctIndex: 0,
        explanation: 'Los custom hooks siguen la convención del prefijo "use" que activa las reglas de ESLint de React y permiten encapsular y componer otros hooks estándar de manera modular.',
        points: 20
      }
    ]
  },
  {
    id: 'quiz_ds_1',
    courseId: 'crs_datascience_2',
    moduleId: 'mod_ds_1',
    title: 'Cuestionario: Estadística Aplicada y Preprocesamiento',
    description: 'Verificación interactiva de destrezas en normalización y tratamiento de datos atípicos.',
    timeLimitMinutes: 10,
    maxAttempts: 2,
    questions: [
      {
        id: 'q_ds_1',
        prompt: '¿Cuándo es más recomendable usar la mediana en lugar de la media aritmética como medida de tendencia central?',
        options: [
          'Cuando el conjunto de datos tiene una distribución perfectamente simétrica y normal.',
          'Cuando existen valores atípicos extremos (outliers) que sesgan considerablemente la media.',
          'Únicamente cuando los datos son puramente de tipo texto o cadenas alfanuméricas.',
          'Nunca, la media siempre es estadísticamente superior.'
        ],
        correctIndex: 1,
        explanation: 'La mediana es una métrica robusta frente a valores atípicos extremos, ya que no se ve alterada por unos pocos valores desproporcionados en las colas de la distribución.',
        points: 25
      },
      {
        id: 'q_ds_2',
        prompt: '¿Qué transformación escala los datos a un rango definido exactamente entre 0 y 1?',
        options: [
          'Estandarización Z-Score',
          'Normalización Min-Max',
          'Logaritmo Neperiano',
          'Regresión Polinomial'
        ],
        correctIndex: 1,
        explanation: 'La normalización Min-Max recalcula cada valor mediante (x - min) / (max - min), acotando matemáticamente todos los resultados en el intervalo [0, 1].',
        points: 25
      }
    ]
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg_fs_1',
    courseId: 'crs_fullstack_1',
    moduleId: 'mod_fs_1',
    lessonId: 'les_fs_2',
    title: 'Proyecto Práctico 1: Aplicación de Gestión de Tareas Full Stack',
    description: 'Construye una aplicación con interfaz React y backend Express. Debe incluir: persistencia de datos, filtrado por estados, manejo seguro de errores y componentes modulares.',
    dueDate: '2026-10-25T23:59:00',
    maxScore: 100,
    rubric: [
      {
        id: 'rub_1',
        title: 'Arquitectura y Composición de Componentes',
        description: 'Separación adecuada de lógica y presentación, uso limpio de hooks y TypeScript estricto.',
        maxPoints: 40
      },
      {
        id: 'rub_2',
        title: 'API y Manejo de Errores',
        description: 'Endpoints RESTful claros, códigos de respuesta correctos y validación de entradas.',
        maxPoints: 30
      },
      {
        id: 'rub_3',
        title: 'Interfaz, Accesibilidad y Usabilidad',
        description: 'Diseño limpio y responsivo con contraste WCAG adecuado y retroalimentación inmediata.',
        maxPoints: 30
      }
    ],
    materials: [
      {
        title: 'Guía de Arquitectura de APIs RESTful (PDF)',
        url: 'https://developer.mozilla.org/es/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs'
      },
      {
        title: 'Repositorio Base de Componentes en GitHub',
        url: 'https://github.com/facebook/react'
      }
    ]
  },
  {
    id: 'asg_uiux_1',
    courseId: 'crs_uiux_3',
    moduleId: 'mod_ux_1',
    lessonId: 'les_ux_1',
    title: 'Caso de Estudio: Rediseño de Flujo de Checkout Móvil',
    description: 'Diseña una propuesta de interfaz de usuario aplicando la regla 60-30-10 y reduciendo la fricción en el proceso de compra para dispositivos móviles.',
    dueDate: '2026-10-30T23:59:00',
    maxScore: 100,
    rubric: [
      {
        id: 'rub_ux_1',
        title: 'Aplicación de la Teoría del Color',
        description: 'Jerarquía cromática intencional sin pastillas decorativas redundantes.',
        maxPoints: 50
      },
      {
        id: 'rub_ux_2',
        title: 'Ergonomía Táctil y Accesibilidad',
        description: 'Áreas de toque superiores a 44px y contraste tipográfico comprobado.',
        maxPoints: 50
      }
    ],
    materials: [
      {
        title: 'Guía de Accesibilidad Móvil WCAG 2.1 AA',
        url: 'https://www.w3.org/WAI/standards-guidelines/wcag/'
      }
    ]
  }
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub_1',
    assignmentId: 'asg_fs_1',
    courseId: 'crs_fullstack_1',
    studentId: 'usr_student_1',
    studentName: 'Sofía Morales',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    submittedAt: '2026-10-08T14:30:00',
    fileName: 'sofia_morales_proyecto_fullstack.zip',
    fileUrl: 'https://github.com/sofiamorales/fullstack-taskmanager-demo',
    contentText: 'He implementado la arquitectura por capas con Express y React 19. El estado utiliza Custom Hooks optimizados y se incluyeron pruebas de integración para los 5 endpoints solicitados.',
    status: 'graded',
    score: 95,
    feedback: '¡Excelente trabajo, Sofía! La separación de responsabilidades en los hooks es impecable y el manejo de estados de carga en la UI demuestra gran madurez técnica. Sugiero revisar el debounce en la barra de búsqueda para la siguiente entrega.',
    rubricScores: {
      rub_1: 38,
      rub_2: 29,
      rub_3: 28
    }
  },
  {
    id: 'sub_2',
    assignmentId: 'asg_fs_1',
    courseId: 'crs_fullstack_1',
    studentId: 'usr_student_2',
    studentName: 'Lucas Benítez',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    submittedAt: '2026-10-09T18:45:00',
    fileName: 'lucas_benitez_entregable.zip',
    fileUrl: 'https://github.com/lucasbenitez/express-react-app',
    contentText: 'Adjunto el repositorio con la solución del proyecto. Implementé autenticación JWT básica y almacenamiento en memoria con Express.',
    status: 'pending' // Waiting for teacher to grade!
  }
];

export const INITIAL_QUIZ_ATTEMPTS: QuizAttempt[] = [
  {
    id: 'att_1',
    quizId: 'quiz_fs_1',
    courseId: 'crs_fullstack_1',
    studentId: 'usr_student_1',
    answers: {
      q1: 1,
      q2: 1,
      q3: 0
    },
    score: 60,
    maxScore: 60,
    percentage: 100,
    completedAt: '2026-10-07T11:20:00',
    passed: true
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_1',
    senderId: 'usr_teacher_1',
    receiverId: 'usr_student_1',
    message: 'Hola Sofía, revisé tu entrega del Proyecto 1. La estructura de carpetas es un excelente ejemplo para tus compañeros.',
    timestamp: '2026-10-08T15:00:00',
    read: true
  },
  {
    id: 'msg_2',
    senderId: 'usr_student_1',
    receiverId: 'usr_teacher_1',
    message: '¡Muchas gracias, profesora Elena! Tomé en cuenta su recomendación sobre el debounce y lo implementaré en el próximo sprint.',
    timestamp: '2026-10-08T15:15:00',
    read: true
  },
  {
    id: 'msg_3',
    senderId: 'usr_student_2',
    receiverId: 'usr_teacher_1',
    message: 'Profesora, subí mi entrega ayer por la tarde. ¿Podría confirmarme si el enlace al repositorio se puede clonar sin inconvenientes?',
    timestamp: '2026-10-09T19:10:00',
    read: false
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    userId: 'usr_student_1',
    title: 'Tarea Calificada',
    message: 'Tu profesora Elena Ramos ha calificado tu entrega del Proyecto Práctico 1: 95/100.',
    type: 'grade',
    read: false,
    timestamp: '2026-10-08T15:02:00',
    linkAction: 'grades'
  },
  {
    id: 'notif_2',
    userId: 'usr_teacher_1',
    title: 'Nueva Tarea Entregada',
    message: 'Lucas Benítez ha enviado su entrega para el Proyecto Práctico 1.',
    type: 'assignment',
    read: false,
    timestamp: '2026-10-09T18:46:00',
    linkAction: 'grading'
  },
  {
    id: 'notif_3',
    userId: 'usr_student_1',
    title: 'Mensaje Nuevo en Chat',
    message: 'Dra. Elena Ramos te ha enviado un mensaje directo en el chat.',
    type: 'chat',
    read: true,
    timestamp: '2026-10-08T15:00:00',
    linkAction: 'chat'
  },
  {
    id: 'notif_4',
    userId: 'usr_admin_1',
    title: 'Reporte Institucional del Campus',
    message: 'El ciclo académico actual cuenta con 6 usuarios activos y 3 cursos publicados.',
    type: 'system',
    read: true,
    timestamp: '2026-10-05T09:00:00',
    linkAction: 'dashboard'
  },
  {
    id: 'notif_5',
    userId: 'usr_admin_1',
    title: 'Gestión y Auditoría de Usuarios',
    message: 'Revisa las cuentas de docentes y estudiantes en la gestión exclusiva de usuarios.',
    type: 'system',
    read: false,
    timestamp: '2026-10-10T11:20:00',
    linkAction: 'users'
  },
  {
    id: 'notif_6',
    userId: 'usr_teacher_1',
    title: 'Cuestionario Programado',
    message: 'El cuestionario de JavaScript Asíncrono está listo en la sección de evaluaciones.',
    type: 'assignment',
    read: false,
    timestamp: '2026-10-10T09:15:00',
    linkAction: 'evaluations'
  },
  {
    id: 'notif_7',
    userId: 'usr_student_1',
    title: 'Nueva Tarea Asignada',
    message: 'Tienes una nueva tarea pendiente: Proyecto Práctico 1 en Desarrollo Web Full Stack.',
    type: 'assignment',
    read: false,
    timestamp: '2026-10-10T08:30:00',
    linkAction: 'assignments'
  }
];

export const INITIAL_PROGRESS: StudentProgress[] = [
  {
    userId: 'usr_student_1',
    courseId: 'crs_fullstack_1',
    completedLessonIds: ['les_fs_1', 'les_fs_2'],
    lastAccessedAt: '2026-10-08T14:00:00'
  },
  {
    userId: 'usr_student_1',
    courseId: 'crs_datascience_2',
    completedLessonIds: ['les_ds_1'],
    lastAccessedAt: '2026-10-06T10:00:00'
  },
  {
    userId: 'usr_student_2',
    courseId: 'crs_fullstack_1',
    completedLessonIds: ['les_fs_1'],
    lastAccessedAt: '2026-10-09T17:00:00'
  }
];
