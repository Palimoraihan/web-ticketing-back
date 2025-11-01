const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db_config");

const Priority = sequelize.define(
  "Priority",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    color:{
      type:DataTypes.STRING,
    }
  },
  {
    timestamps: true,
    tableName: 'priority'
  }
);

module.exports = Priority;
