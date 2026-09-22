# TaskFlow

TaskFlow is a full-stack project management tool starter with a React + Vite + Tailwind CSS client and a Node.js + Express + MongoDB API.

## Prerequisites

- Node.js 18+
- npm 9+
- A local MongoDB instance or MongoDB Atlas connection string

## Setup

```bash
npm install
copy .env.example server\.env
npm run dev
```

The client runs at `http://localhost:5173` and the API runs at `http://localhost:5000`.

To run the API health check, open `http://localhost:5000/api/health`.

## Project structure

```text
client/
  src/
    api/ components/ context/ hooks/ pages/
server/
  src/
    config/ controllers/ middleware/ models/ routes/
```

## Scripts

- `npm run dev` starts both workspaces.
- `npm run build` builds the client for production.
- `npm run lint` runs the client linter.
- `npm run start --workspace server` starts the API without watch mode.