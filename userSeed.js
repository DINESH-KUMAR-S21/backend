import dotenv from 'dotenv'
dotenv.config()
import User from './models/user.js'
import bcrypt from 'bcryptjs'
import connectDB from './DB.js'

const userRegister = async () => {
    try {
        // Wait for DB connection to complete before saving
        await connectDB()
        
        const email = 'admin@gmail.com'
        const existing = await User.findOne({ email })
        if (existing) {
            console.log('Admin user already exists:', existing.email)
            // Optionally update password to a known value if needed
            // const hashed = await bcrypt.hash('Admin@123', 10)
            // existing.password = hashed
            // await existing.save()
            process.exit(0)
        }

        const hashedPassword = await bcrypt.hash('Admin@123', 10)    
        const newUser = new User({
            name: 'Admin',
            email,
            password: hashedPassword,
            role: 'admin',
        })
        await newUser.save()
        console.log('✅ Admin user created successfully')
        process.exit(0)
    } catch(error) {
        console.error('❌ Error creating user:', error.message)
        process.exit(1)
    }
}

userRegister() 