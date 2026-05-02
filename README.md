# ⚡ ProjectPilot — Full-Stack Project & Task Manager

A production-ready, full-stack **Project & Task Management** web application built with **React (Vite)**, **Node.js + Express**, and **MongoDB**. Features role-based access control (Admin / Member), JWT authentication, kanban-style task boards, and a real-time dashboard.

---

## 🔐 Demo Credentials

> Register these accounts **in order** (first registered = Admin automatically).

### 👑 Admin Account
| Field    | Value                        |
|----------|------------------------------|
| Name     | `Admin User`                 |
| Email    | `admin@projectpilot.com`     |
| Password | `Admin@123`                  |
| Role     | **Admin** (full access)      |

### 👤 Member Account
| Field    | Value                        |
|----------|------------------------------|
| Name     | `Member User`                |
| Email    | `member@projectpilot.com`    |
| Password | `Member@123`                 |
| Role     | **Member** (limited access)  |

> ⚠️ **Register the Admin account first**, then the Member account. The system automatically assigns `admin` role to the very first registered user.

---

## 🚀 Features

### 🔑 Authentication
- JWT-based login & registration
- Passwords hashed with **bcrypt** (12 salt rounds)
- Token stored in `localStorage`, auto-verified on reload
- Global 401 interceptor — auto logout on expired token

### 🛡️ Role-Based Access Control (RBAC)
| Feature                    | Admin | Member       |
|----------------------------|-------|--------------|
| View Dashboard             | ✅    | ✅ (own tasks)|
| Create / Edit Projects     | ✅    | ❌           |
| Delete Projects            | ✅    | ❌           |
| Add / Remove Members       | ✅    | ❌           |
| Create / Edit / Delete Tasks | ✅  | ❌           |
| View Assigned Tasks        | ✅    | ✅           |
| Update Task Status         | ✅    | ✅ (own only)|
| Manage Users               | ✅    | ❌           |

### 📊 Dashboard
- Total Tasks, Completed, In Progress, To Do, Overdue, Projects count
- Recent 6 tasks with priority badges and due dates

### 📁 Project Management
- Create, edit, delete projects (Admin)
- Custom project colors
- Project status: `active` / `completed` / `on-hold`
- Completion progress bar
- Add / remove team members (Admin)

### ✅ Task Management
- Kanban board per project (To Do → In Progress → Completed)
- Assign tasks to project members
- Priority levels: `low` / `medium` / `high`
- Due dates with overdue highlighting
- Tags / labels support
- Members can update status of their assigned tasks

### 👥 User Management (Admin)
- View all registered users
- Change user roles (admin ↔ member)
- Delete users (cannot delete yourself)

---

## 🛠️ Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, Vite, React Router v6         |
| Styling    | Vanilla CSS (dark theme, CSS variables) |
| HTTP Client| Axios (with interceptors)               |
| State      | React Context API                       |
| Backend    | Node.js, Express.js                     |
| Database   | MongoDB, Mongoose ODM                   |
| Auth       | JWT (`jsonwebtoken`), bcryptjs          |
| Validation | express-validator                       |
| Logging    | Morgan                                  |
| Icons      | Lucide React                            |
| Toasts     | react-hot-toast                         |

---

## 📁 Project Structure

```
ETHARAAI/
├── backend/
│   ├── server.js                  # Express app entry point
│   ├── .env                       # Environment variables (not committed)
│   ├── .env.example               # Template for env vars
│   ├── package.json
│   ├── middleware/
│   │   └── auth.js                # JWT protect + adminOnly guards
│   ├── models/
│   │   ├── User.js                # User schema (bcrypt, role)
│   │   ├── Project.js             # Project schema
│   │   └── Task.js                # Task schema (indexes)
│   ├── controllers/
│   │   ├── authController.js      # register, login, getMe
│   │   ├── projectController.js   # CRUD + member management
│   │   ├── taskController.js      # CRUD + status + dashboard stats
│   │   └── userController.js      # list, role update, delete
│   └── routes/
│       ├── auth.js
│       ├── projects.js
│       ├── tasks.js
│       └── users.js
│
└── frontend/
    ├── index.html
    ├── vite.config.js             # Dev proxy → localhost:5000
    ├── .env.example
    ├── package.json
    └── src/
        ├── main.jsx               # ReactDOM + BrowserRouter + Toaster
        ├── App.jsx                # Route definitions
        ├── index.css              # Global dark theme design system
        ├── api/
        │   └── axios.js           # Axios instance + interceptors
        ├── context/
        │   └── AuthContext.jsx    # Auth state, login, logout
        ├── components/
        │   ├── Layout.jsx         # Sidebar + <Outlet />
        │   ├── Sidebar.jsx        # Navigation + user info
        │   ├── Modal.jsx          # Reusable modal dialog
        │   └── ProtectedRoute.jsx # Auth guard wrapper
        └── pages/
            ├── LoginPage.jsx       # Sign In / Sign Up tabs
            ├── DashboardPage.jsx   # Stats + recent tasks
            ├── ProjectsPage.jsx    # Project grid + CRUD modal
            ├── ProjectDetailPage.jsx # Kanban board + member management
            ├── TasksPage.jsx       # Filterable task list
            └── UsersPage.jsx       # User management table (Admin)
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/taskmanager?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`) — optional

