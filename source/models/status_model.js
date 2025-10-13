const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db_config");

const Status = sequelize.define(
  "Status",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    color: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
    tableName: "statuses",
  }
);

module.exports = Status;
