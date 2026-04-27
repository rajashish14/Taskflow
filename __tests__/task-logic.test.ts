import { describe, it, expect } from "vitest"

// ─── helpers (same logic as the route handlers, extracted for testability) ────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateTaskInput(input: { title?: string; priority?: string }) {
  const errors: string[] = []

  if (!input.title?.trim()) {
    errors.push("Title is required")
  } else if (input.title.length > 200) {
    errors.push("Title must be under 200 characters")
  }

  const valid = ["LOW", "MEDIUM", "HIGH"]
  if (input.priority && !valid.includes(input.priority)) {
    errors.push(`Priority must be one of: ${valid.join(", ")}`)
  }

  return { valid: errors.length === 0, errors }
}

// mirrors the assignee resolution in server/src/routes/tasks.ts
function resolveAssignee(
  assigneeEmail: string | undefined,
  currentUserEmail: string,
  existingUserId: string | null
): { assigneeId: string | null; pendingEmail: string | null; error: string | null } {
  if (!assigneeEmail) {
    return { assigneeId: null, pendingEmail: null, error: null }
  }

  if (!isValidEmail(assigneeEmail)) {
    return { assigneeId: null, pendingEmail: null, error: "Invalid assignee email" }
  }

  if (existingUserId) {
    return { assigneeId: existingUserId, pendingEmail: null, error: null }
  }

  // can't park your own email as pending — if you're logged in, you definitely have an account
  if (assigneeEmail.toLowerCase() === currentUserEmail.toLowerCase()) {
    return { assigneeId: null, pendingEmail: null, error: "No account found for that email address" }
  }

  return { assigneeId: null, pendingEmail: assigneeEmail, error: null }
}

type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE"

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  PENDING: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE: "PENDING",
}

function canView(task: { ownerId: string; assigneeId?: string | null }, userId: string) {
  return task.ownerId === userId || task.assigneeId === userId
}

function canUpdate(task: { ownerId: string; assigneeId?: string | null }, userId: string) {
  return task.ownerId === userId || task.assigneeId === userId
}

function canDelete(task: { ownerId: string }, userId: string) {
  // only owners can delete — assignees should not be able to remove tasks from someone else's board
  return task.ownerId === userId
}

// ─── email validation ─────────────────────────────────────────────────────────

describe("isValidEmail", () => {
  it("accepts well-formed addresses", () => {
    expect(isValidEmail("alice@example.com")).toBe(true)
    expect(isValidEmail("bob.smith+tag@company.co.uk")).toBe(true)
    expect(isValidEmail("user123@domain.io")).toBe(true)
  })

  it("rejects addresses missing the @ sign", () => {
    expect(isValidEmail("notanemail")).toBe(false)
    expect(isValidEmail("no-at-sign.com")).toBe(false)
  })

  it("rejects addresses with no domain part", () => {
    expect(isValidEmail("user@")).toBe(false)
    expect(isValidEmail("@nodomain.com")).toBe(false)
  })

  it("rejects addresses with spaces", () => {
    expect(isValidEmail("spaces in@email.com")).toBe(false)
  })

  it("rejects an empty string", () => {
    expect(isValidEmail("")).toBe(false)
  })
})

// ─── task input validation ────────────────────────────────────────────────────

describe("validateTaskInput", () => {
  it("fails when title is missing", () => {
    const r = validateTaskInput({ title: "" })
    expect(r.valid).toBe(false)
    expect(r.errors[0]).toMatch(/required/i)
  })

  it("fails when title is only whitespace", () => {
    expect(validateTaskInput({ title: "   " }).valid).toBe(false)
  })

  it("fails when title exceeds 200 characters", () => {
    const r = validateTaskInput({ title: "x".repeat(201) })
    expect(r.valid).toBe(false)
    expect(r.errors[0]).toMatch(/200/)
  })

  it("passes for a normal title", () => {
    expect(validateTaskInput({ title: "Fix the login bug" }).valid).toBe(true)
  })

  it("passes at exactly 200 characters", () => {
    expect(validateTaskInput({ title: "a".repeat(200) }).valid).toBe(true)
  })

  it("rejects unknown priority values", () => {
    const r = validateTaskInput({ title: "ok", priority: "URGENT" })
    expect(r.valid).toBe(false)
    expect(r.errors[0]).toMatch(/Priority/)
  })

  it("accepts all valid priorities", () => {
    for (const p of ["LOW", "MEDIUM", "HIGH"]) {
      expect(validateTaskInput({ title: "ok", priority: p }).valid).toBe(true)
    }
  })

  it("ignores priority field if not provided", () => {
    expect(validateTaskInput({ title: "ok" }).valid).toBe(true)
  })
})

