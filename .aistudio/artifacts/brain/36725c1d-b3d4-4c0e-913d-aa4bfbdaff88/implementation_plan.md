# EduSphere: Plataforma E-Learning Integral y Modular

Plataforma educativa moderna de alto rendimiento orientada al aprendizaje interactivo, gestión académica integral y colaboración en tiempo real con soporte completo para roles de Administrador, Docente y Estudiante.

### User Review & Critical Decisions

> [!IMPORTANT]
> Se han integrado y confirmado las tres decisiones clave del usuario para gobernar la solución:

- **Estrategia de Backend y Almacenamiento**: Full-Stack Express con base de datos unificada, sincronización en tiempo real de notificaciones y chat, y perfiles demo instantáneos precargados para los 3 roles con cambio de sesión rápido.
- **Identidad Visual y Teoría del Color**: Paleta sobria basada en Indigo moderno (`#4F46E5`) para concentración y estructura pedagógica, acentos Esmeralda (`#10B981`) para progreso y retroalimentación positiva, sobre lienzos pizarra neutros con soporte nativo de Modo Oscuro.
- **Formato de Evaluación Académica**: Cuestionarios interactivos tipo test con corrección automática inmediata, combinados con tareas multimedia calificables mediante rúbricas de evaluación detalladas y retroalimentación cualitativa docente.

---

### 1. Overview & Core Concept

- **Qué hace la plataforma**: Proporciona un entorno virtual de aprendizaje (LMS) donde las instituciones administran usuarios con permisos estrictos, los docentes estructuran currículos en módulos y lecciones multimedia (videos, PDFs, imágenes), diseñan cuestionarios autocalificables y evalúan entregas estudiantiles; mientras que los estudiantes cursan contenidos dinámicos, presentan evaluaciones, suben trabajos y se comunican directamente.
- **Público objetivo y roles**:
  - **Administrador**: Control total sobre la institución, creación y gestión de usuarios (docentes y estudiantes), métricas globales de actividad y cursos.
  - **Docente**: Diseñador instruccional y evaluador. Gestiona cursos, organiza módulos, sube material multimedia, configura quizzes y asignaciones, y califica con rúbricas y notas retroalimentadas.
  - **Estudiante**: Aprendiz activo. Explora cursos matriculados, visualiza material didáctico, responde evaluaciones interactivas con puntajes al instante, entrega tareas y monitorea su progreso y calificaciones.
- **Propuesta de valor**: Flujo de aprendizaje sin fricción, libre de sobrecarga visual, con trazabilidad completa de progreso, chat directo entre usuarios y notificaciones en vivo de actividades académicas.

---

### 2. User Experience & Visual Design

#### Flujos de Usuario Principales

1. **Gestión de Sesión y Selector de Rol**:
   - Acceso inmediato con inicio de sesión o selector rápido de cuentas demo (Admin Principal, Docente Titular, Estudiante Activo) para testing ágil.
   - Guardián de rutas y vistas contextuales según rol activo.

2. **Panel de Administrador**:
   - Indicadores generales de plataforma (total de estudiantes, docentes, cursos activos, tasa de finalización).
   - Módulo de creación y gestión de usuarios con validación de roles y estados.
   - Directorio de cursos de la plataforma con opciones de supervisión académica.

3. **Panel de Docente (Studio de Creación y Calificación)**:
   - **Gestor de Cursos**: Creación y edición de cursos con metadatos, categoría y portada.
   - **Constructor de Currículo Modular**: Creación de módulos temáticos y lecciones jerárquicas.
   - **Contenido Multimedia**: Inserción de clases en video, galerías de imágenes explicativas, guías en PDF y material de lectura.
   - **Editor de Evaluaciones**: Constructor de cuestionarios con preguntas de opción múltiple, explicación pedagógica y puntaje asignado.
   - **Centro de Calificaciones**: Bandeja de tareas entregadas por estudiantes, visor de respuestas, aplicación de rúbrica de evaluación y emisión de calificaciones con comentarios.

4. **Panel de Estudiante (Campus Virtual)**:
   - Vista de cursos inscritos con barra de progreso porcentual real.
   - **Aula de Aprendizaje**: Reproductor interactivo de lecciones con visor de video, lector de contenido y documentos descargables.
   - **Módulo de Exámenes**: Interfaz de cuestionario interactivo con temporizador, selección de opciones y cálculo instantáneo de nota al completar.
   - **Bandeja de Entregas**: Formulario para subir tareas con archivos, enlaces y comentarios del estudiante.
   - **Libreta de Calificaciones**: Registro histórico de notas obtenidas y retroalimentación del profesor.

5. **Comunicación y Notificaciones**:
   - **Chat Integrado**: Mensajería directa entre estudiantes y profesores o canal grupal de curso, con historial de mensajes y estado de lectura.
   - **Centro de Notificaciones en Tiempo Real**: Alertas de nuevas tareas publicadas, calificaciones recibidas, mensajes directos y recordatorios de fechas límite.

6. **Perfil y Personalización**:
   - Conmutador fluido entre Modo Claro y Modo Oscuro con persistencia en preferencias de usuario.
   - Personalización de avatar, biografía, información de contacto y preferencias de alerta.

#### Identidad Visual y Teoría del Color

- **Alineación con la Teoría del Color**:
  - **Indigo Primario (`indigo-600` / `#4F46E5`)**: Evoca confianza, concentración prolongada y rigor intelectual; empleado en acciones primarias y navegación activa.
  - **Esmeralda Secundario (`emerald-600` / `#059669`)**: Asocia éxito, avance, tareas completadas y calificaciones aprobatorias.
  - **Ámbar de Alerta (`amber-500` / `#D97706`)**: Tareas pendientes por entregar, plazos cercanos y entregas en revisión.
  - **Pizarra Neutro (`slate-50` a `slate-950`)**: Superficies limpias con relaciones de contraste WCAG AA, sin saturación invasiva ni gradientes distractores.
