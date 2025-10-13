const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db_config");
const Attachment = sequelize.define(
  "Attachment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    file_url: {
      type: DataTypes.STRING(450),
      allowNull: false,
    },
    ticket_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "tickets",
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    last_comment: {
      type: DataTypes.INTEGER,
      allowNull:false
    },
  },
  {
    tableName: "attachments",
    timestamps: true,
  }
);
module.exports = Attachment;
