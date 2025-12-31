import express from 'express'
import { login, verify, changePassword } from './controllers/authController.js'
import authMiddleware from './middleware/authMiddleware.js'

const router = express.Router()

router.post('/login', login)
router.get('/verify', authMiddleware, verify)
router.post('/change-password', authMiddleware, changePassword)

export default router