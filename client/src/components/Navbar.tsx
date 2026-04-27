// top bar — keeps to one line, doesn't fight the content for attention
import { LogOut } from "lucide-react"
import { useAuth } from "../context/AuthContext"

export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header
      className="sticky top-0 z-40 flex h-12 items-center justify-between px-5"
      style={{
        background: "rgba(13,13,16,0.85)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex h-6 w-6 items-center justify-center rounded text-xs font-bold"
          style={{ background: "var(--amber)", color: "#0d0d10", fontFamily: "Syne, sans-serif" }}
        >
          TF
        </div>
        <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "-0.01em" }}>
          Taskflow
        </span>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="h-6 w-6 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
                style={{ background: "var(--amber)", color: "#0d0d10" }}
              >
                {user.name[0]}
              </div>
            )}
            <span className="text-sm" style={{ color: "var(--text-2)" }}>
              {user.name.split(" ")[0]}
            </span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors"
            style={{ color: "var(--text-3)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      )}
    </header>
  )
}
