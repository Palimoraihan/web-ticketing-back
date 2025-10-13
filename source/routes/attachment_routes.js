const express = require("express");
const {
  uploadAttachment,
  getAttachments,
  upload,
  downloadFile,
} = require("../controller/attachment_controller");
const { authenticateToken } = require("../middleware/auth_midleware");

const router = express.Router();

// router.use(authenticateToken);

router.post("/file-upload", upload.single("file"), uploadAttachment);
router.get("/file/:ticket_id", getAttachments);
router.get("/download/:filename", downloadFile);

module.exports = router;
