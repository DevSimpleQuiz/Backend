const StatusCodes = require("http-status-codes");
const jwt = require("jsonwebtoken"); // jwt 모듈
const { loadData, generateQuizSet } = require("../quizGeneration/quizModule");
const { accumulateScoreInfo, findScoreInfo } = require("../utils/util");

(async () => {
  // 엑셀 파일 로드
  await loadData("data/words.xlsx");
})();

const generateQuiz = (req, res) => {
  try {
    // 랜덤 퀴즈 세트 생성
    const quizSet = generateQuizSet();
    return res.json(quizSet);
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

/**
 * Socore에서 찾아서 값 저장
 */
// 퀴즈 결과 생성, 로그인한 유저만 가능(미들웨어 처리)
const handleQuizResult = (req, res) => {
  const { totalQuizCount, solvedQuizCount, totalQuizScore } = req.body;

  const token = req.cookies.token;

  let payload;

  jwt.verify(token, process.env.PRIVATE_KEY, (err, decoded) => {
    if (err) {
      return res.status(StatusCodes.FORBIDDEN).end();
    }

    payload = decoded; // Save the decoded payload to the request object
  });

  const id = payload.id;
  if (
    accumulateScoreInfo(id, { totalQuizCount, solvedQuizCount, totalQuizScore })
  ) {
    scoreInfo = findScoreInfo(id);
    return res.status(StatusCodes.OK).json({ scoreInfo });
  } else {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "퀴즈 정보가 더 필요합니다." });
  }
};

module.exports = {
  generateQuiz,
  handleQuizResult,
};
