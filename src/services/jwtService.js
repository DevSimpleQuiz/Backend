const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const { StatusCodes } = require("http-status-codes");

const verifyToken = async (token) => {
  return await new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_PRIVATE_KEY, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          reject(
            createError(StatusCodes.UNAUTHORIZED, "토큰이 만료되었습니다.")
          );
        } else {
          reject(
            createError(
              StatusCodes.UNAUTHORIZED,
              "토큰 인증에 실패 하셨습니다."
            )
          );
        }
      } else {
        resolve(decoded);
      }
    });
  });
};

module.exports = { verifyToken };
