import mongoose from 'mongoose';

const connectDB = async () => {
  // Read connection string from environment with a sensible fallback (for local testing only).
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ems';

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    // Print a friendly error and rethrow so the caller can decide what to do.
    console.error('❌ MongoDB connection error:', error.message || error);

    // Additional hints for common authentication/connection problems
    const msg = (error.message || '').toLowerCase();
    if (error.name === 'MongooseServerSelectionError') {
      console.error("Hint: If you're using MongoDB Atlas make sure your current IP address is added to the cluster's Network Access (allowlist).");
    }

    // MONGODB auth failures commonly come with code 18 or messages like 'bad auth' or 'authentication failed'
    if (error.code === 18 || msg.includes('bad auth') || msg.includes('authentication failed')) {
      console.error("Auth failed: check your MongoDB username/password in `MONGO_URI`. If your password contains special characters (e.g. '@', ':', '/') make sure it's URL-encoded.");
      console.error("If your `.env` was committed or shared, rotate the Atlas user's password and update the `.env` file.");
    }

    throw error;
  }
};

export default connectDB;
