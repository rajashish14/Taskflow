import { Router, Response } from "express"
import { User } from "../models/User"
import { requireAuth, AuthRequest } from "../middleware/auth"

const router = Router()

// GET /api/users/search?email=foo@bar.com
router.get("/search", requireAuth, async (req, res: Response) => {
  const email = req.query.email as string

  if (!email) {
    res.status(400).json({ error: "email query param is required" })
    return
  }

  const user = await User.findOne(
    { email: email.toLowerCase() },
    { name: 1, email: 1, picture: 1 }
  )

  // return null user rather than 404 — caller decides what message to show
  res.json({ user: user ?? null })
})

export default router
