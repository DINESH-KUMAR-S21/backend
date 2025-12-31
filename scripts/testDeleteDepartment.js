import axios from 'axios';

const BASE = 'http://localhost:5000/api';

const run = async () => {
  try {
    // login as admin
    const login = await axios.post(`${BASE}/auth/login`, { email: 'admin@gmail.com', password: 'Admin@123' });
    const token = login.data.token;
    console.log('Got token length:', token?.length || 'none');

    // list departments
    const deps = await axios.get(`${BASE}/department/list`);
    console.log('Departments count:', deps.data.departments?.length || 0);
    if (!deps.data.departments || deps.data.departments.length === 0) {
      console.log('No departments to delete. Exiting.');
      process.exit(0);
    }

    // pick the first department
    const dep = deps.data.departments[0];
    console.log('Attempting to delete department:', dep._id, dep.dep_name);

    const res = await axios.delete(`${BASE}/department/${dep._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('DELETE response status:', res.status);
    console.log('DELETE response data:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Test delete error status:', err.response?.status);
    console.error('Test delete error data:', err.response?.data || err.message);
    console.error('Full error:', err.toString());
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
};

run();
