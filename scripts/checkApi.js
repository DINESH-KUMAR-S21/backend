import axios from 'axios'

const base = 'http://localhost:5000/api'

const run = async () => {
  try {
    // departments (public)
    const deps = await axios.get(`${base}/department/list`)
    console.log('/api/department/list response status:', deps.status)
    console.log('departments body:', JSON.stringify(deps.data, null, 2))

    // try login
    const loginRes = await axios.post(`${base}/auth/login`, { email: 'admin@gmail.com', password: 'Admin@123' })
    console.log('Login response status:', loginRes.status)
    const token = loginRes.data.token
    console.log('token length:', token?.length)

    // employees (auth)
    const emps = await axios.get(`${base}/employee`, { headers: { Authorization: `Bearer ${token}` } })
    console.log('/api/employee response status:', emps.status)
    console.log('employees body:', JSON.stringify(emps.data, null, 2))

    process.exit(0)
  } catch (err) {
    console.error('API check error:', err.response?.status, err.response?.data || err.message)
    process.exit(1)
  }
}

run()
