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
            style: {
              background: "#1d1d24",
              color: "#eaeaf2",
              border: "1px solid #2c2c38",
              borderRadius: "12px",
              fontSize: "13px",
              fontFamily: "DM Sans, sans-serif",
            },
            success: { iconTheme: { primary: "#34d399", secondary: "#1d1d24" } },
            error:   { iconTheme: { primary: "#f87171", secondary: "#1d1d24" } },
          }}
        />
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}