// ─── assignee resolution ──────────────────────────────────────────────────────

describe("resolveAssignee", () => {
  const ME = "alice@example.com"
  const BOB_ID = "mongodb_objectid_bob_123"

  it("returns all nulls when no email is given", () => {
    expect(resolveAssignee(undefined, ME, null)).toEqual({
      assigneeId: null,
      pendingEmail: null,
      error: null,
    })
  })

  it("sets assigneeId when the user already has an account", () => {
    const r = resolveAssignee("bob@example.com", ME, BOB_ID)
    expect(r.assigneeId).toBe(BOB_ID)
    expect(r.pendingEmail).toBeNull()
    expect(r.error).toBeNull()
  })

  it("stores pending email when the assignee hasn't signed up yet", () => {
    const r = resolveAssignee("newperson@example.com", ME, null)
    expect(r.assigneeId).toBeNull()
    expect(r.pendingEmail).toBe("newperson@example.com")
    expect(r.error).toBeNull()
  })

  it("returns an error if the current user types their own email with no account found", () => {
    const r = resolveAssignee(ME, ME, null)
    expect(r.error).toBeTruthy()
    expect(r.assigneeId).toBeNull()
    expect(r.pendingEmail).toBeNull()
  })

  it("returns an error for an invalid email format", () => {
    const r = resolveAssignee("not-an-email", ME, null)
    expect(r.error).toBeTruthy()
    expect(r.assigneeId).toBeNull()
  })

  it("is case-insensitive for the self-assign check", () => {
    const r = resolveAssignee("ALICE@EXAMPLE.COM", ME, null)
    expect(r.error).toBeTruthy()
  })
})

// ─── authorization rules ──────────────────────────────────────────────────────

describe("task authorization", () => {
  const owner = "user_alice"
  const assignee = "user_bob"
  const stranger = "user_carol"

  const task = { ownerId: owner, assigneeId: assignee }
  const unassigned = { ownerId: owner, assigneeId: null }

  describe("canView", () => {
    it("allows the owner", () => expect(canView(task, owner)).toBe(true))
    it("allows the assignee", () => expect(canView(task, assignee)).toBe(true))
    it("blocks a stranger", () => expect(canView(task, stranger)).toBe(false))
    it("allows owner of an unassigned task", () => expect(canView(unassigned, owner)).toBe(true))
    it("blocks stranger on unassigned task", () => expect(canView(unassigned, stranger)).toBe(false))
  })

  describe("canUpdate", () => {
    it("allows the owner", () => expect(canUpdate(task, owner)).toBe(true))
    it("allows the assignee (to update status)", () => expect(canUpdate(task, assignee)).toBe(true))
    it("blocks a stranger", () => expect(canUpdate(task, stranger)).toBe(false))
  })

  describe("canDelete", () => {
    it("allows only the owner", () => expect(canDelete(task, owner)).toBe(true))
    it("blocks the assignee", () => expect(canDelete(task, assignee)).toBe(false))
    it("blocks a stranger", () => expect(canDelete(task, stranger)).toBe(false))
  })
})

// ─── status cycle ─────────────────────────────────────────────────────────────

describe("STATUS_CYCLE", () => {
  it("steps through the correct sequence", () => {
    expect(STATUS_CYCLE["PENDING"]).toBe("IN_PROGRESS")
    expect(STATUS_CYCLE["IN_PROGRESS"]).toBe("DONE")
    expect(STATUS_CYCLE["DONE"]).toBe("PENDING")
  })

  it("has an entry for every possible status", () => {
    const all: TaskStatus[] = ["PENDING", "IN_PROGRESS", "DONE"]
    for (const s of all) {
      expect(STATUS_CYCLE[s]).toBeDefined()
    }
  })

  it("returns to the starting status after three steps", () => {
    let s: TaskStatus = "PENDING"
    s = STATUS_CYCLE[s]
    s = STATUS_CYCLE[s]
    s = STATUS_CYCLE[s]
    expect(s).toBe("PENDING")
  })
})
