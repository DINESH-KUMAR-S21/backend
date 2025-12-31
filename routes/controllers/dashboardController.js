import Employee from '../../models/Employee.js';
import Department from '../../models/Department.js';
import Leave from '../../models/Leave.js';
// import Salary from '../../models/Salary.js';

const getSummary = async (req, res) => {
    try{
        const totalEmployees = await Employee.countDocuments();
        const totalDepartments = await Department.countDocuments();
        const totalApplied = await Leave.countDocuments();
        const uniqueApplicants = (await Leave.distinct("employeeId")).length;
        const totalSalaries = await Employee.aggregate([
            { $group: { _id: null, total: { $sum: "$salary" } } }

        ]);
        const leaveStatus = await Leave.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const leaveSummary = {
            appliedFor: totalApplied,
            uniqueApplicants,
            approved: leaveStatus.find(item => item._id === "Approved")?.count || 0,
            pending: leaveStatus.find(item => item._id === "Pending")?.count || 0,
            rejected: leaveStatus.find(item => item._id === "Rejected")?.count || 0,
        }

        return res.status(200).json({
            totalEmployees,
            totalDepartments,
            totalSalaries: totalSalaries[0]?.total || 0,
            leaveSummary
        })
    }catch(error){
        console.error("Error fetching dashboard summary:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}

export { getSummary }