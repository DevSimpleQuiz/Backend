const StatusCodes = require("http-status-codes");
const {
  loadData,
  saveQuizDataToDatabase,
} = require("../quizGeneration/quizModule");
const { generateQuizSet } = require("../services/quizService.js");
const { verifyToken } = require("../services/jwtService.js");
const pool = require("../db/mysqldb");
const quizQuery = require("../queries/quizQuery.js");
const userQuery = require("../queries/userQuery.js");
const scoreQuery = require("../queries/scoreQuery.js");

// TODO: RDB 또는 REDIS로 전환
(async () => {
  // 퀴즈용 엑셀 파일 로드, 최초 한번만 호출
  await loadData("data/words.xlsx");
  await saveQuizDataToDatabase();
})();

const generateQuiz = async (req, res, next) => {
  try {
    // 퀴즈 세트 랜덤 생성
    const quizSet = await generateQuizSet();

    return res.json(quizSet);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// TODO: service에서 결과 값 유형이 두가지 이상인 경우의 처리하는 법 찾기(찾고자 하던 데이터를 찾았을 떄, 못찾았을 때)
const markQuizAnswer = async (req, res, next) => {
  try {
    let userAnswer = req.query?.answer; // 쿼리 파라미터에서 answer 가져오기
    let quizId = req.params.quizId; // 경로 파라미터에서 quizId 가져오기

    if (typeof userAnswer === "string") userAnswer = userAnswer.trim();

    // quizId가 숫자로만 이루어졌는지 확인
    if (!/^\d+$/.test(quizId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "quiz id는 숫자이어야 합니다.",
      });
    }

    quizId = parseInt(quizId);

    const getWordQueryResult = await pool.query(quizQuery.getWordQuery, [
      quizId,
    ]);
    if (
      Array.isArray(getWordQueryResult[0]) &&
      getWordQueryResult[0].length === 0
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "유효한 quiz id 이어야 합니다.",
      });
    }
    const word = getWordQueryResult[0][0]["word"];
    const isCorrectAnswer = word === userAnswer ? true : false;

    return res.status(StatusCodes.OK).json({
      isCorrectAnswer: isCorrectAnswer,
      correctAnswer: word,
    });
  } catch (err) {
    console.error(err);
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
  markQuizAnswer,
  saveQuizResult,
};
