const express = require("express");
const router = express.Router();
const commentController = require("../controller/comment_controller");

const { parseQueryParams } = require("../middleware/query_params_middleware");
const createCommentValidation = require("../validators/comment_validator");
const { authenticateToken } = require("../middleware/auth_midleware");

router.get(
  "/comment",
  authenticateToken,
  parseQueryParams,
  commentController.getAllComments
);
// router.get("/sla/:id", commentController.getSlaById);
router.post(
  "/comment",
  authenticateToken,
  createCommentValidation,
  commentController.createComment
);
// router.put("/sla/:id", commentController.updateSla);

module.exports = router;
