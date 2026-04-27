import axios from "axios"

const serverUrl = import.meta.env.VITE_SERVER_URL?.trim().replace(/\/+$/, "")

const api = axios.create({
  baseURL: serverUrl ? `${serverUrl}/api` : "/api",
})

// attach stored JWT on every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// if any request comes back 401, token is expired — clear it and reload
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/"
    }
    return Promise.reject(err)
  }
)

export default api
