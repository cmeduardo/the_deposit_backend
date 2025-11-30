require("dotenv").config();

module.exports = {
  URL: process.env.DATABASE_URL,
  dialect: "postgres",
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
