import { useState } from "react"
import { GoogleLogin } from "@react-oauth/google"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext"

// small decorative squares scattered behind the content
const squares = [
  { size: 180, x: "8%",  y: "12%",  rotate: 14,  opacity: 0.04 },
  { size: 90,  x: "75%", y: "7%",   rotate: -8,  opacity: 0.06 },
  { size: 130, x: "85%", y: "55%",  rotate: 22,  opacity: 0.04 },
  { size: 60,  x: "15%", y: "78%",  rotate: -18, opacity: 0.07 },
  { size: 200, x: "60%", y: "80%",  rotate: 6,   opacity: 0.025 },
]

export function LoginPage() {
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)

  async function handleCredential(credential: string) {
    setLoading(true)
    try {
      await login(credential)
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "Sign-in failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{ background: "var(--bg)" }}
    >
      {/* decorative geometry in the background */}
      {squares.map((sq, i) => (
        <div
          key={i}
          className="pointer-events-none absolute border"
          style={{
            width: sq.size,
            height: sq.size,
            left: sq.x,
            top: sq.y,
            borderColor: `rgba(240,165,0,${sq.opacity})`,
            transform: `rotate(${sq.rotate}deg)`,
          }}
        />
      ))}

      {/* top-left amber dot */}
      <div
        className="pointer-events-none absolute left-1/4 top-1/4 h-64 w-64 rounded-full blur-3xl"
        style={{ background: "rgba(240,165,0,0.06)", transform: "translate(-50%,-50%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        {/* wordmark */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold"
              style={{ background: "var(--amber)", color: "#0b1018", fontFamily: "Sora, sans-serif" }}
            >
              TF
            </div>
            <span style={{ fontFamily: "Sora, sans-serif", fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Taskflow
            </span>
          </div>
          <p style={{ color: "var(--text-2)", fontSize: "0.9rem" }}>
            Assign. Track. Ship.
          </p>
        </div>

        {/* card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(18,26,37,0.9)",
            border: "1px solid var(--border)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
          }}
        >
          <h1
            className="mb-2"
            style={{ fontFamily: "Sora, sans-serif", fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            Welcome back
          </h1>
          <p className="mb-7 text-sm" style={{ color: "var(--text-2)" }}>
            Sign in with your Google account to continue.
          </p>

          {loading ? (
            <div className="flex justify-center py-2">
              <div
                className="h-5 w-5 animate-spin rounded-full border-2"
                style={{ borderColor: "var(--border)", borderTopColor: "var(--amber)" }}
              />
            </div>
          ) : (
            <GoogleLogin
              onSuccess={(r) => r.credential && handleCredential(r.credential)}
              onError={() => toast.error("Google sign-in failed")}
              theme="filled_black"
              shape="rectangular"
              size="large"
              width="300"
              text="continue_with"
            />
          )}

          {/* divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 border-t" style={{ borderColor: "var(--border)" }} />
            <span className="text-xs" style={{ color: "var(--text-3)" }}>what you get</span>
            <div className="flex-1 border-t" style={{ borderColor: "var(--border)" }} />
          </div>

          {/* feature list */}
          <ul className="space-y-2.5">
            {[
              "Personal + shared task boards",
              "Assign by email, even before they join",
              "Live updates via Socket.io",
            ].map((f, i) => (
              <motion.li
                key={f}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: 0.2 + i * 0.06 }}
                className="flex items-center gap-2.5 text-sm"
                style={{ color: "var(--text-2)" }}
              >
                <span style={{ color: "var(--amber)", fontSize: "0.7rem" }}>◆</span>
                {f}
              </motion.li>
            ))}
          </ul>
        </div>

        <p className="mt-5 text-center text-xs" style={{ color: "var(--text-3)" }}>
          No passwords. No account setup. Just Google.
        </p>
      </motion.div>
    </div>
  )
}
