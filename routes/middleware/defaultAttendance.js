import Employee from '../../models/Employee.js';
import Attendance from '../../models/Attendance.js';

const defaultAttendance =  async (req, res, next) => {

    try{
        const date = new Date().toISOString().split('T')[0];
        const existingAttendance = await Attendance.findOne({ date });

        if(!existingAttendance){
            const employees = await Employee.find({});
            if (employees.length > 0) {
                const attendanceRecords = employees.map(emp => ({
                    employeeId: emp._id,
                    date,
                    status: null
                }));
                await Attendance.insertMany(attendanceRecords);
            }
        }
        next()
    }catch(error){
        res.status(500).json({ success: false, error: error });
    }
}

export default defaultAttendance;