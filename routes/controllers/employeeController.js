import Employee from '../../models/Employee.js'
import User from '../../models/user.js'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

import multer from 'multer'


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({storage: storage})


const addEmployee = async (req, res) => {
    try{
    const{
        name,
        email,
        employeeId,
        dob,
        gender,
        martialStatus,
        designation,
        department,
        salary,
        password,
        role,
    } = req.body

    const user = await User.findOne({email})
    if(user){
        return  res.status(400).json({success: false, error: "User with this email already exists"})
    }

    const hashPassword = await bcrypt.hash(password, 10)

    const newUser = new User({
        name,
        email,
        password: hashPassword,
        role,
        profileImage: req.file ? req.file.filename : "",
    })
   const savedUser =  await newUser.save()

    const newEmployee = new Employee({
        userId: savedUser._id,
        employeeId,
        dob,
        gender,
        martialStatus,
        designation,
        department,
        salary    })

        await newEmployee.save()
        return res.status(200).json({success: true, message: "Employee added successfully", employee: newEmployee})
    }catch(error){
        console.error('Add employee error:', error.message);
        return res.status(500).json({success: false, error: "server error", message: error.message})    
    }
    }

    const getEmployees = async (req, res) => {
        try{
            const employees = await Employee.find().populate('userId', {password:0}).populate('department');
            const host = `${req.protocol}://${req.get('host')}`
            const employeesWithUrls = employees.map(emp => {
                const empObj = emp.toObject()
                if (empObj.userId && empObj.userId.profileImage) {
                    empObj.userId.profileImageUrl = `${host}/uploads/${empObj.userId.profileImage}`
                } else if (empObj.userId) {
                    empObj.userId.profileImageUrl = null
                }
                return empObj
            })
            return res.status(200).json({success: true, employees: employeesWithUrls})
        }catch(error){
            console.error('Get employees error:', error.message);
            return res.status(500).json({success: false, error: "get employee server error", message: error.message})    
        }
    }

    // Get employees for a specific department
    const getEmployeesByDepartment = async (req, res) => {
        const { id } = req.params
        try {
            // Validate department id
            const mongoose = await import('mongoose')
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ success: false, error: 'Invalid department id' })
            }
             let employees
             employees = await Employee.find({ department: id }).populate('userId', { password: 0 }).populate('department')
            
            
             if(!employees){
               employee =  await Employee.findOne({ userId : id })
                .populate('userId', { password: 0 })
                .populate('department')
            }


            const host = `${req.protocol}://${req.get('host')}`
            const employeesWithUrls = employees.map(emp => {
                const empObj = emp.toObject()
                if (empObj.userId && empObj.userId.profileImage) {
                    empObj.userId.profileImageUrl = `${host}/uploads/${empObj.userId.profileImage}`
                } else if (empObj.userId) {
                    empObj.userId.profileImageUrl = null
                }
                return empObj
            })

            return res.status(200).json({ success: true, employees: employeesWithUrls })
        } catch (error) {
            console.error('Get employees by department error:', error.message || error)
            return res.status(500).json({ success: false, error: 'get employees by department server error', message: error.message || String(error) })
        }
    }

    const getEmployee = async (req, res) => {
        let { id } = req.params;
        try {
            // If client accidentally sent a JSON-like object string (e.g. "{ \"_id\": \"...\" }"), try to extract `_id`
            if (typeof id === 'string' && id.trim().startsWith('{')) {
                try {
                    const parsed = JSON.parse(id);
                    if (parsed && parsed._id) id = parsed._id;
                } catch (e) {
                    // ignore JSON parse errors
                }
            }

            // Validate ObjectId early to avoid Mongoose cast errors
            // Import mongoose dynamically to avoid top-level import if not present
            const mongoose = await import('mongoose');
            if (!mongoose.Types.ObjectId.isValid(id)) {
                console.warn('Invalid employee id received:', id);
                return res.status(400).json({ success: false, error: 'Invalid employee id', message: `Invalid id: ${id}` });
            }

            // Try to find by employee _id first
            let employee = await Employee.findById(id).populate('userId', { password: 0 }).populate('department');
            // If not found by employee _id, try finding by userId (so client can pass user._id)
            if (!employee) {
                employee = await Employee.findOne({ userId: id }).populate('userId', { password: 0 }).populate('department')
            }

            if (!employee) {
                return res.status(404).json({ success: false, error: 'Employee not found' });
            }

            const host = `${req.protocol}://${req.get('host')}`
            const empObj = employee.toObject()
            if (empObj.userId && empObj.userId.profileImage) {
                empObj.userId.profileImageUrl = `${host}/uploads/${empObj.userId.profileImage}`
            } else if (empObj.userId) {
                empObj.userId.profileImageUrl = null
            }
            return res.status(200).json({ success: true, employee: empObj })
        } catch (error) {
            console.error('Get employee error:', error?.message || error);
            return res.status(500).json({ success: false, error: "get employee server error", message: error.message || String(error) })
        }
    }

const editEmployee = async (req, res) => {
    const { id } = req.params
    try{
        // Validate ObjectId
        const mongoose = await import('mongoose')
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({success:false, error:'Invalid employee id'})
        }

        const employee = await Employee.findById(id)
        if(!employee) return res.status(404).json({success:false, error:'Employee not found'})

        const {
            name,
            email,
            employeeId,
            dob,
            gender,
            martialStatus,
            designation,
            department,
            salary,
        } = req.body || {}

        // Update employee fields when provided
        if(employeeId !== undefined) employee.employeeId = employeeId
        if(dob !== undefined) employee.dob = dob
        if(gender !== undefined) employee.gender = gender
        if(martialStatus !== undefined) employee.martialStatus = martialStatus
        if(designation !== undefined) employee.designation = designation
        if(department !== undefined) employee.department = department
        if(salary !== undefined) employee.salary = salary

        // Update user
        const user = await User.findById(employee.userId)
        if(!user) return res.status(404).json({success:false, error:'Associated user not found'})

        if(name !== undefined) user.name = name
        if(email !== undefined) user.email = email

        if(req.file){
            // remove old image file if exists
            if(user.profileImage){
                const oldPath = path.join(uploadDir, user.profileImage)
                if(fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
            }
            user.profileImage = req.file.filename
        }

        await user.save()
        await employee.save()

        const updatedEmp = await Employee.findById(id).populate('userId', { password: 0 }).populate('department')
        const host = `${req.protocol}://${req.get('host')}`
        const empObj = updatedEmp.toObject()
        if (empObj.userId && empObj.userId.profileImage) {
            empObj.userId.profileImageUrl = `${host}/uploads/${empObj.userId.profileImage}`
        }

        return res.status(200).json({success:true, message:'Employee updated', employee: empObj})

    }catch(error){
        console.error('Edit employee error:', error.message || error)
        return res.status(500).json({success:false, error:'server error', message: error.message || String(error)})
    }
}

export { addEmployee, upload, getEmployees, getEmployee, editEmployee, getEmployeesByDepartment }