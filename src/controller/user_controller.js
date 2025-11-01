const { User, Role, Ticket } = require("../models");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");
require("dotenv").config();

// Constants
const DEFAULT_ROLE_ID = 3;
const TOKEN_EXPIRY = "2d";

const generateAuthToken = async (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const payload = {
    id: user.id,
    email: user.email,
    role_id: user.role_id,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
    issuer: "symo-ticketing",
  });
};

/**
 * Get all users with their roles
 */
const getAllUser = async (req, res) => {
  try {
    const { limit, offset, page, sort, order, search } = req.queryParams;

    const users = await User.findAll({
      include: {
        model: Role,
        as: "role",
        attributes: ["id", "role_name"], // Only include necessary role fields
      },
      attributes: { exclude: ["password"] }, // Never return password
      where: search
        ? {
            [Op.or]: [
              {
                first_name: {
                  [Op.like]: `%${search}%`,
                },
              },
              {
                last_name: {
                  [Op.like]: `%${search}%`,
                },
              },
              {
                email: {
                  [Op.like]: `%${search}%`,
                },
              },
            ],
          }
        : {},
      order: [[sort, order]],
      limit: limit,
      offset: offset,
    });

    res.status(200).json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
const getAllCustomer = async (req, res) => {
  const { limit, offset, page, sort, order, search } = req.queryParams;
  try {
    const users = await User.findAll({
      include: {
        model: Role,
        as: "role",
        attributes: ["id", "role_name"], // Only include necessary role fields
      },
      attributes: { exclude: ["password"] }, // Never return password
      where: {
        role_id: 3,
        [Op.or]: [
          {
            first_name: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            last_name: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            email: {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      },
    });

    res.status(200).json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
const getAllAgent = async (req, res) => {
  try {
    const users = await User.findAll({
      include: {
        model: Role,
        as: "role",
        attributes: ["id", "role_name"], // Only include necessary role fields
      },
      attributes: { exclude: ["password"] }, // Never return password
      where: { role_id: 2 },
    });

    res.status(200).json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const getAllMember = async (req, res) => {
  const { limit, offset, page, sort, order, search } = req.queryParams;
  try {
    const users = await User.findAll({
      include: {
        model: Role,
        as: "role",
        attributes: ["id", "role_name"], // Only include necessary role fields
      },
      attributes: { exclude: ["password"] }, // Never return password
      where: {
        [Op.and]: {
          [Op.not]: { role_id: 3 },
          [Op.or]: [
            {
              first_name: {
                [Op.like]: `%${search}%`,
              },
            },
            {
              last_name: {
                [Op.like]: `%${search}%`,
              },
            },
            {
              email: {
                [Op.like]: `%${search}%`,
              },
            },
          ],
        },
      },
    });

    res.status(200).json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID format",
      });
    }

    const user = await User.findByPk(id, {
      include: {
        model: Role,
        as: "role",
        attributes: ["id", "role_name"],
      },
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * User login - authenticate user by email and password
 */
const loginUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
      include: {
        model: Role,
        as: "role",
        attributes: ["id", "role_name"],
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Generate token
    const token = await generateAuthToken(user);

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * Create new user
 */
const createUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { first_name, last_name, email, password, role_id } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    // Create new user
    const newUser = await User.create({
      first_name: first_name.trim(),
      last_name: last_name ? last_name.trim() : "",
      email: email.toLowerCase().trim(),
      password,
      role_id: role_id || DEFAULT_ROLE_ID,
    });

    // Fetch created user with role (excluding password)
    const createdUser = await User.findByPk(newUser.id, {
      include: {
        model: Role,
        as: "role",
        attributes: ["id", "role_name"],
      },
      attributes: { exclude: ["password"] },
    });

    res.status(201).json({
      success: true,
      data: createdUser,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);

    // Handle specific database errors
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * Update user by ID
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, role_id } = req.body;

    // Validate ID format
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID format",
      });
    }

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({
        where: { email: email.toLowerCase() },
      });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: "Email already in use",
        });
      }
    }

    // Update user
    const updateData = {};
    if (first_name) updateData.first_name = first_name.trim();
    if (last_name !== undefined) updateData.last_name = last_name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (role_id) updateData.role_id = role_id;
    console.log(`User Update ${JSON.stringify(updateData)}`);

    await user.update(updateData);

    // Fetch updated user with role
    const updatedUser = await User.findByPk(id, {
      include: {
        model: Role,
        as: "role",
        attributes: ["id", "role_name"],
      },
      attributes: { exclude: ["password"] },
    });

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * Delete user by ID
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID format",
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    const usedInOrders = await Ticket.findOne({ where: { agent_id: id } });
    console.log(usedInOrders);

    if (usedInOrders) {
      return res.status(409).json({
        success: false,
        error:
          "Cannot delete this user because it is being used in another table",
      });
    }
    await user.destroy();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

module.exports = {
  getAllUser,
  getUserById,
  getAllCustomer,
  getAllAgent,
  getAllMember,
  loginUser, // Renamed from getUserByEmail
  createUser,
  updateUser,
  deleteUser,
};
