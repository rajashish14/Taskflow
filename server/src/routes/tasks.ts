import { Router, Response } from "express"
import mongoose from "mongoose"
import { Task } from "../models/Task"
import { User } from "../models/User"
import { requireAuth, AuthRequest } from "../middleware/auth"
import { emitToUser } from "../lib/socket"

const router = Router()

// populate fields we return on every task response
const POPULATE = [
  { path: "owner", select: "name email picture" },
  { path: "assignee", select: "name email picture" },
]

// GET /api/tasks — tasks you own OR are assigned to
router.get("/", requireAuth, async (req, res: Response) => {
  const { userId } = (req as AuthRequest).user

  const tasks = await Task.find({
    $or: [{ owner: userId }, { assignee: userId }],
  })
    .populate(POPULATE)
    .sort({ updatedAt: -1 })

  res.json(tasks)
})

// POST /api/tasks
router.post("/", requireAuth, async (req, res: Response) => {
  const { userId, email: currentEmail } = (req as AuthRequest).user
  const { title, description, priority, dueDate, assigneeEmail } = req.body

  if (!title?.trim()) {
    res.status(422).json({ error: "Title is required" })
    return
  }
  if (title.length > 200) {
    res.status(422).json({ error: "Title must be under 200 characters" })
    return
  }

  let assigneeId: mongoose.Types.ObjectId | undefined
  let pendingAssigneeEmail: string | undefined

  if (assigneeEmail) {
    const found = await User.findOne({ email: assigneeEmail.toLowerCase() })
    if (found) {
      assigneeId = found._id as mongoose.Types.ObjectId
    } else if (assigneeEmail.toLowerCase() === currentEmail) {
      res.status(404).json({ error: "No account found for that email address" })
      return
    } else {
      // they haven't signed up — park the email and link it on their first login
      pendingAssigneeEmail = assigneeEmail.toLowerCase()
    }
  }

  const task = await Task.create({
    title: title.trim(),
    description: description?.trim() || undefined,
    priority: priority ?? "MEDIUM",
    dueDate: dueDate ? new Date(dueDate) : undefined,
    owner: userId,
    assignee: assigneeId,
    pendingAssigneeEmail,
  })

  const populated = await task.populate(POPULATE)

  // push real-time updates via Socket.io
  emitToUser(userId, "task:created", populated)
  if (assigneeId && assigneeId.toString() !== userId) {
    emitToUser(assigneeId.toString(), "task:created", populated)
  }

  res.status(201).json(populated)
})

// PUT /api/tasks/:id
router.put("/:id", requireAuth, async (req, res: Response) => {
  const { userId } = (req as AuthRequest).user
  const task = await Task.findById(req.params.id)

  if (!task) {
    res.status(404).json({ error: "Task not found" })
    return
  }

  const isOwner = task.owner.toString() === userId
  const isAssignee = task.assignee?.toString() === userId

  if (!isOwner && !isAssignee) {
    res.status(403).json({ error: "Forbidden" })
    return
  }

  const { title, description, status, priority, dueDate } = req.body

  // assignees can only change status — everything else is owner-only
  if (status) task.status = status

  if (isOwner) {
    if (title !== undefined) {
      if (!title.trim()) {
        res.status(422).json({ error: "Title cannot be empty" })
        return
      }
      task.title = title.trim()
    }
    if (description !== undefined) task.description = description || undefined
    if (priority !== undefined) task.priority = priority
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : undefined
  }

  await task.save()
  const populated = await task.populate(POPULATE)

  emitToUser(task.owner.toString(), "task:updated", populated)
  if (task.assignee && task.assignee.toString() !== task.owner.toString()) {
    emitToUser(task.assignee.toString(), "task:updated", populated)
  }

  res.json(populated)
})

// DELETE /api/tasks/:id
router.delete("/:id", requireAuth, async (req, res: Response) => {
  const { userId } = (req as AuthRequest).user
  const task = await Task.findById(req.params.id)

  if (!task) {
    res.status(404).json({ error: "Task not found" })
    return
  }

  if (task.owner.toString() !== userId) {
    res.status(403).json({ error: "Only the owner can delete a task" })
    return
  }

  const assigneeId = task.assignee?.toString()
  await task.deleteOne()

  const deleted = { id: req.params.id }
  emitToUser(userId, "task:deleted", deleted)
  if (assigneeId && assigneeId !== userId) {
    emitToUser(assigneeId, "task:deleted", deleted)
  }

  res.status(204).send()
})

export default router
