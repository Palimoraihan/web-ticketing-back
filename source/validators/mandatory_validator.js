const { body, param } = require("express-validator");

const mandatoryAddValid = [
  body("name")
    .isLength({ min: 1, max: 50 })
    .withMessage("name is required and must be less than 50 characters"),
];
const mandatoryUpdateValid = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Category ID must be a positive integer")
]
module.exports = { mandatoryAddValid,mandatoryUpdateValid };
