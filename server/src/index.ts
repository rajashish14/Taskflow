import express from "express"
import http from "http"
import { Server as SocketServer } from "socket.io"
import mongoose from "mongoose"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import dotenv from "dotenv"
import { initSocket } from "./lib/socket"
import { verifyToken } from "./lib/jwt"
import authRoutes from "./routes/auth"
import taskRoutes from "./routes/tasks"
import userRoutes from "./routes/users"

dotenv.config()

const missingEnv = ["MONGODB_URI", "JWT_SECRET", "GOOGLE_CLIENT_ID"].filter(
  (key) => !process.env[key]?.trim()
)

if (missingEnv.length > 0) {
  console.error(`Missing required environment variable(s): ${missingEnv.join(", ")}`)
  process.exit(1)
}

const app = express()
const server = http.createServer(app)

const io = new SocketServer(server, {
  cors: {
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
  },
})

initSocket(io)

// ── middleware ────────────────────────────────────────────────────────────────

app.use(helmet())
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
  })
)
app.use(express.json())

// light rate limiting on auth endpoint to slow down credential stuffing
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 })
app.use("/api/auth", authLimiter)

// ── routes ────────────────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/users", userRoutes)

app.get("/health", (_req, res) => res.json({ ok: true }))

// ── socket.io auth ────────────────────────────────────────────────────────────

io.use((socket, next) => {
  const token = socket.handshake.auth?.token as string
  if (!token) return next(new Error("unauthorized"))

  const payload = verifyToken(token)
  if (!payload) return next(new Error("unauthorized"))

  socket.data.userId = payload.userId
  next()
})

io.on("connection", (socket) => {
  const userId = socket.data.userId as string
  socket.join(`user:${userId}`)

  socket.on("disconnect", () => {
    socket.leave(`user:${userId}`)
  })
})

// ── start ─────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT ?? 4000

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log("MongoDB connected")
    server.listen(PORT, () => console.log(`Server running on :${PORT}`))
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err)
    process.exit(1)
  })
