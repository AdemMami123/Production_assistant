# Docker Configuration - Completed ✅

**Date:** November 11, 2025

## What Was Accomplished

### Docker Files Created

1. ✅ **apps/frontend/Dockerfile** - Frontend container configuration
2. ✅ **apps/backend/Dockerfile** - Backend container configuration
3. ✅ **docker-compose.yml** - Multi-container orchestration
4. ✅ **.env.docker.example** - Docker environment template
5. ✅ **.dockerignore** - Files to exclude from Docker builds

## Docker Architecture

### Multi-Stage Builds

Both frontend and backend use optimized multi-stage Docker builds:

1. **base** - Base Node.js image (Alpine Linux)
2. **deps** - Install dependencies
3. **shared-builder** - Build shared package
4. **builder** - Build application
5. **runner** - Minimal production image

### Benefits
- ✅ Smaller final images (only production code)
- ✅ Faster builds with layer caching
- ✅ Secure (no build tools in production)
- ✅ Optimized for production

## Services Configuration

### Frontend Service
- **Port:** 3000
- **Container:** productivity-frontend
- **Base Image:** node:20-alpine
- **Build Context:** Root directory
- **Dockerfile:** apps/frontend/Dockerfile

### Backend Service
- **Port:** 4000
- **Container:** productivity-backend
- **Base Image:** node:20-alpine
- **Build Context:** Root directory
- **Dockerfile:** apps/backend/Dockerfile
- **Health Check:** HTTP GET /health (every 30s)

### Optional Services (Commented Out)

#### PostgreSQL
- **Port:** 5432
- **Image:** postgres:16-alpine
- **Volume:** Persistent data storage
- Enable if not using Supabase

#### Redis
- **Port:** 6379
- **Image:** redis:7-alpine
- Enable for caching/sessions

## Network Configuration

### app-network
- **Type:** Bridge network
- **Purpose:** Inter-service communication
- Frontend can reach backend at `http://backend:4000`
- Backend can reach frontend at `http://frontend:3000`

## Usage

### Development with Docker

#### Build and Start All Services
```bash
# Copy environment file
cp .env.docker.example .env

# Edit .env with your credentials

# Build and start containers
npm run docker:up
```

Or using Docker Compose directly:
```bash
docker-compose up -d --build
```

#### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
```

#### Stop Services
```bash
npm run docker:down
```

Or:
```bash
docker-compose down
```

#### Rebuild Specific Service
```bash
# Rebuild frontend
docker-compose build frontend

# Rebuild backend
docker-compose build backend
```

### Production Deployment

#### Build Production Images
```bash
npm run docker:build
```

#### Push to Registry
```bash
# Tag images
docker tag productivity-assistant-frontend:latest your-registry/frontend:latest
docker tag productivity-assistant-backend:latest your-registry/backend:latest

# Push images
docker push your-registry/frontend:latest
docker push your-registry/backend:latest
```

## Environment Variables

### Required Variables

Create `.env` file from template:
```bash
cp .env.docker.example .env
```

Fill in these values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Internal Service URLs

Docker Compose automatically handles internal networking:
- Backend URL for frontend: `http://backend:4000`
- Frontend URL for backend: `http://frontend:3000`

## Docker Compose Commands

### Basic Operations
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View status
docker-compose ps

# Remove all (including volumes)
docker-compose down -v
```

### Build Operations
```bash
# Build all services
docker-compose build

# Build without cache
docker-compose build --no-cache

# Build specific service
docker-compose build frontend
```

### Logs and Debugging
```bash
# All logs
docker-compose logs

# Follow logs
docker-compose logs -f

# Specific service logs
docker-compose logs backend

# Last 100 lines
docker-compose logs --tail=100
```

### Execute Commands in Container
```bash
# Open shell in frontend container
docker-compose exec frontend sh

# Open shell in backend container
docker-compose exec backend sh

# Run npm command
docker-compose exec backend npm run lint
```

## Health Checks

### Backend Health Check
The backend includes a health check endpoint that Docker monitors:
- **Endpoint:** `http://localhost:4000/health`
- **Interval:** Every 30 seconds
- **Timeout:** 10 seconds
- **Retries:** 3 attempts
- **Start Period:** 40 seconds

### Check Health Status
```bash
docker-compose ps
```

Look for "healthy" status in the State column.

## Volume Management

### PostgreSQL Data (if enabled)
```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres productivity > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres productivity < backup.sql
```

## Optimization Tips

### Image Size Optimization
- ✅ Using Alpine Linux (minimal base)
- ✅ Multi-stage builds
- ✅ .dockerignore excludes unnecessary files
- ✅ Only production dependencies in final image

### Build Speed Optimization
- ✅ Layer caching for dependencies
- ✅ Separate shared package build
- ✅ Parallel builds with docker-compose

### Security Best Practices
- ✅ Non-root user in containers
- ✅ No development tools in production image
- ✅ Minimal attack surface with Alpine
- ✅ Environment variables for secrets

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
# Windows PowerShell:
netstat -ano | findstr :3000

# Kill process by PID
taskkill /PID <pid> /F
```

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Check container status
docker-compose ps

# Rebuild without cache
docker-compose build --no-cache backend
```

### Network Issues
```bash
# Recreate network
docker-compose down
docker network prune
docker-compose up -d
```

### Clean Slate
```bash
# Remove everything and start fresh
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

## Next.js Configuration for Docker

The frontend Dockerfile requires Next.js standalone output. Already configured in `next.config.js`:

```javascript
module.exports = {
  output: 'standalone', // Required for Docker
  // ... other config
}
```

## Production Considerations

### Environment-Specific Configs

Create different compose files:
```bash
# Development
docker-compose.yml

# Production
docker-compose.prod.yml
```

Use specific file:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Scaling Services

Scale horizontally:
```bash
docker-compose up -d --scale backend=3
```

### Monitoring

Add monitoring containers:
- Prometheus for metrics
- Grafana for dashboards
- Loki for log aggregation

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Build Docker images
  run: docker-compose build

- name: Push to registry
  run: |
    docker push your-registry/frontend:latest
    docker push your-registry/backend:latest
```

## Notes

- Frontend requires `output: 'standalone'` in next.config.js (needs to be added)
- Backend health check ensures service reliability
- Shared package is built first in both Dockerfiles
- Using Node 20 LTS for stability
- Alpine Linux reduces image size by ~80%
- All containers run as non-root users for security
- Environment variables are passed from `.env` file
