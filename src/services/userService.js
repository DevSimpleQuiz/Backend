// src/services/userService.js
const crypto = require("crypto");

const {
  HASH_REPEAT_TIMES,
  SALT_BYTE_SEQUENCE_SIZE,
  DIGEST_ALGORITHM,
  ENCODING_STYLE,
} = require("../constant/constant.js");
const { verifyToken } = require("./jwtService.js");
const pool = require("../db/mysqldb.js");
const userQuery = require("../queries/userQuery.js");
const createHttpError = require("http-errors");
const { StatusCodes } = require("http-status-codes");

const generateSalt = () => {
  return crypto.randomBytes(SALT_BYTE_SEQUENCE_SIZE).toString(ENCODING_STYLE);
};

const convertHashPassword = (password, salt) => {
  const hashPassword = crypto
    .pbkdf2Sync(
      password,
      salt,
      HASH_REPEAT_TIMES,
      SALT_BYTE_SEQUENCE_SIZE,
      DIGEST_ALGORITHM
    )
    .toString(ENCODING_STYLE);

  return hashPassword;
};

const getUserNumIdByToken = async (token) => {
  try {
    const payload = await verifyToken(token);
    const userId = payload.id;
    const userIdResult = await pool.query(userQuery.getUserId, userId);
    const userNumId = userIdResult[0][0]?.id;

    if (!userNumId) {
      throw createHttpError(
        StatusCodes.NOT_FOUND,
        "사용자 정보를 찾을 수 없습니다."
      );
    }

    return userNumId;
  } catch (err) {
    console.error("Fatal: 유저의 아이디를 찾을 수 없습니다.");
    throw createHttpError(
      StatusCodes.NOT_FOUND,
      "사용자 정보를 찾을 수 없습니다."
    );
  }
};

module.exports = { convertHashPassword, generateSalt, getUserNumIdByToken };
