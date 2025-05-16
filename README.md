# TaskBoard Pro

A modern project collaboration platform for teams to manage projects, tasks, and workflow automations.

---

## Features

- Google OAuth and email/password login
- Create projects, invite users by email, only members can access/modify
- Create tasks (title, description, due date, assignee), move tasks across statuses (Kanban), assign tasks
- Custom statuses per project (default: To Do, In Progress, Done)
- Workflow automation:
  - When a task is moved to 'Done', assign a badge
  - When a task is assigned to user X, move to 'In Progress'
  - When a due date passes, send a notification
- Commenting on tasks
- User badges for completed tasks
- Responsive, modern UI

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas or local MongoDB
- Firebase project (for Google OAuth)

### Setup

1. Clone the repo:
   ```
   git clone https://github.com/aboro-code/taskboard-pro.git
   cd taskboard-pro
   ```

2. Backend:
   - `cd backend`
   - Copy `.env.example` to `.env` and fill in your MongoDB URI and JWT secret
   - Place your Firebase service account key as `serviceAccountKey.json`
   - Install dependencies: `npm install`
   - Start server: `npm run run`

3. Frontend:
   - `cd frontend`
   - Install dependencies: `npm install`
   - Start dev server: `npm run dev`
   - Visit [http://localhost:5173](http://localhost:5173)

---

## Dependencies to Install

### Backend (`/backend`)

Run this in your `/backend` directory:
```
npm install express mongoose jsonwebtoken firebase-admin
```

### Frontend (`/frontend`)

Run this in your `/frontend` directory:
```
npm install react react-dom axios react-router-dom
```

---

## API Endpoints

- `POST /api/auth/signup` - Sign up with email/password
- `POST /api/auth/signin` - Sign in with email/password
- `POST /api/auth/google` - Google OAuth login
- `GET /api/projects` - List projects for user
- `POST /api/projects` - Create project
- `POST /api/projects/:id/invite` - Invite user by email
- `GET /api/projects/:id` - Get project details
- `DELETE /api/projects/:id` - Delete project (owner only)
- `GET /api/tasks/project/:projectId` - List tasks for project
- `POST /api/tasks/project/:projectId` - Create task
- `PUT /api/tasks/:id` - Update/move task
- `DELETE /api/tasks/:id` - Delete task (owner only)
- `POST /api/automations/project/:projectId` - Create automation
- `GET /api/automations/project/:projectId` - List automations
- `POST /api/automations/check-due-dates` - Trigger due date notifications
- `GET /api/automations/notifications` - Get notifications for user
- `POST /api/automations/task/:taskId/comment` - Add comment to task
- `GET /api/automations/task/:taskId/comments` - Get comments for task

---

## Database Schema

- **User:** `{ name, email, passwordHash, badges: [String] }`
- **Project:** `{ title, description, owner, members: [User], statuses: [String] }`
- **Task:** `{ title, description, dueDate, status, assignee, project, comments: [{ user, text, createdAt }] }`
- **Automation:** `{ project, trigger, condition, action, createdBy }`
- **Notification:** `{ user, message, createdAt }`

---

## Automation Logic

Automations are stored in the `Automation` collection.

**Assign badge when task is moved to Done:**
```json
{
  "trigger": "status_change",
  "condition": { "to": "Done" },
  "action": { "type": "assign_badge", "badge": "Completed Task" }
}
```

**Move to In Progress when assigned to user X:**
```json
{
  "trigger": "assignment",
  "condition": { "user": "USER_ID" },
  "action": { "type": "move_status", "status": "In Progress" }
}
```

**Send notification when due date passes:**
```json
{
  "trigger": "due_date_passed",
  "action": { "type": "send_notification" }
}
```

---

## Security & Best Practices

- All sensitive files (e.g., `.env`, `serviceAccountKey.json`) are in `.gitignore`.
- JWT secret and MongoDB URI are never committed.
- Clean code, clear separation of backend and frontend.

---

## Author

Arnab Boro
