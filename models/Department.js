import mongoose from 'mongoose';
import Employee from './Employee.js';
import Leave from './Leave.js';
import Salary from './Salary.js';


const departmentSchema = new mongoose.Schema({
    dep_name: {type: String, required: true},
    description: {type: String},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
})

departmentSchema.pre("deleteOne", { document: true, query: false }, async function() {
    try {
        // Gather employees in this department
        const employees = await Employee.find({ department: this._id }).select('_id userId')
        const empIds = employees.map(emp => emp._id)

        if (empIds.length) {
            // Clean up related records. The controller already handles most cascade deletes,
            // but keep this as a safety net in case deletion occurs elsewhere.
            await Leave.deleteMany({ employeeId: { $in: empIds } })
            await Salary.deleteMany({ employeeId: { $in: empIds } })
        }

        // Do NOT call next() in async middleware - returning/throwing is sufficient.
    } catch (error) {
        // Throwing will halt the delete operation and surface the error.
        console.error('Department pre-delete hook error:', error)
        throw error
    }
});

const Department = mongoose.model('Department', departmentSchema);

export default Department;
