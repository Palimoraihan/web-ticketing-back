const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port:process.env.DB_PORT,
    dialect: "mysql",
    dialectOptions:{
      ssl: {
      require: true, // <<<<<<< YOU NEED THIS
    }
    },
    // logging: console.log
    logging: false

  }
);
module.exports = {sequelize}
