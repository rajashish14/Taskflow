import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, CheckCircle2, Loader2, X } from "lucide-react"
import api from "../lib/api"
import { isValidEmail } from "../lib/utils"
import type { CreateTaskInput, Priority, Task, TaskStatus, UpdateTaskInput } from "../types"

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => Promise<unknown>
  editTask?: Task | null
}

type LookupState = "idle" | "loading" | "found" | "missing"

// shared input style — inline so we're not polluting global CSS with form-specific rules
const field = `
  width: 100%;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 9px 12px;
  font-size: 0.875rem;
  color: var(--text);
  font-family: "DM Sans", sans-serif;
  outline: none;
  transition: border-color 0.15s;
`

export function TaskForm({ open, onClose, onSubmit, editTask }: Props) {
  const [title, setTitle]             = useState("")
  const [desc, setDesc]               = useState("")
  const [priority, setPriority]       = useState<Priority>("MEDIUM")
  const [status, setStatus]           = useState<TaskStatus>("PENDING")
  const [dueDate, setDueDate]         = useState("")
  const [assigneeEmail, setEmail]     = useState("")
  const [lookup, setLookup]           = useState<LookupState>("idle")
  const [assigneeName, setAssignName] = useState("")
  const [saving, setSaving]           = useState(false)

  const titleRef = useRef<HTMLInputElement>(null)
  const timer    = useRef<ReturnType<typeof setTimeout>>()
  const isEdit   = !!editTask

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title)
      setDesc(editTask.description ?? "")
      setPriority(editTask.priority)
      setStatus(editTask.status)
      setDueDate(editTask.dueDate ? editTask.dueDate.split("T")[0] : "")
      setEmail(editTask.assignee?.email ?? editTask.pendingAssigneeEmail ?? "")
      setLookup(editTask.assignee ? "found" : "idle")
      setAssignName(editTask.assignee?.name ?? "")
    } else {
      reset()
    }
  }, [editTask, open])

  useEffect(() => { if (open) setTimeout(() => titleRef.current?.focus(), 60) }, [open])

  function reset() {
    setTitle(""); setDesc(""); setPriority("MEDIUM"); setStatus("PENDING")
    setDueDate(""); setEmail(""); setLookup("idle"); setAssignName("")
  }

  function handleEmailChange(val: string) {
    setEmail(val)
    setLookup("idle")
    clearTimeout(timer.current)
    if (!isValidEmail(val)) return
    setLookup("loading")
    timer.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/users/search?email=${encodeURIComponent(val)}`)
        if (data.user) { setLookup("found"); setAssignName(data.user.name ?? val) }
        else setLookup("missing")
      } catch { setLookup("idle") }
    }, 550)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      if (isEdit) {
        await onSubmit({ title, description: desc || undefined, priority, status, dueDate: dueDate || null } as UpdateTaskInput)
      } else {
        await onSubmit({ title, description: desc || undefined, priority, dueDate: dueDate || undefined, assigneeEmail: assigneeEmail || undefined } as CreateTaskInput)
      }
      onClose()
    } finally { setSaving(false) }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-[520px] rounded-2xl shadow-2xl"
              style={{ background: "rgba(18,26,37,0.96)", border: "1px solid var(--border-hi)" }}
              onClick={e => e.stopPropagation()}
            >
              {/* header */}
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <h2 style={{ fontFamily: "Sora, sans-serif", fontSize: "1rem", fontWeight: 700 }}>
                  {isEdit ? "Edit task" : "New task"}
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1 transition-colors"
                  style={{ color: "var(--text-3)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--text-2)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={submit} className="space-y-4 p-5">

                {/* title */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-2)" }}>
                    Title <span style={{ color: "var(--red)" }}>*</span>
                  </label>
                  <input
                    ref={titleRef}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    style={{ ...Object.fromEntries(field.trim().split(";").filter(Boolean).map(s => s.split(":").map(x => x.trim()))) } as any}
                    onFocus={e => (e.target.style.borderColor = "var(--amber)")}
                    onBlur={e  => (e.target.style.borderColor = "var(--border)")}
                    maxLength={200}
                    required
                  />
                </div>

                {/* description */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-2)" }}>
                    Description
                  </label>
                  <textarea
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder="Add context or notes..."
                    rows={3}
                    style={{
                      width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)",
                      borderRadius: "10px", padding: "9px 12px", fontSize: "0.875rem",
                      color: "var(--text)", fontFamily: "DM Sans, sans-serif",
                      outline: "none", resize: "none", transition: "border-color 0.15s",
                    } as any}
                    onFocus={e => (e.target.style.borderColor = "var(--amber)")}
                    onBlur={e  => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>

                {/* row: priority + status OR due date */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-2)" }}>Priority</label>
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value as Priority)}
                      style={{
                        width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)",
                        borderRadius: "10px", padding: "9px 12px", fontSize: "0.875rem",
                        color: "var(--text)", fontFamily: "DM Sans, sans-serif", outline: "none",
                      } as any}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>

                  {isEdit ? (
                    <div>
                      <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-2)" }}>Status</label>
                      <select
                        value={status}
                        onChange={e => setStatus(e.target.value as TaskStatus)}
                        style={{
                          width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)",
                          borderRadius: "10px", padding: "9px 12px", fontSize: "0.875rem",
                          color: "var(--text)", fontFamily: "DM Sans, sans-serif", outline: "none",
                        } as any}
                      >
                        <option value="PENDING">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-2)" }}>Due date</label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                        style={{
                          width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)",
                          borderRadius: "10px", padding: "9px 12px", fontSize: "0.875rem",
                          color: "var(--text)", fontFamily: "DM Sans, sans-serif", outline: "none",
                        } as any}
                      />
                    </div>
                  )}
                </div>

                {/* due date on edit view */}
                {isEdit && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-2)" }}>Due date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      style={{
                        width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)",
                        borderRadius: "10px", padding: "9px 12px", fontSize: "0.875rem",
                        color: "var(--text)", fontFamily: "DM Sans, sans-serif", outline: "none",
                      } as any}
                    />
                  </div>
                )}

                {/* assignee email — create only */}
                {!isEdit && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-2)" }}>
                      Assign to
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={assigneeEmail}
                        onChange={e => handleEmailChange(e.target.value)}
                        placeholder="teammate@company.com"
                        style={{
                          width: "100%", background: "var(--surface-2)", outline: "none",
                          border: `1px solid ${lookup === "found" ? "#34d399" : lookup === "missing" ? "var(--border)" : "var(--border)"}`,
                          borderRadius: "10px", padding: "9px 40px 9px 12px",
                          fontSize: "0.875rem", color: "var(--text)", fontFamily: "DM Sans, sans-serif",
                          transition: "border-color 0.15s",
                        } as any}
                        onFocus={e => (e.target.style.borderColor = lookup === "found" ? "#34d399" : "var(--amber)")}
                        onBlur={e  => (e.target.style.borderColor = lookup === "found" ? "#34d399" : "var(--border)")}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {lookup === "loading" && <Loader2 size={15} className="animate-spin" style={{ color: "var(--text-3)" }} />}
                        {lookup === "found"   && <CheckCircle2 size={15} style={{ color: "#34d399" }} />}
                        {lookup === "missing" && <AlertTriangle size={15} style={{ color: "var(--amber)" }} />}
                      </div>
                    </div>

                    <AnimatePresence>
                      {lookup === "found" && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="mt-1.5 text-xs" style={{ color: "#34d399" }}>
                          ✓ {assigneeName}
                        </motion.p>
                      )}
                      {lookup === "missing" && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="mt-1.5 text-xs" style={{ color: "var(--amber)" }}>
                          User with this email not found. The task will link when they sign up.
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* footer buttons */}
                <div
                  className="flex items-center justify-end gap-2 pt-2"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl px-4 py-2 text-sm transition-colors"
                    style={{ color: "var(--text-2)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !title.trim()}
                    className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-opacity"
                    style={{
                      background: "var(--amber)",
                      color: "#0b1018",
                      fontFamily: "Sora, sans-serif",
                      opacity: saving || !title.trim() ? 0.5 : 1,
                      cursor: saving || !title.trim() ? "not-allowed" : "pointer",
                    }}
                  >
                    {saving && <Loader2 size={13} className="animate-spin" />}
                    {isEdit ? "Save" : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
