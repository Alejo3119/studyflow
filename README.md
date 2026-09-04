# StudyFlow

Organizador de tareas y hábitos para estudiantes, con sincronización de dos vías con Google Calendar.

**Demo en vivo:** [studyflow-plum-eta.vercel.app](https://studyflow-plum-eta.vercel.app)

## Funcionalidades

- **Tareas**: crear, editar, completar y eliminar, con materia, prioridad y fecha límite. Se agrupan automáticamente en Vencidas / Hoy / Próximas / Sin fecha / Completadas.
- **Hábitos**: seguimiento diario con racha (🔥) y una tira visual de los últimos 7 días.
- **Panel principal**: resumen del día — tareas pendientes, vencidas, tareas de hoy y hábitos por marcar.
- **Google Calendar (sincronización de dos vías)**:
  - Al crear/editar/eliminar una tarea con fecha, se crea/actualiza/borra el evento correspondiente en tu calendario de Google automáticamente.
  - Botón "Sincronizar" que trae eventos existentes de Google Calendar como tareas nuevas, y empuja cualquier tarea local pendiente de enviar.
- **Multi-usuario**: cada cuenta de Google que se conecta tiene sus propias tareas y hábitos, completamente separados del resto.
- **Modo oscuro** automático según la configuración del sistema.

## Stack técnico

- [Next.js 16](https://nextjs.org) (App Router, Server Actions, Turbopack) + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com)
- [Prisma ORM](https://www.prisma.io) + [PostgreSQL](https://neon.tech) (Neon)
- [Auth.js / NextAuth](https://authjs.dev) con proveedor de Google (OAuth) para login y acceso a Calendar API
- Desplegado en [Vercel](https://vercel.com)

## Cómo correrlo en local

### 1. Requisitos

- [Node.js](https://nodejs.org) 20 o superior
- Una base de datos PostgreSQL (por ejemplo, gratis en [neon.tech](https://neon.tech))
- Un proyecto de [Google Cloud Console](https://console.cloud.google.com) con:
  - Google Calendar API habilitada
  - Pantalla de consentimiento OAuth configurada (agrega tu correo en "Test users" mientras no publiques la app)
  - Scope agregado en **Data access**: `https://www.googleapis.com/auth/calendar.events`
  - Credenciales OAuth de tipo "Aplicación web" con este redirect URI: `http://localhost:3000/api/auth/callback/google`

### 2. Instalación

```bash
npm install
```

### 3. Variables de entorno

Crea un archivo `.env` en la raíz con:

```bash
DATABASE_URL="postgresql://usuario:password@host/db?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://usuario:password@host/db?sslmode=require"

AUTH_SECRET="genera uno con: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\""
AUTH_GOOGLE_ID="tu-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="tu-client-secret"
```

### 4. Base de datos

```bash
npx prisma migrate dev
```

### 5. Levantar el servidor

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Despliegue

El proyecto está configurado para desplegarse en Vercel con base de datos Postgres en Neon. Para producción, agrega las mismas variables de entorno en Vercel y un redirect URI adicional en Google Cloud Console apuntando a tu dominio de producción (`https://tu-dominio.vercel.app/api/auth/callback/google`).

```bash
vercel deploy --prod
```
