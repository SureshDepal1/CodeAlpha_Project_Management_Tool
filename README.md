# TaskFlow

TaskFlow is a focused project management workspace for teams that want their work, ownership, and momentum in one place. It combines a Kanban board, editable task details, comments, live collaboration, and notification delivery in a small full-stack application.

## Features

- Project workspace with member management and protected routes
- Kanban boards with drag-and-drop task movement
- Task detail modal with title, description, assignee, priority, due date, and comments
- JWT-authenticated REST API and Socket.io connections
- Live project rooms for task and comment updates
- Persisted notifications for assignments, comments, and project invitations
- Notification bell with unread count, dropdown history, toast alerts, and mark-all-read
- Light and dark mode with persisted preference
- Route transitions, Escape-to-close modals, friendly loading states, and a real 404 page
- Idempotent demo data seed for fast local evaluation

## Screenshots

Add product captures to this section before a portfolio or release review:

| Workspace | Project board | Task activity |
| --- | --- | --- |
| `docs/screenshots/workspace.png` | `docs/screenshots/board.png` | `docs/screenshots/task-detail.png` |

## Tech Stack

- **Client:** React 19, Vite, Tailwind CSS 4, React Router, Socket.io Client
- **Server:** Node.js, Express, MongoDB, Mongoose, Socket.io
- **Authentication:** JWT bearer tokens for REST and Socket.io handshakes
- **Hosting:** Vercel for the client, Render for the API, MongoDB Atlas for persistence

## Local Setup

### Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- MongoDB locally or a MongoDB Atlas cluster

### Install and configure

```bash
npm install
copy .env.example server\.env
copy client\.env.example client\.env
```

Set a long random `JWT_SECRET`, a reachable `MONGODB_URI`, and Gmail App Password credentials in `server/.env`. `EMAIL_USER` is the Gmail address used as the sender; `EMAIL_PASS` must be a Google App Password, never the account password. For local development, the defaults in `client/.env.example` are sufficient.

### Run

```bash
npm run dev
```

- Client: `http://localhost:5173`
- API: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

### Seed demo data

```bash
npm run seed
```

The seed is safe to run more than once. It creates three demo users, a `Northstar launch` project, three columns, tasks, and comments.

Demo login: `avery@taskflow.demo` / `Demo1234!`

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start client and API together |
| `npm run build` | Build the Vercel client |
| `npm run lint` | Run Oxlint for the client |
| `npm run seed` | Seed demo data into the configured database |
| `npm run start --workspace server` | Start the API in production mode |

## API Documentation

All routes except health, login, and registration require `Authorization: Bearer <token>`.

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account and send a verification email |
| `POST` | `/api/auth/login` | Authenticate and return a JWT |
| `GET` | `/api/auth/me` | Return the current user |
| `GET` | `/api/auth/verify-email/:token` | Confirm a one-hour email verification token |
| `POST` | `/api/auth/resend-verification` | Send a replacement verification email |

### Projects and tasks

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/projects` | List projects for the current user |
| `POST` | `/api/projects` | Create a project |
| `GET` | `/api/projects/:id` | Get a project and members |
| `POST` | `/api/projects/:id/members` | Add a project member by email |
| `GET` | `/api/projects/:projectId/tasks` | List project tasks |
| `POST` | `/api/projects/:projectId/tasks` | Create a task |
| `PATCH` | `/api/tasks/:id` | Update task details |
| `PATCH` | `/api/tasks/:id/move` | Move a task between positions |
| `GET` | `/api/tasks/:id/comments` | List task comments |
| `POST` | `/api/tasks/:id/comments` | Add a comment |
| `DELETE` | `/api/tasks/:id/comments/:commentId` | Delete your comment |

### Notifications

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/notifications` | List recent notifications and unread count |
| `PATCH` | `/api/notifications/:id/read` | Mark one notification as read |
| `PATCH` | `/api/notifications/read-all` | Mark all notifications as read |

### Socket.io

Connect with `{ auth: { token } }`. After connecting, a board emits `project:join` with its project id. The server authorizes membership before joining `project:<id>`.

Project events include `task:created`, `task:updated`, `task:moved`, `comment:created`, `comment:deleted`, and `project:member-added`. User-specific notifications arrive as `notification:new`.

## Deployment

### MongoDB Atlas

1. Create a free cluster and database user in MongoDB Atlas.
2. Add the Render outbound IP range or temporarily allow `0.0.0.0/0` during development.
3. Copy the SRV connection string into Render as `MONGODB_URI`.

### Render API

Create a Web Service from the repository. `render.yaml` is included, or use:

- Build command: `npm install`
- Start command: `npm run start --workspace server`
- Health check: `/api/health`

Set these environment variables on Render:

```text
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=<gmail-app-password>
CLIENT_URL=https://<your-vercel-domain>
```

### Vercel client

Import the repository as a Vercel project with `client` as the Root Directory. Vercel detects `client/vercel.json` for SPA fallback routing.

Set these environment variables in Vercel:

```text
VITE_API_URL=https://<your-render-service>.onrender.com/api
VITE_SOCKET_URL=https://<your-render-service>.onrender.com
```

Deploy Render first, copy its public URL into `CLIENT_URL`, then deploy Vercel and use its public URL in Render. Redeploy after changing either origin.

## Project Structure

```text
client/   React application, pages, shared components, and Vercel config
server/   Express API, models, Socket.io server, seed script, and Render config
```

## License

This project is provided for demonstration and portfolio use.
