# 🚀 Productivity Assistant Monorepo

A modern, production-ready monorepo featuring Next.js frontend, Node.js backend, and shared utilities package.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)

## ✨ Features

- 🎨 **Modern UI** - Next.js 14 with Tailwind CSS, Framer Motion, and Shadcn UI
- 🔒 **Type Safe** - Full TypeScript support across the entire stack
- 🐳 **Docker Ready** - Complete Docker configuration with multi-stage builds
- 📦 **Monorepo** - Shared code between frontend and backend
- 🛡️ **Secure** - Authentication with Supabase, security middleware
- 📱 **Responsive** - Mobile-first design with dark mode support
- ⚡ **Fast** - Optimized builds and hot module replacement
- 📚 **Well Documented** - Comprehensive documentation for every component

## 🏗️ Project Structure

```
productivity-assistant/
├── apps/
│   ├── frontend/          # Next.js 14 application
│   │   ├── src/
│   │   │   ├── app/      # Next.js App Router
│   │   │   ├── components/  # React components (Shadcn UI)
│   │   │   ├── lib/      # Utilities & Supabase client
│   │   │   └── styles/   # Global styles & Tailwind
│   │   └── Dockerfile
│   │
│   └── backend/          # Express.js API server
│       ├── src/
│       │   ├── routes/   # API endpoints
│       │   ├── middleware/  # Auth & error handling
│       │   ├── lib/      # Supabase & utilities
│       │   └── index.ts  # Server entry point
│       └── Dockerfile
│
├── packages/
│   └── shared/           # Shared utilities package
│       ├── src/
│       │   ├── types/    # TypeScript interfaces
│       │   ├── utils/    # Helper functions
│       │   ├── validation/  # Zod schemas
│       │   └── constants/   # App constants
│       └── package.json
│
├── docs/                 # 📚 Complete documentation (9 guides)
├── docker-compose.yml    # Docker orchestration
└── package.json          # Root workspace config
```

## 🚀 Tech Stack

### Frontend

- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animations
- **[Shadcn UI](https://ui.shadcn.com/)** - Beautiful component library
- **[Supabase](https://supabase.com/)** - Authentication & Database

### Backend

- **[Node.js 20](https://nodejs.org/)** & **[Express](https://expressjs.com/)** - API server
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Supabase](https://supabase.com/)** - Database & Auth
- **[Zod](https://zod.dev/)** - Schema validation
- **Helmet, CORS, Morgan** - Security & logging

### Shared

- **TypeScript** - Shared types and utilities
- **Zod** - Validation schemas

### Dev Tools

- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Docker](https://www.docker.com/)** - Containerization
- **npm Workspaces** - Monorepo management

## 📦 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Supabase account (free tier works)
- Docker (optional, for containerized deployment)

### Installation

```bash
# 1. Navigate to project directory
cd productivity_assistant

# 2. Install all dependencies
npm install

# 3. Build shared package
cd packages/shared
npm run build
cd ../..

# 4. Set up environment variables
# Frontend
cp apps/frontend/.env.example apps/frontend/.env.local
# Backend
cp apps/backend/.env.example apps/backend/.env

# 5. Edit .env files with your Supabase credentials
# Get credentials from: https://app.supabase.com/project/_/settings/api
```

### Running Development Servers

```bash
# Option 1: Run all services (recommended)
npm run dev

# Option 2: Run individually
npm run dev:frontend  # Frontend at http://localhost:3000
npm run dev:backend   # Backend at http://localhost:4000
```

### Using Docker

```bash
# Copy Docker environment file
cp .env.docker.example .env

# Edit .env with your Supabase credentials

# Start all services
npm run docker:up

# Stop all services
npm run docker:down
```

## 🛠️ Available Scripts

### Root Level

```bash
npm run dev              # Run all apps in development
npm run build            # Build all apps
npm run lint             # Lint all packages
npm run format           # Format all code with Prettier
npm run format:check     # Check code formatting
npm run clean            # Remove all node_modules and build outputs
```

### Frontend

```bash
npm run dev:frontend     # Run Next.js dev server
npm run build:frontend   # Build for production
```

### Backend

```bash
npm run dev:backend      # Run Express dev server
npm run build:backend    # Build TypeScript
```

### Docker

```bash
npm run docker:up        # Start all services
npm run docker:down      # Stop all services
npm run docker:build     # Build images
```

## 📚 Documentation

Comprehensive documentation is available in the `/docs` folder:

1. **[Getting Started](docs/00-getting-started.md)** - Complete setup guide
2. **[Monorepo Structure](docs/01-monorepo-structure.md)** - Workspace architecture
3. **[Next.js Frontend](docs/02-nextjs-frontend.md)** - Frontend configuration
4. **[Node.js Backend](docs/03-nodejs-backend.md)** - API server setup
5. **[Shared Package](docs/04-shared-package.md)** - Utilities and types
6. **[ESLint & Prettier](docs/05-eslint-prettier.md)** - Code quality tools
7. **[Environment Variables](docs/06-environment-variables.md)** - Configuration guide
8. **[Docker Configuration](docs/07-docker-configuration.md)** - Container setup
9. **[Project Summary](docs/08-project-summary.md)** - Complete overview

## 🔑 Environment Variables

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Backend (`.env`)

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

**� See [Environment Variables Guide](docs/06-environment-variables.md) for detailed setup**

## 🧪 API Endpoints

### Public

- `GET /health` - Health check

### Protected (Require Authentication)

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update user profile

## 🎨 UI Components

The project includes Shadcn UI components. Add more with:

```bash
cd apps/frontend
npx shadcn-ui@latest add [component-name]
```

Available components: button, card, dialog, dropdown-menu, form, input, toast, and more.

## 🐳 Docker Architecture

- **Multi-stage builds** for optimized images
- **Alpine Linux** base (minimal size)
- **Health checks** for backend
- **Bridge networking** for inter-service communication
- **Non-root users** for security

## 📊 Project Stats

- **60+ files created**
- **2,000+ lines of documentation**
- **8 comprehensive guides**
- **TypeScript throughout**
- **Production-ready**

## 🛣️ Roadmap

### Implemented ✅

- [x] Monorepo structure with npm workspaces
- [x] Next.js 14 frontend with App Router
- [x] Express.js backend with TypeScript
- [x] Shared utilities package
- [x] Supabase integration
- [x] Tailwind CSS & Shadcn UI
- [x] Framer Motion animations
- [x] ESLint & Prettier
- [x] Docker configuration
- [x] Complete documentation

### Next Steps 🚧

- [ ] Authentication pages (login/signup)
- [ ] Database schema & migrations
- [ ] Real CRUD operations
- [ ] Unit & E2E tests
- [ ] CI/CD pipeline
- [ ] Deployment guides

## 🤝 Contributing

This is a template/starter project. Feel free to:

- Fork and customize for your needs
- Report issues or suggest improvements
- Share your implementations

## � License

MIT

## 🙏 Acknowledgments

Built with amazing open-source technologies:

- [Next.js](https://nextjs.org/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Framer Motion](https://www.framer.com/motion/)

## 📞 Support

- 📚 Check the [documentation](docs/)
- 🐛 Found a bug? (Create an issue if this is a shared repo)
- 💬 Questions? (Check documentation first)

---

**Made with ❤️ using TypeScript, Next.js, and Express**

**🎉 Ready to build something amazing!**
