const { Comments, Category, Priority, User } = require("../models");
const { validationResult } = require("express-validator");

const getAllComments = async (req, res) => {
  try {
    const comments = await Comments.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
    });
    res.status(200).json({
      success: true,
      data: comments,
      count: comments.length,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const createComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { message, ticket_id } = req.body;
    const userLogin = req.user.id;
    const newComment = await Comments.create({
      message,
      user_id: userLogin, //USer Id Sementara
      ticket_id,
    });
    const getComment = await Comments.findByPk(newComment.id);
    res.status(201).json({
      success: true,
      data: getComment,
      message: "Comment created successfully",
    });
  } catch (error) {
    console.error("Error creating Comment:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
module.exports = { getAllComments, createComment };
