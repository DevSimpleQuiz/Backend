const createHttpError = require("http-errors");
const pool = require("../db/mysqldb.js");
const userQuery = require("../queries/userQuery.js");
const scoreQuery = require("../queries/scoreQuery.js");
const { StatusCodes } = require("http-status-codes");

const getMyRank = async (userId) => {
  try {
    const result = await pool.query(scoreQuery.getMyRank, userId);
    return result[0][0]["user_rank"];
  } catch (err) {
    console.error(err);
    throw createHttpError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error"
    );
  }
};

const findMyRank = async (scoreInfos, userId) => {
  if (!scoreInfos || scoreInfos.length === 0) {
    return -1;
  }

  for (let i = 0; i < scoreInfos.length; i++) {
    if (scoreInfos[i]["user_id"] === userId) {
      return i + 1;
    }
  }

  return -1;
};

/**
 * 전체 순위 계산 이후,
 * 나의 순위 가져오기
 */
const gerMypageInfo = async (myUserId) => {
  try {
    const queryResult = await pool.query(scoreQuery.getMypageInfo, myUserId);
    const scoreInfo = queryResult[0][0];
    const myRank = await getMyRank(myUserId);

    return {
      rank: myRank,
      score: scoreInfo["total_score"], // 현재까지 총 점수
      totalQuizCount: scoreInfo["total_quiz_count"], // 지금까지 푼 문제 수
      totalSolvedQuizCount: scoreInfo["total_solved_count"],
      challengeCount: scoreInfo["challenge_count"],
    };
  } catch (err) {
    console.error(err);
    throw createHttpError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error"
    );
  }
};

// TODO: getMyRank()를 이용하는 방향으로 변경
const getMyRankInfo = async (scoreInfos, userId) => {
  const getUserIdResult = await pool.query(userQuery.getUserId, userId);
  const userNumId = getUserIdResult[0][0]?.id;
  const myRank = await findMyRank(scoreInfos, userNumId);
  const myScoreInfoIdx = myRank - 1;

  return {
    id: userId,
    rank: myRank,
    score: scoreInfos[myScoreInfoIdx]["total_score"],
    totalQuizCount: scoreInfos[myScoreInfoIdx]["total_quiz_count"],
    totalSolvedQuizCount: scoreInfos[myScoreInfoIdx]["total_solved_count"],
  };
};

const topThreeRankerInfo = async (scoreInfos) => {
  let topThreeUserNumIds = [];

  for (let idx = 0; idx < Math.min(scoreInfos.length, 3); idx++) {
    topThreeUserNumIds.push(scoreInfos[idx]["user_id"]);
  }

  const { query, params } =
    userQuery.getThreeUsersInfoQuery(topThreeUserNumIds);
  const userInfosQueryResult = await pool.query(query, params);
  const userInfos = userInfosQueryResult[0];

  let topUserRanks = [];
  for (let idx = 0; idx < Math.min(scoreInfos.length, 3); idx++) {
    const userId = scoreInfos[idx]["user_id"];
    const userInfo = userInfos.find((user) => user.id === userId);

    if (userInfo) {
      topUserRanks.push({
        id: userInfo["user_id"],
        rank: idx + 1,
        score: scoreInfos[idx].total_score,
      });
    }
  }

  return {
    topRankers: topUserRanks,
  };
};

// TODO: SQL로 순위도 가져오도록 수정
const nearThreeRankerInfo = async (scoreInfos, myScoreInfoIdx) => {
  // myScoreInfoIdx 인근 +- 1
  // 내가 1등인 경우 1,2,3등
  // 내가 마지막 순위인 경우 내 위로 2단계 이전부터 시작
  let nearThreeUserNumIds = [];
  // 내가 1등인 경우
  if (myScoreInfoIdx === 0) {
    const topRankers = await topThreeRankerInfo(scoreInfos);

    return {
      nearRankers: topRankers["topRankers"],
    };
  } else {
    let idx = myScoreInfoIdx - 1;

    // 현재 내 순위가 마지막이고 전체 유저 수가 3명 이상일 때
    if (myScoreInfoIdx + 1 === scoreInfos.length && scoreInfos.length > 2) {
      idx--;
    }

    for (idx; idx < Math.min(scoreInfos.length, myScoreInfoIdx + 2); idx++) {
      nearThreeUserNumIds.push(scoreInfos[idx]["user_id"]);
    }

    const { query, params } =
      userQuery.getThreeUsersInfoQuery(nearThreeUserNumIds);
    const userInfosQueryResult = await pool.query(query, params);
    const userInfos = userInfosQueryResult[0];
    let nearThreeRanks = [];
    idx = myScoreInfoIdx - 1;

    // 현재 내 순위가 마지막이고 전체 유저 수가 3명 이상일 때
    if (myScoreInfoIdx + 1 === scoreInfos.length && scoreInfos.length > 2) {
      idx--;
    }

    for (idx; idx < Math.min(scoreInfos.length, myScoreInfoIdx + 2); idx++) {
      const userId = scoreInfos[idx]["user_id"];
      const userInfo = userInfos.find((user) => user.id === userId);
      if (userInfo) {
        nearThreeRanks.push({
          id: userInfo["user_id"],
          rank: idx + 1,
          score: scoreInfos[idx]["total_score"],
          totalQuizCount: scoreInfos[idx]["total_quiz_count"],
          totalSolvedQuizCount: scoreInfos[idx]["total_solved_count"],
        });
      }
    }
    return {
      nearRankers: nearThreeRanks,
    };
  }
};

const getRankingPagesInfo = async (page, limit) => {
  // TODO: validator middleware에서 확인했지만 service가 다른 controller에서 쓰일 수 있으므로 파라미터 유효성 검사를 해야하는가?
  if (page < 1 || limit < 1) {
    console.error("getRankingPagesInfo()의 인자는 양의 정수이어야 합니다");
    return null;
  }

  const pageItemCount = limit;

  const totalItemCountQueryResult = await pool.query(
    scoreQuery.getRankingPageItemsCount
  );
  const totalItemCount = totalItemCountQueryResult[0][0]["totalItemCount"];
  const totalPage =
    totalItemCount % pageItemCount
      ? parseInt(totalItemCount / pageItemCount, 10) + 1
      : parseInt(totalItemCount / pageItemCount, 10);

  const currentPage = page;

  if (currentPage > totalPage) {
    console.error("유효하지 않은 페이지 번호 입니다.");
    throw createHttpError(
      StatusCodes.BAD_REQUEST,
      "유효하지 않은 페이지 번호 입니다."
    );
  }

  const currentPageStartItemIdx = (page - 1) * pageItemCount;
  const queryResult = await pool.query(scoreQuery.getRankingPagesInfo, [
    pageItemCount,
    currentPageStartItemIdx,
  ]);

  return {
    allRankers: queryResult[0].map((userRankInfo) => {
      return {
        id: userRankInfo.id,
        rank: userRankInfo.rank,
        score: userRankInfo.score,
        totalQuizCount: userRankInfo.totalQuizCount,
        totalSolvedQuizCount: userRankInfo.totalSolvedQuizCount,
      };
    }),
    pagination: {
      currentPage,
      totalPage,
    },
  };
};

module.exports = {
  gerMypageInfo,
  getMyRank,
  getMyRankInfo,
  topThreeRankerInfo,
  nearThreeRankerInfo,
  getRankingPagesInfo,
  findMyRank,
};
