---
name: docker-containers
description: "Skill para Docker — Dockerfile, docker-compose, multi-stage builds, redes, volúmenes. MODO LEARNING."
version: 1.0.0
argument-hint: [Dockerfile, compose, imagen o servicio a configurar]
allowed-tools: Read, Write, Bash, Glob, Grep
---

# Skill: Docker y Containers

Skill para containerización con Docker y Docker Compose.
**MODO LEARNING**: incluye explicaciones didácticas y comentarios educativos.

---

## Paso 0 — Verificar versiones

| Feature | Versión mínima | Estable desde |
|---------|---------------|---------------|
| Multi-stage builds | Docker 17.05 | 17.05 |
| BuildKit | Docker 18.09 | 23.0 (default) |
| `docker compose` (v2, sin guión) | Docker 20.10 | 20.10 |
| `docker-compose` (v1, legacy) | Separado | Deprecado |
| Health checks | Docker 1.12 | 1.12 |
| `.dockerignore` | Docker 1.0 | 1.0 |
| `docker init` (genera archivos) | Docker 25+ | 25.0 |
| `--mount` syntax | Docker 17.06 | 17.06 |
| Compose `watch` | Compose 2.22 | 2.22 |
| Compose `profiles` | Compose 2.1 | 2.1 |

**Verificar `docker --version` y `docker compose version` antes de recomendar features.**

**Política LTS N/N-1 (runtime + tooling):** elegir imágenes base y features de Docker/Compose compatibles con versiones LTS N o N-1 del entorno (Node, Java, Python, etc.). Si el proyecto no soporta una feature nueva, mantener variante legacy compatible y documentar el fallback.

---

## Parte 1 — Dockerfile (Node.js)

### Multi-stage build (producción)

```dockerfile
# Dockerfile

# ========== Stage 1: Build ==========
# Usa imagen con todas las herramientas de build
FROM node:20-alpine AS builder

# Directorio de trabajo dentro del container
WORKDIR /app

# Copiar SOLO archivos de dependencias primero (aprovecha cache de capas)
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para build)
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript / build del proyecto
RUN npm run build

# ========== Stage 2: Production ==========
# Imagen limpia, solo con runtime
FROM node:20-alpine AS production

# Usuario no-root por seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copiar solo package.json para instalar dependencias de producción
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar artefactos de build desde el stage anterior
COPY --from=builder /app/dist ./dist

# Cambiar a usuario no-root
USER appuser

# Puerto que expone la app
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Comando de inicio
CMD ["node", "dist/server.js"]
```

### .dockerignore

```
node_modules
dist
.git
.gitignore
*.md
.env
.env.*
docker-compose*.yml
Dockerfile
.dockerignore
coverage
.nyc_output
```

---

## Parte 2 — Dockerfile (Java / Spring Boot)

```dockerfile
# Multi-stage build para Spring Boot
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copiar Maven wrapper y pom.xml
COPY mvnw pom.xml ./
COPY .mvn .mvn

# Descargar dependencias (aprovecha cache)
RUN ./mvnw dependency:go-offline -B

# Copiar código fuente
COPY src ./src

# Build (sin tests, más rápido)
RUN ./mvnw package -DskipTests -B

# ========== Production ==========
FROM eclipse-temurin:21-jre-alpine AS production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copiar JAR desde stage de build
COPY --from=builder /app/target/*.jar app.jar

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## Parte 3 — Dockerfile (Python / FastAPI)

```dockerfile
FROM python:3.12-slim AS production

RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

# Instalar dependencias primero (cache de capas)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY app/ ./app/

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Parte 4 — Docker Compose

