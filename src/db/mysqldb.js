// mysql 모듈 소환
const mysqldb = require("mysql2/promise");

const pool = mysqldb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dateStrings: true,
});

module.exports = pool;
