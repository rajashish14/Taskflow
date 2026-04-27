import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Plus } from "lucide-react"
import { useTasks } from "../hooks/useTasks"
import { TaskCard } from "./TaskCard"
import { TaskForm } from "./TaskForm"
import { SkeletonCard } from "./SkeletonCard"
import type { Task, TaskStatus } from "../types"

type Tab = "all" | "mine" | "assigned"

const STATUS_GROUPS: { id: TaskStatus | "ALL"; label: string }[] = [
  { id: "ALL",         label: "All"         },
  { id: "PENDING",     label: "To Do"       },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "DONE",        label: "Done"        },
]

export function TaskBoard({ currentUserId }: { currentUserId: string }) {
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks()
  const [formOpen, setFormOpen]     = useState(false)
  const [editing, setEditing]       = useState<Task | null>(null)
  const [tab, setTab]               = useState<Tab>("all")
  const [statusFilter, setStatus]   = useState<TaskStatus | "ALL">("ALL")

  const visible = tasks.filter(t => {
    const byTab =
      tab === "all"      ? true :
      tab === "mine"     ? t.owner._id === currentUserId :
      /* assigned */       t.assignee?._id === currentUserId && t.owner._id !== currentUserId

    const byStatus = statusFilter === "ALL" || t.status === statusFilter
    return byTab && byStatus
  })

  function openEdit(task: Task) { setEditing(task); setFormOpen(true) }
  function closeForm()          { setFormOpen(false); setEditing(null) }

  async function onSubmit(data: any) {
    if (editing) await updateTask(editing._id, data)
    else         await createTask(data)
  }

  const total = tasks.length
  const open  = tasks.filter(t => t.status !== "DONE").length
  const done  = tasks.filter(t => t.status === "DONE").length

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">

        {/* page header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
              Your workspace
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-2)" }}>
              Track everything. Forget nothing.
            </p>
          </div>

          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-85"
            style={{ background: "var(--amber)", color: "#0d0d10", fontFamily: "Syne, sans-serif" }}
          >
            <Plus size={15} strokeWidth={2.5} />
            New task
          </button>
        </div>

        {/* stat pills */}
        <div className="mb-7 flex gap-3">
          {[
            { n: total, label: "total",    color: "var(--text-2)" },
            { n: open,  label: "open",     color: "var(--blue)"   },
            { n: done,  label: "done",     color: "var(--green)"  },
          ].map(({ n, label, color }) => (
            <div
              key={label}
              className="flex items-baseline gap-1.5 rounded-xl px-4 py-2.5"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <span style={{ fontFamily: "DM Mono, monospace", fontSize: "1.1rem", fontWeight: 400, color }}>
                {n}
              </span>
              <span className="text-xs" style={{ color: "var(--text-3)" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* view tabs */}
        <div className="mb-4 flex gap-1 overflow-x-auto pb-1">
          {(["all","mine","assigned"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="shrink-0 rounded-lg px-3 py-1.5 text-sm transition-colors"
              style={{
                background: tab === t ? "var(--surface-3)" : "transparent",
                color: tab === t ? "var(--text)" : "var(--text-3)",
                fontWeight: tab === t ? 500 : 400,
                border: tab === t ? "1px solid var(--border-hi)" : "1px solid transparent",
              }}
            >
              {t === "all" ? "All tasks" : t === "mine" ? "Created by me" : "Assigned to me"}
            </button>
          ))}
        </div>

        {/* status filters */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {STATUS_GROUPS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setStatus(id)}
              className="shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-all"
              style={{
                borderColor:      statusFilter === id ? "var(--amber-border)" : "var(--border)",
                background:       statusFilter === id ? "var(--amber-glow)" : "transparent",
                color:            statusFilter === id ? "var(--amber)" : "var(--text-3)",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* tasks */}
        {loading ? (
          <div className="space-y-2.5">
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : visible.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            {/* big empty-state number */}
            <p style={{ fontFamily: "Syne, sans-serif", fontSize: "5rem", fontWeight: 800, color: "var(--surface-3)", lineHeight: 1 }}>
              0
            </p>
            <p className="mt-3 text-sm font-medium" style={{ color: "var(--text-2)" }}>
              {tab === "assigned" ? "Nothing assigned to you yet" : "No tasks match this filter"}
            </p>
            {tab !== "assigned" && (
              <button
                onClick={() => setFormOpen(true)}
                className="mt-4 rounded-xl px-4 py-2 text-sm transition-opacity hover:opacity-80"
                style={{ background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)" }}
              >
                + Create one
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {visible.map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  currentUserId={currentUserId}
                  onStatusChange={(id, s) => updateTask(id, { status: s })}
                  onDelete={deleteTask}
                  onEdit={openEdit}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <TaskForm open={formOpen} onClose={closeForm} onSubmit={onSubmit} editTask={editing} />
    </>
  )
}
