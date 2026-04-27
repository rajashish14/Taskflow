import mongoose from "mongoose"
import dotenv from "dotenv"
import { User } from "../models/User"
import { Task } from "../models/Task"

dotenv.config()

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI!)
  console.log("Connected to MongoDB")

  await User.deleteMany({})
  await Task.deleteMany({})

  const alice = await User.create({
    name: "Alice Chen",
    email: "alice@example.com",
    picture: "https://api.dicebear.com/8.x/avataaars/svg?seed=alice",
    googleId: "seed_google_alice",
  })

  const bob = await User.create({
    name: "Bob Sharma",
    email: "bob@example.com",
    picture: "https://api.dicebear.com/8.x/avataaars/svg?seed=bob",
    googleId: "seed_google_bob",
  })

  await Task.insertMany([
    {
      title: "Set up CI/CD pipeline",
      description: "GitHub Actions for test + deploy to Railway",
      status: "IN_PROGRESS",
      priority: "HIGH",
      owner: alice._id,
      assignee: alice._id,
    },
    {
      title: "Design system audit",
      description: "Review spacing and color tokens for consistency",
      status: "PENDING",
      priority: "MEDIUM",
      owner: alice._id,
      assignee: bob._id,
    },
    {
      title: "Write API documentation",
      status: "PENDING",
      priority: "LOW",
      owner: bob._id,
      assignee: bob._id,
    },
    {
      title: "Fix mobile nav overflow",
      description: "Breaks at 375px viewport, probably the logo width",
      status: "DONE",
      priority: "HIGH",
      owner: bob._id,
      assignee: alice._id,
    },
  ])

  console.log("Seeded 2 users and 4 tasks")
  await mongoose.disconnect()
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
