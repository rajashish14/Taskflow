import mongoose, { Document, Schema, Types } from "mongoose"

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE"
export type Priority = "LOW" | "MEDIUM" | "HIGH"

export interface ITask extends Document {
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  dueDate?: Date
  owner: Types.ObjectId
  assignee?: Types.ObjectId
  // stores email for someone who hasn't created an account yet
  pendingAssigneeEmail?: string
  createdAt: Date
  updatedAt: Date
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, maxlength: 200, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "DONE"],
      default: "PENDING",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    dueDate: { type: Date },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignee: { type: Schema.Types.ObjectId, ref: "User" },
    pendingAssigneeEmail: { type: String, lowercase: true },
  },
  { timestamps: true }
)

taskSchema.index({ owner: 1 })
taskSchema.index({ assignee: 1 })
taskSchema.index({ pendingAssigneeEmail: 1 })

export const Task = mongoose.model<ITask>("Task", taskSchema)
