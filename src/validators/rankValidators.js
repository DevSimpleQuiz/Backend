const { query, validationResult } = require("express-validator");

const rankValidators = [
  // page 필수, 존재 여부와 숫자인지 확인
  query("page")
    .exists({ checkFalsy: true }) // 값이 존재하는지 확인 (빈 문자열 허용 안함)
    .withMessage("Page 파라미터는 필수입니다.")
    .bail()
    .isInt({ min: 1, max: 2147483647 }) // 숫자 여부 및 범위 검증
    .withMessage("Page는 1에서 2147483647 사이의 정수여야 합니다."),

  // limit 필수, 존재 여부와 숫자인지 확인
  query("limit")
    .exists({ checkFalsy: true }) // 값이 존재하는지 확인 (빈 문자열 허용 안함)
    .withMessage("Limit 파라미터는 필수입니다.")
    .bail()
    .isInt({ min: 1, max: 100 }) // 숫자 여부 및 범위 검증
    .withMessage("Limit은 1에서 100 사이의 정수여야 합니다."),
];

// 검증 에러 처리 및 형 변환 미들웨어
const handleValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // 검증 통과 후 page, limit 숫자형으로 변환
  req.query.page = parseInt(req.query.page, 10);
  req.query.limit = parseInt(req.query.limit, 10);
  next();
};

module.exports = {
  rankValidators,
  handleValidationResult,
};
