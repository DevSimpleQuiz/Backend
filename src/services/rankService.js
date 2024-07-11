const createHttpError = require("http-errors");
const connection = require("../db/mysqldb.js");
const scoreQuery = require("../queries/scoreQuery.js");
const { StatusCodes } = require("http-status-codes");

/*
  [
    { user_id: 4, total_score: 360 },
    { user_id: 1, total_score: 270 },
    { user_id: 5, total_score: 90 }
  ],
*/
const findMyRank = (scoreInfos, userId) => {
  if (!scoreInfos || scoreInfos.length === 0) {
    return -1;
  }

  for (let i = 0; i < scoreInfos.length; i++) {
    if (scoreInfos[i].user_id === userId) {
      return i + 1;
    }
  }

  return -1; // userId가 배열에 없는 경우
};

/**
 * 나의 순위 가져오기
 * 전체 순위 계산..
 *
 * SELECT user_id, total_score FROM score ORDER BY totaL_score DESC, user_id ASC;
 * SELECT * FROM 테이블명 ORDER BY 컬럼명1 ASC, 컬럼명2 DESC;
 */
const gerRank = async (myUserId) => {
  try {
    const queryResult = await connection.query(scoreQuery.getAllScoreInfo);

    const scoreInfos = queryResult[0];
    const myRank = findMyRank(scoreInfos, myUserId);
    // 아직 퀴즈를 풀지 않아서 데이터가 없는 경우.
    if (myRank === -1) {
      return {
        myRank: scoreInfos.length + 1,
        totalSolvedCount: 0,
      };
    }

    const idx = myRank - 1;
    return {
      myRank: myRank,
      totalSolvedCount: scoreInfos[idx]["total_solved_count"],
    };
  } catch (err) {
    console.error(err);
    throw createHttpError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error"
    );
  }
};

module.exports = { gerRank };
