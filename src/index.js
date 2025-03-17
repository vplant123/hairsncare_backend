const dotenv = require("dotenv");
const connectDB = require("./db/index.js");
const app = require("./app.js");
// const Razorpay = require("razorpay")
const path = require("path");

dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

console.log(process.env);

connectDB()
  .then(() => {
    app.listen(3000, () => {
      console.log(`server is running at port :  3000`);
    });
  })
  .catch((err) => {
    console.log("Mongodb connection failed !!", err);
  });
