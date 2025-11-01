const jwt = require("jsonwebtoken");
const { User, Role } = require("../models");
require("dotenv").config();

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
    console.log('MYTOKEN',token);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access token required",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findByPk(decoded.id, {
      include: {
        model: Role,
        as: "role",
        attributes: ["id", "role_name"],
      },
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const adminPermition = async (req, res, next) => {
  const { id } = req.role.id;
  console.log(`ROLE ID ${id}`);
};

module.exports = { authenticateToken };
