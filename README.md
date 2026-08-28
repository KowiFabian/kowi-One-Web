# 🎙️ Kowi One - Tu Voz Digital, Nuestro Futuro

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-blue?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-MVP%20Development-orange?style=flat-square)]()

## 📋 Descripción del Proyecto

**Kowi One** es una plataforma SaaS innovadora para la gestión y comercialización de voces clonadas con IA. Combinamos tecnología de punta con una interfaz intuitiva para permitir que creadores, empresas y profesionales:

- 🎤 **Clonar voces** con tecnología IA avanzada
- 🔊 **Mejorar audio** con filtros profesionales
- 📝 **Transcribir** contenido multimedia automáticamente
- ✅ **Certificar** la autenticidad de voces digitales

## 🚀 Fase 1: Core MVP

### Estado Actual: ✅ EN DESARROLLO

La Fase 1 establece la base fundamental de Kowi One con una estructura moderna de Next.js 14, incluyendo:

### ✨ Características Implementadas

#### 🎨 Frontend
- **Landing Page** completa con hero section, features y CTA
- **Login/Signup** con validación de formularios
- **Dashboard** responsivo con sidebar navegable
- **UI/UX moderna** usando Tailwind CSS
- **Diseño Mobile-First** completamente responsive

#### ⚙️ Configuración Técnica
- ✅ **Next.js 14** con App Router
- ✅ **TypeScript** con strict mode
- ✅ **Tailwind CSS** para estilos
- ✅ **ESLint y Prettier** para código limpio
- ✅ **Lucide React** para iconografía
- ✅ **Seguridad headers** en Next.js config
- ✅ **.gitignore** optimizado

#### 📁 Estructura de Carpetas
```
src/
├── app/
│   ├── layout.tsx           # Root layout con metadata
│   ├── globals.css          # Estilos globales
│   ├── page.tsx             # Landing page
│   ├── auth/
│   │   ├── login/page.tsx   # Página de login
│   │   └── signup/page.tsx  # Página de registro
│   ├── dashboard/
│   │   └── page.tsx         # Dashboard principal
│   └── api/
│       ├── health/route.ts          # Health check
│       ├── transcribe/route.ts      # Transcripción (placeholder)
│       ├── clone-voice/route.ts     # Clonación (placeholder)
│       └── enhance-audio/route.ts   # Mejora de audio (placeholder)
├── lib/
│   ├── hooks.ts             # Custom hooks (useAuth, useProjects, useFileUpload)
│   ├── supabase-client.ts   # Placeholder Supabase
│   └── ai-services.ts       # Placeholder servicios IA
└── types/
    └── index.ts             # TypeScript definitions
```

#### 📚 Documentación Completa
- ✅ **README.md** (este archivo)
- ✅ **CONTRIBUTING.md** con guías de contribución
- ✅ **SETUP.md** con instrucciones de desarrollo
- ✅ **CHANGELOG.md** con historial de cambios
- ✅ **package.json** con todos los scripts

## 🛠️ Quick Start

### Requisitos Previos
- Node.js 18+
- npm 9+

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/KowiFabian/kowi-One-Web.git
cd kowi-One-Web

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local

# Iniciar servidor de desarrollo
npm run dev
```

Visita `http://localhost:3000` en tu navegador.

## 📝 Scripts Disponibles

```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Compilar para producción
npm run start        # Iniciar servidor de producción
npm run lint         # Ejecutar ESLint
npm run format       # Formatear código con Prettier
npm run type-check   # Verificar tipos TypeScript
```

## 🎨 Tecnología Stack

| Categoría | Tecnología |
|-----------|-----------|
| **Framework** | Next.js 14 |
| **React** | React 18.2 |
| **Lenguaje** | TypeScript 5.2 |
| **Estilos** | Tailwind CSS 3.3 |
| **Iconos** | Lucide React |
| **Linting** | ESLint 8.46 |
| **Formateo** | Prettier 3.0 |

## 🔄 Roadmap Completo

### ✅ Fase 1: Core MVP (EN DESARROLLO)
- Landing page y marketing
- Autenticación (UI lista, backend pendiente)
- Dashboard base
- Estructura de tipos TypeScript
- Placeholders para API integrations

