# 🚀 TaskFlow — Team Task Manager (Full-Stack)

A full-stack team task management app with:
- **MongoDB Atlas** database
- **Node.js + Express** REST API
- **React** frontend
- **JWT Authentication** (Signup/Login)
- **Role-based access control** (Admin / Member)
- **Kanban board** per project
- **Dashboard** with overdue tracking

---

## ⚙️ Prerequisites

Install these first:
- [Node.js](https://nodejs.org/) (v18 or higher)
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) account

---

## 🗄️ Step 1 — Setup MongoDB Atlas

1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas) → **Sign Up free**
2. Create a **free cluster** (M0 Sandbox)
3. In **Database Access** → Add a database user (e.g. username: `taskuser`, password: `taskpass123`)
4. In **Network Access** → Click **Add IP Address** → Select **Allow Access from Anywhere** → Confirm
5. In your cluster, click **Connect** → **Connect your application** → Copy the connection string

It will look like:
```
mongodb+srv://taskuser:taskpass123@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
```

---

## 🛠️ Step 2 — Setup Backend

### Open terminal in VS Code → go to backend folder:
```bash
cd backend
```

### Install dependencies:
```bash
npm install
```

### Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

### Edit `.env` — paste your MongoDB URI:
```
PORT=5000
MONGODB_URI=mongodb+srv://taskuser:taskpass123@cluster0.abcde.mongodb.net/taskflow?retryWrites=true&w=majority
JWT_SECRET=my_super_secret_key_change_this
NODE_ENV=development
```

> ⚠️ Replace the MONGODB_URI with your actual connection string from Atlas.
> ⚠️ Add `/taskflow` before the `?` in the URI — this is the database name.

### Start backend:
```bash
npm run dev
```

You should see:
```
✅ MongoDB Atlas connected
🚀 Server running on http://localhost:5000
```

---

## 🎨 Step 3 — Setup Frontend

### Open a NEW terminal tab → go to frontend folder:
```bash
cd frontend
```

### Install dependencies:
```bash
npm install
```

### Start frontend:
```bash
npm start
```

Opens automatically at: **http://localhost:3000**

---

## 👤 Step 4 — Create Your First Account

1. Go to **http://localhost:3000**
2. Click **Sign Up**
3. Fill in your name, email, password
4. **First user automatically becomes Admin** 🎉

### To add team members:
- Login as Admin
- Go to **Team** → **+ Add Member**
- Fill in their name, email, password, role

---

## 🔑 Role Permissions

| Feature              | Admin | Member |
|---------------------|-------|--------|
| View all tasks       | ✅    | ❌ (own only) |
| Create tasks         | ✅    | ✅ (self-assign) |
| Assign to others     | ✅    | ❌ |
| Delete tasks         | ✅    | ❌ |
| Create projects      | ✅    | ❌ |
| Delete projects      | ✅    | ❌ |
| Manage team members  | ✅    | ❌ |
| Change member roles  | ✅    | ❌ |
| Update task status   | ✅    | ✅ (own tasks) |

---

## 📡 API Endpoints

```
POST   /api/auth/signup          Register new user
POST   /api/auth/login           Login
GET    /api/auth/me              Get current user

GET    /api/users                Get all users
POST   /api/users                Add member (Admin)
PUT    /api/users/:id            Update user (Admin)
DELETE /api/users/:id            Deactivate user (Admin)

GET    /api/projects             Get all projects
POST   /api/projects             Create project (Admin)
GET    /api/projects/:id         Get single project
PUT    /api/projects/:id         Update project (Admin)
DELETE /api/projects/:id         Delete project (Admin)

GET    /api/tasks                Get tasks (filtered)
GET    /api/tasks/my             Get my tasks
GET    /api/tasks/stats/dashboard Dashboard stats
POST   /api/tasks                Create task
PUT    /api/tasks/:id            Update task
DELETE /api/tasks/:id            Delete task (Admin)
```

---

## 🌐 Deploy on Railway (Mandatory)

### Backend:
1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select your repo → choose `backend` folder
4. Add environment variables (same as `.env`)
5. Railway will give you a URL like `https://taskflow-backend.railway.app`

### Frontend:
1. In `frontend/src/api/axios.js`, change `baseURL` to your Railway backend URL
2. Create another Railway service for the `frontend` folder
3. Set build command: `npm run build`, start command: `serve -s build`

---

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── models/
│   │   ├── User.js          MongoDB User schema
│   │   ├── Project.js       MongoDB Project schema
│   │   └── Task.js          MongoDB Task schema
│   ├── routes/
│   │   ├── auth.js          Login / Signup APIs
│   │   ├── users.js         User management APIs
│   │   ├── projects.js      Project CRUD APIs
│   │   └── tasks.js         Task CRUD APIs
│   ├── middleware/
│   │   └── auth.js          JWT verification + role check
│   ├── server.js            Express app entry
│   ├── .env.example         Environment variables template
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── api/
        │   └── axios.js     Axios instance with JWT
        ├── context/
        │   └── AuthContext.js  Global auth state
        ├── components/
        │   ├── UI.js        Reusable components
        │   └── Layout.js    Sidebar layout
        ├── pages/
        │   ├── AuthPage.js  Login / Signup
        │   ├── Dashboard.js Dashboard + stats
        │   ├── Projects.js  Projects list
        │   ├── ProjectDetail.js  Kanban board
        │   ├── Tasks.js     Task list with filters
        │   └── Team.js      Team management
        ├── App.js           Routes
        └── index.js         Entry point
```

---

## 🐛 Common Issues

**MongoDB connection error?**
- Check your Atlas IP Whitelist → allow 0.0.0.0/0
- Verify the URI has `/taskflow` before the `?`
- Check username/password are correct

**CORS error on frontend?**
- Make sure backend is running on port 5000
- Check `proxy` in `frontend/package.json` is `http://localhost:5000`

**Port already in use?**
- Kill the process: `npx kill-port 5000` or `npx kill-port 3000`

---

Made with ❤️ — TaskFlow
