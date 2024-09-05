const createHttpError = require("http-errors");
const pool = require("../db/mysqldb.js");
const userQuery = require("../queries/userQuery.js");
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

  return -1;
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
        solvedCount: 0,
      };
    }

    const idx = myRank - 1;
    return {
      myRank: myRank,
      solvedCount: scoreInfos[idx]["total_solved_count"],
    };
  } catch (err) {
    console.error(err);
    throw createHttpError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error"
    );
  }
};

const getMyRankInfo = async (scoreInfos, userId) => {
  const getUserIdResult = await pool.query(userQuery.getUserId, userId);
  const userNumId = getUserIdResult[0][0]?.id;
  const myRank = await findMyRank(scoreInfos, userNumId);

  const myScoreInfoIdx = myRank - 1;

  return {
    id: userId,
    rank: myRank,
    totalQuizScore: scoreInfos[myScoreInfoIdx]["total_score"],
    totalQuizCount: scoreInfos[myScoreInfoIdx]["total_quiz_count"],
    totalSolvedQuizCount: scoreInfos[myScoreInfoIdx]["total_solved_count"],
  };
};

const topThreeRankerInfo = async (scoreInfos) => {
  let topThreeUserNumIds = [];
  for (let idx = 0; idx < Math.min(scoreInfos.length, 3); idx++) {
    topThreeUserNumIds.push(scoreInfos[idx].user_id);
  }

  const { query, params } =
    userQuery.getThreeUsersInfoQuery(topThreeUserNumIds);
  const userInfosQueryResult = await pool.query(query, params);
  const userInfos = userInfosQueryResult[0];

  let topUserRanks = [];
  for (let idx = 0; idx < Math.min(scoreInfos.length, 3); idx++) {
    const userId = scoreInfos[idx].user_id;
    const userInfo = userInfos.find((user) => user.id === userId);
    if (userInfo) {
      topUserRanks.push({
        id: userInfo.user_id,
        rank: idx + 1,
        score: scoreInfos[idx].total_score,
      });
    }
  }

  return {
    topRankers: topUserRanks,
    topRankerCount: topUserRanks.length,
  };
};

const nearThreeRankerInfo = async (scoreInfos, myScoreInfoIdx) => {
  // myScoreInfoIdx 인근 +- 1
  // 내가 1등인 경우 1,2,3등
  // 내가 마지막 순위인 경우 내 위로 2단계 이전부터 시작
  let nearThreeUserNumIds = [];
  // 내가 1등인 경우
  if (myScoreInfoIdx === 0) {
    result["nearRankers"] = topUserRanks;
    result["nearRankersCount"] = topUserRanks.length;
  } else {
    let idx = myScoreInfoIdx - 1;
    // 현재 내 순위가 마지막이고 전체 유저 수가 3명 이상일 때
    if (myScoreInfoIdx + 1 === scoreInfos.length && scoreInfos.length > 2) {
      idx--;
    }
    for (idx; idx < Math.min(scoreInfos.length, myScoreInfoIdx + 2); idx++) {
      nearThreeUserNumIds.push(scoreInfos[idx].user_id);
    }
    const { query, params } =
      userQuery.getThreeUsersInfoQuery(nearThreeUserNumIds);
    const userInfosQueryResult = await pool.query(query, params);
    const userInfos = userInfosQueryResult[0];
    let nearThreRanks = [];
    idx = myScoreInfoIdx - 1;
    // 현재 내 순위가 마지막이고 전체 유저 수가 3명 이상일 때
    if (myScoreInfoIdx + 1 === scoreInfos.length && scoreInfos.length > 2) {
      idx--;
    }
    for (idx; idx < Math.min(scoreInfos.length, myScoreInfoIdx + 2); idx++) {
      const userId = scoreInfos[idx].user_id;
      const userInfo = userInfos.find((user) => user.id === userId);
      if (userInfo) {
        nearThreRanks.push({
          id: userInfo.user_id,
          rank: idx + 1,
          score: scoreInfos[idx].total_score,
        });
      }
    }
    return {
      nearRankers: nearThreRanks,
      nearRankerCount: nearThreRanks.length,
    };
  }
};

module.exports = {
  gerRankInfo,
  getMyRankInfo,
  topThreeRankerInfo,
  nearThreeRankerInfo,
  findMyRank,
};
