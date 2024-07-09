const { body } = require("express-validator");

// 숫자인지 확인하고, 정수인지 확인
const ensureInt = (value) => {
  if (!isNaN(value) && Number.isInteger(parseFloat(value))) {
    return true;
  }
  return false;
};

const quizValidators = {
  saveQuizResult: [
    body("totalQuizCount")
      .exists()
      .withMessage("응시한 문제 수가 존재해야 합니다.")
      .notEmpty()
      .withMessage("응시한 문제 수가 비어 있을 수 없습니다.")
      .custom(ensureInt)
      .withMessage("응시한 문제 수는 문자열이 아닌 정수여야 합니다.")
      .isInt({ min: 0 })
      .withMessage("응시한 문제 수가 0 이상의 정수여야 합니다."),
    body("solvedQuizCount")
      .exists()
      .withMessage("맞춘 문제 수가 존재해야 합니다.")
      .notEmpty()
      .withMessage("맞춘 문제 수는 비어 있을 수 없습니다.")
      .custom(ensureInt)
      .withMessage("맞춘 문제 수는 문자열이 아닌 정수여야 합니다.")
      .isInt({ min: 0 })
      .withMessage("맞춘 문제 수는 0 이상의 정수여야 합니다."),
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
