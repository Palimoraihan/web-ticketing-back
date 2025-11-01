const { body, param } = require("express-validator");
const createTicketValidation = [
  body("subject")
    .isLength({ min: 1, })
    .withMessage("subject is required and must be less than 50 characters")
    .trim(),
  body("user_id")
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("Category ID must be a positive integer"),
  body("agent_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Category ID must be a positive integer"),
  body("category_id")
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("Category ID must be a positive integer"),
  body("priority_id")
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("Priority ID must be a positive integer"),
  body("status_id")
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("Status ID must be a positive integer"),
];
const updateTicketValidation = [
  body("subject")
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage("subject is required and must be less than 50 characters")
    .trim(),
  body("user_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Category ID must be a positive integer"),
  body("agent_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Category ID must be a positive integer"),
  body("category_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Category ID must be a positive integer"),
  body("priority_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Priority ID must be a positive integer"),
  body("status_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Status ID must be a positive integer"),
];
module.exports = { createTicketValidation,updateTicketValidation };
