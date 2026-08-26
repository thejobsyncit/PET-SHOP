import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/pawora';
    console.log(`Connecting to database: ${connStr}...`);
    
    mongoose.set('strictQuery', false);
    
    // Set connection timeout to 5 seconds so it fails fast if not running
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('Backend will fall back to in-memory/JSON-file mock database support.');
    return false;
  }
};

export default connectDB;
