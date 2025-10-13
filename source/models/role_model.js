const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db_config");

const Role = sequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role_name: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
    tableName: 'roles'
  }
);

module.exports = Role;
