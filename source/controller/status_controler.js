const { Status, Ticket } = require("../models");
const { validationResult } = require("express-validator");

const getAllStatus = async (req, res) => {
  try {
    const status = await Status.findAll();
    res.status(200).json({
      success: true,
      data: status,
      count: status.length,
    });
  } catch (error) {
    console.error("Error fetching status:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const getStatusById = async (req, res) => {
  try {
    const { id } = req.params;
    const getStatus = await Status.findByPk(id);
    if (!getStatus) {
      return res.status(404).json({
        success: false,
        error: "Status not found",
      });
    }
    res.status(200).json({
      success: true,
      data: getStatus,
    });
  } catch (error) {
    console.error("Error fetching status by ID:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const createStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { name, color } = req.body;

    const existingStatus = await Status.findOne({
      where: { name: name },
    });
    if (existingStatus) {
      return res.status(409).json({
        success: false,
        error: "Status with this name already exists",
      });
    }
    const newStatus = await Status.create({
      name,
      color,
    });
    const getStatus = await Status.findByPk(newStatus.id);
    res.status(201).json({
      success: true,
      data: getStatus,
      message: "Status created successfully",
    });
  } catch (error) {
    console.error("Error creating status:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
const updateStatus = async (req, res) => {
  try {
    const { name, color } = req.body;
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const status = await Status.findByPk(id);
    if (!status) {
      return res.status(404).json({
        success: false,
        error: "Status not found",
      });
    }
    // const existingStatus = await Status.findOne({
    //   where: { name: name },
    // });
    // if (existingStatus) {
    //   return res.status(409).json({
    //     success: false,
    //     error: "Status with this name already exists",
    //   });
    // }
    // const usedInOrders = await Ticket.findOne({ where: { status_id: id } });
    // if (usedInOrders) {
    //   return res.status(409).json({
    //     success: false,
    //     error:
    //       "Cannot update this status because it is being used in another table",
    //   });
    // }
    await status.update({ name: name, color: color });
    res.status(200).json({
      success: true,
      data: status,
      message: "Status updated successfully",
    });
  } catch (error) {
    console.error("Error update status:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
const deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const status = await Status.findByPk(id);
    if (!status) {
      return res.status(404).json({
        success: false,
        error: "Status not found",
      });
    }
    const usedInOrders = await Ticket.findOne({ where: { status_id: id } });
    if (usedInOrders) {
      return res.status(409).json({
        success: false,
        error:
          "Cannot delete this status because it is being used in another table",
      });
    }
    await status.destroy();

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
  getAllStatus,
  getStatusById,
  createStatus,
  updateStatus,
  deleteStatus,
};
