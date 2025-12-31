import express from 'express';
import authMiddleware from './middleware/authMiddleware.js';
import {addLeave, getLeave} from './controllers/leaveController.js';
import {getLeaves, getLeaveDetail, updateLeave} from './controllers/leaveController.js';

const router = express.Router()

// Authenticated endpoints
router.post('/add', authMiddleware, addLeave)
// Fetch leaves for a specific employee id (authenticated)
router.get('/:id', authMiddleware, getLeave)
router.put('/:id', authMiddleware, updateLeave)
router.get('/detail/:id', authMiddleware, getLeaveDetail)
router.get('/', authMiddleware, getLeaves)

export default router;