const createHttpError = require("http-errors");
const pool = require("../db/mysqldb.js");
const scoreQuery = require("../queries/scoreQuery.js");
const { StatusCodes } = require("http-status-codes");

const findMyRank = async (scoreInfos, userId) => {
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
 * 전체 순위 계산 이후,
 * 나의 순위 가져오기
 */
const gerRankInfo = async (myUserId) => {
  try {
    const queryResult = await pool.query(scoreQuery.getAllrankInfo);

    const scoreInfos = queryResult[0];
    const myRank = await findMyRank(scoreInfos, myUserId);
    // 아직 퀴즈를 풀지 않아서 데이터가 없는 경우.

    if (myRank === -1) {
      console.log(`Fatal: ${myUserId}유저의 랭킹 정보를 찾을 수 없습니다.`);
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

module.exports = { gerRankInfo, findMyRank };
