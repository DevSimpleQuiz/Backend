// const conn = require("../mariadb"); // db 모듈
const { StatusCodes } = require("http-status-codes"); // statud code 모듈
const crypto = require("crypto"); // crypto 모듈 : 암호화
const users = require("../db/users");
const scores = require("../db/scores");
// const dotenv = require("dotenv"); // dotenv 모듈
// dotenv.config();

const SALT_BYTE_SEQUENCE_SIZE = 32;
const HASH_REPEAT_TIMES = 10000; // 해시 생성 시 반복할 횟수입니다. 반복 횟수가 많을수록 해시 생성에 시간이 더 걸리므로 공격자가 해시값을 깨기 어렵게 합니다.

let scoreId = 1;
let userId = 1;

const findUser = function (id) {
  for (const [_, user] of users) {
    if (user["id"] === id) {
      return user;
    }
  }
  return null;
};

const findScoreInfo = function (id) {
  const userInfo = findUser(id);

  if (userInfo === null) {
    return null;
  }

  return scores.get(userInfo["scoreId"]);
};

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
      users.set(userId, { id, hashPassword, salt, scoreId });
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

// "/join/check-login-id", 회원가입인데 check-login-id이 맞는가?,
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
