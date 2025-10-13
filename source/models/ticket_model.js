const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db_config");

const Ticket = sequelize.define(
  "Ticket",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    subject: {
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
    agent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "User",
        key: "id",
      },
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Category",
        key: "id",
      },
    },
    priority_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Priority",
        key: "id",
      },
    },
    status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Status",
        key: "id",
      },
    },
    sla_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Sla",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
    tableName: "tickets",
  }
);

module.exports = Ticket;
