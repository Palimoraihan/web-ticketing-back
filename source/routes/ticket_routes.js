const express = require("express");
const router = express.Router();
const ticketController = require("../controller/ticket_controller");
const { authenticateToken } = require("../middleware/auth_midleware");
const {
  createTicketValidation,
  updateTicketValidation,
} = require("../validators/ticket_validation");
const {
  ticketParseQueryParams,
} = require("../middleware/ticket_query_params_middleware");

router.get(
  "/ticket",
  authenticateToken,
  ticketParseQueryParams,
  ticketController.getAllTicket
);
router.get("/ticket/:id", authenticateToken, ticketController.getTicketById);
router.post(
  "/ticket",
  authenticateToken,
  createTicketValidation,
  ticketController.createTicket
);

router.put(
  "/ticket/:id",
  authenticateToken,
  updateTicketValidation,
  ticketController.updateTicket
);
router.put("/assign/:id",authenticateToken, ticketController.assignTicket);

module.exports = router;
