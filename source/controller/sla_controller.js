const { Sla, Category, Priority } = require("../models");
const { validationResult } = require("express-validator");

const getAllSla = async (req, res) => {
  try {
    const sla = await Sla.findAll({
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"], // Only include necessary role fields
        },
        {
          model: Priority,
          as: "priority",
          attributes: ["id", "name"], // Only include necessary role fields
        },
      ],
    });
    res.status(200).json({
      success: true,
      data: sla,
      count: sla.length,
    });
  } catch (error) {
    console.error("Error fetching sla:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const getSlaById = async (req, res) => {
  try {
    const { id } = req.params;
    const getSla = await Sla.findByPk(id);
    if (!getSla) {
      return res.status(404).json({
        success: false,
        error: "Sla not found",
      });
    }
    res.status(200).json({
      success: true,
      data: getSla,
    });
  } catch (error) {
    console.error("Error fetching sla by ID:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const createSla = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const {
      sla_name,
      description,
      response_time,
      resolution_time,
      category_id,
      priority_id,
    } = req.body;

    const existingSla = await Sla.findOne({
      where: { sla_name: sla_name },
    });
    if (existingSla) {
      return res.status(409).json({
        success: false,
        error: "Sla with this name already exists",
      });
    }
    console.log(
      `Description SLA ${description} ${description ? description : ""}`
    );

    const newSla = await Sla.create({
      sla_name,
      description: description ? description : "",
      response_time,
      resolution_time,
      category_id,
      priority_id,
    });
    const getSla = await Sla.findByPk(newSla.id);
    res.status(201).json({
      success: true,
      data: getSla,
      message: "Sla created successfully",
    });
  } catch (error) {
    console.error("Error creating Sla:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
const updateSla = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      sla_name,
      description,
      response_time,
      resolution_time,
      category_id,
      priority_id,
    } = req.body;

    // Validate ID format
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid Sla ID format",
      });
    }

    // Find user
    const sla = await Sla.findByPk(id);
    if (!sla) {
      return res.status(404).json({
        success: false,
        error: "Sla not found",
      });
    }

    // Check if email is being changed and if it's already taken
    if (sla_name && sla_name.toLowerCase() !== sla.sla_name) {
      const existingSla = await Sla.findOne({
        where: { sla_name: sla_name.toLowerCase() },
      });
      if (existingSla) {
        return res.status(409).json({
          success: false,
          error: "SLA name already in use",
        });
      }
    }

    // Update user
    const updateData = {};

    if (sla_name) updateData.sla_name = sla_name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (response_time) updateData.response_time = response_time;
    if (resolution_time) updateData.resolution_time = resolution_time;
    if (category_id) updateData.category_id = category_id;
    if (priority_id) updateData.priority_id = priority_id;

    await sla.update(updateData);

    // Fetch updated user with role
    const updatedSla = await Sla.findByPk(id, {});

    res.status(200).json({
      success: true,
      data: updatedSla,
      message: "Sla updated successfully",
    });
  } catch (error) {
    console.error("Error updating sla:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

module.exports = {
  getAllSla,
  getSlaById,
  createSla,
  updateSla,
};
