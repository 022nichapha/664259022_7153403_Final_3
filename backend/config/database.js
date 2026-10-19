require("dotenv").config();
const { Sequelize } = require("sequelize");

// อ่านค่าจาก .env
const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME, DATABASE_URL } =
  process.env;

// สร้างการเชื่อมต่อด้วย DATABASE_URL หรือการรวมตัวแปรแยก
const sequelize = DATABASE_URL
  ? new Sequelize(DATABASE_URL, {
      dialect: "postgres",
      logging: false,
    })
  : new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
      host: DB_HOST,
      port: DB_PORT || 5432,
      dialect: "postgres",
      logging: false,
    });

module.exports = sequelize;
