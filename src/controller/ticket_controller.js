const {
  Ticket,
  Category,
  Priority,
  Sla,
  User,
  Status,
  Comments,
  SLALog,
  TicketLog,
  Attachment,
} = require("../models");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

const buildWhereConditions = (search, category, priority, status, user) => {
  const conditions = [];

  if (search) {
    conditions.push({
      subject: {
        [Op.like]: `%${search}%`,
      },
    });
  }
  if (user.role_id === 2) {
    conditions.push({
      agent_id: {
        [Op.or]: [user.id, null],
      },
    });
  }
  if (user.role_id === 3) {
    conditions.push({
      user_id: user.id,
    });
  }
  // Build filter conditions
  const filterConditions = {};
  if (category) filterConditions.category_id = category;
  if (priority) filterConditions.priority_id = priority;
  if (status) filterConditions.status_id = status;

  if (Object.keys(filterConditions).length > 0) {
    conditions.push(filterConditions);
  }

  // If we have both search and filters, use AND logic
  if (search && Object.keys(filterConditions).length > 0) {
    return {
      [Op.and]: conditions,
    };
  }

  // If we only have search or only have filters
  if (conditions.length === 1) {
    return conditions[0];
  }

  // If we have multiple filter conditions but no search, combine them
  if (conditions.length > 1) {
    return {
      [Op.and]: conditions,
    };
  }

  return {};
};

