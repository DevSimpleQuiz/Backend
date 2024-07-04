const { StatusCodes } = require("http-status-codes");
const { isLowerAlphaNumeric } = require("../utils/util.js");

const INVAILD_ID_MSG =
  "아이디는 5~20자의 영어 소문자, 숫자로만 구성 가능합니다";
const INVAILD_PASSWORD_MSG =
  "비밀번호는 8~20자의 영어 대소문자, 숫자, 특수문자로만 구성 가능합니다";

/**회원가입 시 유저가 입력한 id
 * 5~20자, 영문 대소문자, 숫자, 특수문자 포함
 */
const validateId = (req, res, next) => {
  const { id } = req.body;
  const trimmedId = id.trim();

  // 5~20자
  if (trimmedId.length < 5 || trimmedId.length > 20) {
    // return false;
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: INVAILD_ID_MSG,
    });
  }

  // alphabet, number로만 이루어져 있는지 확인
  if (isLowerAlphaNumeric(trimmedId)) {
    next();
  } else {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: INVAILD_ID_MSG });
  }
};

/**회원가입 시 유저가 입력한 password
 * 8~20자, 영문 대소문자, 숫자, 특수문자 포함
 */
const validatePassword = (req, res, next) => {
  const { password } = req.body;
  const trimmedPassword = password.trim();

  // 8~20자
  if (trimmedPassword.length < 8 || trimmedPassword.length > 20) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: INVAILD_PASSWORD_MSG,
    });
  }
  // 정규표현식을 사용하여 영문 대소문자, 숫자, 특수문자 포함 여부 확인
  const regex = /^[a-zA-Z0-9?!@#$%]*$/;

  // 비밀번호가 정규표현식과 일치하는지 확인
  if (regex.test(password)) {
    next();
  } else {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: INVAILD_PASSWORD_MSG,
    });
  }
};

module.exports = { validateId, validatePassword };
