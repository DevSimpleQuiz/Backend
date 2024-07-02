const INVAILD_ID_MSG =
  "아이디는 5~20자의 영어 소문자, 숫자로만 구성 가능합니다";
const INVAILD_PASSWORD_MSG =
  "비밀번호는 5~20자의 영어 대소문자, 숫자, 특수문자로만 구성 가능합니다";

const isAlphaNumeric = (str) => {
  for (const code of str) {
    if (
      !(code >= "a" && code <= "z") &&
      !(code >= "A" && code <= "Z") &&
      !(code >= "0" && code <= "9")
    ) {
      return false;
    }
  }
  return true;
};

const isLowerAlphaNumeric = (str) => {
  if (isAlphaNumeric(str) === false) return false;

  // 대문자가 껴있다면 false
  for (const code of str) {
    if (code >= "A" && code <= "Z") {
      return false;
    }
  }
  return true;
};

/**
 * @param {*} id 회원가입 시 유저가 입력한 id
 * @returns boolean
 * 5~20자, 영어 소문자와 숫자 이어야만 한다.
 */
const validateId = (req, res, next) => {
  const { id } = req.body;
  const trimmedId = id.trim();

  // 5~20자
  if (trimmedId.length < 5 || trimmedId.length > 20) {
    // return false;
    return res.status(401).json({
      message: INVAILD_ID_MSG,
    });
  }

  // alphabet, number로만 이루어져 있는지 확인
  if (isLowerAlphaNumeric(trimmedId)) {
    next();
  } else {
    return res.status(401).json({ message: INVAILD_ID_MSG });
  }
};

/**
 * @param {*} id 회원가입 시 유저가 입력한 password
 * @returns boolean
 * 5~20자, 영문 대소문자, 숫자, 특수문자 포함
 */
const validatePassword = (req, res, next) => {
  const { password } = req.body;
  const trimmedPassword = password.trim();

  // 5~20자
  if (trimmedPassword.length < 5 || trimmedPassword.length > 20) {
    return res.status(401).json({
      message: INVAILD_PASSWORD_MSG,
    });
  }
  // 정규표현식을 사용하여 영문 대소문자, 숫자, 특수문자 포함 여부 확인
  const regex = /^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]*$/;

  // 비밀번호가 정규표현식과 일치하는지 확인
  if (regex.test(password)) {
    next();
  } else {
    return res.status(401).json({
      message: INVAILD_PASSWORD_MSG,
    });
  }
};

module.exports = { validateId, validatePassword };
