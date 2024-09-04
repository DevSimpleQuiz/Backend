const createHttpError = require("http-errors");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const { COOKIE_OPTION } = require("../constant/constant.js");

const isAuthenticated = (req, res, next) => {
  const token = req.cookies?.token;

  console.log("token : ", token);
  console.log("req.cookies : ", req.cookies);
  if (!token) {
    console.log("인증받지 않은 사용자입니다. 로그인 해주세요.");
    return next(
      createHttpError(
        StatusCodes.FORBIDDEN,
        "인증받지 않은 사용자입니다. 로그인 해주세요."
      )
    );
  }

  jwt.verify(token, process.env.JWT_PRIVATE_KEY, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        // 토큰이 만료된 경우
        res.clearCookie("token", COOKIE_OPTION);
        console.log("토큰이 만료되었습니다.");
        return next(
          createHttpError(StatusCodes.UNAUTHORIZED, "토큰이 만료되었습니다.")
        );
      } else {
        // 그 외의 인증 오류
        console.log("인증에 실패했습니다.");
        return next(
          createHttpError(StatusCodes.UNAUTHORIZED, "인증에 실패했습니다.")
        );
      }
    } else {
      // 토큰이 유효한 경우, 이미 인증된 사용자
      req.user = decoded;
      next();
    }
  });
};

const isNotAuthenticated = (req, res, next) => {
  const token = req.cookies.token;

  // 로그인 하지 않은 것을 확인하므로 토큰이 없으면 다음 로직으로 이동.
  if (!token) {
    return next();
  }

  jwt.verify(token, process.env.JWT_PRIVATE_KEY, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        // 토큰이 만료된 경우
        res.clearCookie("token", COOKIE_OPTION);
        console.log("토큰이 만료되었습니다.");
        return next(
          createHttpError(StatusCodes.UNAUTHORIZED, "토큰이 만료되었습니다.")
        );
      } else {
        // 그 외의 인증 오류
        console.log("인증에 실패했습니다.");
        return next(
          createHttpError(StatusCodes.UNAUTHORIZED, "인증에 실패했습니다.")
        );
      }
    } else {
      // 토큰이 유효한 경우, 이미 인증된 사용자
      console.log(`${decoded.id}은(는) 이미 인증된 사용자입니다.`);
      return next(
        createHttpError(StatusCodes.FORBIDDEN, "이미 인증된 사용자입니다.")
      );
    }
  });
};

module.exports = {
  isAuthenticated,
  isNotAuthenticated,
};
