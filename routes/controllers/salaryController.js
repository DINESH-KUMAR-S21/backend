import Salary from '../../models/Salary.js';
import Employee from '../../models/Employee.js';


const addSalary = async (req, res) => {
    try{
        // Helpful logging for debugging
        console.log('addSalary called. body:', req.body, 'user:', req.user ? req.user._id : null)

        const { employeeId, basicSalary, allowances = 0, deductions = 0, payDate } = req.body || {}

        // Validate required fields
        if (!employeeId || basicSalary === undefined) {
            return res.status(400).json({ success: false, error: 'Missing required fields: employeeId and basicSalary are required' })
        }

        const bs = Number(basicSalary)
        const a = Number(allowances)
        const d = Number(deductions)

        if (Number.isNaN(bs) || Number.isNaN(a) || Number.isNaN(d)) {
            return res.status(400).json({ success: false, error: 'Numeric fields must be valid numbers' })
        }

        const totalSalary = bs + a - d

        const newSalary = new Salary({
            employeeId,
            basicSalary: bs,
            allowances: a,
            deductions: d,
            netSalary: totalSalary,
            payDate
        })

        await newSalary.save()

        return res.status(201).json({success: true, salary: newSalary})
    } catch(error){
        console.error('Add salary error:', error)
        return res.status(500).json({success: false, error: "salary add server error", message: error.message})
    }
}

const getSalary = async (req, res) => {
  try{
    const {id} = req.params
    let salary = await Salary.find({employeeId: id}).populate('employeeId', 'employeeId')
    if(!salary || salary.length < 1){
      const employee = await Employee.findOne({userId: id})
      salary = await Salary.find({employeeId: employee._id}).populate('employeeId', 'employeeId')
    }

    // Return both keys for backwards compatibility: `salary` (existing) and `salaries` (expected by frontend)
    return res.status(200).json({success: true, salary, salaries: salary})
  }catch(error){
    console.error('Get salary error:', error)
    return res.status(500).json({success: false, error: "salary get server error", message: error.message})
  }  
}

export { addSalary, getSalary }    