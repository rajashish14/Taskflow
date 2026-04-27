import { Navbar } from "../components/Navbar"
import { TaskBoard } from "../components/TaskBoard"
import { useAuth } from "../context/AuthContext"

export function DashboardPage() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />
      <TaskBoard currentUserId={user.id} />
    </div>
  )
}
