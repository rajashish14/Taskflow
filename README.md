# 🚀 Taskflow - Real-time Collaborative Task Manager

A full-stack MERN application for team task tracking and management with real-time updates, Google OAuth authentication, and seamless collaboration.

---

## 📋 Live Deployment

- **Client:** [https://taskflow1-weld.vercel.app/](https://taskflow1-weld.vercel.app/)
- **Server API:** [https://taskflow-production-5485.up.railway.app/](https://taskflow-production-5485.up.railway.app/)

---

## ✨ Key Features

- 🔐 **Google OAuth 2.0 Authentication** — Secure login with Google accounts
- 📝 **Task Creation & Management** — Create, update, and delete tasks with rich metadata
- 👥 **Email-based Task Assignment** — Assign tasks to team members by email address
- ⚡ **Real-time Updates** — Live synchronization across all connected clients using Socket.io
- 🎨 **Responsive UI** — Modern, mobile-friendly interface built with React and Tailwind CSS
- 📊 **Task Status Tracking** — Track tasks through Todo, In Progress, and Completed states
- 🔗 **Pending Assignee Linking** — Tasks assigned to unregistered users are linked upon their first login

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | React 18, Vite, TypeScript | Latest |
| **Styling** | Tailwind CSS, Framer Motion | Latest |
| **Backend** | Node.js, Express, TypeScript | 18+ |
| **Database** | MongoDB, Mongoose | Latest |
| **Authentication** | Google OAuth 2.0, JWT | Latest |
| **Real-time** | Socket.io | Latest |
| **Testing** | Vitest | Latest |
| **Deployment** | Vercel (Client), Railway (Server) | — |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- Google OAuth credentials ([setup guide](#environment-variables))

### Setup

```bash
# Clone the repository
git clone https://github.com/rajashish14/Taskflow.git
cd Taskflow
```

**Start the Server:**
```bash
cd server
npm install   
npm run dev             # Starts on http://localhost:4000
```

**Start the Client (new terminal):**
```bash
cd client
npm install  
npm run dev             # Starts on http://localhost:5173
```

Open your browser to `http://localhost:5173` and sign in with Google.

**Load Demo Data (optional):**
```bash
cd server && npm run seed
```
Creates two demo users (alice@example.com, bob@example.com) with sample tasks.

---

## 🔧 Environment Variables

### Server Configuration (`server/.env`)

| Variable | Example | Notes |
|---|---|---|
| `MONGODB_URI` | `mongodb://localhost:27017/collab-tasks` | Local MongoDB or MongoDB Atlas connection string |
| `JWT_SECRET` | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | Keep secure and unique |
| `GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | From [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `CLIENT_URL` | `http://localhost:5173` | Frontend URL (production: Vercel URL) |
| `PORT` | `4000` | Server port (default: 4000) |

### Client Configuration (`client/.env`)

| Variable | Notes |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Must match server's `GOOGLE_CLIENT_ID` |

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable the Google+ API
4. Create an OAuth 2.0 Client ID credential
5. Add authorized JavaScript origins:
   - Development: `http://localhost:5173`
   - Production: `https://taskflow1-weld.vercel.app`

---

## 🏗️ Architecture & Design

### Authentication Flow
- Users sign in with Google on the client side
- Google credential is validated on the server
- Server generates a JWT token and stores it in localStorage
- Subsequent API requests include the JWT in the Authorization header
- Socket.io connection is authenticated per user with their JWT

### Real-time Synchronization
- Socket.io establishes persistent connections with per-user rooms
- When a task is created, updated, or deleted, the server broadcasts updates to all connected clients
- Users in the same "room" receive live updates instantly without page refresh

### Data Model
```
User
├─ _id (ObjectId)
├─ email (unique)
├─ name
└─ tasks (reference array)

Task
├─ _id (ObjectId)
├─ title
├─ description
├─ status (Todo | In Progress | Completed)
├─ owner (User reference)
├─ assignee (User reference)
├─ pendingAssigneeEmail (for unregistered users)
└─ createdAt / updatedAt (timestamps)
```

### Permission Model
- **Task Owners:** Can edit task details, reassign, or delete
- **Assignees:** Can update task status
- **Public:** Cannot access private tasks (403 Forbidden)

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/google` — Exchange Google token for JWT

### Users
- `GET /api/users/:id` — Fetch user profile
- `GET /api/users` — List all users

### Tasks
- `GET /api/tasks` — Fetch all tasks for authenticated user
- `POST /api/tasks` — Create a new task
- `PUT /api/tasks/:id` — Update task (owner only)
- `DELETE /api/tasks/:id` — Delete task (owner only)
- `PATCH /api/tasks/:id/status` — Update task status (assignee or owner)

---

## 🧪 Testing

Run the test suite:
```bash
npm test
```

The project includes **33 tests** covering:
- Input validation and sanitization
- Permission rules enforcement
- Pending assignee linking logic
- Task status transitions
- JWT verification

---

## 🌍 Deployment

### Server Deployment (Railway)

1. Sign in to [Railway](https://railway.app/)
2. Create a new project → Deploy from GitHub
3. Select the repository and set **Root Directory** to `server/`
4. Add MongoDB addon or use MongoDB Atlas URI
5. Configure environment variables in the Railway dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `CLIENT_URL` (your Vercel client URL)
   - `PORT` (Railway sets this, but include for clarity)
6. Deploy — Railway runs `npm start` automatically

### Client Deployment (Vercel)

1. Sign in to [Vercel](https://vercel.com/)
2. Import your GitHub repository
3. Set **Root Directory** to `client/`
4. Add environment variables:
   - `VITE_GOOGLE_CLIENT_ID` (same as server)
5. Deploy — Vercel auto-detects Vite and builds
6. Update Google OAuth origins to include your Vercel URL

---

## 🐛 Design Decisions & Problem-Solving

### Issue 1: Google Sign-in `origin_mismatch` Error
**Problem:** Google OAuth kept rejecting requests with 403 error.  
**Solution:** Locked development to a single origin (`localhost:5173`) and registered it in Google Cloud Console OAuth settings. Production uses the Vercel URL.

### Issue 2: Google Button Width Error
**Problem:** The Google button logged `"Provided button width is invalid: 100%"` and failed to render.  
**Solution:** The `@react-oauth/google` library requires pixel-string widths (e.g., `"320"`), not percentages. Changed the width prop accordingly.

### Issue 3: JWT Secret Not Found at Runtime
**Problem:** `secretOrPrivateKey must have a value` during login.  
**Solution:** Moved JWT secret lookup from module-load time to call time and added startup validation to ensure all required environment variables are present before the server starts.

### Issue 4: Socket.io Listener Conflicts
**Problem:** Using `socket.removeAllListeners()` broke other components sharing the same socket instance.  
**Solution:** Changed to targeted `socket.off("event-name")` calls to remove only specific listeners without affecting the rest of the application.

---

## 📈 Scalability & Future Enhancements

### Current Limitations
- ❌ JWT stored in localStorage (XSS risk) → Should move to HttpOnly cookies
- ❌ No pagination (all tasks fetched at once) → Implement cursor-based pagination
- ❌ No rate limiting on task operations → Add rate limiter middleware
- ❌ Single-server Socket.io setup → Use Redis adapter for horizontal scaling
- ❌ No optimistic rollback on failures → Implement proper error recovery UI
- ❌ No email notifications → Integrate Resend or SendGrid
- ❌ No task comments → Add nested comments for collaboration
- ❌ No full-text search → Add MongoDB text index and search endpoint

---

## 📂 Project Structure

```
taskflow/
├── server/                    # Node.js Express backend
│   ├── src/
│   │   ├── index.ts          # Server entry point
│   │   ├── models/           # MongoDB schemas (User, Task)
│   │   ├── routes/           # API endpoints (auth, tasks, users)
│   │   ├── middleware/       # Authentication & validation
│   │   └── lib/              # Utilities (JWT, Socket.io, database seeding)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                  # Server environment variables
│
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── main.tsx          # React entry point
│   │   ├── App.tsx           # Main app component
│   │   ├── components/       # React components (TaskBoard, TaskCard, etc.)
│   │   ├── pages/            # Page components (LoginPage, DashboardPage)
│   │   ├── context/          # Auth context provider
│   │   ├── hooks/            # Custom hooks (useTasks)
│   │   ├── lib/              # Utilities (API calls, Socket.io client)
│   │   ├── types/            # TypeScript type definitions
│   │   └── index.css         # Global styles + Tailwind
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts        # Vite configuration
│   ├── tailwind.config.js    # Tailwind CSS config
│   └── .env                  # Client environment variables
│
├── __tests__/                # Test suite
│   └── task-logic.test.ts    # 33 comprehensive tests
│
├── package.json              # Root package (optional workspace config)
├── vitest.config.ts          # Test runner configuration
└── README.md                 # This file
```

---

## 🔐 Security Considerations

1. **JWT Tokens** — Currently stored in localStorage; consider HttpOnly cookies for production
2. **CORS** — Configured to accept requests only from authorized origins
3. **Input Validation** — All user inputs are validated and sanitized
4. **Permission Checks** — API enforces role-based access control
5. **MongoDB Injection** — Mongoose prevents injection attacks through schema validation
6. **Rate Limiting** — Implemented on authentication routes

---

## 🤝 How to Contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is open-source and available under the MIT License.

---

## 👤 Author

**Aashish Ranjan**  
- GitHub: [@rajashish14](https://github.com/rajashish14)

---

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Known Limitations](#-scalability--future-enhancements) section
2. Review environment variable setup in the [Environment Variables](#-environment-variables) section
3. Ensure Node.js 18+ and MongoDB are properly installed
4. Check server and client logs for detailed error messages

---

**Last Updated:** April 2026  
**Version:** 1.0.0
