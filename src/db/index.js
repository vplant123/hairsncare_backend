const { MongoClient, ServerApiVersion } = require("mongodb");
const mongoose = require("mongoose");
// Use your live MongoDB URI (from MongoDB Atlas)
const uri = "mongodb+srv://hairsncares:hairsncares12345@hairsncares.d3wpd.mongodb.net/?retryWrites=true&w=majority&appName=HairsNCare";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectDB() {
  try {
    // Connect to MongoDB Atlas
    await client.connect();
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // Retry the connection after 10 seconds
    setTimeout(connectDB, 10000);
  }

  // Listen for errors during the connection
  client.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });


  // Gracefully handle application shutdown
  process.on("SIGINT", async () => {
    await client.close();
    console.log("MongoDB connection closed due to application termination");
    process.exit(0);
  });
}

module.exports = connectDB;
