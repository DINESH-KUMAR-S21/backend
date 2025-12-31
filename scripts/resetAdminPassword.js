import connectDB from '../DB.js'
import User from '../models/user.js'
import bcrypt from 'bcryptjs'

const run = async () => {
  try {
    await connectDB()
    const email = 'admin@gmail.com'
    const user = await User.findOne({ email })
    if (!user) {
      console.error('Admin user not found')
      process.exit(1)
    }
    const hash = await bcrypt.hash('Admin@123', 10)
    user.password = hash
    await user.save()
    console.log('Admin password reset successful')
    process.exit(0)
  } catch (err) {
    console.error('Error resetting admin password:', err)
    process.exit(1)
  }
}

run()
