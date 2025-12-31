import express from 'express';
import authMiddleware from './middleware/authMiddleware.js';
import { addDepartment, getDepartments, editDepartment, getDepartmentById, deleteDepartment } from './controllers/departmentController.js';

const router = express.Router()

// Public list endpoint used by the frontend
router.get('/list', getDepartments)

// Authenticated endpoints
router.get('/', authMiddleware, getDepartments)
router.get('/:id', authMiddleware, getDepartmentById)
router.put('/:id', authMiddleware, editDepartment)
router.post('/add', authMiddleware, addDepartment)
router.delete('/:id', authMiddleware, deleteDepartment)

export default router;