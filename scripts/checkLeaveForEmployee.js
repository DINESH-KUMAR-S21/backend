import axios from 'axios'

const base = 'http://localhost:5000/api'
const empId = process.argv[2]

const run = async () => {
  if (!empId) {
    console.error('Usage: node checkLeaveForEmployee.js <employeeId>')
    process.exit(1)
  }
  try {
    const loginRes = await axios.post(`${base}/auth/login`, { email: 'admin@gmail.com', password: 'Admin@123' })
    const token = loginRes.data.token
    console.log('Got token length:', token?.length)

    const res = await axios.get(`${base}/leave/${empId}`, { headers: { Authorization: `Bearer ${token}` } })
    console.log(`/api/leave/${empId} status:`, res.status)
    console.log('body:', JSON.stringify(res.data, null, 2))

    // Also fetch all leaves
    const all = await axios.get(`${base}/leave`, { headers: { Authorization: `Bearer ${token}` } })
    console.log('/api/leave (all) status:', all.status)
    console.log('body:', JSON.stringify(all.data, null, 2))

    process.exit(0)
  } catch (err) {
    console.error('Error:', err.response?.status, err.response?.data || err.message)
    process.exit(1)
  }
}

run()
