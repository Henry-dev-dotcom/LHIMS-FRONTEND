# Frontend Production Readiness

## Goal

This stage prepares the completed live-API frontend for deployment behind a static web server.

## Added production readiness features

- Frontend version updated to `12.1.0`.
- Production environment template added: `.env.production.example`.
- Dockerfile added with a Vite build stage and Nginx runtime stage.
- Nginx SPA fallback added so browser refreshes work on nested routes.
- Static asset cache headers added for built assets.
- Production QA script added: `npm run lint:production`.

## Required production environment

```txt
VITE_API_MODE=live
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_API_TIMEOUT_MS=15000
```

## Local production-style build

```bash
cp .env.production.example .env.production
npm install
npm run lint:production
npm run build
```

## Docker build

```bash
docker build -t diagnosis-center-frontend .
docker run --rm -p 8080:80 diagnosis-center-frontend
```

Open:

```txt
http://localhost:8080
```
