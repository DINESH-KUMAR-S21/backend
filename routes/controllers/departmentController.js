import mongoose from 'mongoose';
import Department from '../../models/Department.js';
import Employee from '../../models/Employee.js';
import Leave from '../../models/Leave.js';
import Salary from '../../models/Salary.js';
import User from '../../models/user.js';

const { Types } = mongoose;

const getDepartments = async (req, res) => {
    try{
        const departments = await Department.find();
        return res.status(200).json({success: true, departments})
    }catch(error){
        console.error('Get departments error:', error.message);
        return res.status(500).json({success: false, error: "get department server error", message: error.message})    
    }
}

const getDepartmentById = async (req, res) => {
    try{
        const { id } = req.params;
        const department = await Department.findById(id);
        if(!department) return res.status(404).json({success:false, error:'Department not found'});
        return res.status(200).json({success:true, department});
    }catch(error){
        console.error('Get department by id error:', error.message);
        return res.status(500).json({success:false, error:'server error', message: error.message});
    }
}

const editDepartment = async (req, res) => {
    try{
        const { id } = req.params;
        // Guard against missing body (e.g., requests with no JSON payload)
        const { dep_name, description } = req.body || {};

        const update = {};
        if (dep_name !== undefined) update.dep_name = dep_name;
        if (description !== undefined) update.description = description;

        const updated = await Department.findByIdAndUpdate(id, update, { new: true });
        if(!updated) return res.status(404).json({success:false, error:'Department not found'});
        return res.status(200).json({success:true, message:'Department updated', department: updated});
    }catch(error){
        console.error('Update department error:', error.message);
        return res.status(500).json({success:false, error:'server error', message: error.message});
    }
}

const addDepartment = async (req, res) => {
    try{
        const {dep_name, description} = req.body;
       const newDep = new Department({
        dep_name,
        description
       })
       await newDep.save()
       return res.status(201).json({success: true, message: "Department added successfully", department: newDep})

    }catch(error){
        console.error('Add department error:', error.message);
        return res.status(500).json({success: false, error: "server error", message: error.message})    
    }
}

const deleteDepartment = async (req, res) => {
    try{
        const { id } = req.params;

        if (!id) return res.status(400).json({ success: false, error: 'Missing department id' });
        if (!Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, error: 'Invalid department id' });

        const department = await Department.findById(id);
        if (!department) return res.status(404).json({ success: false, error: 'Department not found' });

        // Find employees in this department
        const employees = await Employee.find({ department: id }).select('_id userId');
        const employeeIds = employees.map(e => e._id);
        const userIds = employees.map(e => e.userId).filter(Boolean);

        // Prepare counters
        let leavesDeleted = 0, salariesDeleted = 0, employeesDeleted = 0, usersDeleted = 0;

        // Delete linked records with per-step error handling
        try {
            if (employeeIds.length) {
                const resLeaves = await Leave.deleteMany({ employeeId: { $in: employeeIds } });
                leavesDeleted = resLeaves.deletedCount || 0;
                console.log(`Deleted ${leavesDeleted} leaves for department ${id}`);

                const resSalaries = await Salary.deleteMany({ employeeId: { $in: employeeIds } });
                salariesDeleted = resSalaries.deletedCount || 0;
                console.log(`Deleted ${salariesDeleted} salaries for department ${id}`);

                const resEmployees = await Employee.deleteMany({ _id: { $in: employeeIds } });
                employeesDeleted = resEmployees.deletedCount || 0;
                console.log(`Deleted ${employeesDeleted} employees for department ${id}`);
            }
        } catch (innerErr) {
            console.error('Error deleting linked employee records:', innerErr);
            return res.status(500).json({ success: false, error: 'Error deleting linked employee records', message: innerErr.message });
        }

        // Remove associated user accounts for those employees (only users with role 'employee')
        try {
            if (userIds.length) {
                const resUsers = await User.deleteMany({ _id: { $in: userIds }, role: 'employee' });
                usersDeleted = resUsers.deletedCount || 0;
                console.log(`Deleted ${usersDeleted} user accounts for department ${id}`);
            }
        } catch (innerErr) {
            console.error('Error deleting associated users:', innerErr);
            return res.status(500).json({ success: false, error: 'Error deleting associated users', message: innerErr.message });
        }

        // Delete the department
        try {
            await department.deleteOne();
            console.log(`Deleted department ${id}`);
        } catch (innerErr) {
            console.error('Error deleting department record:', innerErr);
            return res.status(500).json({ success: false, error: 'Error deleting department', message: innerErr.message });
        }

        return res.status(200).json({
            success: true,
            message: 'Department and related records deleted successfully',
            department,
            deletedCounts: {
                employees: employeesDeleted,
                leaves: leavesDeleted,
                salaries: salariesDeleted,
                users: usersDeleted
            }
        });

    }catch(error){
        console.error('delete department error:', error);
        return res.status(500).json({success: false, error: "server error", message: (error && error.message) || String(error)})    
    }

}

export { addDepartment, getDepartments, editDepartment, getDepartmentById, deleteDepartment };