const getAllTicket = async (req, res) => {
  try {
    const {
      limit,
      offset,
      page,
      sort,
      order,
      search,
      category,
      priority,
      status,
    } = req.queryParams;
    console.log("USER REQ", req.user);

    const whereConditions = buildWhereConditions(
      search,
      category,
      priority,
      status,
      req.user
    );
    const tickets = await Ticket.findAll({ where: whereConditions });
    const ticket = await Ticket.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "last_name"],
        },
        {
          model: User,
          as: "agent",
          attributes: ["id", "first_name", "last_name"],
        },
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
        {
          model: Priority,
          as: "priority",
          attributes: ["id", "name", "color"],
        },
        {
          model: Status,
          as: "status",
          attributes: ["id", "name", "color"],
        },
        {
          model: Sla,
          as: "sla",
          attributes: ["id", "sla_name", "response_time", "resolution_time"],
        },
        {
          model: SLALog,
          as: "sla_logs",
        },
      ],
      where: whereConditions,
      order: [[sort, order]],
      limit: limit,
      offset: offset,
    });
    res.status(200).json({
      success: true,
      data: ticket,
      count: ticket.length,
      total: tickets.length,
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const getTicket = await Ticket.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: User,
          as: "agent",
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
        {
          model: Priority,
          as: "priority",
          attributes: ["id", "name", "color"],
        },
        {
          model: Status,
          as: "status",
          attributes: ["id", "name", "color"],
        },
        {
          model: Sla,
          as: "sla",
          attributes: ["id", "sla_name", "response_time", "resolution_time"],
        },
        {
          model: Comments,
          as: "comments",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "first_name", "last_name", "email"], // opsional
            },
          ],
        },
        {
          model: SLALog,
          as: "sla_logs",
        },
        {
          model: TicketLog,
          as: "logs",
        },
        {
          model: Attachment,
          as: "attachments",
        },
      ],
    });
    if (!getTicket) {
      return res.status(404).json({
        success: false,
        error: "Ticket not found",
      });
    }
    res.status(200).json({
      success: true,
      data: getTicket,
    });
  } catch (error) {
    console.error("Error fetching ticket by ID:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
const createTicket = async (req, res) => {
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
      subject,
      user_id,
      agent_id,
      category_id,
      priority_id,
      status_id,
      comment,
    } = req.body;
    const userLogin = req.user.id;
    const sla = await Sla.findOne({
      where: {
        [Op.and]: [{ category_id: category_id }, { priority_id: priority_id }],
      },
    });
    if (!sla) {
      return res.status(400).json({
        success: false,
        error: "Sla not found for create ticket",
      });
    }
    const payload = {
      subject,
      user_id,
      agent_id,
      category_id,
      priority_id,
      sla_id: sla.id,
      status_id,
    };
    // agent_id ? (payload.status_id = 2) : (payload.status_id = status_id);
    const newTicket = await Ticket.create(payload);
    const now = new Date();
    let responseDueDate = new Date(now.getTime() + sla.response_time * 1000);
    let resolutionDueDate = new Date(
      now.getTime() + sla.resolution_time * 1000
    );
    const addSlaLog = {
      sla_id: sla.id,
      ticket_id: newTicket.id,
      response_duedate_at: responseDueDate,
      resolution_duedate_at: resolutionDueDate,
    };
    if (agent_id) addSlaLog.response_at = now;
    await SLALog.create(addSlaLog);
    await TicketLog.create({
      ticket_id: newTicket.id,
      action: "Created",
      new_value: `Ticket created with subject: ${subject}`,
      changed_by: userLogin,
    });
    if (comment) {
      await Comments.create({
        message: comment,
        ticket_id: newTicket.id,
        user_id: userLogin,
      });
    }

    const getTicket = await Ticket.findByPk(newTicket.id);
    res.status(201).json({
      success: true,
      data: getTicket,
      message: "Ticket created successfully",
    });
  } catch (error) {
    console.error("Error creating Ticket:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
const updateTicket = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }
    const { id } = req.params;
    const { subject, user_id, agent_id, category_id, priority_id, status_id } =
      req.body;
    const userLogin = req.user.id;
    // Validate ID format
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid Ticket ID format",
      });
    }

    // Find user
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: "Ticket not found",
      });
    }
    // Check if email is being changed and if it's already taken
    const sla = await Sla.findOne({
      where: {
        [Op.and]: [
          { category_id: category_id ?? ticket.category_id },
          { priority_id: priority_id ?? ticket.priority_id },
        ],
      },
    });
    if (!sla) {
      return res.status(400).json({
        success: false,
        error: "Sla not found for update ticket",
      });
    }

    // Update user
    const updateData = {};

    if (subject) updateData.subject = subject.trim();
    if (user_id) updateData.user_id = user_id;
    if (agent_id) updateData.agent_id = agent_id;
    if (category_id) updateData.category_id = category_id;
    if (priority_id) updateData.priority_id = priority_id;
    if (status_id) updateData.status_id = status_id;
    // if (sla) updateData.sla_id = sla.id;

    const oldValues = { ...ticket.dataValues };
    await ticket.update(updateData);

    // Fetch updated user with role
    for (const [key, newValue] of Object.entries(updateData)) {
      if (oldValues[key] !== newValue) {
        await TicketLog.create({
          ticket_id: id,
          action: `Updated ${key}`,
          old_value: `${oldValues[key]}`,
          new_value: `${newValue}`,
          changed_by: userLogin,
        });
      }
    }
    const now = new Date();
    let responseDueDate = new Date(now.getTime() + sla.response_time * 1000);
    let resolutionDueDate = new Date(
      now.getTime() + sla.resolution_time * 1000
    );
    if (
      oldValues.status_id === 1 &&
      status_id === 1 &&
      category_id &&
      priority_id
    ) {
      await SLALog.update(
        {
          sla_id: sla.id,
          response_duedate_at: responseDueDate,
          resolution_duedate_at: resolutionDueDate,
        },
        { where: { ticket_id: id } }
      );
    }
    if (updateData.status_id !== 1) {
      await SLALog.update(
        { response_at: new Date() },
        { where: { ticket_id: id, response_at: null } }
      );
    }
    if (updateData.status_id === 3) {
      // Assuming 4 is "Resolved"
      await SLALog.update(
        { resolution_at: new Date() },
        { where: { ticket_id: id, resolution_at: null } }
      );
    }
    const updatedTicket = await Ticket.findByPk(id);
    res.status(200).json({
      success: true,
      data: updatedTicket,
      message: "Ticket updated successfully",
    });
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
const assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { agent_id } = req.body;
    const userLogin = req.user.id;
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    const oldAgentId = ticket.agent_id;
    await ticket.update({ agent_id });

    // Log assignment
    await TicketLog.create({
      ticket_id: id,
      action: "Assigned",
      old_value: oldAgentId ? String(oldAgentId) : null,
      new_value: String(agent_id),
      changed_by: userLogin,
    });

    // Update SLA response time
    await SLALog.update(
      { response_at: new Date() },
      { where: { ticket_id: id, response_at: null } }
    );

    res.json({ success: true, message: "Ticket assigned successfully" });
  } catch (error) {
    console.error("Error assigment ticket:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

module.exports = {
  getAllTicket,
  getTicketById,
  createTicket,
  updateTicket,
  assignTicket,
};
