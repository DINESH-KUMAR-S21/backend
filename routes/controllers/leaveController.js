import Leave from "../../models/Leave.js"
import Employee from "../../models/Employee.js"
import axios from "axios"


const addLeave = async (req, res) => {
  try {
    const { userId, leaveType, startDate, endDate, reason } = req.body

    // Map short codes from the frontend to the enum values used in the model
    const leaveTypeMap = {
      sick: 'Sick Leave',
      casual: 'Casual Leave',
      annual: 'Annual Leave',
      maternity: 'Maternity Leave',
      paternity: 'Paternity Leave',
      bereavement: 'Bereavement Leave',
      unpaid: 'Unpaid Leave',
    }

    const normalizedLeaveType = leaveTypeMap[leaveType] || leaveType

    // Basic validation
    if (!userId || !normalizedLeaveType || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }

    // Resolve employee reference. The frontend sends the current auth user's _id as userId.
    // We try to find an Employee by _id first, then by userId.
    let employeeObj = null
    try {
      employeeObj = await Employee.findById(userId).populate('userId', 'name').populate('department', 'dep_name')
    } catch (err) {
      // ignore cast errors
      employeeObj = null
    }
    if (!employeeObj) {
      employeeObj = await Employee.findOne({ userId }).populate('userId', 'name').populate('department', 'dep_name')
    }

    if (!employeeObj) {
      return res.status(400).json({ success: false, message: 'Employee not found for provided userId' })
    }

    const newLeave = new Leave({
      employeeId: employeeObj._id,
      leaveType: normalizedLeaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
    })

    await newLeave.save()

    return res.status(201).json({ success: true, leave: newLeave })
  } catch (error) {
    console.error('Add leave error:', error)
    // If it's a mongoose validation error, return 400 with details
    if (error.name === 'ValidationError') {
      const details = Object.values(error.errors).map((e) => e.message)
      return res.status(400).json({ success: false, message: 'Validation failed', details })
    }

    return res.status(500).json({ success: false, error: 'leave add server error', message: error.message })
  }
}

const getLeave = async (req, res) => {
  try {
    const { id } = req.params
    if (!id) return res.status(400).json({ success: false, message: 'Missing employee id' })

    // First try to find leaves where employeeId directly matches the provided id
    let leaves = await Leave.find({ employeeId: id })

    // If none found, try to interpret the id as an Employee._id and search for leaves
    // that reference either the Employee._id or the Employee.userId (some records store userId)
    if (!leaves || leaves.length === 0) {
      let employee = null
      try {
        employee = await Employee.findById(id)
      } catch (err) {
        employee = null
      }
      if (!employee) {
        employee = await Employee.findOne({ userId: id })
      }

      if (employee) {
        const idsToSearch = [String(employee._id)]
        if (employee.userId) idsToSearch.push(String(employee.userId))
        leaves = await Leave.find({ employeeId: { $in: idsToSearch } })
      }
    }

    return res.status(200).json({ success: true, leaves })
  } catch (error) {
    console.error('Get leaves error:', error)
    return res.status(500).json({ success: false, error: 'leave fetch server error', message: error.message })
  }
}

const getLeaves = async (req, res) => {
  try {
    // Fetch all leaves and populate employee information where possible
    const leaves = await Leave.find()

    const populatedLeaves = await Promise.all(
      leaves.map(async (leave) => {
        // try to find Employee by stored employeeId (could be employee._id or a userId)
        let employee = null
        if (leave.employeeId) {
          try {
            employee = await Employee.findById(leave.employeeId).populate('userId', 'name').populate('department', 'dep_name')
          } catch (err) {
            employee = null
          }
          if (!employee) {
            employee = await Employee.findOne({ userId: leave.employeeId }).populate('userId', 'name').populate('department', 'dep_name')
          }
        }

        const obj = leave.toObject()
        obj.employeeId = employee // may be null, but gives frontend the populated info when available
        return obj
      })
    )

    return res.status(200).json({ success: true, leaves: populatedLeaves })
  } catch (error) {
    console.error('Get leaves error:', error)
    return res.status(500).json({ success: false, error: 'leave fetch server error', message: error.message })
  }
}

const getLeaveDetail = async (req, res) => {
  try {
    const { id } = req.params
    // Get raw leave doc first (may contain user._id in employeeId)
    const rawLeave = await Leave.findById(id)
    if (!rawLeave) return res.status(404).json({ success: false, message: 'Leave not found' })

    // Try to resolve an Employee document for this leave
    let employee = null
    if (rawLeave.employeeId) {
      try {
        employee = await Employee.findById(rawLeave.employeeId).populate('userId', 'name profileImage').populate('department', 'dep_name')
      } catch (err) {
        employee = null
      }
      if (!employee) {
        // maybe employeeId stored a User._id, try to find by userId
        employee = await Employee.findOne({ userId: rawLeave.employeeId }).populate('userId', 'name profileImage').populate('department', 'dep_name')
      }
    }

    const leaveObj = rawLeave.toObject()
    leaveObj.employeeId = employee // may be null

    console.log('getLeaveDetail - employee resolved:', Boolean(employee))

    return res.status(200).json({ success: true, leave: leaveObj })
  } catch (error) {
    console.error('Get leave detail error:', error)
    return res.status(500).json({ success: false, error: 'leave fetch server error', message: error.message })
  }
}

const updateLeave = async (req, res) => {
  try{
    const { id } = req.params
    const { status } = req.body
    if (!status) return res.status(400).json({ success: false, message: 'Missing status' })

    const updated = await Leave.findByIdAndUpdate(id, { status }, { new: true })
    if (!updated) return res.status(404).json({ success: false, message: 'Leave not found' })

    // populate employee for response
    const populated = await Leave.findById(updated._id).populate({
      path: 'employeeId',
      populate: [
        { path: 'department', select: 'dep_name' },
        { path: 'userId', select: 'name profileImage' }
      ]
    })

    return res.status(200).json({ success: true, leave: populated })

  }catch (error) {
    console.error('Update leave error:', error)
    return res.status(500).json({ success: false, error: 'leave update server error', message: error.message })
  }
}

export { addLeave, getLeave, getLeaves, getLeaveDetail, updateLeave }