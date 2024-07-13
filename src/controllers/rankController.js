const StatusCodes = require("http-status-codes");
const { verifyToken } = require("../services/jwtService.js");
const pool = require("../db/mysqldb");
const { findMyRank } = require("../services/rankService.js");
const userQuery = require("../queries/userQuery.js");
const scoreQuery = require("../queries/scoreQuery.js");

/**
 * 랭킹 정보에 대한 응답 제공
 *
 * 나의 랭킹 및 스코어 데이터
 * top3랭커 정보
 * 나의 위아래 1명의 랭킹 정보
 *
 * TODO:
 * 0. 스코어 정보 가져오기
 * 1. 나의 랭킹 정보 구성(id, rank, total score, quiz count, sovled count)
 * 2. top3 랭커 정보 구성
 *   - top3인 유저의 id 정보 가져오기
 * 3. near3 랭커 정보 구성
 */

/**
{
  "id": "jake",
  "myRank": 3,
  "totalQuizScore": 160,
  "totalQuizCount": 20,
  "solvedQuizCount": 16,
  "topRankers": [
	  {
	    "id": "tom",
	    "rank": 1
	  },
	  ...
  ],
  "topRankerCount": 3,
  "nearRankers": [
	  {
	    "id": "jim",
	    "rank": 2
	  },
	  ...
  ],
  "nearRankerCount": 3,
}
 */
const rankInfo = async (req, res, next) => {
  try {
    let result = {};
    const queryResult = await pool.query(scoreQuery.getAllrankInfo);
    const scoreInfos = queryResult[0];
    console.log("scoreInfos : ", scoreInfos);

    // 1. 나의 랭킹 정보 구성(id, rank, total score, quiz count, sovled count)
    const token = req.cookies.token;

    const payload = await verifyToken(token);
    const userId = payload.id;
    result["id"] = userId;

    const getUserIdResult = await pool.query(userQuery.getUserId, userId);
    const userNumId = getUserIdResult[0][0]?.id;
    const myRank = await findMyRank(scoreInfos, userNumId);
    result["myRank"] = myRank;

    const myScoreInfoIdx = myRank - 1;

    console.log("scoreInfos[myScoreInfoIdx] : ", scoreInfos[myScoreInfoIdx]);
    result["totalQuizScore"] = scoreInfos[myScoreInfoIdx]["total_score"];
    result["totalQuizCount"] = scoreInfos[myScoreInfoIdx]["total_quiz_count"];
    result["totalSolvedQuizCount"] =
      scoreInfos[myScoreInfoIdx]["total_solved_count"];

    // 2. top3 랭커 정보 구성
    let topThreeUserNumIds = [];
    console.log(
      "Math.min(scoreInfos.length, 3) : ",
      Math.min(scoreInfos.length, 3)
    );
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
      console.log("userInfo : ", userInfo);
      if (userInfo) {
        topUserRanks.push({ id: userInfo.user_id, rank: idx + 1 });
      }
    }
    result["topRankers"] = topUserRanks;
    result["topRankerCount"] = topUserRanks.length;

    // 3. near3 랭커 정보 구성
    {
      // myScoreInfoIdx 인근 +- 1
      // 내가 1등인 경우 1,2,3등,
      // 내가 마지막 순위인 경우 내 위부터 3
      let nearThreeUserNumIds = [];
      console.log("topUserRanks : ", topUserRanks);
      // 내가 1등인 경우
      if (myScoreInfoIdx === 0) {
        result["nearRankers"] = topUserRanks;
        result["nearRankersCount"] = topUserRanks.length;
      } else {
        console.log("scoreInfos.length : ", scoreInfos.length);
        console.log("myScoreInfoIdx - 1 : ", myScoreInfoIdx - 1);
        console.log("myScoreInfoIdx + 1 : ", myScoreInfoIdx + 1);
        for (
          let idx = myScoreInfoIdx - 1;
          idx < Math.min(scoreInfos.length, myScoreInfoIdx + 1);
          idx++
        ) {
          nearThreeUserNumIds.push(scoreInfos[idx].user_id);
        }
        console.log("nearThreeUserNumIds : ", nearThreeUserNumIds);
        const { query, params } =
          userQuery.getThreeUsersInfoQuery(nearThreeUserNumIds);
        const userInfosQueryResult = await pool.query(query, params);
        const userInfos = userInfosQueryResult[0];
        let nearThreRanks = [];
        for (
          let idx = 0;
          idx < Math.min(scoreInfos.length, myScoreInfoIdx + 1);
          idx++
        ) {
          const userId = scoreInfos[idx].user_id;
          const userInfo = userInfos.find((user) => user.id === userId);
          console.log("userInfo : ", userInfo);
          if (userInfo) {
            nearThreRanks.push({ id: userInfo.user_id, rank: idx + 1 });
          }
        }
        console.log("nearThreRanks : ", nearThreRanks);
        result["nearRankers"] = nearThreRanks;
        result["nearRankerCount"] = nearThreRanks.length;
      }
    }

    return res.json(result);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports = {
  rankInfo,
};
