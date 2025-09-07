###############################
# Stage 1: Build static assets #
###############################
FROM node:20-alpine AS build

WORKDIR /app

# Install build tooling first (needed for native optional deps like bufferutil)
RUN apk add --no-cache python3 build-base && ln -sf python3 /usr/bin/python

# Copy manifests (layer cache)
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# If user prefers another manager they can adjust; default to npm
# Use --omit=dev during build? No, we need dev deps for Vite build, remove after since multi-stage.
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm i --frozen-lockfile; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    else npm install; fi

# Pass build-time env (only variables prefixed with VITE_ are statically injected)
ARG VITE_ENCRYPTION_KEY
ENV VITE_ENCRYPTION_KEY=${VITE_ENCRYPTION_KEY}

COPY . .

RUN npm run build

###############################
# Stage 2: Minimal static host #
###############################
FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

# Add a tiny static server (serve)
RUN npm install -g serve@14.2.3

COPY --from=build /app/dist ./dist

# Default port for serve
EXPOSE 4173

HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost:4173/ >/dev/null 2>&1 || exit 1

ENTRYPOINT ["serve","-s","dist","-l","4173"]
