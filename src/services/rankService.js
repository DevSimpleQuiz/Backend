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
      nearThreeUserNumIds.push(scoreInfos[idx]["user_id"]);
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
      const userId = scoreInfos[idx]["user_id"];
      const userInfo = userInfos.find((user) => user.id === userId);
      if (userInfo) {
        nearThreRanks.push({
          id: userInfo["user_id"],
          rank: idx + 1,
          score: scoreInfos[idx]["total_score"],
          totalQuizCount: scoreInfos[idx]["total_quiz_count"],
          totalSolvedQuizCount: scoreInfos[idx]["total_solved_count"],
        });
      }
    }
    return {
      nearRankers: nearThreRanks,
    };
  }
};

const getRankingPagesInfo = async (page, limit) => {
  if (page < 1 || limit < 1) {
    console.log("getRankingPagesInfo()의 인자는 양의 정수이어야 합니다");
    return null;
  }

  // TODO: transaction 처리, page 개수와 page 가져오는 연산
  const totalItemCountQuery = `SELECT COUNT(id) AS totalItemCount FROM score`;
  const totalItemCountQueryResult = await pool.query(totalItemCountQuery);
  const totalItemCount = totalItemCountQueryResult[0][0]["totalItemCount"];
  console.log("totalItemCount : ", totalItemCount);

  const pageItemCount = limit;

  // 페이지 당 1개, 전체 10개
  // 페이지 당 3개, 전체 10개 => 14
  // 나머지가 있으면 몫에서 +1
  // 10개 3개
  const totalPage =
    totalItemCount % pageItemCount
      ? parseInt(totalItemCount / pageItemCount, 10) + 1
      : parseInt(totalItemCount / pageItemCount, 10);

  const currentPage = undefined;

  /** 고려사항
   * 마지막 페이지보다 크면, 마지막 페이지를 보여줌
   * 마지막 페이지 =>
   * e.g) 전체 101개 아이템
   *   한 페이지에 10개 아이템
   *   11번째 페이지에 아이템 1개
   *   즉, 101번째 아이템이어야 함
   */
  if (page > totalPage) {
    Math.min(page);
  }
  const currentPageStartItemIdx = Math.max(
    // parseInt(page / limit, 10) * limit,
    (page - 1) * limit,
    // parseInt(() / limit, 10),
    // 페이지가 중간인 경우, 마지막인 경우, 전체 페이지 수보다 현재 페이지가 더 큰 경우
    // 중간이면, 그대로 빼면 됨
    // 마지막인 경우, 전체 아이템 수 % 페이지 당 아이템 수
    // 전체 페이지 수보다 현재 페이지가 더 큰 경우,
    Math.max(0, totalItemCount - pageItemCount)
  );
  const queryResult = await pool.query(scoreQuery.getRankingPagesInfo, [
    limit,
    currentPageStartItemIdx,
  ]);
  //
  /** TODO
   * - pagination info, 현재 페이지, 전체 페이지
   * - 엣지 케이스 감안하기
   *   - 뒤로가기, 앞으로 가기
   *   - 범위 벗어나는 페이지
   *   - 1 페이지에 1개 아이템 보여주는 경우
   *   - rank가 1개도 없는 경우
   *   - 페이지 범위를 벗어나는 경우
   *     - 전체 7페이지인데 8페이지 이상을 요구하는 경우
   *     - 마지막 페이지를 return
   */
  /** 페이지 표시 방법
   * - 전체, 현재 페이지 계산
   *   - 전체 아이템 수 가져오기query
   *   - 페이지 계산
   *     - 한 페이지 아이템 수로 나누어서 계산
   *     - 전체 페이지 범위를 넘어선다면 마지막 페이지로 이동시킴
   *       page = max(1, (itemCount - pageItemCount))
   *   - 페이지 정보 query
   *
   */

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
  gerRankInfo,
  getMyRankInfo,
  topThreeRankerInfo,
  nearThreeRankerInfo,
  getRankingPagesInfo,
  findMyRank,
};