```env
VITE_API_URL=http://localhost:5000/api
```

> If `VITE_API_URL` is not set, the Vite dev proxy handles all `/api` requests automatically.

---

## 🏃 Running Locally

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (free tier works)

### 1. Clone / Open the project
```bash
cd "c:\Users\ankit\OneDrive\Desktop\ETHARAAI"
```

### 2. Configure Backend
```bash
cd backend
```
Edit `.env` with your actual MongoDB URI and JWT secret.

### 3. Start Backend
```bash
# In terminal 1
cd backend
npm run dev
# → Server on http://localhost:5000
```

### 4. Start Frontend
```bash
# In terminal 2
cd frontend
npm run dev
# → App on http://localhost:5173
```

### 5. Register Accounts
1. Open `http://localhost:5173`
2. Click **Sign Up** → Register `admin@projectpilot.com` / `Admin@123` → becomes **Admin**
3. Log out → Sign Up → Register `member@projectpilot.com` / `Member@123` → becomes **Member**

---

## 🌐 REST API Reference

### Auth — `/api/auth`
| Method | Endpoint     | Access  | Description        |
|--------|--------------|---------|--------------------|
| POST   | `/register`  | Public  | Register new user  |
| POST   | `/login`     | Public  | Login, get JWT     |
| GET    | `/me`        | Private | Get current user   |

### Projects — `/api/projects`
| Method | Endpoint                    | Access  | Description          |
|--------|-----------------------------|---------|----------------------|
| GET    | `/`                         | Auth    | List projects        |
| GET    | `/:id`                      | Auth    | Get single project   |
| POST   | `/`                         | Admin   | Create project       |
| PUT    | `/:id`                      | Admin   | Update project       |
| DELETE | `/:id`                      | Admin   | Delete project       |
| POST   | `/:id/members`              | Admin   | Add member           |
| DELETE | `/:id/members/:userId`      | Admin   | Remove member        |

### Tasks — `/api/tasks`
| Method | Endpoint         | Access        | Description             |
|--------|------------------|---------------|-------------------------|
| GET    | `/dashboard`     | Auth          | Dashboard stats         |
| GET    | `/`              | Auth          | List tasks (filtered)   |
| GET    | `/:id`           | Auth          | Get single task         |
| POST   | `/`              | Admin         | Create task             |
| PUT    | `/:id`           | Admin         | Update task             |
| PATCH  | `/:id/status`    | Auth (own)    | Update status only      |
| DELETE | `/:id`           | Admin         | Delete task             |

### Users — `/api/users`
| Method | Endpoint         | Access  | Description          |
|--------|------------------|---------|----------------------|
| GET    | `/`              | Admin   | List all users       |
| GET    | `/:id`           | Admin   | Get single user      |
| PATCH  | `/:id/role`      | Admin   | Change user role     |
| DELETE | `/:id`           | Admin   | Delete user          |

---

## 🚢 Deployment on Railway

### Backend
1. Go to [railway.app](https://railway.app) → **New Project**
2. Add a **MongoDB** plugin (or use MongoDB Atlas URI)
3. Deploy from GitHub → select the `backend/` folder (or set root directory)
4. Set environment variables in Railway dashboard:
   ```
   MONGO_URI=<your atlas uri>
   JWT_SECRET=<strong secret>
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   CLIENT_URL=https://<your-frontend-url>
   ```
5. Railway auto-detects `npm start` from `package.json`

### Frontend
1. Add another Railway service → deploy `frontend/` folder
2. Set build command: `npm run build`
3. Set start command: `npx serve dist`
4. Add env variable:
   ```
   VITE_API_URL=https://<your-backend-railway-url>/api
   ```

---

## 🔒 Security Notes

- Passwords are never stored in plain text (bcrypt, 12 rounds)
- JWT tokens expire in 7 days
- Admin-only routes protected by `adminOnly` middleware
- Members can only access/modify their own assigned tasks
- CORS restricted to `CLIENT_URL` origin

---

## 📸 Pages Overview

| Page            | Route            | Description                              |
|-----------------|------------------|------------------------------------------|
| Login / Register | `/login`        | Tabbed auth form                         |
| Dashboard       | `/dashboard`     | Stats cards + recent task feed           |
| Projects        | `/projects`      | Project grid with color & progress       |
| Project Detail  | `/projects/:id`  | Kanban board + member panel              |
| Tasks           | `/tasks`         | Full task list with status/priority filter|
| Team            | `/users`         | Admin-only user management table         |

---

## 👨‍💻 Author

Built with ❤️ using **React + Node.js + MongoDB**

---

## 📄 License

MIT License — free to use and modify.
