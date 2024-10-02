const { param, query, body } = require("express-validator");

/** 강제 형변환 미들웨어
 * UUID 문자열 값이 숫자로 시작하는 경우
 * 강제 형변환 이후 숫자 이후에 있는 문자열 값이 날아가는 문제 발생
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
*/

// 숫자인지 확인하고, 정수인지 확인
const ensureInt = (value) => {
  if (!isNaN(value) && Number.isInteger(parseFloat(value))) {
    return true;
  }
  return false;
};

const quizValidators = {
  markQuizAnswer: [
    param("quizId")
      .isInt({ min: 1 })
      .withMessage("퀴즈 id는 양의 정수이어야 합니다."),
    query("answer")
      .exists({ checkFalsy: true }) // 빈 문자열, null, undefined 다 걸러냄
      .withMessage("답변은 필수 항목입니다.")
      .isString()
      .withMessage("답변은 문자열이어야 합니다.")
      .notEmpty()
      .withMessage("답변은 비어있어서는 안됩니다.")
      .trim()
      .escape(),
  ],
  saveQuizResult: [
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
    body("challengeId")
      .optional()
      .notEmpty()
      .withMessage("챌린지 ID가 존재해야 합니다.")
      .isUUID()
      .withMessage("챌린지 ID는 UUID 형식이어야 합니다."),
    body("quizId")
      .exists()
      .withMessage("퀴즈ID가 존재해야 합니다.")
      .notEmpty()
      .withMessage("퀴즈ID는 비어 있을 수 없습니다.")
      .custom(ensureInt)
      .withMessage("퀴즈ID는 문자열이 아닌 정수여야 합니다.")
      .isInt({ min: 0 })
      .withMessage("퀴즈ID는 0 이상의 정수여야 합니다."),
  ],
};

module.exports = quizValidators;
