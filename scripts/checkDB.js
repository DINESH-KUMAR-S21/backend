import connectDB from '../DB.js'
import Department from '../models/Department.js'
import Employee from '../models/Employee.js'
import User from '../models/user.js'

const run = async () => {
  try {
    await connectDB()
    const deptCount = await Department.countDocuments()
    const empCount = await Employee.countDocuments()
    const userCount = await User.countDocuments()

    console.log('Department count:', deptCount)
    console.log('Employee count:', empCount)
    console.log('User count:', userCount)

    const depts = await Department.find().limit(5)
    const emps = await Employee.find().limit(5).populate('userId').populate('department')

    console.log('Sample departments:', depts)
    console.log('Sample employees:', emps)

    process.exit(0)
  } catch (err) {
    console.error('DB check error:', err)
    process.exit(1)
  }
}

run()
