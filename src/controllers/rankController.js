const { verifyToken } = require("../services/jwtService.js");
const pool = require("../db/mysqldb");
const {
  getMyRankInfo,
  topThreeRankerInfo,
  nearThreeRankerInfo,
} = require("../services/rankService.js");
const scoreQuery = require("../queries/scoreQuery.js");

// TODO: pagination 코드를 service로 모듈화한 이후 top3에서 재활용할 것
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

// TODO: controller에서 바로 query 접근 못하도록 변경, 스코어 정보 가져오는 코드 별도 service로 추출
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

// TODO: pagination 코드를 service로 모듈화한 이후 near ranker에서 재활용할 것
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

/** TODO
 * 1. page, limit 쿼리 파라미터 검증
 *   - 값이 있는가?
 *   - 숫자로만 이루어져 있는가?
 *   - 범위는 적절한가?
 *   - 미들웨어로 분리
 * 2. SQL query 테스트
 * 3. api 구현
 * 4. 성능 이슈
 *   - 매 번 트랜젝션 발생
 *     score에 값을 추가,갱신하거나 조회할 때
 *   - 돈과 관련된 것처럼 민감한 부분이 아니므로 유저마다 몇 초 정도 랭킹 순위가 다르게 보일 수 있다.
 * 5. Redis 도입 고려
 *   - score를 redis에 기록
 *   - 값이 자주 변동될 수 있는데 redis 쓰는 게 나은가?
 *   - 추후 message queue 도입 시 달라질 수 있는 점은 무엇인가?
 */
// ===
/** TODO
 * 3. api 구현
 *   - pagination
 *   - pagination 정보(현재 페이지, 전체 페이지 수)
 */
const rankingPagesInfo = async (req, res, next) => {
  const { page, limit } = req.query;

  try {
    const queryResult = await pool.query(scoreQuery.getRankingPagesInfo, [
      limit,
      (page - 1) * limit,
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
    const currentPage = undefined;
    const totalPage = undefined;

    return res.json({
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
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports = {
  topRankersInfo,
  myRankInfo,
  nearRankersInfo,
  rankingPagesInfo,
};
