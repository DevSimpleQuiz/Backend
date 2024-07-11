const StatusCodes = require("http-status-codes");
const { verifyToken } = require("../services/jwtService.js");
const pool = require("../db/mysqldb");
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
 * 1. 랭킹 정보 가져오기
 * 2. 나의 랭킹 정보 구성(id, rank, total score, quiz count, sovled count)
 * 3. top3 랭커 정보 구성
 *   - top3인 유저의 id 정보 가져오기
 * 4.
 */
const rankInfo = async (req, res, next) => {
  try {
    const queryResult = await pool.query(scoreQuery.getAllrankInfo);
    const scoreInfos = queryResult[0];

    console.log("scoreInfos : ", scoreInfos);
    // my rank info (id, rank, total score, quiz count, sovled count)
    {
    }

    // top3 ranker info
    {
      let topThreeUserNumIds = [];
      console.log(
        "Math.min(scoreInfos.length, 3) : ",
        Math.min(scoreInfos.length, 3)
      );
      for (let idx = 0; idx < Math.min(scoreInfos.length, 3); idx++) {
        // console.log("scoreInfos[idx].user_id : ", scoreInfos[idx].user_id);
        topThreeUserNumIds.push(scoreInfos[idx].user_id);
      }
      console.log("topThreeUserNumIds : ", topThreeUserNumIds);

      const { query, params } =
        userQuery.getThreeUsersInfoQuery(topThreeUserNumIds);
      console.log("Generated Query: ", query);
      console.log("Query Params: ", params);

      const userInfosQueryResult = await pool.query(query, params);
      console.log("userInfosQueryResult : ", userInfosQueryResult);
      const userInfos = userInfosQueryResult[0];
      console.log("userInfos : ", userInfos);
      // const userInfos = await pool.query(
      //   userQuery.getThreeUsersInfo(topThreeUserNumIds),
      //   topThreeUserNumIds
      // );

      let topUserRanks = [];
      for (let idx = 0; idx < Math.min(scoreInfos.length, 3); idx++) {
        const userId = scoreInfos[idx].user_id;
        const userInfo = userInfos.find((user) => user.id === userId);
        console.log("userInfo : ", userInfo);
        if (userInfo) {
          topUserRanks.push({ user_id: userInfo.user_id, rank: idx + 1 });
        }
      }
      console.log("topUserRanks : ", topUserRanks);
    }

    // near ranker info
    {
    }

    return res.json(scoreInfos);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports = {
  rankInfo,
};
