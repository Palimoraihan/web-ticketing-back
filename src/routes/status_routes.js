const express = require("express");
const router = express.Router();
const statusController = require("../controller/status_controler");
const { mandatoryAddValid,mandatoryUpdateValid } = require("../validators/mandatory_validator");

router.get("/status", statusController.getAllStatus);
router.get("/status/:id", statusController.getStatusById);
router.post("/status", mandatoryAddValid, statusController.createStatus);
router.put("/status/:id", mandatoryUpdateValid,mandatoryAddValid, statusController.updateStatus);
router.delete("/status/:id", mandatoryUpdateValid, statusController.deleteStatus);

module.exports = router;
