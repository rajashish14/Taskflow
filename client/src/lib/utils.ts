import type { Priority, TaskStatus } from "../types"

export function cn(...parts: (string | false | undefined | null)[]): string {
  return parts.filter(Boolean).join(" ")
}

export const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  PENDING:     "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE:        "PENDING",
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW:    "Low",
  MEDIUM: "Medium",
  HIGH:   "High",
}

// used in tests and in the assignee lookup debounce
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// CSS variable references for amber accent — keeps components consistent
export const AMBER = {
  glow:   "var(--amber-glow)",
  border: "var(--amber-border)",
  solid:  "var(--amber)",
}
