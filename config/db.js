const mongoose = require("mongoose");

const uri = process.env.MONGO_URI;
const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}.`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    // await mongoose.disconnect();
  }
};

module.exports = connectDB;
