# ⬡ TaskFlow — Team Task Manager

A full-stack team task management app with role-based access control, kanban boards, and real-time dashboard.

## 🚀 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router v6, Vite |
| Backend | Node.js, Express |
| Database | SQLite via Sequelize ORM |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Deployment | Railway (single service, monorepo) |

## ✨ Features

- **Authentication** — Signup/Login with JWT tokens, persistent sessions
- **Role-Based Access** — Admin (full control) vs Member (limited access)
  - First registered user is automatically Admin
- **Projects** — Create/manage projects with colors, due dates, team members
- **Kanban Board** — Visual task management: To Do → In Progress → Review → Done
- **Task Management** — Create, assign, prioritize tasks with due dates
- **Dashboard** — Stats overview: total, in-progress, overdue, completed tasks
- **Task Filters** — Filter by status, priority, overdue, or assigned to me

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── models/        # Sequelize models (User, Project, Task, ProjectMember)
│   ├── routes/        # Express route handlers
│   ├── middleware/    # JWT auth middleware
│   └── server.js      # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── pages/     # Login, Signup, Dashboard, Projects, Tasks
│   │   ├── components/# Layout, shared components
│   │   ├── context/   # Auth context
│   │   └── utils/     # Axios API instance
│   └── index.html
├── railway.toml       # Railway deployment config
└── package.json       # Root scripts
```

## 🔐 Role Permissions

| Action | Admin | Member |
|--------|-------|--------|
| Create projects | ✅ | ❌ |
| Delete projects | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| Create tasks | ✅ | ✅ (in their projects) |
| Edit tasks | ✅ | ✅ (in their projects) |
| Delete tasks | ✅ | Own tasks only |
| View all projects | ✅ | Own projects only |

## 🛠️ Local Development

### Prerequisites
- Node.js >= 18
- npm

### Setup

```bash
# Clone and enter directory
cd task-manager

# Install all dependencies
npm install --prefix backend
npm install --prefix frontend

# Create backend .env
cp .env.example backend/.env
# Edit backend/.env and set JWT_SECRET

# Start backend (port 5000)
npm run dev:backend

# Start frontend (port 5173) in another terminal
npm run dev:frontend
```

Open http://localhost:5173

## 🚂 Deploy to Railway

### Step 1: Push to GitHub

```bash
cd task-manager
git init
git add .
git commit -m "Initial commit: TaskFlow app"
git remote add origin https://github.com/YOUR_USERNAME/taskflow.git
git push -u origin main
```

### Step 2: Deploy on Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `taskflow` repository
4. Railway will auto-detect the `railway.toml` config

### Step 3: Set Environment Variables

In Railway dashboard → your service → **Variables**:

```
JWT_SECRET=<generate a strong 32+ char random string>
NODE_ENV=production
```

> **Tip:** Generate a secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Step 4: Add a Volume (Recommended for SQLite)

1. In Railway: **New** → **Volume**
2. Mount at `/app/data`
3. Add env var: `DB_PATH=/app/data/database.sqlite`

This persists your database across deployments.

### Step 5: Done! 🎉

Railway will build and deploy. Your app URL will be shown in the dashboard (e.g., `https://taskflow-production.up.railway.app`).

## 🔌 API Endpoints

### Auth
```
POST /api/auth/signup   - Register
POST /api/auth/login    - Login
GET  /api/auth/me       - Current user
GET  /api/auth/users    - List all users (authenticated)
```

### Projects
```
GET    /api/projects           - List projects
POST   /api/projects           - Create project (admin)
GET    /api/projects/:id        - Project details + tasks
PUT    /api/projects/:id        - Update project (admin)
DELETE /api/projects/:id        - Delete project (admin)
POST   /api/projects/:id/members       - Add member (admin)
DELETE /api/projects/:id/members/:uid  - Remove member (admin)
```

### Tasks
```
GET    /api/tasks              - List tasks (with filters)
POST   /api/tasks              - Create task
PUT    /api/tasks/:id          - Update task
DELETE /api/tasks/:id          - Delete task
GET    /api/tasks/stats/dashboard - Dashboard statistics
```

### Query Parameters for GET /api/tasks
- `status` — todo | in_progress | review | done
- `priority` — low | medium | high | critical
- `assigneeId` — filter by assigned user
- `projectId` — filter by project
- `overdue=true` — only overdue tasks

## 🏗️ Database Schema

```
User: id, name, email, password, role (admin/member)
Project: id, name, description, status, color, dueDate
Task: id, title, description, status, priority, dueDate, order, projectId, assigneeId, creatorId
ProjectMember: id, projectId, userId, role (owner/admin/member)
```
