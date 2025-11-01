const { body, param } = require("express-validator");
const createSlaValidation = [
  body("sla_name")
    .isLength({ min: 1, max: 50 })
    .withMessage("name is required and must be less than 50 characters")
    .trim(),
  body("response_time")
    .notEmpty()
    .isInt({ min: 30 })
    .withMessage("Response time must be a greater than 30"),
  body("resolution_time")
    .notEmpty()
    .isInt({ min: 30 })
    .withMessage("Resolution time must be a greater than 30"),
  body("category_id")
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("Category ID must be a positive integer"),
  body("priority_id")
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("Priority ID must be a positive integer"),
];

module.exports ={createSlaValidation}