- **Tipografía**: `Plus Jakarta Sans` para titulares limpios y legibilidad en pantallas; cifras tabulares (`tabular-nums`) en notas, temporizadores y porcentajes.
- **Disciplina Visual**: Eliminación de pastillas decorativas redundantes en metadatos, reemplazadas por texto inline estructurado con separadores sutiles (`·`).

---

### 3. Key Product Decisions & Trade-Offs

- **Decisión 1: Backend Full-Stack Express con Persistencia Unificada**:
  - *Enfoque*: Servidor Express con endpoints RESTful para CRUD de usuarios, cursos, módulos, lecciones, entregas, notas y mensajes, respaldado por un almacén de datos persistente en disco/memoria estructurado.
  - *Razón*: Garantiza una experiencia reactiva instantánea, soporte de roles riguroso sin dependencias externas bloqueantes, y pruebas inmediatas de los 3 perfiles con datos realistas preconfigurados.
- **Decisión 2: Motor de Calificación Híbrido**:
  - *Enfoque*: Exámenes tipo test autocalificables en tiempo real al finalizar el intento + tareas con rúbrica cualitativa y cuantitativa para corrección manual docente.
  - *Razón*: Optimiza el tiempo del docente y entrega al estudiante tanto validación instantánea del aprendizaje como retroalimentación profunda en proyectos.
- **Decisión 3: Sistema de Chat y Notificaciones en Vivo**:
  - *Enfoque*: Arquitectura reactiva en tiempo real con sincronización de estado, historial de conversaciones y avisos flotantes de actividad académica.
  - *Razón*: Cumple con el requisito de notificaciones inmediatas y comunicación directa sin recargar la página.

---

### 4. Technical Architecture & Data Strategy

#### Diagrama de Arquitectura de Componentes

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Cliente Web (React 19 + Vite)                   │
├────────────────────────────────────────────────────────────────────────┤
│  Top Navigation (Top Bar Contract: Marca, Navegación, Rol, Perfil)      │
├─────────────────┬──────────────────────────────────────────────────────┤
│  Barra Lateral  │  Zona de Trabajo Principal                           │
│  - Dashboard    │  ┌────────────────────────────────────────────────┐  │
│  - Mis Cursos   │  │ Vistas según Rol:                              │  │
│  - Evaluaciones │  │ · Administrador: Gestión de Usuarios & Stats   │  │
│  - Mensajes     │  │ · Docente: Creador de Cursos & Calificaciones  │  │
│  - Progreso     │  │ · Estudiante: Aula Interactiva & Tareas        │  │
│  - Perfil       │  └────────────────────────────────────────────────┘  │
│                 │  ┌────────────────────────┐ ┌────────────────────┐   │
│                 │  │ Chat en Tiempo Real    │ │ Centro Notificac.  │   │
│                 │  └────────────────────────┘ └────────────────────┘   │
└─────────────────┴──────────────────────────────────────────────────────┘
                                  │
                       HTTP REST  │  Eventos / Sockets
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 Servidor Backend Full-Stack (Node / Express)           │
├────────────────────────────────────────────────────────────────────────┤
│  · Autenticación & Control de Acceso RBAC (Admin / Docente / Alumno)   │
│  · API REST: /api/users, /api/courses, /api/submissions, /api/grades   │
│  · Bus de Eventos & Notificaciones en Tiempo Real                      │
│  · Gestor de Persistencia y Repositorio de Contenidos                  │
└────────────────────────────────────────────────────────────────────────┘
```

#### Modelo de Datos Principal

- **User**: `id`, `name`, `email`, `role` (`admin` | `teacher` | `student`), `avatar`, `bio`, `createdAt`.
- **Course**: `id`, `title`, `description`, `teacherId`, `category`, `thumbnail`, `level`, `published`, `modulesCount`, `enrolledCount`.
- **Module**: `id`, `courseId`, `order`, `title`, `description`.
- **Lesson**: `id`, `moduleId`, `order`, `title`, `contentType` (`video` | `article` | `pdf` | `image`), `contentUrl`, `textContent`, `durationMinutes`.
- **Quiz**: `id`, `moduleId` | `courseId`, `title`, `questions` (array con `id`, `prompt`, `options`, `correctIndex`, `explanation`, `points`), `timeLimitMinutes`.
- **Assignment**: `id`, `moduleId` | `courseId`, `title`, `description`, `dueDate`, `maxScore`, `rubric` (criterios con pesos).
- **Submission**: `id`, `assignmentId` | `quizId`, `studentId`, `submittedAt`, `content` (texto, links, respuestas de quiz), `score`, `status` (`pending` | `graded`), `feedback`.
- **ChatMessage**: `id`, `senderId`, `receiverId`, `courseId`, `message`, `timestamp`, `read`.
- **Notification**: `id`, `userId`, `title`, `message`, `type` (`assignment` | `grade` | `chat` | `system`), `read`, `timestamp`, `actionUrl`.

#### Mapeo de Interacciones y Flujos de Estado

- **Cambio de rol dinámico**: Cambio sin pérdida de estado para auditar la plataforma desde las tres perspectivas.
- **Creación de contenido**: Validación en tiempo real de formularios, carga y previsualización de multimedia.
- **Evaluación**: Bloqueo de reenvío en quizzes, cálculo automático de notas y emisión inmediata de notificación al estudiante.
- **Entrega de tareas**: Envío con confirmación visual, cambio de estado de pendiente a calificada y actualización del boletín.
