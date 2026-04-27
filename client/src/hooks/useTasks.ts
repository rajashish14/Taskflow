import { useState, useEffect, useCallback } from "react"
import toast from "react-hot-toast"
import api from "../lib/api"
import { getSocket } from "../lib/socket"
import type { Task, CreateTaskInput, UpdateTaskInput } from "../types"

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  // initial fetch
  useEffect(() => {
    api
      .get<Task[]>("/tasks")
      .then(({ data }) => setTasks(data))
      .catch(() => toast.error("Failed to load tasks"))
      .finally(() => setLoading(false))
  }, [])

  // real-time updates via Socket.io
  useEffect(() => {
    const socket = getSocket()

    socket.on("task:created", (task: Task) => {
      setTasks((prev) => {
        // guard against duplicate if we already added it optimistically
        if (prev.find((t) => t._id === task._id)) return prev
        return [task, ...prev]
      })
    })

    socket.on("task:updated", (task: Task) => {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)))
    })

    socket.on("task:deleted", ({ id }: { id: string }) => {
      setTasks((prev) => prev.filter((t) => t._id !== id))
    })

    return () => {
      socket.off("task:created")
      socket.off("task:updated")
      socket.off("task:deleted")
    }
  }, [])

  const createTask = useCallback(async (input: CreateTaskInput) => {
    try {
      const { data } = await api.post<Task>("/tasks", input)
      // optimistic add before server socket event fires
      setTasks((prev) => {
        if (prev.find((t) => t._id === data._id)) return prev
        return [data, ...prev]
      })
      toast.success("Task created")
      return data
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Failed to create task")
      return null
    }
  }, [])

  const updateTask = useCallback(async (id: string, input: UpdateTaskInput) => {
    // optimistic update so the UI feels instant
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, ...input } : t))
    )

    try {
      const { data } = await api.put<Task>(`/tasks/${id}`, input)
      // replace with the server's response (has correct timestamps)
      setTasks((prev) => prev.map((t) => (t._id === id ? data : t)))
      return data
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Failed to update task")
      return null
    }
  }, [])

  const deleteTask = useCallback(async (id: string) => {
    // optimistic remove
    setTasks((prev) => prev.filter((t) => t._id !== id))

    try {
      await api.delete(`/tasks/${id}`)
      toast.success("Task deleted")
      return true
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? "Failed to delete task")
      return false
    }
  }, [])

  return { tasks, loading, createTask, updateTask, deleteTask }
}
