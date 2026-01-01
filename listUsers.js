import connectDB from './DB.js'
import User from './models/user.js'

const listUsers = async () => {
  try {
    await connectDB()
    const users = await User.find({}).select('name email role createdAt')
    console.log('Users in DB:')
    users.forEach(u => console.log(JSON.stringify(u, null, 2)))
    process.exit(0)
  } catch (err) {
    console.error('Error listing users:', err.message || err)
    process.exit(1)
  }
}

listUsers()
