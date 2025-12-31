import User from './models/user.js'
import bcrypt from 'bcryptjs'
import connectDB from './DB.js'

const userRegister = async () => {
    try {
        // Wait for DB connection to complete before saving
        await connectDB()
        
        const hashedPassword = await bcrypt.hash('Admin@123', 10)    
        const newUser = new User({
            name: 'Admin',
            email: 'admin@gmail.com',
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