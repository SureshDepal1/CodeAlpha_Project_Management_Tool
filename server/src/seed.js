import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import Column from './models/Column.js'
import Comment from './models/Comment.js'
import Project from './models/Project.js'
import Task from './models/Task.js'
import User from './models/User.js'

dotenv.config()

const demoUsers = [
  { name: 'Avery Morgan', email: 'avery@taskflow.demo', password: 'Demo1234!', avatarColor: '#6D5EF5' },
  { name: 'Maya Chen', email: 'maya@taskflow.demo', password: 'Demo1234!', avatarColor: '#0EA5A4' },
  { name: 'Theo Brooks', email: 'theo@taskflow.demo', password: 'Demo1234!', avatarColor: '#F59E0B' },
]

const getOrCreateUser = async (details) => {
  const existing = await User.findOne({ email: details.email })
  if (existing) {
    existing.isVerified = true
    await existing.save()
    return existing
  }
  return User.create({ ...details, isVerified: true })
}

const run = async () => {
  await connectDB()
  const users = await Promise.all(demoUsers.map(getOrCreateUser))
  const [avery, maya, theo] = users
  const project = await Project.findOneAndUpdate(
    { title: 'Northstar launch' },
    {
      $set: {
        description: 'Coordinate the final launch work across product, design, and marketing.',
        owner: avery._id,
        members: [{ user: avery._id, role: 'admin' }, { user: maya._id, role: 'member' }, { user: theo._id, role: 'member' }],
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )

  const columns = {}
  for (const [title, order] of [['Backlog', 0], ['In progress', 1], ['Ready to ship', 2]]) {
    columns[title] = await Column.findOneAndUpdate({ project: project._id, title }, { $set: { order } }, { upsert: true, new: true, setDefaultsOnInsert: true })
  }

  const tasks = [
    { title: 'Polish onboarding checklist', description: 'Make the first-run checklist clear for new workspace owners.', column: columns['Backlog']._id, order: 0, priority: 'medium', assignee: maya._id },
    { title: 'Review launch metrics', description: 'Confirm the dashboard events and baseline conversion numbers.', column: columns['In progress']._id, order: 0, priority: 'high', assignee: avery._id },
    { title: 'Publish release notes', description: 'Turn the final product changes into a concise customer update.', column: columns['Ready to ship']._id, order: 0, priority: 'low', assignee: theo._id },
  ]
  const savedTasks = []
  for (const details of tasks) {
    savedTasks.push(await Task.findOneAndUpdate(
      { project: project._id, title: details.title },
      { $set: { ...details, project: project._id, createdBy: avery._id } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ))
  }

  const comments = [
    [savedTasks[0], maya, 'I will tighten the copy and add a short owner handoff note.'],
    [savedTasks[1], avery, 'The first pass is in the dashboard now.'],
    [savedTasks[2], theo, 'Draft is ready for a final review before publishing.'],
  ]
  for (const [task, author, text] of comments) {
    await Comment.findOneAndUpdate({ task: task._id, author: author._id, text }, { $setOnInsert: { task: task._id, author: author._id, text } }, { upsert: true, new: true })
  }

  console.log('Demo data ready.')
  console.log('Demo login: avery@taskflow.demo / Demo1234!')
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
}).finally(async () => {
  await mongoose.disconnect()
})
