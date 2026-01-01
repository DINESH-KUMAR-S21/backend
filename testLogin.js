import axios from 'axios';

const run = async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', { email: 'admin@gmail.com', password: 'Admin@123' });
    console.log('Login test response:', res.status, res.data);
  } catch (err) {
    if (err.response) {
      console.error('Login test failed:', err.response.status, err.response.data);
    } else {
      console.error('Login test error:', err.message || err);
    }
  }
}

run()
