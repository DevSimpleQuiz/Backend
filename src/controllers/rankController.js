const { verifyToken } = require("../services/jwtService.js");
const pool = require("../db/mysqldb");
const {
  getMyRankInfo,
  topThreeRankerInfo,
  nearThreeRankerInfo,
} = require("../services/rankService.js");
const scoreQuery = require("../queries/scoreQuery.js");

/**
 * 랭킹 정보에 대한 응답 제공
 *
 * 0. 스코어 정보 가져오기
 * 1. 나의 랭킹 정보 구성(id, rank, total score, quiz count, sovled count)
 * 2. top3 랭커 정보 구성
 *   - top3인 유저의 id 정보 가져오기
 * 3. near3 랭커 정보 구성
 */
const rankInfo = async (req, res, next) => {
  try {
    let result = {};
    const queryResult = await pool.query(scoreQuery.getAllrankInfo);

    const token = req.cookies.token;
    const payload = await verifyToken(token);
    const userId = payload.id;

    //  0. 스코어 정보 가져오기
    const scoreInfos = queryResult[0];

    // 1. 나의 랭킹 정보 구성(id, rank, total score, quiz count, sovled count)
    result = await getMyRankInfo(scoreInfos, userId);

    // 2. top3 랭커 정보 구성
    result = { ...result, ...(await topThreeRankerInfo(scoreInfos)) };

    // 3. near3 랭커 정보 구성
    const myScoreInfoIdx = result["rank"] - 1;
    result = {
      ...result,
      ...(await nearThreeRankerInfo(scoreInfos, myScoreInfoIdx)),
    };

    return res.json(result);
  } catch (err) {
    console.error("rankInfo err : ", err);
    next(err);
  }
};

module.exports = {
  rankInfo,
};
