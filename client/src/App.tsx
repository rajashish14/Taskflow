import { GoogleOAuthProvider } from "@react-oauth/google"
import { Toaster } from "react-hot-toast"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { LoginPage } from "./pages/LoginPage"
import { DashboardPage } from "./pages/DashboardPage"

function Routes() {
  const { user } = useAuth()
  return user ? <DashboardPage /> : <LoginPage />
}

export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()

  if (!googleClientId) {
    return (
      <div style={{ padding: 24, fontFamily: "DM Sans, sans-serif", color: "#eaeaf2", background: "#1d1d24", minHeight: "100vh" }}>
        Missing VITE_GOOGLE_CLIENT_ID in client/.env
      </div>
    )
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <Routes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 2600,
            style: {
              background: "rgba(18,26,37,0.96)",
              color: "#eef4ff",
              border: "1px solid #3b4f6f",
              borderRadius: "14px",
              fontSize: "13px",
              fontFamily: "Manrope, sans-serif",
              boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
            },
            success: { iconTheme: { primary: "#34d399", secondary: "#182233" } },
            error: { iconTheme: { primary: "#ff8c83", secondary: "#182233" } },
          }}
        />
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}
