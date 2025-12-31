import User from '../../models/user.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const login = async (req , res) => {
    try{
        const {email , password} = req.body;
        console.log('Login attempt with email:', email);
        
        if (!email || !password) {
            return res.status(400).json({message : "Email and password are required"})
        }
        
        const foundUser = await User.findOne({email})
        if(!foundUser){
            console.log('User not found:', email);
            return res.status(400).json({message : "User not found"})
        }

        const isMatch = await bcrypt.compare(password , foundUser.password)
        if(!isMatch){
            console.log('Invalid password for user:', email);
            return res.status(400).json({message : "Invalid credentials"})
        }

        const token = jwt.sign({userId : foundUser._id, role: foundUser.role} , process.env.JWT_SECRET , {expiresIn : "10d"}) 
        res.status(200).json({token, user: {id: foundUser._id, name: foundUser.name, role: foundUser.role},
        })
    }catch(error){
        console.error('Login error:', error.message);
        res.status(500).json({message : "Server error", error: error.message})
}
}

const verify = (req, res) =>{
    return res.status(200).json({success: true, user: req.user})
} 

const changePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Old password and new password are required" });
        }

        const foundUser = await User.findById(userId);
        if (!foundUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(oldPassword, foundUser.password);
        if(!isMatch){
            return res.status(400).json({ message: "Old password is incorrect" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassword, salt);
        foundUser.password = hashed;
        foundUser.updatedAt = Date.now();
        await foundUser.save();

        return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error('Change password error:', error.message);
        return res.status(500).json({ message: "Server error", error: error.message});
    }
}

export {login, verify, changePassword} 