const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db_config");

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
    tableName: 'category'
  }
);

module.exports = Category;
