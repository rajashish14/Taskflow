import { Router, Request, Response } from "express"
import { OAuth2Client } from "google-auth-library"
import { User } from "../models/User"
import { Task } from "../models/Task"
import { signToken } from "../lib/jwt"

const router = Router()
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// POST /api/auth/google
// Body: { credential: string }  — the ID token from Google Sign-In
router.post("/google", async (req: Request, res: Response) => {
  const { credential } = req.body

  if (!credential) {
    res.status(400).json({ error: "credential is required" })
    return
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    if (!payload?.email || !payload.sub) {
      res.status(400).json({ error: "Invalid Google token" })
      return
    }

    // upsert the user — on repeat sign-ins, just update name/picture in case they changed it
    const user = await User.findOneAndUpdate(
      { googleId: payload.sub },
      {
        name: payload.name ?? payload.email,
        email: payload.email,
        picture: payload.picture ?? "",
        googleId: payload.sub,
      },
      { upsert: true, new: true }
    )

    // link any tasks that were assigned to this email before they had an account
    const pending = await Task.countDocuments({ pendingAssigneeEmail: payload.email })
    if (pending > 0) {
      await Task.updateMany(
        { pendingAssigneeEmail: payload.email },
        { assignee: user._id, pendingAssigneeEmail: undefined }
      )
    }

    const token = signToken({ userId: user._id.toString(), email: user.email })
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, picture: user.picture } })
  } catch (err) {
    console.error("Google auth error:", err)
    res.status(401).json({ error: "Token verification failed" })
  }
})

export default router
