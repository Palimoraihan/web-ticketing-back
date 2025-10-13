const express = require("express");
const router = express.Router();
const roleController = require("../controller/role_controller");

router.get("/role", roleController.getAllRole);
module.exports = router
