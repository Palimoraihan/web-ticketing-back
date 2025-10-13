const express = require("express");
const router = express.Router();
const userController = require("../controller/user_controller");
const { loginValidation } = require("../validators/user_validators");
const { parseQueryParams } = require("../middleware/query_params_middleware");
const { authenticateToken } = require("../middleware/auth_midleware");

router.get(
  "/users",
  authenticateToken,
  parseQueryParams,
  userController.getAllUser
);
router.get("/customer",parseQueryParams, userController.getAllCustomer);
router.get("/agent", userController.getAllAgent);
router.get("/member",parseQueryParams, userController.getAllMember);
router.get("/users/:id", userController.getUserById);
router.post("/login", loginValidation, userController.loginUser);
router.post("/register", userController.createUser);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);

module.exports = router;
