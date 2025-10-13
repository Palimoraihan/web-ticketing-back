const express = require("express");
const router = express.Router();
const priorityController = require("../controller/priority_controller");
const { mandatoryAddValid,mandatoryUpdateValid } = require("../validators/mandatory_validator");

router.get("/priority", priorityController.getAllPriority);
router.get("/priority/:id", priorityController.getPriorityById);
router.post("/priority", mandatoryAddValid, priorityController.createPriority);
router.put("/priority/:id", mandatoryUpdateValid,mandatoryAddValid, priorityController.updatePriority);
router.delete("/priority/:id", mandatoryUpdateValid, priorityController.deletePriority);


module.exports = router;
