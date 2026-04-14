// const mongoose = require("mongoose");

// const uri = "mongodb://127.0.0.1:27017/HairsNCare";

// const connectDB = async () => {
//   try {
//     await mongoose.connect(uri, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       serverSelectionTimeoutMS: 10000,
//     });

//     console.log("Mongoose connected to MongoDB");

//     mongoose.connection.on("error", (err) => {
//       console.error("MongoDB error via Mongoose:", err);
//     });

//     process.on("SIGINT", async () => {
//       await mongoose.connection.close();
//       console.log("MongoDB connection closed due to app termination");
//       process.exit(0);
//     });
//   } catch (error) {
//     console.error("Mongoose connection error:", error);
//     setTimeout(connectDB, 10000);
//   }
// };

// module.exports = connectDB;

const mongoose = require("mongoose");

const uri =process.env.MONGODB_URI;


async function connectDB() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,

      useUnifiedTopology: true,

      family: 4, // Force IPv4 (important for your VPS)
    });

    console.log("✅ Mongoose connected to MongoDB Atlas!");
  } catch (err) {
    console.error("❌ Mongoose connection error:", err.message);

    setTimeout(connectDB, 10000); // Retry after 10s
  }

  // Graceful shutdown

  process.on("SIGINT", async () => {
    await mongoose.connection.close();

    console.log("🛑 Mongoose disconnected due to app termination");

    process.exit(0);
  });
}

module.exports = connectDB;
