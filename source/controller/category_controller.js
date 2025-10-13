const { Category, Sla, Priority, Ticket } = require("../models");
const { validationResult } = require("express-validator");
const { sequelize } = require("../config/db_config");
const { Op } = require("sequelize");

const getAllCategory = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const getCategory = await Category.findByPk(id, {
      include: [
        {
          model: Sla,
          as: "sla",
          include: [
            {
              model: Priority,
              as: "priority",
            },
          ],
        },
      ],
    });
    if (!getCategory) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }
    res.status(200).json({
      success: true,
      data: getCategory,
    });
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { name } = req.body;

    const existingCategory = await Category.findOne({
      where: { name: name },
    });
    if (existingCategory) {
      return res.status(409).json({
        success: false,
        error: "Category with this name already exists",
      });
    }
    const newCategory = await Category.create({
      name,
    });
    const getCategory = await Category.findByPk(newCategory.id);
    res.status(201).json({
      success: true,
      data: getCategory,
      message: "Category created successfully",
    });
  } catch (error) {
    console.error("Error creating category:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }
    const existingCategory = await Category.findOne({
      where: { name: name },
    });
    if (existingCategory) {
      return res.status(409).json({
        success: false,
        error: "Category with this name already exists",
      });
    }
    await category.update({ name: name });
    res.status(200).json({
      success: true,
      data: category,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("Error creating category:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const getCategoryBySla = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Sla,
          as: "sla",
          include: [
            {
              model: Priority,
              as: "priority",
            },
          ],
        },
      ],
    });
    res.status(200).json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
const createCategoryWithSla = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { name, slas } = req.body;

    const existingCategory = await Category.findOne({
      where: { name: name },
    });
    if (existingCategory) {
      return res.status(409).json({
        success: false,
        error: "Category with this name already exists",
      });
    }
    let slaData = [];
    const newCategory = await Category.create({
      name,
    });
    for (let index = 0; index < slas.length; index++) {
      const element = slas[index];
      const priority = await Priority.findByPk(element.priority_id);
      if (!priority) {
        return res.status(404).json({
          success: false,
          error: "Priority not found",
        });
      }
      const dataMap = {
        priority_id: element.priority_id,
        category_id: newCategory.id,
        response_time: element.response_time,
        resolution_time: element.resolution_time,
      };
      slaData.push(dataMap);
    }

    await Sla.bulkCreate(slaData, { ignoreDuplicates: false });
    res.status(201).json({
      success: true,
      data: newCategory,
      message: "Category created successfully",
    });
  } catch (error) {
    console.error("Error creating category:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const createCategoryWithSla2 = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { name, slas } = req.body;

    // Validate required fields
    if (!name || !slas || !Array.isArray(slas) || slas.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Name and at least one SLA are required",
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      where: { name: name.trim() },
      transaction,
    });

    if (existingCategory) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        error: "Category with this name already exists",
      });
    }

    // Validate all priorities exist before creating category
    const priorityIds = [...new Set(slas.map((sla) => sla.priority_id))];

    const existingPriorities = await Priority.findAll({
      where: { id: priorityIds },
      attributes: ["id"],
      transaction,
    });

    const foundPriorityIds = new Set(existingPriorities.map((p) => p.id));
    const missingPriorityIds = priorityIds.filter(
      (id) => !foundPriorityIds.has(id)
    );

    if (missingPriorityIds.length > 0) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: "Priority not found",
        details: `Priority IDs not found: ${missingPriorityIds.join(", ")}`,
      });
    }

    // Check for duplicate priority_ids in request

    const duplicatePriorities = priorityIds.filter((id, index, arr) => {
      return arr.indexOf(id) !== index;
    });
    if (duplicatePriorities.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: "Duplicate priority IDs are not allowed",
        details: `Duplicate priority IDs: ${duplicatePriorities[0].priority_id}`,
      });
    }

    // Create category
    const newCategory = await Category.create(
      {
        name: name.trim(),
      },
      { transaction }
    );

    // Prepare SLA data with validation
    const slaData = slas.map((sla) => {
      // Validate SLA fields
      if (!sla.priority_id || !sla.response_time || !sla.resolution_time) {
        throw new Error(
          "Priority ID, response time, and resolution time are required for each SLA"
        );
      }

      if (sla.response_time <= 0 || sla.resolution_time <= 0) {
        throw new Error(
          "Response time and resolution time must be positive numbers"
        );
      }

      if (sla.response_time >= sla.resolution_time) {
        throw new Error("Response time must be less than resolution time");
      }

      return {
        priority_id: sla.priority_id,
        category_id: newCategory.id,
        response_time: sla.response_time,
        resolution_time: sla.resolution_time,
      };
    });

    // Create SLAs
    await Sla.bulkCreate(slaData, {
      transaction,
      validate: true,
    });

    // Commit transaction
    await transaction.commit();

    // Fetch complete category data with SLAs for response
    const categoryWithSlas = await Category.findByPk(newCategory.id, {
      include: [
        {
          model: Sla,
          as: "sla",
          include: [
            {
              model: Priority,
              as: "priority",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: categoryWithSlas,
      message: "Category with SLAs created successfully",
    });
  } catch (error) {
    // Rollback transaction on any error

    console.error("Error creating category with SLAs:", error);

    // Handle specific validation errors
    if (
      error.message.includes("required") ||
      error.message.includes("positive numbers") ||
      error.message.includes("less than resolution time")
    ) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // Handle Sequelize validation errors
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    // Handle Sequelize unique constraint errors
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        error: "Duplicate entry",
        details: error.errors.map((err) => err.message),
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
const updateCategoryWithSla = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { id } = req.params;
    const { name, slas } = req.body;

    // Validate required fields
    if (!name && (!slas || !Array.isArray(slas))) {
      return res.status(400).json({
        success: false,
        error: "At least name or SLA data is required for update",
      });
    }

    // Check if category exists
    const existingCategory = await Category.findByPk(id, {
      include: [
        {
          model: Sla,
          as: "sla",
          attributes: ["id", "priority_id"],
        },
      ],
      transaction,
    });

    if (!existingCategory) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    // Check name uniqueness if name is being updated
    if (name && name.trim() !== existingCategory.name) {
      const duplicateCategory = await Category.findOne({
        where: {
          name: name.trim(),
          id: { [Op.ne]: id }, // Exclude current category
        },
        transaction,
      });

      if (duplicateCategory) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          error: "Category with this name already exists",
        });
      }
    }

    // Update category name if provided
    if (name) {
      await existingCategory.update(
        {
          name: name.trim(),
        },
        { transaction }
      );
    }
    let slasInUsePriority;
    // Process SLA updates if provided
    if (slas && Array.isArray(slas) && slas.length > 0) {
      // Validate all priorities exist
      const priorityIds = [...new Set(slas.map((sla) => sla.priority_id))];
      const existingPriorities = await Priority.findAll({
        where: { id: priorityIds },
        attributes: ["id"],
        transaction,
      });

      const foundPriorityIds = new Set(existingPriorities.map((p) => p.id));
      const missingPriorityIds = priorityIds.filter(
        (id) => !foundPriorityIds.has(id)
      );

      if (missingPriorityIds.length > 0) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: "Priority not found",
          details: `Priority IDs not found: ${missingPriorityIds.join(", ")}`,
        });
      }

      // Check for duplicate priority_ids in request
      const duplicatePriorities = priorityIds.filter(
        (id, index, arr) => arr.indexOf(id) !== index
      );

      if (duplicatePriorities.length > 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: "Duplicate priority IDs are not allowed",
          details: `Duplicate priority IDs: ${duplicatePriorities.join(", ")}`,
        });
      }

      // Validate SLA data
      const validatedSlaData = [];
      for (const sla of slas) {
        // Validate SLA fields
        if (
          !sla.priority_id ||
          sla.response_time == null ||
          sla.resolution_time == null
        ) {
          throw new Error(
            "Priority ID, response time, and resolution time are required for each SLA"
          );
        }

        if (sla.response_time <= 0 || sla.resolution_time <= 0) {
          throw new Error(
            "Response time and resolution time must be positive numbers"
          );
        }

        if (sla.response_time >= sla.resolution_time) {
          throw new Error("Response time must be less than resolution time");
        }

        validatedSlaData.push({
          id: sla.id || null, // For updates
          priority_id: sla.priority_id,
          category_id: existingCategory.id,
          response_time: sla.response_time,
          resolution_time: sla.resolution_time,
        });
      }

      // Get current SLA IDs
      const currentSlaIds = existingCategory.sla.map((sla) => sla.id);
      const getSlaInTicket = await Ticket.findAll({
        include: [
          {
            model: Priority,
            as: "priority",
            attributes: ["id", "name"],
          },
        ],
        where: { sla_id: currentSlaIds },
      });
      const updatedSlaIds = validatedSlaData
        .filter((sla) => sla.id)
        .map((sla) => sla.id);
      const newSlas = validatedSlaData.filter((sla) => !sla.id);
      let perviouseSlaId;
      let perviouseSlaId2;
      const slasInUse = getSlaInTicket
        .filter((data) => {
          if (perviouseSlaId != data.sla_id) {
            perviouseSlaId = data.sla_id;
            return data.sla_id;
          }
        })
        .map((data) => data.sla_id);
      slasInUsePriority = getSlaInTicket
        .filter((data) => {
          if (perviouseSlaId2 != data.sla_id) {
            perviouseSlaId2 = data.sla_id;
            return data.sla_id;
          }
        })
        .map((data) => data.priority.name);

      // Delete SLAs that are not in the update request
      const slasToDelete = currentSlaIds.filter(
        (id) => !updatedSlaIds.includes(id) && !slasInUse.includes(id)
      );
      if (slasToDelete.length > 0) {
        await Sla.destroy({
          where: { id: slasToDelete },
          transaction,
        });
      }

      // Update existing SLAs
      for (const slaData of validatedSlaData.filter(
        (sla) => !slasInUse.includes(sla.id)
      )) {
        await Sla.update(
          {
            priority_id: slaData.priority_id,
            response_time: slaData.response_time,
            resolution_time: slaData.resolution_time,
          },
          {
            where: { id: slaData.id },
            transaction,
          }
        );
      }

      // Create new SLAs
      if (newSlas.length > 0) {
        const newSlaData = newSlas.map(({ id, ...sla }) => sla); // Remove id property
        await Sla.bulkCreate(newSlaData, {
          transaction,
          validate: true,
        });
      }
    }

    // Commit transaction
    await transaction.commit();

    // Fetch updated category with SLAs for response
    const updatedCategory = await Category.findByPk(id, {
      include: [
        {
          model: Sla,
          as: "sla",
          include: [
            {
              model: Priority,
              as: "priority",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });
    console.log("PRIORITY", slasInUsePriority);

    const out = {
      success: true,
      data: updatedCategory,
      message: "Category updated successfully",
    };
    console.log("LENGT PRIORITY IN USE", slasInUsePriority.length);

    if (slasInUsePriority.length > 0) {
      out.warning = `Priority ${slasInUsePriority.join(" , ")} in category ${
        updatedCategory.name
      } can\'t update because use in another table `;
    }
    console.log("OUT", out);

    res.status(200).json(out);
  } catch (error) {
    // Rollback transaction on any error
    await transaction.rollback();

    console.error("Error updating category with SLAs:", error);

    // Handle specific validation errors
    if (
      error.message.includes("required") ||
      error.message.includes("positive numbers") ||
      error.message.includes("less than resolution time")
    ) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // Handle Sequelize validation errors
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    // Handle Sequelize unique constraint errors
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        error: "Duplicate entry",
        details: error.errors.map((err) => err.message),
      });
    }

    // Handle foreign key constraint errors
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        error: "Foreign key constraint error",
        details: "Referenced record does not exist",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Sla,
          as: "sla",
          include: [
            {
              model: Priority,
              as: "priority",
            },
          ],
        },
      ],
    });
    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }
    const usedInOrders = await Ticket.findOne({ where: { category_id: id } });
    if (usedInOrders) {
      return res.status(409).json({
        success: false,
        error:
          "Cannot delete this category because it is being used in another table",
      });
    }
    const currentSlaIds = category.sla.map((sla) => sla.id);
    console.log(currentSlaIds);

    await Sla.destroy({
      where: { id: currentSlaIds },
    });

    // category.sla.forEach(element => {

    // });
    await category.destroy();

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
  getAllCategory,
  getCategoryById,
  createCategory,
  updateCategory,
  getCategoryBySla,
  createCategoryWithSla2,
  updateCategoryWithSla,
  deleteCategory,
};
