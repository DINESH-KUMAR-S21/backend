import express from 'express';
import authMiddleware from './middleware/authMiddleware.js';
import {addSalary, getSalary} from './controllers/salaryController.js';


const router = express.Router()

// Public list endpoint used by the frontend

// Authenticated endpoints

router.post('/add', authMiddleware, addSalary)
router.get('/:id', authMiddleware, getSalary)


export default router;