import connectDB from './DB.js'
import User from './models/user.js'

const run = async () => {
  try{
    await connectDB()
    const email = 'admin@gmail.com'
    const u = await User.findOne({ email })
    console.log('FindOne result for', email, ':', u ? JSON.stringify(u, null, 2) : 'NOT FOUND')
    process.exit(0)
  }catch(err){
    console.error('Error:', err)
    process.exit(1)
  }
}
run()
