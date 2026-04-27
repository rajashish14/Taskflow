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

  const reveal = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  }

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">

        {/* page header */}
        <motion.div
          variants={reveal}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between"
        >
          <div>
            <h1 style={{ fontSize: "1.9rem", fontWeight: 800, lineHeight: 1.1 }}>
              Project command center
            </h1>
            <p className="mt-1 text-sm sm:text-[0.95rem]" style={{ color: "var(--text-2)" }}>
              Assign work, monitor progress, and ship confidently.
            </p>
          </div>

          <button
            onClick={() => setFormOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors sm:w-auto"
            style={{
              background: "var(--amber)",
              color: "#0b1018",
              borderColor: "rgba(255,255,255,0.25)",
              fontFamily: "Sora, sans-serif",
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.05)")}
            onMouseLeave={e => (e.currentTarget.style.filter = "none")}
          >
            <Plus size={15} strokeWidth={2.5} />
            New task
          </button>
        </motion.div>

        {/* stat pills */}
        <motion.div
          variants={reveal}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {[
            { n: total, label: "total",    color: "var(--text-2)" },
            { n: open,  label: "open",     color: "var(--blue)"   },
            { n: done,  label: "done",     color: "var(--green)"  },
          ].map(({ n, label, color }) => (
            <div
              key={label}
              className="flex items-baseline justify-between gap-1.5 rounded-2xl px-4 py-3"
              style={{ background: "rgba(18,26,37,0.85)", border: "1px solid var(--border)", backdropFilter: "blur(8px)" }}
            >
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "1.2rem", fontWeight: 500, color }}>
                {n}
              </span>
              <span className="text-xs uppercase tracking-[0.08em]" style={{ color: "var(--text-3)" }}>{label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          variants={reveal}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.42, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5 rounded-2xl border p-3"
          style={{ borderColor: "var(--border)", background: "rgba(18,26,37,0.8)" }}
        >
          {/* view tabs */}
          <div className="mb-3 flex gap-1 overflow-x-auto pb-1">
            {(["all","mine","assigned"] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="shrink-0 rounded-lg px-3 py-1.5 text-sm transition-colors"
                style={{
                  background: tab === t ? "var(--surface-3)" : "transparent",
                  color: tab === t ? "var(--text)" : "var(--text-3)",
                  fontWeight: tab === t ? 600 : 500,
                  border: tab === t ? "1px solid var(--border-hi)" : "1px solid transparent",
                }}
              >
                {t === "all" ? "All tasks" : t === "mine" ? "Created by me" : "Assigned to me"}
              </button>
            ))}
          </div>

          {/* status filters */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {STATUS_GROUPS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setStatus(id)}
                className="shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition-all"
                style={{
                  borderColor: statusFilter === id ? "var(--amber-border)" : "var(--border)",
                  background: statusFilter === id ? "var(--amber-glow)" : "transparent",
                  color: statusFilter === id ? "var(--amber)" : "var(--text-3)",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* tasks */}
        {loading ? (
          <div className="space-y-2.5">
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : visible.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border py-20 text-center"
            style={{ borderColor: "var(--border)", background: "rgba(18,26,37,0.68)" }}
          >
            {/* big empty-state number */}
            <p style={{ fontSize: "4.6rem", fontWeight: 800, color: "var(--surface-3)", lineHeight: 1 }}>
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
          <motion.div
            variants={reveal}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.45, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-2"
          >
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
          </motion.div>
        )}
      </div>

      <TaskForm open={formOpen} onClose={closeForm} onSubmit={onSubmit} editTask={editing} />
    </>
  )
}
