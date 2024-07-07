// src/middleware/authMiddleware.js
const createError = require("http-errors");
const { StatusCodes } = require("http-status-codes");
const { verifyToken } = require("../services/jwtService");

const isAuthenticated = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next(
      createError(
        StatusCodes.FORBIDDEN,
        "인증받지 않은 사용자입니다. 로그인 해주세요."
      )
    );
  }

  try {
    const payload = verifyToken(token);
    if (!payload) {
      return next(
        createError(StatusCodes.UNAUTHORIZED, "토큰이 유효하지 않습니다.")
      );
    }
    req.user = payload; // 요청에 사용자 정보를 추가
    next();
  } catch (error) {
    next(error);
  }
};

// 미인증된 사용자 체크 미들웨어
const isNotAuthenticated = (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    return next(
      createError(StatusCodes.FORBIDDEN, "이미 인증된 사용자입니다.")
    );
  }

  next();
};

module.exports = {
  isAuthenticated,
  isNotAuthenticated,
};
