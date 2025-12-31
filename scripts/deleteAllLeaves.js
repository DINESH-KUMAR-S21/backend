import connectDB from '../DB.js'
import Leave from '../models/Leave.js'

const run = async () => {
  try {
    await connectDB()
    const res = await Leave.deleteMany({})
    console.log(`✅ Deleted ${res.deletedCount} leave record(s)`)
    process.exit(0)
  } catch (err) {
    console.error('❌ Error deleting leaves:', err)
    process.exit(1)
  }
}

run()
