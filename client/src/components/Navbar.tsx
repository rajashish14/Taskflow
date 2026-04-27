// top bar — keeps to one line, doesn't fight the content for attention
import { useEffect, useRef, useState } from "react"
import { ChevronDown, LogOut, Mail } from "lucide-react"
import { useAuth } from "../context/AuthContext"

export function Navbar() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false)
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [])

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
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="flex items-center gap-2 rounded-full border px-2 py-1.5 transition-colors"
              style={{ color: "var(--text-2)", borderColor: "var(--border)", background: "rgba(24,34,51,0.58)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(32,45,66,0.92)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(24,34,51,0.58)")}
              aria-expanded={menuOpen}
              aria-label="Open profile menu"
            >
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-7 w-7 rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
                  style={{ background: "var(--amber)", color: "#0b1018" }}
                >
                  {user.name[0]}
                </div>
              )}

              <span className="hidden text-sm font-medium sm:inline" style={{ color: "var(--text)" }}>
                {user.name.split(" ")[0]}
              </span>
              <ChevronDown size={14} style={{ color: "var(--text-3)" }} />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-12 z-50 w-[270px] rounded-2xl border p-3 shadow-2xl"
                style={{
                  borderColor: "var(--border-hi)",
                  background: "rgba(18,26,37,0.98)",
                  backdropFilter: "blur(14px)",
                }}
              >
                <div className="mb-3 flex items-center gap-3 rounded-xl border p-2.5" style={{ borderColor: "var(--border)", background: "rgba(24,34,51,0.7)" }}>
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="h-10 w-10 rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
                      style={{ background: "var(--amber)", color: "#0b1018" }}
                    >
                      {user.name[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold" style={{ color: "var(--text)" }}>
                      {user.name}
                    </p>
                    <p className="truncate text-xs" style={{ color: "var(--text-2)" }}>
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="mb-3 rounded-lg border px-2.5 py-2 text-xs" style={{ borderColor: "var(--border)", color: "var(--text-2)" }}>
                  <div className="flex items-center gap-2">
                    <Mail size={13} style={{ color: "var(--text-3)" }} />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors"
                  style={{ color: "var(--text)", borderColor: "var(--border)", background: "rgba(24,34,51,0.58)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(32,45,66,0.92)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(24,34,51,0.58)")}
                >
                  <LogOut size={13} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
