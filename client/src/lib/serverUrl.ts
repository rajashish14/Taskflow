const rawServerUrl = import.meta.env.VITE_SERVER_URL?.trim()

if (!rawServerUrl) {
  throw new Error("VITE_SERVER_URL is required")
}

export const serverUrl = rawServerUrl.replace(/\/+$/, "")