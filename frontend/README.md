# Frontend — Acompanhamento de Estágio

Frontend em React, TypeScript, Vite e Tailwind CSS.

## Requisitos

- Node.js 22
- npm

## Desenvolvimento local

```bash
npm install
npm run dev
```

O Vite encaminha requisições iniciadas com `/api` para `http://localhost:8000`.
Para usar outro endereço:

```bash
VITE_API_PROXY_TARGET=http://outro-host:8000 npm run dev
```

## Verificações

```bash
npm run lint
npm run build
```

## Docker

```bash
docker build -t internship-monitoring-frontend .
docker run --rm -p 5173:5173 internship-monitoring-frontend
```

Dentro do Docker, o proxy usa `http://backend:8000` por padrão.
