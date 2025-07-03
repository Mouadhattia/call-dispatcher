require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const logger = require("./utils/logger");
const routes = require("./routes");
const authRoutes = require("./routes/auth");
const clientRoutes = require("./routes/client");
const mongoose = require("mongoose");

// Initialize Express app
const app = express();

// Verify environment variables
logger.info("Environment Configuration:");
logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);
logger.info(`PORT: ${process.env.PORT}`);
logger.info(
  `TWILIO_ACCOUNT_SID: ${process.env.TWILIO_ACCOUNT_SID ? "Set" : "Not Set"}`
);
logger.info(
  `TWILIO_AUTH_TOKEN: ${process.env.TWILIO_AUTH_TOKEN ? "Set" : "Not Set"}`
);
logger.info(`TWILIO_PHONE_NUMBER: ${process.env.TWILIO_PHONE_NUMBER}`);
logger.info(`QUEUE_NAME: ${process.env.QUEUE_NAME}`);
logger.info(`HOLD_MUSIC_URL: ${process.env.HOLD_MUSIC_URL}`);

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/auth", authRoutes);
app.use("/", routes);
app.use("/clients", clientRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => logger.info("Database connected"))
  .catch((err) => logger.error("Database connection error:", err));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});
