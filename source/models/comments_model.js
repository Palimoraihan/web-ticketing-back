const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db_config");

const Comments = sequelize.define(
  "Comments",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    message: {
      type: DataTypes.STRING,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "User",
        key: "id",
      },
    },
    ticket_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Ticket",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
    tableName: "comments",
  }
);

module.exports = Comments;
