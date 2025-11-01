const { body, param } = require("express-validator");

/**
 * Validation rules for user login
 */
const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .trim(),
  body("password")
    .isLength({ min: 1 })
    .withMessage("Password is required")
];

/**
 * Validation rules for user creation
 */
const createUserValidation = [
  body("first_name")
    .isLength({ min: 1, max: 50 })
    .withMessage("First name is required and must be less than 50 characters")
    .trim(),
  body("last_name")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Last name must be less than 50 characters")
    .trim(),
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .trim(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
  body("role_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Role ID must be a positive integer")
];

/**
 * Validation rules for user update
 */
const updateUserValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("User ID must be a positive integer"),
  body("first_name")
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name must be between 1 and 50 characters")
    .trim(),
  body("last_name")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Last name must be less than 50 characters")
    .trim(),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .trim(),
  body("role_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Role ID must be a positive integer")
];

/**
 * Validation for user ID parameter
 */
const userIdValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("User ID must be a positive integer")
];

module.exports = {
  loginValidation,
  createUserValidation,
  updateUserValidation,
  userIdValidation
};