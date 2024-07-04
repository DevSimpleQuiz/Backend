const { StatusCodes } = require("http-status-codes");
const crypto = require("crypto");
const connection = require("../db/mysqldb.js");
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

module.exports = {
  join,
  checkLoginId,
};
