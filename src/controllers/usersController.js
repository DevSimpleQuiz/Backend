// const conn = require("../mariadb"); // db 모듈
const { StatusCodes } = require("http-status-codes"); // statud code 모듈
const jwt = require("jsonwebtoken"); // jwt 모듈
const crypto = require("crypto"); // crypto 모듈 : 암호화
const { findUser } = require("../utils/util.js");

// const dotenv = require("dotenv"); // dotenv 모듈
// dotenv.config();
const {
  SALT_BYTE_SEQUENCE_SIZE,
  HASH_REPEAT_TIMES,
} = require("../constants/constant.js");

/**
 * login한 상태인지 미들웨어에서 확인 필요
 */
const login = (req, res) => {
  const { id, password } = req.body;
  const loginUser = findUser(id);

  if (loginUser) {
    const hashPassword = crypto
      .pbkdf2Sync(
        password,
        loginUser.salt,
        HASH_REPEAT_TIMES,
        SALT_BYTE_SEQUENCE_SIZE,
        "sha512"
      )
      .toString("base64");
    // => 디비 비밀번호랑 비교
    if (loginUser && loginUser.password == hashPassword) {
      // 토큰 발행
      const token = jwt.sign(
        {
          id: loginUser.id,
        },
        process.env.PRIVATE_KEY,
        {
          expiresIn: "10m",
          issuer: "DevSimQuiz",
        }
      );

      // 토큰 쿠키에 담기
      res.cookie("token", token, {
        httpOnly: true,
      });

      return res.status(StatusCodes.NO_CONTENT).end();
    } else {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "잘못된 아이디, 비밀번호를 입니다.",
      });
    }
  }
  return res.status(StatusCodes.UNAUTHORIZED).json({
    message: "잘못된 아이디, 비밀번호를 입니다.",
  });
};

module.exports = {
  login,
};
