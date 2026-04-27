import { Request, Response, NextFunction } from "express"
import { verifyToken } from "../lib/jwt"

// extend Express's Request type so downstream handlers get proper types
export interface AuthRequest extends Request {
  user: {
    userId: string
    email: string
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token provided" })
    return
  }

  const token = header.slice(7)
  const payload = verifyToken(token)

  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" })
    return
  }

  (req as AuthRequest).user = payload
  next()
}
