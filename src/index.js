const dotenv = require("dotenv");
const connectDB = require("./db/index.js");
const app = require("./app.js");
require("./workers/index.js"); // Starts background analysis & report workers (§6)
// const Razorpay = require("razorpay")
const path = require("path");

dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server is running at port :  ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongodb connection failed !!", err);
  });
