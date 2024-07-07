// src/validators/userValidators.js
const { body } = require("express-validator");

const userValidators = {
  id: [
    body("id")
      .trim()
      .isLength({ min: 5, max: 20 })
      .matches(/^[a-z0-9]+$/)
      .withMessage("아이디는 5~20자 영어 소문자, 숫자만 가능합니다."),
  ],
  password: [
    body("password")
      .trim()
      .isLength({ min: 8, max: 20 })
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[?!@#$%])[A-Za-z\d?!@#$%]{8,20}$/
      )
      .withMessage(
        "비밀번호는 8~20자 영어 대소문자, 숫자, 특수문자(? ! @ # $ %)만 가능합니다."
      ),
  ],
  newPassword: [
    body("newPassword")
      .trim()
      .isLength({ min: 8, max: 20 })
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[?!@#$%])[A-Za-z\d?!@#$%]{8,20}$/
      )
      .withMessage(
        "비밀번호는 8~20자 영어 대소문자, 숫자, 특수문자(? ! @ # $ %)만 가능합니다."
      ),
  ],
};

module.exports = userValidators;
