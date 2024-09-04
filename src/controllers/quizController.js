const StatusCodes = require("http-status-codes");
const {
  loadData,
  generateQuizSet,
  saveQuizDataToDatabase,
} = require("../quizGeneration/quizModule");
const { verifyToken } = require("../services/jwtService.js");
const pool = require("../db/mysqldb");
const userQuery = require("../queries/userQuery.js");
const scoreQuery = require("../queries/scoreQuery.js");
// TODO: RDB 또는 REDIS로 전환
(async () => {
  // 퀴즈용 엑셀 파일 로드, 최초 한번만 호출
  await loadData("data/words.xlsx");
  await saveQuizDataToDatabase();
})();

const generateQuiz = (req, res, next) => {
  try {
    // 퀴즈 세트 랜덤 생성
    const quizSet = generateQuizSet();

    return res.json(quizSet);
  } catch (err) {
    next(err);
  }
};

const saveQuizResult = async (req, res, next) => {
  try {
    let { totalQuizCount, solvedQuizCount, totalQuizScore } = req.body;
    const token = req.cookies.token;
    const payload = await verifyToken(token);
    const userId = payload.id;

    const getUserIdResult = await pool.query(userQuery.getUserId, userId);
    const userNumId = getUserIdResult[0][0]?.id;

    if (!userNumId) {
      throw createHttpError(
        StatusCodes.NOT_FOUND,
        "사용자 정보를 찾을 수 없습니다."
      );
    }

    const currentScoreInfoResult = await pool.query(
      scoreQuery.getScoreInfo,
      userNumId
    );

    const currentScoreInfo = currentScoreInfoResult[0][0];

    if (currentScoreInfo) {
      totalQuizCount += currentScoreInfo["total_quiz_count"];
      solvedQuizCount += currentScoreInfo["total_solved_count"];
      totalQuizScore += currentScoreInfo["total_score"];

      const values = [
        totalQuizCount,
        solvedQuizCount,
        totalQuizScore,
        userNumId,
      ];
      await pool.query(scoreQuery.updateScoreInfo, values);
    }

    return res.status(StatusCodes.NO_CONTENT).end();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  generateQuiz,
  saveQuizResult,
};
