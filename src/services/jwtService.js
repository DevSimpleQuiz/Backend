const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const { StatusCodes } = require("http-status-codes");

const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.PRIVATE_KEY, (err, decoded) => {
      if (err) {
        reject(
          createError(StatusCodes.UNAUTHORIZED, "인증에 실패 하셨습니다.")
        );
      } else {
        resolve(decoded);
      }
    });
  });
};

module.exports = { verifyToken };
