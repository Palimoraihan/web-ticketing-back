const express = require("express");
require("dotenv").config();
const helmet = require("helmet");
const cors = require("cors");
const fs = require("fs");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("./config/db_config");
const userRoute = require("./routes/user_routes");
const categoryRoute = require("./routes/category_routes");
const priorityRoute = require("./routes/priority_routes");
const statusRoute = require("./routes/status_routes");
const slaRoute = require("./routes/sla_routes");
const ticketRoute = require("./routes/ticket_routes");
const commentRoute = require("./routes/comment_routes");
const attachmentRoute = require("./routes/attachment_routes");
const roleRoute = require("./routes/role_routes");
const authCheck = require("./routes/auth_check_routes");
require("./jobs/sla_breach_cron");

const app = express();
// dotenv.config();
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  },
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const port = process.env.PORT || 3030;
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
const myApi = "/api/v1";
app.use(myApi, userRoute);
app.use(myApi, categoryRoute);
app.use(myApi, priorityRoute);
app.use(myApi, statusRoute);
app.use(myApi, slaRoute);
app.use(myApi, ticketRoute);
app.use(myApi, commentRoute);
app.use(myApi, attachmentRoute);
app.use(myApi, roleRoute);
app.use(myApi, authCheck);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});
app.get("/", (req, res) => {
  res.send("Welcome to ticketing system");
});
app.listen(port, () => console.log(`Ticketing Listen To Port ${port}`));
