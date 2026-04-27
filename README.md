# Taskflow - Real-time Collaborative Task Manager

Taskflow is a full-stack MERN project for team task tracking. You can create tasks, assign by email, and see live updates through Socket.io.

Live demo: https://taskflow-demo.up.railway.app (replace with your deployed URL)

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + Framer Motion |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB + Mongoose |
| Auth | Google OAuth 2.0 + JWT |
| Real-time | Socket.io |
| Deployment | Railway (server + MongoDB) + Vercel (client) |

---

## Quick start

**Prerequisites:** Node.js 18+, MongoDB running locally (or a MongoDB Atlas URI)

```bash
git clone https://github.com/your-username/collab-tasks
cd collab-tasks
```

**Server:**
```bash
cd server
npm install   
npm run dev             # starts on :4000
```

**Client (new terminal):**
```bash
cd client
npm install  
npm run dev             # starts on :5173
```

Open `http://localhost:5173` and sign in with Google.

**Seed demo data (optional):**
```bash
cd server && npm run seed
```
Creates two users (alice@example.com, bob@example.com) with 4 sample tasks.

If Node and MongoDB are already installed, setup usually takes a few minutes.

---

## Environment variables

### server/.env

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | `mongodb://localhost:27017/collab-tasks` locally, or your Atlas URI |
| `JWT_SECRET` | Run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `GOOGLE_CLIENT_ID` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth 2.0 Client |
| `CLIENT_URL` | `http://localhost:5173` locally, your Vercel URL in production |
| `PORT` | `4000` (default) |

### client/.env

| Variable | Note |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Same value as `GOOGLE_CLIENT_ID` in server |

**Google OAuth setup:** In the Google Cloud Console, add these to your OAuth 2.0 client:
- Authorised JavaScript origins: `http://localhost:5173`
- No redirect URIs needed — we use the popup flow (credential callback)

---

## Design notes

- Google login is handled on the client, verified on the server, then exchanged for app JWTs.
- JWT is currently stored in localStorage for simplicity. For production, HttpOnly cookies would be safer.
- Socket.io is used for real-time updates and per-user rooms.
- If a task is assigned to an email that has not signed up yet, we keep it in `pendingAssigneeEmail` and link it on that user's first login.
- Assignees can update status, while owners control task details.

---

## Problems I hit and how I fixed them

1. Google sign-in kept failing with `origin_mismatch` (403).
I fixed it by locking dev to one origin (`localhost:5173`) and adding that exact origin in Google Cloud OAuth settings.

2. The Google button logged `Provided button width is invalid: 100%`.
The library expects a pixel value string, so I changed it to `"320"`.

3. Login was failing on the server with `secretOrPrivateKey must have a value`.
`JWT_SECRET` was being read too early during module load. I changed JWT secret lookup to happen at call time and added startup checks for required env vars.

---

## One decision I changed mid-way

I first used `socket.removeAllListeners()` in task hook cleanup.
I changed it to targeted `socket.off("event")` calls.
Reason: this app has shared socket usage, and removing all listeners can break other components.

---

## Running tests

```bash
# from the repo root
npm test
```

There are 33 tests.
They run without DB/server setup and cover input validation, permission rules, pending-assignee linking, and status changes.

---

## Deployment (Railway + Vercel)

**Server on Railway:**
1. New project → Deploy from GitHub → select `server/` as root
2. Add MongoDB plugin (or use Atlas and paste the URI)
3. Set all environment variables in the Railway dashboard
4. Railway auto-runs `npm start` → `node dist/index.js`

**Client on Vercel:**
1. New project → import repo → set **Root Directory** to `client/`
2. Add `VITE_GOOGLE_CLIENT_ID` in environment variables
3. Vercel detects Vite automatically

**Google Console:**
Add your production URLs to the OAuth client's authorized origins before going live.

---

## Known limitations / what I'd do next

- **JWT storage** — move to HttpOnly cookie to eliminate XSS token theft risk
- **Pagination** — tasks are fetched all at once; need cursor-based pagination past ~200 tasks
- **Rate limiting** — currently only on `/api/auth`; should cover task creation too
- **Socket.io multi-instance** — the current setup works on a single server process. Scaling horizontally would need a Redis adapter (`@socket.io/redis-adapter`)
- **Optimistic rollback** — if a status update fails, the UI doesn't roll back the change. Worth handling properly
- **Email notifications** — notify assignees when a task lands on their board (Resend is a good fit)
- **Task comments** — natural next feature for a collaboration tool
- **Search** — MongoDB text index on `title` + `description`
