const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // const connectionInstance = await mongoose.connect("mongodb+srv://hairsncares:Kz3o8JfxuxxQFHj7@hairsncares.d3wpd.mongodb.net/HairsNCare",
    // );
    // const connectionInstance = await mongoose.connect(
    //   "mongodb://127.0.0.1:27017/HairsNCare?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.0.1"
    // );

    const connectionInstance = await mongoose.connect(
      "mongodb://develop:911@Admin007@147.79.68.31:27017/myappdb?authSource=admin"
    );

    console.log(
      `\n MongoDB connected !! DB HOST :${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Mongodb connection error", error);
    process.exit(1);
  }
};
module.exports = connectDB;
