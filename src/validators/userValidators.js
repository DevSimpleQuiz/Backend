const { body } = require("express-validator");

const userValidators = {
  id: [
    body("id")
      .exists()
      .withMessage("아이디는 5~20자 영어 소문자, 숫자만 가능합니다.")
      .trim()
      .notEmpty()
      .withMessage("아이디는 5~20자 영어 소문자, 숫자만 가능합니다.")
      .matches(/^[a-z0-9]{5,20}$/)
      .withMessage("아이디는 5~20자 영어 소문자, 숫자만 가능합니다."),
  ],
  password: [
    body("password")
      .exists()
      .withMessage(
        "비밀번호는 8~20자 영어 대소문자, 숫자, 특수문자(? ! @ # $ %)만 가능합니다."
      )
      .trim()
      .notEmpty()
      .withMessage(
        "비밀번호는 8~20자 영어 대소문자, 숫자, 특수문자(? ! @ # $ %)만 가능합니다."
      )
      .matches(/^[A-Za-z\d?!@#$%]{8,20}$/)
      .withMessage(
        "비밀번호는 8~20자 영어 대소문자, 숫자, 특수문자(? ! @ # $ %)만 가능합니다."
      ),
  ],
  newPassword: [
    body("newPassword")
      .exists()
      .withMessage(
        "비밀번호는 8~20자 영어 대소문자, 숫자, 특수문자(? ! @ # $ %)만 가능합니다."
      )
      .trim()
      .notEmpty()
      .withMessage(
        "비밀번호는 8~20자 영어 대소문자, 숫자, 특수문자(? ! @ # $ %)만 가능합니다."
      )
      .matches(/^[A-Za-z\d?!@#$%]{8,20}$/)
      .withMessage(
        "비밀번호는 8~20자 영어 대소문자, 숫자, 특수문자(? ! @ # $ %)만 가능합니다."
      ),
  ],
};

module.exports = userValidators;
