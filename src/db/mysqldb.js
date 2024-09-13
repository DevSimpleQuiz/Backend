// mysql 모듈 소환
// import { createPool } from "mysql2/promise";
const { createPool } = require("mysql2/promise");

const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dateStrings: true,
});

module.exports = pool;
