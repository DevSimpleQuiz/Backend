// mysql 모듈 소환
const dotenv = require("dotenv");
const mysqldb = require("mysql2/promise");

dotenv.config();

const connection = mysqldb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dateStrings: true,
});

module.exports = connection;
