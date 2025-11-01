const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db_config");

const Sla = sequelize.define(
  "Sla",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sla_name: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
    },
    response_time: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    resolution_time: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
  },
  {
    timestamps: true,
    tableName: "sla",
  }
);

module.exports = Sla;
