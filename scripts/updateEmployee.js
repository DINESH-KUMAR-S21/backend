import axios from 'axios'

const base = 'http://localhost:5000/api'

const run = async () => {
  try {
    const loginRes = await axios.post(`${base}/auth/login`, { email: 'admin@gmail.com', password: 'Admin@123' })
    const token = loginRes.data.token

    const emps = await axios.get(`${base}/employee`, { headers: { Authorization: `Bearer ${token}` } })
    const emp = emps.data.employees[0]
    console.log('Updating employee id:', emp._id)

    const updateRes = await axios.put(`${base}/employee/${emp._id}`, { name: 'Updated Test Employee', designation: 'Senior Developer', salary: 60000 }, { headers: { Authorization: `Bearer ${token}` } })
    console.log('Update response:', updateRes.status, updateRes.data)
    process.exit(0)
  } catch (err) {
    console.error('Update error:', err.response?.status, err.response?.data || err.message)
    process.exit(1)
  }
}

run()
