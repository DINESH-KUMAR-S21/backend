import connectDB from '../DB.js'
import Department from '../models/Department.js'
import User from '../models/user.js'
import Employee from '../models/Employee.js'
import bcrypt from 'bcryptjs'

const seed = async () => {
  try {
    await connectDB()

    let dept = await Department.findOne({ dep_name: 'Human Resources' })
    if (!dept) {
      dept = await Department.create({ dep_name: 'Human Resources', description: 'HR dept' })
      console.log('Created department:', dept._id)
    } else {
      console.log('Department exists:', dept._id)
    }

    let user = await User.findOne({ email: 'test.employee@example.com' })
    if (!user) {
      const hash = await bcrypt.hash('Password123', 10)
      user = await User.create({ name: 'Test Employee', email: 'test.employee@example.com', password: hash, role: 'employee' })
      console.log('Created user:', user._id)
    } else {
      console.log('User exists:', user._id)
    }

    let emp = await Employee.findOne({ userId: user._id })
    if (!emp) {
      emp = await Employee.create({ userId: user._id, employeeId: 'EMP001', dob: '1990-01-01', gender: 'male', martialStatus: 'single', designation: 'Developer', department: dept._id, salary: 50000 })
      console.log('Created employee:', emp._id)
    } else {
      console.log('Employee exists:', emp._id)
    }

    process.exit(0)
  } catch (err) {
    console.error('Seed error:', err)
    process.exit(1)
  }
}

seed()
