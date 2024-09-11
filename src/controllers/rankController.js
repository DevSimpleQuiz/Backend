const { verifyToken } = require("../services/jwtService.js");
const pool = require("../db/mysqldb");
const {
  getMyRankInfo,
  topThreeRankerInfo,
  nearThreeRankerInfo,
} = require("../services/rankService.js");
const scoreQuery = require("../queries/scoreQuery.js");

const topRankersInfo = async (req, res, next) => {
  try {
    const queryResult = await pool.query(scoreQuery.getAllrankInfo);

    //  0. 스코어 정보 가져오기
    const scoreInfos = queryResult[0];

    // 1. top3 랭커 정보
    const result = await topThreeRankerInfo(scoreInfos);
    return res.json(result);
  } catch (err) {
    console.error("topRankersInfo err : ", err);
    next(err);
  }
};

const myRankInfo = async (req, res, next) => {
  try {
    const queryResult = await pool.query(scoreQuery.getAllrankInfo);

    const token = req.cookies.token;
    const payload = await verifyToken(token);
    const userId = payload.id;

    //  0. 스코어 정보 가져오기
    const scoreInfos = queryResult[0];

    // 1. 나의 랭킹 정보 구성(id, rank, total score, quiz count, sovled count)
    const result = await getMyRankInfo(scoreInfos, userId);

    return res.json(result);
  } catch (err) {
    console.error("myRankInfo err : ", err);
    next(err);
  }
};

const nearRankersInfo = async (req, res, next) => {
  try {
    const queryResult = await pool.query(scoreQuery.getAllrankInfo);

    const token = req.cookies.token;
    const payload = await verifyToken(token);
    const userId = payload.id;

    //  0. 스코어 정보 가져오기
    const scoreInfos = queryResult[0];

    // 1. 나의 랭킹 정보 구성(id, rank, total score, quiz count, sovled count)
    let myRank = await getMyRankInfo(scoreInfos, userId);
    myRank = myRank["rank"];

    // 2. near3 랭커 정보 구성
    const myScoreInfoIdx = myRank - 1;
    result = await nearThreeRankerInfo(scoreInfos, myScoreInfoIdx);

    return res.json(result);
  } catch (err) {
    console.error("nearRankersInfo err : ", err);
    next(err);
  }
};

const rankingPagesInfo = (req, res, next) => {
  const queryParameter = req.query;
  console.log("queryParameter : ", queryParameter);

  const { page, limit } = queryParameter;
  console.log("page : ", page);
  console.log("limit : ", limit);

  return res.json({ message: `endpoint: /ranks?$page={page}&limit=${limit}` });
};

module.exports = {
  topRankersInfo,
  myRankInfo,
  nearRankersInfo,
  rankingPagesInfo,
};
