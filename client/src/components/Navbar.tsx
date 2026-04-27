// top bar — keeps to one line, doesn't fight the content for attention
import { LogOut } from "lucide-react"
import { useAuth } from "../context/AuthContext"

export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: "rgba(9,17,29,0.84)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(14px)",
      }}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-bold"
            style={{ background: "var(--amber)", color: "#0b1018", fontFamily: "Sora, sans-serif" }}
          >
            TF
          </div>
          <div>
            <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "1rem" }}>
              Taskflow
            </span>
            <p className="hidden text-[11px] sm:block" style={{ color: "var(--text-3)" }}>
              Team workspace
            </p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full border px-2.5 py-1 sm:flex" style={{ borderColor: "var(--border)", background: "rgba(24,34,51,0.65)" }}>
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
                  style={{ background: "var(--amber)", color: "#0b1018" }}
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
              className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
              style={{ color: "var(--text-2)", borderColor: "var(--border)", background: "rgba(24,34,51,0.45)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(32,45,66,0.9)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(24,34,51,0.45)")}
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
