const mongoose = require("mongoose");

const connectDB = async () => {
  try {

    const dbUri = process.env.MONGODB_URI || "mongodb://develop:911Admin007@147.79.68.31:27017/myappdb?authSource=myappdb";
    const connectionInstance = await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Set a timeout to avoid hanging on connection failures
      directConnection: true, // Set to true for direct connection
    });

    console.log(
      `\nMongoDB connected! DB Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
