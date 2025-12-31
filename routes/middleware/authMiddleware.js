import jwt from 'jsonwebtoken'
import User from '../../models/user.js'

const verifyUser = async (req, res, next) => {
    try{
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({success: false, error: "Token not provided", message: "Unauthorized" });
        }

        const token = authHeader.split(' ')[1];

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({success: false, error: "Token not valid", message: "Unauthorized"});
        }

        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(404).json({success: false, error: "User not found"})
        }

        req.user = user
        next();
    }catch(error){
        console.error('Auth middleware error:', error.message);
        return res.status(500).json({success: false, error: "server error"})

    }
}

export default verifyUser