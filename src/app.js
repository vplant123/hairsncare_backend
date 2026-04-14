const express = require("express");
// const cookieParser = require("cookie-parser");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler.js");
const route = require("../src/routes/user.routes.js");
const hairTestRoutes = require("../src/routes/hairTest.routes.js");
const paymentRoute = require("./routes/payment.routes.js");
const adminRoutes = require("./routes/admin.routes.js");
const doctorRoutes = require("./routes/doctor.routes.js");
const bookapointment = require("./routes/payment.routes.js");
const cartRoutes = require("./routes/cart.routes.js");
const utilityRoutes = require("./routes/utility.routes.js");
const reportRoutes = require("./routes/report.routes.js");
const sessionRoutes = require("./routes/session.routes.js");

const bodyParser = require("body-parser");
const path = require("path");
const morgan = require("morgan");

// require("./lokiLogger.js");

// Security middleware

const app = express();

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 300,
// });
// app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.use(
  morgan("common", {
    stream: {
      write: (message) => console.log(message.trim()),
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes declaration
app.use("/api/v1/users", route);
app.use("/api/v1/hair-tests", hairTestRoutes);
//payment
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/bookAppointment", bookapointment);

//admin
app.use("/api/v1/admin", adminRoutes);

//doctor routes
app.use("/api/v1/doctor", doctorRoutes);
//cart routes
app.use("/api/v1/cart", cartRoutes);
//utility routes
app.use("/api/v1/utility", utilityRoutes);
// report / diagnostic pipeline routes (TrichoScan AI)
app.use("/api/v1/reports", reportRoutes);
// PRODUCTION TRICHOSCAN PIPELINE (§4)
app.use("/api/v1/sessions", sessionRoutes);
app.use("/api/v1/leads", sessionRoutes); // Lead capture handled by session controller for session context (§4.5)
// S3 Storage is used in production for all uploads and reports.
// (Local static uploads route removed for cloud parity).

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.use(errorHandler);

module.exports = app;
