import { useState } from "react"
import { motion } from "framer-motion"
import { format, isToday, isTomorrow, isPast } from "date-fns"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import type { Task, TaskStatus } from "../types"
import { STATUS_CYCLE } from "../lib/utils"

const PRIORITY_STRIPE: Record<string, string> = {
  HIGH:   "#f87171",
  MEDIUM: "#f0a500",
  LOW:    "#34d399",
}

const STATUS_DOT: Record<TaskStatus, { color: string; label: string }> = {
  PENDING:     { color: "#4e4e62", label: "To Do"       },
  IN_PROGRESS: { color: "#60a5fa", label: "In Progress" },
  DONE:        { color: "#34d399", label: "Done"        },
}

function formatDue(dateStr: string) {
  const d = new Date(dateStr)
  if (isToday(d))    return { text: "Today",    urgent: true  }
  if (isTomorrow(d)) return { text: "Tomorrow", urgent: false }
  if (isPast(d))     return { text: format(d, "MMM d"), urgent: true }
  return { text: format(d, "MMM d"), urgent: false }
}

interface Props {
  task: Task
  currentUserId: string
  onStatusChange: (id: string, status: TaskStatus) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
}

export function TaskCard({ task, currentUserId, onStatusChange, onDelete, onEdit }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isOwner  = task.owner._id === currentUserId
  const isDone   = task.status === "DONE"
  const dot      = STATUS_DOT[task.status]
  const stripe   = PRIORITY_STRIPE[task.priority]
  const due      = task.dueDate ? formatDue(task.dueDate) : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className="group relative flex items-start gap-0 overflow-visible rounded-2xl"
      style={{
        background: "rgba(18,26,37,0.88)",
        border: "1px solid var(--border)",
        opacity: isDone ? 0.55 : 1,
        transition: "border-color 0.15s, box-shadow 0.15s, transform 0.15s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-hi)"
        ;(e.currentTarget as HTMLElement).style.boxShadow = "0 14px 40px rgba(0,0,0,0.28)"
        ;(e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"
        ;(e.currentTarget as HTMLElement).style.boxShadow = "none"
        ;(e.currentTarget as HTMLElement).style.transform = "translateY(0)"
      }}
    >
      {/* left priority stripe — color-codes the task at a glance */}
      <div className="w-1 self-stretch shrink-0" style={{ background: stripe }} />

      <div className="flex flex-1 items-start gap-2.5 px-3 py-3.5 sm:gap-3 sm:px-4 sm:py-4">
        {/* status toggle */}
        <motion.button
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-110"
          onClick={() => onStatusChange(task._id, STATUS_CYCLE[task.status])}
          title={`Mark as ${STATUS_DOT[STATUS_CYCLE[task.status]].label}`}
          style={{ lineHeight: 0 }}
          whileTap={{ scale: 0.92 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            {isDone ? (
              <>
                <circle cx="8" cy="8" r="7.5" fill="#34d399" fillOpacity="0.2" stroke="#34d399" strokeWidth="1" />
                <path d="M5 8l2 2 4-4" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </>
            ) : task.status === "IN_PROGRESS" ? (
              <>
                <circle cx="8" cy="8" r="7.5" fill="#60a5fa" fillOpacity="0.15" stroke="#60a5fa" strokeWidth="1" />
                <circle cx="8" cy="8" r="2.5" fill="#60a5fa" />
              </>
            ) : (
              <circle cx="8" cy="8" r="7.5" fill="none" stroke="var(--border-hi)" strokeWidth="1.5" />
            )}
          </svg>
        </motion.button>

        {/* main content */}
        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-medium leading-snug"
            style={{
              color: isDone ? "var(--text-3)" : "var(--text)",
              textDecoration: isDone ? "line-through" : "none",
            }}
          >
            {task.title}
          </p>

          {task.description && (
            <p className="mt-1 line-clamp-1 text-xs" style={{ color: "var(--text-2)" }}>
              {task.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {/* status pill */}
            <span
                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                style={{ background: "rgba(24,34,51,0.9)", color: dot.color, border: "1px solid var(--border)" }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot.color }} />
              {dot.label}
            </span>

            {/* due date */}
            {due && (
              <span
                className="rounded-full px-2 py-0.5 text-xs"
                style={{
                  background: due.urgent ? "rgba(248,113,113,0.1)" : "var(--surface-2)",
                  color: due.urgent ? "var(--red)" : "var(--text-2)",
                  border: "1px solid var(--border)",
                }}
              >
                {due.text}
              </span>
            )}

            {/* assignee avatar + name */}
            {task.assignee ? (
              <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-2)" }}>
                {task.assignee.picture ? (
                  <img src={task.assignee.picture} alt="" className="h-3.5 w-3.5 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <span
                    className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold"
                    style={{ background: "var(--amber)", color: "#0d0d10" }}
                  >
                    {task.assignee.name[0]}
                  </span>
                )}
                {task.assignee.name.split(" ")[0]}
              </span>
            ) : task.pendingAssigneeEmail ? (
              <span className="text-xs italic" style={{ color: "var(--text-3)" }}>
                {task.pendingAssigneeEmail} · invited
              </span>
            ) : null}
          </div>
        </div>

        {/* owner-only context menu */}
        {isOwner && (
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="rounded-lg p-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
              style={{ color: "var(--text-3)" }}
              aria-label="Open task actions"
            >
              <MoreHorizontal size={15} />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.14 }}
                  className="absolute right-0 top-7 z-20 min-w-[156px] rounded-xl py-1.5 shadow-2xl"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border-hi)" }}
                >
                  <button
                    onClick={() => { setMenuOpen(false); onEdit(task) }}
                    className="flex w-full items-center gap-2 whitespace-nowrap px-3.5 py-2 text-sm transition-colors"
                    style={{ color: "var(--text-2)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--text-2)")}
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(task._id) }}
                    className="flex w-full items-center gap-2 whitespace-nowrap px-3.5 py-2 text-sm transition-colors"
                    style={{ color: "var(--red)" }}
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </motion.div>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
