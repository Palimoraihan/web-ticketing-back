const { Priority, Ticket } = require("../models");
const { validationResult } = require("express-validator");

const getAllPriority = async (req, res) => {
  try {
    const priority = await Priority.findAll();
    res.status(200).json({
      success: true,
      data: priority,
      count: priority.length,
    });
  } catch (error) {
    console.error("Error fetching priority:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const getPriorityById = async (req, res) => {
  try {
    const { id } = req.params;
    const getPriority = await Priority.findByPk(id);
    if (!getPriority) {
      return res.status(404).json({
        success: false,
        error: "Priority not found",
      });
    }
    res.status(200).json({
      success: true,
      data: getPriority,
    });
  } catch (error) {
    console.error("Error fetching Priority by ID:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const createPriority = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { name,color } = req.body;

    const existingPriority = await Priority.findOne({
      where: { name: name },
    });
    if (existingPriority) {
      return res.status(409).json({
        success: false,
        error: "Priority with this name already exists",
      });
    }
    const newPriority = await Priority.create({
      name,color
    });
    const getPriority = await Priority.findByPk(newPriority.id);
    res.status(201).json({
      success: true,
      data: getPriority,
      message: "Priority created successfully",
    });
  } catch (error) {
    console.error("Error creating Priority:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
const updatePriority = async (req, res) => {
  try {
    const { name,color } = req.body;
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const priority = await Priority.findByPk(id);
    if (!priority) {
      return res.status(404).json({
        success: false,
        error: "Priority not found",
      });
    }
    // const existingPriority = await Priority.findOne({
    //   where: { name: name },
    // });
    // if (existingPriority) {
    //   return res.status(409).json({
    //     success: false,
    //     error: "Priority with this name already exists",
    //   });
    // }
    // const usedInOrders = await Ticket.findOne({ where: { priority_id: id } });
    // if (usedInOrders) {
    //   return res.status(409).json({
    //     success: false,
    //     error:
    //       "Cannot update this priority because it is being used in another table",
    //   });
    // }
    await priority.update({ name: name,color:color });
    res.status(200).json({
      success: true,
      data: priority,
      message: "Priority updated successfully",
    });
  } catch (error) {
    console.error("Error creating Priority:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
const deletePriority = async (req, res) => {
  try {
    const { id } = req.params;

    const priority = await Priority.findByPk(id);
    if (!priority) {
      return res.status(404).json({
        success: false,
        error: "Priority not found",
      });
    }
    const usedInOrders = await Ticket.findOne({ where: { priority_id: id } });
    if (usedInOrders) {
      return res.status(409).json({
        success: false,
        error:
          "Cannot delete this priority because it is being used in another table",
      });
    }
    await priority.destroy();

    res.status(200).json({
      success: true,
      message: "Status deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting status:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
module.exports = {
  getAllPriority,
  getPriorityById,
  createPriority,
  updatePriority,
  deletePriority
};
