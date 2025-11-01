const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db_config");
const TicketLog = sequelize.define(
  "TicketLog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ticket_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "tickets",
        key: "id",
      },
    },
    action: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    old_value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    new_value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    changed_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "ticket_logs",
    timestamps: true,
  }
);
module.exports = TicketLog;
