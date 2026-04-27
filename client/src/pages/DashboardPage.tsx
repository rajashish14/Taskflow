import { Navbar } from "../components/Navbar"
import { TaskBoard } from "../components/TaskBoard"
import { useAuth } from "../context/AuthContext"

export function DashboardPage() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "transparent" }}>
      <div className="pointer-events-none absolute -left-20 top-16 h-72 w-72 rounded-full blur-3xl" style={{ background: "rgba(124,179,255,0.1)" }} />
      <div className="pointer-events-none absolute -right-16 bottom-6 h-72 w-72 rounded-full blur-3xl" style={{ background: "rgba(247,180,65,0.08)" }} />
      <Navbar />
      <TaskBoard currentUserId={user.id} />
    </div>
  )
}
