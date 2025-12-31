import express from 'express';
import authMiddleware from './middleware/authMiddleware.js';
import { addEmployee, upload, getEmployees, getEmployee, editEmployee, getEmployeesByDepartment } from './controllers/employeeController.js';

const router = express.Router()

// Public list endpoint used by the frontend
router.get('/', authMiddleware, getEmployees)
// List employees for a specific department
router.get('/department/:id', authMiddleware, getEmployeesByDepartment)

// Authenticated endpoints
router.get('/:id', authMiddleware, getEmployee)
router.put('/:id', authMiddleware, upload.single('image'), editEmployee)
router.post('/add', authMiddleware, upload.single('image'), addEmployee)
// router.delete('/:id', authMiddleware, deleteDepartment)

export default router;