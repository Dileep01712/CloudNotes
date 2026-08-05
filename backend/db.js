const mongoose = require('mongoose');
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in .env');
  process.exit(1);
}

const connectToMongo = async (retryCount = 0) => {
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Connected to MongoDB server successfully');
  } catch (error) {
    console.error(`Error connecting to MongoDB (attempt ${retryCount + 1}):`, error.message);
    if (retryCount < 5) {
      console.log(`Retrying in 5 seconds...`);
      setTimeout(() => connectToMongo(retryCount + 1), 5000);
    } else {
      console.error('Failed to connect to MongoDB after 5 attempts. Exiting...');
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected – attempting to reconnect...');
  connectToMongo();
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

module.exports = connectToMongo;