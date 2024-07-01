// const conn = require("../mariadb"); // db 모듈
const { StatusCodes } = require("http-status-codes"); // statud code 모듈
const crypto = require("crypto"); // crypto 모듈 : 암호화
const users = require("../db/users");
// const dotenv = require("dotenv"); // dotenv 모듈
// dotenv.config();

const SALT_BYTE_SEQUENCE_SIZE = 10;
const HASH_REPEAT_TIMES = 10000; // 해시 생성 시 반복할 횟수입니다. 반복 횟수가 많을수록 해시 생성에 시간이 더 걸리므로 공격자가 해시값을 깨기 어렵게 합니다.

let scoreId = 1;
let userId = 1;

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

    if (users.get(id)) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "중복된 아이디입니다.",
      });
    } else {
      users.set(id, { hashPassword, salt, scoreInfo: { scoreId } });
      scoreId++;
      /**
        users.set(userIdNumber, {
          id,
          hashPassword,
          salt,
          scoreInfo: { scoreId },
        });
        userIdNumber++;
        scoreId++;
       */
      return res.status(StatusCodes.CREATED).json({ message: "OK" });
    }
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.CONFLICT).json({ message: err });
  }
  // let values = [id, hashPassword, salt];
  // conn.query(sql, values, (err, results) => {
  //   if (err) {
  //     console.log(err);
  //     return res.status(StatusCodes.BAD_REQUEST).end();
  //   }
  //   if (results.affectedRows) //  affectedRows는 영향받은 rows의 수를 의미
  //     return res.status(StatusCodes.CREATED).json(results);
  //   else return res.status(StatusCodes.BAD_REQUEST).end();
  // });
};

// "/join/check-login-id"
// 회원가입인데 check-login-id이 맞는가?,
const checkLoginId = (req, res) => {
  const { id } = req.body;

  try {
    const userInfo = users.get(id);

    // console.log(`salt : ${salt}, hashPassword : ${hashPassword}`);

    console.log(`userInfo : `, userInfo);
    let results;
    if (userInfo) {
      results = { isDulicated: true };
    } else {
      results = { isDulicated: false };
    }
    return res.status(StatusCodes.OK).json(results);

    // users.set(id, { hashPassword, salt });
    // console.log(`users `, users);
    // return res.json({ message: "OK" });
  } catch (err) {
    console.error(err);
    return res.json({ message: err });
  }
};
module.exports = {
  join,
  checkLoginId,
};
