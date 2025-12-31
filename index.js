import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './DB.js'
import user from './models/user.js'
import departmentRouter from './routes/department.js'
import employeeRouter from './routes/employee.js'
import authRoutes from './routes/auth.js'
import path from 'path'
import salaryRouter from './routes/salary.js'
import leaveRouter from './routes/leave.js'
import dashboardRouter from './routes/dashboard.js'
import attendanceRouter from './routes/attendance.js'

// load environment variables from .env for local development
dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')))
app.use('/api/auth', authRoutes)
app.use('/api/department', departmentRouter)
app.use('/api/employee', employeeRouter)
app.use('/api/leave', leaveRouter)
app.use('/api/salary', salaryRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/attendance', attendanceRouter)

const PORT = process.env.PORT || 5000

// Wait for DB to connect before starting the server so startup errors are obvious.
try {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
} catch (err) {
  console.error('Failed to start server due to DB connection error.')
  process.exit(1)
}