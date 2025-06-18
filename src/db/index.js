const mongoose = require("mongoose");

// Prevent accidental database operations in production
const isProd = process.env.NODE_ENV === "production";

// Safety middleware to prevent dangerous operations in production
mongoose.set("runValidators", true);

// Prevent accidental collection drops
if (isProd) {
  mongoose.plugin((schema) => {
    // Block deleteMany in production
    schema.pre("deleteMany", function (next) {
      console.error("DELETE_MANY blocked in production");
      next(new Error("DELETE_MANY operations are not allowed in production"));
    });

    // Block deleteOne without an ID in production
    schema.pre("deleteOne", function (next) {
      if (!this._conditions._id) {
        console.error("Attempted DELETE without ID specification");
        next(new Error("DELETE requires specific document ID"));
      }
      next();
    });
  });
}

const connectDB = async () => {
  // const dbUri =
  //   process.env.MONGODB_URI ||
  //   "mongodb://develop:911Admin007@147.79.68.31:27017/myappdb?authSource=myappdb";

  const dbUri = "mongodb://127.0.0.1:27017/HairsNCare?";

  // Retry connection for a few attempts if it fails
  const connectWithRetry = async () => {
    try {
      const connectionInstance = await mongoose.connect(dbUri, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
        directConnection: true, // Skip replica set discovery, connect directly to the MongoDB server
      });

      console.log(
        `MongoDB connected! DB Host: ${connectionInstance.connection.host}`
      );
    } catch (error) {
      console.error("MongoDB connection error:", error);
      setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
    }
  };

  await connectWithRetry();

  // Add connection event handlers
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected! Attempting to reconnect...");
  });

  // Graceful shutdown
  process.on("SIGINT", async () => {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination");
      process.exit(0);
    } catch (err) {
      console.error("Error during MongoDB shutdown:", err);
      process.exit(1);
    }
  });
};

module.exports = connectDB;
