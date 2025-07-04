const { MongoClient, ServerApiVersion } = require('mongodb');

// MongoDB connection URI
const uri = "mongodb+srv://hairsncares:hairsncares12345@hairsncares.d3wpd.mongodb.net/?retryWrites=true&w=majority&appName=HairsNcare";

// Create a MongoClient instance with MongoClientOptions
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectDB() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } catch (error) {
    console.error("MongoDB connection error:", error);
    setTimeout(connectDB, 5000); // Retry connection after 5 seconds if failed
  }

  // Add connection event handlers if needed
  client.on('error', (err) => {
    console.error("MongoDB connection error:", err);
  });
}

module.exports = connectDB;
