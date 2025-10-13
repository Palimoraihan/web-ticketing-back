const express = require("express");
const router = express.Router();
const categoryController = require("../controller/category_controller");
const { mandatoryAddValid,mandatoryUpdateValid } = require("../validators/mandatory_validator");

router.get("/category", categoryController.getAllCategory);
router.get("/category-by-sla", categoryController.getCategoryBySla);
router.get("/category/:id", categoryController.getCategoryById);
router.post("/category", mandatoryAddValid, categoryController.createCategory);
router.post("/category-sla", mandatoryAddValid, categoryController.createCategoryWithSla2);
router.put("/category/:id", mandatoryUpdateValid,mandatoryAddValid, categoryController.updateCategory);
router.put("/category-sla/:id", mandatoryUpdateValid,mandatoryAddValid, categoryController.updateCategoryWithSla);
router.delete("/category/:id", categoryController.deleteCategory);

// router.post("/register", userController.createUser);

module.exports = router;
