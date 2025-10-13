const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db_config");

const SLALog = sequelize.define(
  "SLALog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    is_breached: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    response_duedate_at: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "response_duedate_at",
    },
    resolution_duedate_at: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "resolution_duedate_at",
    },
    response_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resolution_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sla_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Sla",
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
    tableName: "sla_logs",
    timestamps: false,
  }
);

module.exports = SLALog;
