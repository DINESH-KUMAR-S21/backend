import mongoose from 'mongoose'
import connectDB from '../DB.js'
import Leave from '../models/Leave.js'

const empId = process.argv[2]

const run = async () => {
  try {
    await connectDB()
    const all = await Leave.find().lean()
    console.log('All leaves count:', all.length)
    all.forEach((l) => {
      console.log('leave _id:', l._id, 'employeeId (raw):', l.employeeId)
    })

    if (empId) {
      const by = await Leave.find({ employeeId: empId }).lean()
      console.log(`by employeeId ${empId} count:`, by.length)
      by.forEach((l) => console.log('match leave _id:', l._id))

      // extra: attempt to filter manually
      const manual = all.filter((l) => String(l.employeeId) === String(empId) || (l.employeeId && l.employeeId.toString && l.employeeId.toString() === empId))
      console.log('manual filter count:', manual.length)
    }

    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

run()
