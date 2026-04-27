export type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE"
export type Priority = "LOW" | "MEDIUM" | "HIGH"

export interface TaskUser {
  _id: string
  name: string
  email: string
  picture: string
}

export interface Task {
  _id: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  dueDate?: string
  owner: TaskUser
  assignee?: TaskUser
  pendingAssigneeEmail?: string
  createdAt: string
  updatedAt: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  picture: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  priority?: Priority
  dueDate?: string
  assigneeEmail?: string
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: Priority
  dueDate?: string | null
}
