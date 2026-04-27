import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import api from "../lib/api"
import { connectSocket, disconnectSocket, getSocket } from "../lib/socket"
import type { AuthUser } from "../types"

interface AuthContextValue {
  user: AuthUser | null
  login: (credential: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem("user")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadStoredUser)

  const login = useCallback(async (credential: string) => {
    const { data } = await api.post("/auth/google", { credential })

    // persist token and user so they survive a page refresh
    localStorage.setItem("token", data.token)
    localStorage.setItem("user", JSON.stringify(data.user))

    setUser(data.user)

    // update the socket with the new token and connect
    const socket = getSocket()
    socket.auth = { token: data.token }
    connectSocket()
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    disconnectSocket()
    setUser(null)
  }, [])

  // if user was already logged in from a previous session, connect socket on mount
  if (user && typeof window !== "undefined") {
    const socket = getSocket()
    if (!socket.connected) connectSocket()
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
