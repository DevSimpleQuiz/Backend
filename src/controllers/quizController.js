const StatusCodes = require("http-status-codes");
const jwt = require("jsonwebtoken"); // jwt 모듈
const { loadData, generateQuizSet } = require("../quizGeneration/quizModule");

(async () => {
  // 퀴즈용 엑셀 파일 로드, 최초 한번만 호출
  await loadData("data/words.xlsx");
})();

// 랜덤 퀴즈 세트 생성
const generateQuiz = (req, res, next) => {
  try {
    const quizSet = generateQuizSet();

    return res.json(quizSet);
  } catch (err) {
    next(err);
  }
};

/**
 * Socore에서 찾아서 값 저장
 */
// 퀴즈 결과 생성, 로그인한 유저만 가능(미들웨어 처리)
const handleQuizResult = async (req, res) => {
  const { totalQuizCount, solvedQuizCount, totalQuizScore } = req.body;

  const token = req.cookies.token;

  let payload;

  await jwt.verify(token, process.env.JWT_PRIVATE_KEY, (err, decoded) => {
    if (err) {
      return res.status(StatusCodes.FORBIDDEN).end();
    }

    payload = decoded; // Save the decoded payload to the request object
  });

  const id = payload.id;

  return res
    .status(StatusCodes.UNAUTHORIZED)
    .json({ message: "퀴즈 정보가 더 필요합니다." });
};

module.exports = {
  generateQuiz,
  handleQuizResult,
};
