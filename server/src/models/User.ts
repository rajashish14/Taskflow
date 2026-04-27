import mongoose, { Document, Schema } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  picture: string
  googleId: string
  createdAt: Date
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    picture: { type: String, default: "" },
    googleId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
)

export const User = mongoose.model<IUser>("User", userSchema)
