const StatusCodes = require("http-status-codes");
const { v4: uuidv4 } = require("uuid");
const {
  loadData,
  saveQuizDataToDatabase,
  quizChallengeIdMap,
  validateQuizChallengeId,
} = require("../quizGeneration/quizModule");
const { generateQuizSet } = require("../services/quizService.js");
const { verifyToken } = require("../services/jwtService.js");
const {
  NORMAL_QUIZ_SET_SIZE,
  INFINITE_CHALLENGE_QUIZ_SET_SIZE,
  KST_OFFSET,
  QUIZ_TIMEOUT,
  INIT_EXPIRED_TIME_INTERVAL,
} = require("../constant/constant.js");
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
    const quizSet = await generateQuizSet(NORMAL_QUIZ_SET_SIZE);

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
    const challengeId = req.query?.challengeId; // 경로 파라미터에서 quizId 가져오기
    let quizId = req.params.quizId; // 경로 파라미터에서 quizId 가져오기

    const getWordQueryResult = await pool.query(quizQuery.getQuizWord, [
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
    console.log("challengeId : ", challengeId);
    if (validateQuizChallengeId(challengeId)) {
      const challengeData = quizChallengeIdMap.get(challengeId);
      console.log("challengeData : ", challengeData);
      // TODO: 15초에 대해 const 변수로 처리
      if (isCorrectAnswer) {
        challengeData.expiredTime += QUIZ_TIMEOUT;
        challengeData.correctStreak += 1;
      } else {
        challengeData.isChallengeActive = false;
      }
      const updatedChallengeData = quizChallengeIdMap.get(challengeId);
      console.log("updatedChallengeData : ", updatedChallengeData);
    }

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
    let {
      totalQuizCount,
      solvedQuizCount,
      totalQuizScore,
      quizId,
      challengeId,
    } = req.body;
    const token = req.cookies.token;
    const payload = await verifyToken(token);
    const userId = payload.id;

    // TODO: getUserNumIdByToken service 만들어서 사용
    const getUserIdResult = await pool.query(userQuery.getUserId, userId);
    const userNumId = getUserIdResult[0][0]?.id;

    if (!userNumId) {
      throw createHttpError(
        StatusCodes.NOT_FOUND,
        "사용자 정보를 찾을 수 없습니다."
      );
    }

    // TODO: service 모듈로 분리 [userNumId, totalQuizCount, solvedQuizCount, totalQuizScore, quizId];
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

      const solvedQuizQueryResult = await connection.query(
        quizQuery.isQuizSolved,
        [userNumId, quizId]
      );
      const isSolved = solvedQuizQueryResult[0][0] ? true : false;

      // 이전에 맞힌 적이 없다면
      if (isSolved == false) {
        // 문제 풀었음을 표기 solved_quizzes
        if (solvedQuizCount === 1)
          await connection.query(quizQuery.recordQuizSolved, [
            quizId,
            userNumId,
          ]);
        // 통계 데이터를 반영 quiz_accuracy_statistics;
        await connection.query(quizQuery.updateQuizStatistics, [
          solvedQuizCount,
          totalQuizCount,
          quizId,
        ]);
      }

      /** TODO: 무한퀴즈챌린지인 경우 처리
       * - 연속으로 맞힌 최대 문제 개수 DB에 반영(summary 테이블, update 단, 현재 db에 있는 값보다 큰 경우에만 반영)
       * - 현재까지 맞힌 문제 수 DB에 반영 (detail 테이블, update)
       */
      if (challengeId) {
        console.log(`challengeId : ${challengeId}`);
        const challengeData = quizChallengeIdMap.get(challengeId);
        if (!challengeData) {
          console.log(
            `${challengeId}, 챌린지 id는 서버에 없는 id 입니다. DB에 이미 저장 되었는지 확인 해주세요.`
          );
        }

        // detail 테이블에 값 갱신하기, correct streak이 더 늘어난 경우에만 반영됨
        const updateInfiniteChallengeDetailQuery = `UPDATE infinite_quiz_detail SET correct_streak = ? WHERE challenge_id = ? AND correct_streak < ?`;
        connection.query(updateInfiniteChallengeDetailQuery, [
          challengeData.correctStreak,
          challengeId,
          challengeData.correctStreak,
        ]);

        // summary 테이블에 값 갱신하기, correct streak이 더 늘어난 경우에만 반영됨
        const updateInfiniteChallengeSummaryQuery = `UPDATE infinite_quiz_summary SET correct_streak = ? WHERE user_id = ? AND correct_streak < ?`;
        connection.query(updateInfiniteChallengeSummaryQuery, [
          challengeData.correctStreak,
          userNumId,
          challengeData.correctStreak,
        ]);
      }

      await connection.commit();
    } catch (err) {
      console.error("퀴즈 결과 저장 트렌젝션 쿼리 에러 ,", err);
      await connection.rollback();
      next(err);
    } finally {
      connection.release();
    }

    return res.status(StatusCodes.NO_CONTENT).end();
  } catch (err) {
    console.error("퀴즈 결과 저장 트렌젝션 쿼리 에러 ,", err);
    next(err);
  }
};

