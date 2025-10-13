const express = require("express");
const router = express.Router();
const slaController = require("../controller/sla_controller");
const { createSlaValidation } = require("../validators/sla_validation");
const { parseQueryParams } = require("../middleware/query_params_middleware");

router.get("/sla", parseQueryParams, slaController.getAllSla);
router.get("/sla/:id", slaController.getSlaById);
router.post("/sla", createSlaValidation,slaController.createSla);
router.put("/sla/:id", slaController.updateSla);

module.exports = router;
