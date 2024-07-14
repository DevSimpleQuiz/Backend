const jwt = require("jsonwebtoken");
const createHttpError = require("http-errors");
const { StatusCodes } = require("http-status-codes");

const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    return decoded;
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw createHttpError(
        StatusCodes.UNAUTHORIZED,
        "토큰이 만료되었습니다.",
        err
      );
    } else {
      throw createHttpError(
        StatusCodes.UNAUTHORIZED,
        "토큰 인증에 실패 하셨습니다.",
        err
      );
    }
  }
};

/* 
const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    return decoded;
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw createHttpError(StatusCodes.UNAUTHORIZED, "토큰이 만료되었습니다.");
    } else {
      throw createHttpError(
        StatusCodes.UNAUTHORIZED,
        "토큰 인증에 실패 하셨습니다."
      );
    }
  }
};
*/

/**
const verifyToken = async (token) => {
  return await new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_PRIVATE_KEY, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          reject(
            createHttpError(StatusCodes.UNAUTHORIZED, "토큰이 만료되었습니다.")
          );
        } else {
          reject(
            createHttpError(
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
 */

module.exports = { verifyToken };
