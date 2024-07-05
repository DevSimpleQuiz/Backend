const { StatusCodes } = require("http-status-codes"); // statud code 모듈
const crypto = require("crypto");
const jwt = require("jsonwebtoken"); // jwt 모듈
const connection = require("../db/mysqldb"); // db 모듈
const userQuery = require("../queries/userQuery.js");

const {
  SALT_BYTE_SEQUENCE_SIZE,
  HASH_REPEAT_TIMES,
} = require("../constants/constant.js");

const join = async (req, res) => {
  const { id, password } = req.body;

  // id 중복 확인
  try {
    const getUserIdResult = await connection.query(userQuery.getUserId, id);
    const userId = getUserIdResult[0][0];

    if (userId) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "이미 사용 중인 아이디입니다.",
      });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }

  // 암호화된 비밀번호와 salt 값을 같이 DB에 저장
  try {
    const salt = crypto.randomBytes(SALT_BYTE_SEQUENCE_SIZE).toString("base64");
    const hashPassword = crypto
      .pbkdf2Sync(
        password,
        salt,
        HASH_REPEAT_TIMES,
        SALT_BYTE_SEQUENCE_SIZE,
        "sha512"
      )
      .toString("base64");

    let values = [id, hashPassword, salt];

    await connection.query(userQuery.join, values);

    return res.status(StatusCodes.CREATED).json({ message: "OK" });
  } catch (err) {
    console.error("insert error ", err);
    return res.status(StatusCodes.CONFLICT).json({ message: "Server error" });
  }
};

const checkLoginId = async (req, res) => {
  const { id } = req.body;
  // id 중복 확인
  try {
    const getUserIdResult = await connection.query(userQuery.getUserId, id);
    const userId = getUserIdResult[0][0];

    if (userId) {
      results = { isDulicated: true };
    } else {
      results = { isDulicated: false };
    }
    return res.status(StatusCodes.OK).json(results);
  } catch (err) {
    console.error(err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

/**
 * login한 상태인지 미들웨어에서 확인 필요
 */
const login = async (req, res) => {
  const { id, password } = req.body;

  try {
    const getUserPasswordInfoResult = await connection.query(
      userQuery.getUserPasswordInfo,
      id
    );

    const loginUser = getUserPasswordInfoResult[0][0];

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
      if (loginUser.password == hashPassword) {
        // 토큰 발행
        const token = jwt.sign(
          {
            id: loginUser.id,
          },
          process.env.PRIVATE_KEY,
          {
            expiresIn: "1m",
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
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: "server error",
    });
  }
};

/**
 * 현재 비밀번호가 맞는지 확인,
 * 변경 비밀번호와 현재 비밀번호가 다른지 확인
 */
const passwordResetRequest = async (req, res) => {
  // return re
  const { password, newPassword } = req.body;

  if (password === newPassword) {
    return res.status(StatusCodes.OK);
  }

  const token = req.cookies.token;

  let payload;

  jwt.verify(token, process.env.PRIVATE_KEY, (err, decoded) => {
    if (err) {
      return res.status(StatusCodes.FORBIDDEN).end();
    }

    payload = decoded; // Save the decoded payload to the request object
  });

  const userId = payload.id;

  try {
    const getUserPasswordInfoResult = await connection.query(
      userQuery.getUserPasswordInfo,
      userId
    );

    const loginUser = getUserPasswordInfoResult[0][0];

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
      if (loginUser.password == hashPassword) {
      } else {
      }

      return res.status().json();
    }
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};

const passwordReset = (req, res) => {
  // return re
};

module.exports = {
  join,
  checkLoginId,
  login,
  passwordResetRequest,
  passwordReset,
};
