// mysql 모듈 소환
const dotenv = require("dotenv");
const mysqldb = require("mysql2/promise");

// const mysqldb = require("mysql2");

dotenv.config();

// DB와 연결 통로 생성
const connection = mysqldb.createPool({
  host: "127.0.0.1", // process.env.DB_HOST
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dateStrings: true,
});

// 데이터베이스 연결 시도
// connection.connect((err) => {
//   if (err) {
//     console.error("데이터베이스 연결 실패:", err.stack);
//     return;
//   }
//   console.log("데이터베이스 연결 성공, 연결 ID:", connection.threadId);
// });

module.exports = connection;
