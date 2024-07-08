// src/controllers/userController.js
const { StatusCodes } = require("http-status-codes"); // statud code 모듈
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const connection = require("../db/mysqldb"); // db 모듈
const userQuery = require("../queries/userQuery.js");

const {
  convertHashPassword,
  generateSalt,
} = require("../services/userService.js");
const { verifyToken } = require("../services/jwtService.js");

const join = async (req, res, next) => {
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
    next(err);
  }

  // 암호화된 비밀번호와 salt 값을 같이 DB에 저장
  try {
    const salt = generateSalt();
    const hashPassword = convertHashPassword(password, salt);
    const values = [id, hashPassword, salt];

    await connection.query(userQuery.join, values);

    return res.status(StatusCodes.CREATED).json({ message: "OK" });
  } catch (err) {
    next(err);
  }
};

const checkLoginId = async (req, res, next) => {
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
    next(err);
  }
};

/**
 * login한 상태인지 미들웨어에서 확인 필요
 */
const login = async (req, res, next) => {
  const { id, password } = req.body;

  try {
    const getUserInfoResult = await connection.query(userQuery.getUserInfo, id);

    const loginUser = getUserInfoResult[0][0];

    if (loginUser) {
      const hashPassword = convertHashPassword(password, loginUser.salt);

      if (loginUser.password === hashPassword) {
        // 토큰 발행
        const token = jwt.sign(
          {
            id: loginUser.user_id,
          },
          process.env.JWT_PRIVATE_KEY,
          {
            expiresIn: process.env.TOKEN_EXPIRED_TIME,
            issuer: "DevSimQuiz",
          }
        );

        // 토큰 쿠키에 담기
        res.cookie("token", token, {
          httpOnly: true,
          sameStie: "strict",
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
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await res.clearCookie("token", { httpOnly: true });
    return res.status(StatusCodes.NO_CONTENT).end();
  } catch (err) {
    next(err);
  }
};

/**
 * 현재 비밀번호를 제대로 입력헀는지 확인한다.
 */
const isCurrentPassword = async (req, res, next) => {
  const { password } = req.body;
  const token = req.cookies.token;

  try {
    const payload = await verifyToken(token);
    const userId = payload.id;
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

    const hashPassword = convertHashPassword(password, loginUser.salt);

    if (loginUser.password === hashPassword) {
      return res.status(StatusCodes.OK).json({
        success: true,
      });
    } else {
      return res.status(StatusCodes.OK).json({
        success: false,
        message: "비밀번호가 틀렸습니다.",
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * 현재 비밀번호와 이전 비밀번호가 다른지 비교한다.
 * TODO: 다른 추가 검증이 필요한지 생각 및 조사
 */
const isAvailablePassword = async (req, res, next) => {
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
const resetPassword = async (req, res, next) => {
  const { password, newPassword } = req.body;
  const token = req.cookies.token;

  try {
    const payload = await verifyToken(token);
    const userId = payload.id;
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

    const hashPassword = convertHashPassword(password, loginUser.salt);

    if (loginUser.password === hashPassword) {
      if (password === newPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "현재 비밀번호와 같은 비밀번호는 사용할 수 없습니다.",
        });
      }
      const salt = generateSalt();
      const hashNewPassword = convertHashPassword(newPassword, salt);
      const values = [hashNewPassword, salt, userId];

      await connection.query(userQuery.resetPassword, values);

      return res.status(StatusCodes.NO_CONTENT).end();
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "비밀번호가 틀렸습니다.",
      });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  join,
  checkLoginId,
  login,
  logout,
  isCurrentPassword,
  isAvailablePassword,
  resetPassword,
};