### 📅 Fase 2: Supabase Authentication (PRÓXIMA)
- Integración Supabase Auth
- Gestión de sesiones
- Protección de rutas
- Perfiles de usuario

### 📅 Fase 3: Projects & Audio Management
- CRUD de proyectos
- Upload de archivos de audio
- Storage en Supabase
- Gestión de versiones

### 📅 Fase 4: AI Services Integration
- OpenAI Whisper (transcripción)
- ElevenLabs (clonación de voz)
- Audio enhancement
- Processing pipeline

### 📅 Fase 5: Marketplace & Monetization
- Sistema de certificación
- Marketplace de voces
- Stripe/Payment integration
- Analytics dashboard

## 🔐 Seguridad

### Características Implementadas
- ✅ Headers de seguridad en Next.js
- ✅ TypeScript strict mode
- ✅ Validación de formularios
- ✅ `.env.example` sin credenciales reales
- ✅ `.gitignore` optimizado

### Próximas Mejoras
- Rate limiting en APIs
- CSRF protection
- Input sanitization
- JWT tokens (con Supabase)

## 📊 Páginas Principales

### Landing Page (`/`)
- Hero section con CTA
- 4 features principales
- Sección "Sobre Nosotros"
- Call-to-action final
- Footer completo

### Login (`/auth/login`)
- Formulario email/password
- Opciones OAuth (Google, GitHub)
- Link a signup
- Validación en cliente

### Signup (`/auth/signup`)
- Full name input
- Email/password con validación
- Password strength indicator
- Confirmación de términos
- Link a login

### Dashboard (`/dashboard`)
- Sidebar navegable (collapse mobile)
- Tab Projects (con mock data)
- Tab Profile (edición)
- Tab Settings
- Responsive design

## 🚀 Deployment

### Vercel (Recomendado)

```bash
# 1. Push a GitHub
git push origin phase/1-core-mvp

# 2. Conectar en Vercel
# https://vercel.com/new

# 3. Configurar environment variables en Vercel Dashboard
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
OPENAI_API_KEY=your_key
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_key
```

## 📖 Documentación Adicional

- **[SETUP.md](SETUP.md)** - Guía completa de instalación y desarrollo
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Guías de contribución y estándares de código
- **[CHANGELOG.md](CHANGELOG.md)** - Historial de cambios y roadmap
- **[API Routes](SETUP.md#-api-routes)** - Documentación de endpoints

## 🤝 Contribuir

¡Queremos tu ayuda! Lee [CONTRIBUTING.md](CONTRIBUTING.md) para:

- Cómo configurar tu entorno
- Estándares de código
- Proceso de Pull Request
- Guías de commit

### Quick Contribution Guide

```bash
# 1. Crear rama de feature
git checkout -b feature/mi-feature

# 2. Hacer cambios y commit
git commit -m "feat: agregar nueva feature"

# 3. Push y crear PR
git push origin feature/mi-feature
# Crear PR en GitHub hacia phase/1-core-mvp
```

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/KowiFabian/kowi-One-Web/issues)
- **Discussions**: [GitHub Discussions](https://github.com/KowiFabian/kowi-One-Web/discussions)
- **Email**: faviangaray@gmail.com

## 📜 Licencia

Este proyecto está bajo licencia **MIT**. Ver [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) - Framework web
- [React](https://react.dev/) - Biblioteca UI
- [Tailwind CSS](https://tailwindcss.com/) - Sistema de estilos
- [TypeScript](https://www.typescriptlang.org/) - Tipado estático
- [Lucide React](https://lucide.dev/) - Iconos

## 👨‍💻 Autor

**Fabian Kowitsch** - [@KowiFabian](https://github.com/KowiFabian)

---

## 📊 Estadísticas del Proyecto

- **Versión**: 0.1.0 (MVP)
- **Estado**: En Desarrollo
- **Node**: 18+
- **Licencia**: MIT
- **Creado**: Agosto 2025

---

## 🎯 Próximos Pasos

1. ✅ Fase 1: Core MVP (Completar)
2. 🔄 Crear PR hacia `main`
3. 📋 Code review
4. 🚀 Merge y deploy preview
5. 👉 Comenzar Fase 2: Supabase Auth

---

**Hecho con ❤️ para la comunidad de creadores de contenido**

*"Tu voz digital, nuestro futuro"* 🎙️
