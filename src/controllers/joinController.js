const { StatusCodes } = require("http-status-codes");
const crypto = require("crypto");
const users = require("../db/users");
const scores = require("../db/scores");
const { findUser } = require("../utils/util.js");

const {
  SALT_BYTE_SEQUENCE_SIZE,
  HASH_REPEAT_TIMES,
} = require("../constants/constant.js");

let scoreId = Object.keys(scores).length || 1;
let userId = Object.keys(users).length || 1;

console.log(`scoreId : ${scoreId}`);
console.log(`userId : ${userId}`);

const join = (req, res) => {
  const { id, password } = req.body;

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

    if (findUser(id) !== null) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "중복된 아이디입니다.",
      });
    } else {
      users.set(userId, { id, password: hashPassword, salt, scoreId });
      scores.set(scoreId, {
        id,
        totalQuizCount: 0,
        solvedQuizCount: 0,
        totalQuizScore: 0,
      });
      userId++;
      scoreId++;
      return res.status(StatusCodes.CREATED).json({ message: "OK" });
    }
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.CONFLICT).json({ message: err });
  }
};

const checkLoginId = (req, res) => {
  const { id } = req.body;

  try {
    let results;

    if (findUser(id)) {
      results = { isDulicated: true };
    } else {
      results = { isDulicated: false };
    }
    return res.status(StatusCodes.OK).json(results);
  } catch (err) {
    console.error(err); // logger로 대체 예정
    return res.json({ message: err });
  }
};

module.exports = {
  join,
  checkLoginId,
};
