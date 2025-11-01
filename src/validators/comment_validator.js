
const { body, param } = require("express-validator");
const createCommentValidation = [
  body("message")
    .isLength({ min: 1, })
    .withMessage("message is required")
    .trim(),
  body("ticket_id")
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("Ticket ID must be a positive integer"),
];
module.exports = createCommentValidation