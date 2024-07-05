const { StatusCodes } = require("http-status-codes"); // statud code 모듈
const crypto = require("crypto");
const createError = require("http-errors");
const connection = require("../db/mysqldb"); // db 모듈
const userQuery = require("../queries/userQuery.js");
const { verifyToken } = require("../services/jwtService");

const {
  SALT_BYTE_SEQUENCE_SIZE,
  HASH_REPEAT_TIMES,
  DIGEST_ALGORITHM,
  ENCODING_STYLE,
} = require("../constant/constant.js");
const { convertHashPassword, generateSalt } = require("../services/userService.js");

const { verifyToken } = require("../services/jwtService.js");

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
      .json({ message: "Internal Server Error" });
  }

  // 암호화된 비밀번호와 salt 값을 같이 DB에 저장
  try {
    const salt = crypto
      .randomBytes(SALT_BYTE_SEQUENCE_SIZE)
      .toString(ENCODING_STYLE);

    const hashPassword = crypto
      .pbkdf2Sync(
        password,
        salt,
        HASH_REPEAT_TIMES,
        SALT_BYTE_SEQUENCE_SIZE,
        DIGEST_ALGORITHM
      )
      .toString(ENCODING_STYLE);

    let values = [id, hashPassword, salt];

    await connection.query(userQuery.join, values);

    return res.status(StatusCodes.CREATED).json({ message: "OK" });
  } catch (err) {
    console.error("insert error ", err);
    return res
      .status(StatusCodes.CONFLICT)
      .json({ message: "Internal Server Error" });
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
      .json({ message: "Internal Server Error" });
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
        .toString(ENCODING_STYLE);
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
      message: "Internal Server Error",
    });
  }
};

/**
 * 현재 비밀번호를 제대로 입력헀는지 확인한다.
 */
const isCurrentPassword = async (req, res) => {
  const { password } = req.body;
  const token = req.cookies.token;

  try {
    if (!token) {
      throw createError(
        StatusCodes.FORBIDDEN,
        "인증받지 않은 사용자입니다. 로그인 해주세요."
      );
    }

    const payload = await verifyToken(token);
    const userId = payload.id;

    console.log("userId : ", userId);

    const getUserPasswordInfoResult = await connection.query(
      userQuery.getUserPasswordInfo,
      userId
    );
    const loginUser = getUserPasswordInfoResult[0][0];

    if (!loginUser) {
      throw createError(
        StatusCodes.NOT_FOUND,
        "사용자 정보를 찾을 수 없습니다."
      );
    }

    const hashPassword = convertHashPassword(
      password,
      generateSalt(),
    );

    if (loginUser.password !== hashPassword) {
      throw createError(
        StatusCodes.UNAUTHORIZED,
        "비밀번호가 일치하지 않습니다."
      );
    }
    return res.status(StatusCodes.NO
  } catch (error) {
    // return res
    //   .status(StatusCodes.INTERNAL_SERVER_ERROR)
    //   .json({ message: "Internal Server Error" });
    next(error); // 에러를 미들웨어로 전달
  }
};

/**
 * 현재 비밀번호와 이전 비밀번호가 다른지 비교한다.
 */
const isAvailablePassword = async (req, res) => {
  const { password, newPassword } = req.body;
  let result;

  if (password === newPassword) {
    result = {
      success: false,
      message: "현재 비밀번호와 같은 비밀번호는 사용할 수 없습니다.",
    };
  } else {
    result = {
      success: true,
    };
  }
  return res.status(StatusCodes.OK).json(result);
};

/**
 * 현재 비밀번호가 맞는지 확인,
 * 변경 비밀번호와 현재 비밀번호가 다른지 확인
 */
const passwordResetRequest = async (req, res) => {
  // return re
};

const passwordReset = (req, res) => {
  // return re
};

module.exports = {
  join,
  checkLoginId,
  login,
  isCurrentPassword,
  isAvailablePassword,
  passwordResetRequest,
  passwordReset,
};
