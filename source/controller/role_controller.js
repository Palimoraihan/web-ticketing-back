
const {Role} =require("../models")
const getAllRole = async (req, res) => {
  try {
    const role = await Role.findAll();
    res.status(200).json({
      success: true,
      data: role,
      count: role.length,
    });
  } catch (error) {
    console.error("Error fetching role:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
module.exports ={
    getAllRole
}