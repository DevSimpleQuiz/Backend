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

// TODO: service에서 결과 값 유형이 두 가지 이상인 경우의 처리하는 법 찾기(찾고자 하던 데이터를 찾았을 떄, 못찾았을 때)
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
    let { totalQuizCount, solvedQuizCount, totalQuizScore, quizId } = req.body;
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

    // TODO: 1개씩만 저장할 것이기 때문에 total이라는 표현이 필요할까? 오히려 혼동을 주지는 않을까?
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 퀴즈 결과 저장
      await connection.query(scoreQuery.updateScoreInfo, [
        totalQuizCount,
        solvedQuizCount,
        totalQuizScore,
        userNumId,
      ]);

      // 이전에 맞힌 적이 있는가?
      const checkSolvedQuizQuery = `SELECT id FROM solved_quizzes WHERE user_id = ? AND quiz_id = ?`;
      const solvedQuizQueryResult = await connection.query(
        checkSolvedQuizQuery,
        [userNumId, quizId]
      );
      const isSolved = solvedQuizQueryResult[0][0] ? true : false;

      // 이전에 맞힌 적이 없다면
      if (isSolved == false) {
        // 문제 풀었음을 표기 solved_quizzes
        const quizSolvedQuery = `INSERT INTO solved_quizzes (quiz_id, user_id) VALUES (?, ?)`;
        connection.query(quizSolvedQuery, [quizId, userNumId]);
        // 통계 데이터를 반영 quiz_accuracy_statistics;
        const quizStatisticsQuery = `UPDATE quiz_accuracy_statistics \
                                    SET correct_people_count = correct_people_count  + ?, \
                                        total_attempts_count_before_correct = total_attempts_count_before_correct + ? \
                                    WHERE quiz_id = ?`;
        connection.query(quizStatisticsQuery, [
          solvedQuizCount,
          totalQuizCount,
          quizId,
        ]);
      }

      connection.commit();
    } catch (error) {
      console.error("퀴즈 결과 저장 트렌젝션 쿼리 에러 ,", err);
      await connection.rollback();
      next(err);
    } finally {
      connection.release();
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
