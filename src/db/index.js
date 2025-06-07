const mongoose = require("mongoose");

// Prevent accidental database operations in production
const isProd = process.env.NODE_ENV === "production";

// Safety middleware to prevent dangerous operations
mongoose.set("runValidators", true);

// Prevent accidental collection drops
if (isProd) {
  mongoose.plugin((schema) => {
    schema.pre("deleteMany", function (next) {
      if (isProd) {
        console.error("DELETE_MANY blocked in production");
        next(new Error("DELETE_MANY operations are not allowed in production"));
      }
      next();
    });

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
  try {
    const dbUri =
      process.env.MONGODB_URI ||
      "mongodb://develop:911Admin007@147.79.68.31:27017/myappdb?authSource=myappdb";
    const connectionInstance = await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      directConnection: true,
    });

    console.log(
      `\nMongoDB connected! DB Host: ${connectionInstance.connection.host}`
    );

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
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
