const StatusCodes = require("http-status-codes");
const { loadData, generateQuizSet } = require("../quizGeneration/quizModule");
const { verifyToken } = require("../services/jwtService.js");
const connection = require("../db/mysqldb");
const userQuery = require("../queries/userQuery.js");
const scoreQuery = require("../queries/scoreQuery.js");

(async () => {
  // 퀴즈용 엑셀 파일 로드, 최초 한번만 호출
  await loadData("data/words.xlsx");
})();

const generateQuiz = (req, res, next) => {
  try {
    // 랜덤 퀴즈 세트 생성
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
const saveQuizResult = async (req, res, next) => {
  try {
    let { totalQuizCount, solvedQuizCount, totalQuizScore } = req.body;
    const token = req.cookies.token;
    const payload = await verifyToken(token);
    const userId = payload.id;

    const getUserIdResult = await connection.query(userQuery.getUserId, userId);
    const userNumId = getUserIdResult[0][0]?.id;

    if (!userNumId) {
      throw createError(
        StatusCodes.NOT_FOUND,
        "사용자 정보를 찾을 수 없습니다."
      );
    }

    const currentScoreInfoResult = await connection.query(
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
      await connection.query(scoreQuery.updateScoreInfo, values);
    } else {
      const values = [
        userNumId,
        totalQuizCount,
        solvedQuizCount,
        totalQuizScore,
      ];
      await connection.query(scoreQuery.addScoreInfo, values);
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