```yaml
# docker-compose.yml
version: '3.8'  # Opcional en Compose v2, pero explícito para claridad

services:
  # Aplicación principal
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production        # Stage específico del multi-stage
    ports:
      - "3000:3000"             # host:container
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://user:pass@db:3306/mydb
      - JWT_SECRET=${JWT_SECRET}  # Desde .env del host
    depends_on:
      db:
        condition: service_healthy  # Esperar a que DB esté sana
    restart: unless-stopped
    networks:
      - app-network

  # Base de datos
  db:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: mydb
      MYSQL_USER: user
      MYSQL_PASSWORD: pass
    volumes:
      - db-data:/var/lib/mysql     # Volumen persistente
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql  # Script de inicialización
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - app-network

  # Cache (ejemplo)
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped
    networks:
      - app-network

# Volúmenes persistentes (sobreviven a docker compose down)
volumes:
  db-data:
  redis-data:

# Red interna (los servicios se comunican por nombre: db, redis)
networks:
  app-network:
    driver: bridge
```

### Compose para desarrollo

```yaml
# docker-compose.dev.yml — override para desarrollo
version: '3.8'

services:
  app:
    build:
      target: builder            # Stage con devDependencies
    volumes:
      - .:/app                   # Hot-reload: monta código fuente
      - /app/node_modules        # Excepto node_modules (del container)
    environment:
      - NODE_ENV=development
    command: npm run dev         # Override del CMD
```

```bash
# Uso con override
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

---

## Parte 5 — Comandos esenciales

```bash
# Construir imagen
docker build -t mi-app:latest .

# Correr container
docker run -d -p 3000:3000 --name mi-app mi-app:latest

# Ver containers corriendo
docker ps

# Ver logs
docker logs -f mi-app

# Entrar al container
docker exec -it mi-app sh

# Parar y eliminar
docker stop mi-app && docker rm mi-app

# --- Docker Compose ---

# Levantar todos los servicios
docker compose up -d

# Ver logs de todos los servicios
docker compose logs -f

# Reconstruir (después de cambios en Dockerfile)
docker compose up -d --build

# Parar todo
docker compose down

# Parar y eliminar volúmenes (BORRA DATOS)
docker compose down -v

# Ver estado
docker compose ps
```

---

## Parte 6 — Buenas prácticas

### Optimización de capas (cache)

```dockerfile
# BIEN: archivos que cambian MENOS van primero
COPY package*.json ./         # Cambia poco → capa cacheada
RUN npm ci                    # Solo se re-ejecuta si package.json cambió
COPY . .                      # Cambia seguido → las capas anteriores se cachean

# MAL: todo junto (cualquier cambio invalida el cache)
COPY . .
RUN npm ci
```

### Tamaño de imagen

| Base image | Tamaño aprox. | Usar para |
|-----------|--------------|-----------|
| `node:20` | ~900 MB | Desarrollo |
| `node:20-slim` | ~200 MB | Producción (Debian minimal) |
| `node:20-alpine` | ~130 MB | Producción (Alpine Linux) |
| `python:3.12` | ~1 GB | Desarrollo |
| `python:3.12-slim` | ~150 MB | Producción |
| `eclipse-temurin:21-jre-alpine` | ~100 MB | Java producción |

---

## Reglas obligatorias

1. **Multi-stage builds** para producción. No incluir devDependencies ni código fuente en la imagen final.
2. **Usuario no-root** (`USER appuser`). Nunca correr como root en producción.
3. **`.dockerignore`** siempre presente. Excluir node_modules, .git, .env.
4. **Health checks** en Dockerfiles y Compose.
5. **Volúmenes para datos persistentes** (DB, uploads). Los datos no van en el container.
6. **Variables de entorno** para configuración. Nunca hardcodear credenciales en Dockerfile.
7. **`npm ci`** en vez de `npm install` en Docker (instalación determinística).
8. **`depends_on` con `condition: service_healthy`** para dependencias entre servicios.
9. **Alpine o slim** como base para producción.

## Checklist

- [ ] Multi-stage build implementado
- [ ] `.dockerignore` presente y completo
- [ ] Usuario no-root configurado
- [ ] Health check definido
- [ ] Volúmenes para datos persistentes
- [ ] Variables de entorno (no hardcodeadas)
- [ ] `npm ci` en vez de `npm install`
- [ ] Imagen base slim/alpine para producción
- [ ] `docker compose` con depends_on + healthcheck
