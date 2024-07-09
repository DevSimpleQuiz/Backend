const { body } = require("express-validator");

// 강제 형변환 미들웨어
const forceTypeConversion = (req, res, next) => {
  Object.keys(req.body).forEach((key) => {
    const value = req.body[key];
    const numberValue = parseFloat(value);
    if (!isNaN(numberValue) && Number.isInteger(numberValue)) {
      req.body[key] = numberValue;
    }
  });
  next();
};

// 숫자인지 확인하고, 정수인지 확인
const ensureInt = (value) => {
  if (!isNaN(value) && Number.isInteger(parseFloat(value))) {
    return true;
  }
  return false;
};

const quizValidators = {
  saveQuizResult: [
    forceTypeConversion,
    body("totalQuizCount")
      .exists()
      .withMessage("응시한 문제 수가 존재해야 합니다.")
      .notEmpty()
      .withMessage("응시한 문제 수가 비어 있을 수 없습니다.")
      .isInt({ min: 0 })
      .withMessage("응시한 문제 수가 0 이상의 정수여야 합니다.")
      .custom(ensureInt)
      .withMessage("응시한 문제 수는 문자열이 아닌 정수여야 합니다."),
    body("solvedQuizCount")
      .exists()
      .withMessage("맞춘 문제 수가 존재해야 합니다.")
      .notEmpty()
      .withMessage("맞춘 문제 수는 비어 있을 수 없습니다.")
      .custom(ensureInt)
      .withMessage("맞춘 문제 수는 문자열이 아닌 정수여야 합니다.")
      .isInt({ min: 0 })
      .withMessage("맞춘 문제 수는 0 이상의 정수여야 합니다.")
      .custom((value, { req }) => {
        if (parseInt(value, 10) > parseInt(req.body.totalQuizCount, 10)) {
          throw new Error("맞춘 문제 수는 응시한 문제 수보다 클 수 없습니다.");
        }
        return true;
      }),
    body("totalQuizScore")
      .exists()
      .withMessage("맞춘 총 점수가 존재해야 합니다.")
      .notEmpty()
      .withMessage("맞춘 총 점수는 비어 있을 수 없습니다.")
      .custom(ensureInt)
      .withMessage("맞춘 총 점수는 문자열이 아닌 정수여야 합니다.")
      .isInt({ min: 0 })
      .withMessage("맞춘 총 점수는 0 이상의 정수여야 합니다."),
  ],
};

module.exports = quizValidators;