const infiniteChallenge = async (req, res, next) => {
  try {
    //
    /** TODO:
     * - 무한 퀴즈 챌린지 동안 중복 문제 이슈 처리할지 추후 고려 필요
     *   - 현재 버젼에서는 중복 발생 가능
     */

    // 1. 요청에 challengeId가 있고 만료되지 않았다면 해당 challengeId를 재활용한다.
    const { challengeId } = req.query;
    let currnetChallengeId = challengeId;
    let isNewchallengeId = false;

    // 2. challengeId를 못 서버 내에서 찾았거나 만료되었다면 기존 challengeId는 제거하며 새로운 challengeId를 만든다.
    // 서버 내에서 못 찾은 경우 ,만료된 경우 내역을 로그로 남긴다. 꼬일 수 있는 부분이므로 추적 가능해야한다.
    if (validateQuizChallengeId(challengeId) == false) {
      currnetChallengeId = uuidv4();
      isNewchallengeId = true;

      const currentTime = Date.now() + KST_OFFSET;

      // 만료 시간을 60초 후로 설정 (60초를 밀리초로 변환하여 더함)
      const expiredTime = currentTime + INIT_EXPIRED_TIME_INTERVAL;

      /* infinite_quiz_detail
        - challenge_id (PK)
        - user_id (FK)
        - correct_streak (해당 도전에서의 기록)
        - start_time (도전 시작 시간)
        - end_time (도전 종료 시간)
      */

      // TODO: 결과를 마지막에 로그인 한 뒤에 반영시키고 싶은 경우, 데이터를 insert into 해야함
      //  무한 퀴즈 챌린지 상세 테이블 기본 값 삽입, 로그인 된 경우만 처리됨
      // `INSERT INTO infinite_quiz_detail (challenge_id, user_id) VALUES(?, ?)`
      const token = req.cookies.token;

      console.log("token in infiniteChallenge(): ", token);
      /**
       */
      if (token) {
        const payload = await verifyToken(token);
        const userId = payload?.id;
        // TODO: getUserNumIdByToken service 만들어서 사용
        const getUserIdResult = await pool.query(userQuery.getUserId, userId);
        const userNumId = getUserIdResult[0][0]?.id;
        console.log("userNumId : ", userNumId);

        if (!userNumId) {
          throw createHttpError(
            StatusCodes.NOT_FOUND,
            "사용자 정보를 찾을 수 없습니다."
          );
        }
        // TODO: transaction
        const connection = await pool.getConnection();
        try {
          await connection.beginTransaction();

          await connection.query(quizQuery.addInfiniteQuizChallengeDetail, [
            currnetChallengeId,
            userNumId,
          ]);
          //  전체 도전 횟수 1회 증가 처리
          await connection.query(
            quizQuery.increaseInfiniteQuizCount,
            userNumId
          );

          await connection.commit();
        } catch (err) {
          console.error(
            "무한 퀴즈 챌린지 초기 데이터 세팅, 트렌젝션 쿼리 에러 ",
            err
          );
          await connection.rollback();
          next(err);
        } finally {
          connection.release();
        }
      }
      // challengeData 객체 생성
      const challengeData = {
        correctStreak: 0,
        expiredTime: expiredTime,
        startTime: currentTime,
        isChallengeActive: true, // 유효 시간 내에서 문제를 맞히는 중일 때만 true, 틀리거나 시간이 지나면 false
      };
      quizChallengeIdMap.set(currnetChallengeId, challengeData);
    }

    console.log("quizChallengeIdMap.size : ", quizChallengeIdMap.size);
    const quizSet = await generateQuizSet(INFINITE_CHALLENGE_QUIZ_SET_SIZE);

    return res.json({
      quizzes: quizSet.quizzes,
      challengeId: currnetChallengeId,
      isNewchallengeId,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports = {
  generateQuiz,
  markQuizAnswer,
  saveQuizResult,
  infiniteChallenge,
};
