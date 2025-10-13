const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth_midleware");
router.get("/auth-check", authenticateToken,(req, res)=>{
     res.status(200).json({
      success: true,
      data: "Auth successfully",
    });
});
module.exports = router;