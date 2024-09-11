const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const createHttpError = require("http-errors");
const pool = require("../db/mysqldb");
const userQuery = require("../queries/userQuery.js");
const scoreQuery = require("../queries/scoreQuery.js");
const { COOKIE_OPTION } = require("../constant/constant.js");
const { gerRankInfo } = require("../services/rankService.js");

const {
  convertHashPassword,
  generateSalt,
} = require("../services/userService.js");
const { verifyToken } = require("../services/jwtService.js");

const join = async (req, res, next) => {
  try {
    const { id, password } = req.body;
    const getUserIdResult = await pool.query(userQuery.getUserId, id);
    const userId = getUserIdResult[0][0];

    if (userId) {
      console.log(`${id}는 이미 사용 중인 아이디입니다.`);
      return res.status(StatusCodes.CONFLICT).json({
        message: "이미 사용 중인 아이디입니다.",
      });
    }
    // 암호화된 비밀번호와 salt 값을 같이 DB에 저장
    const salt = generateSalt();
    const hashPassword = convertHashPassword(password, salt);
    const values = [id, hashPassword, salt];

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(userQuery.join, values);

      const newUserIdResult = await connection.query(userQuery.getUserId, id);
      const newUserId = newUserIdResult[0][0]?.id;
      if (!newUserId) {
        console.error("Fatal: 방금 추가한 유저의 아이디를 찾을 수 없습니다!!!");
        throw createHttpError(
          StatusCodes.NOT_FOUND,
          "사용자 정보를 찾을 수 없습니다."
        );
      }
      await connection.query(scoreQuery.addScoreInfo, newUserId);
      await connection.commit();
    } catch (err) {
      console.error("회원가입 트렌젝션 쿼리 에러 ,", err);
      await connection.rollback();
      next(err);
    } finally {
      connection.release();
    }

    console.log(`${id} 회원가입 성공`);
    return res.status(StatusCodes.CREATED).json({ message: "OK" });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// id 중복 확인
const checkLoginId = async (req, res, next) => {
  try {
    const { id } = req.body;
    const getUserIdResult = await pool.query(userQuery.getUserId, id);
    const userId = getUserIdResult[0][0];

    if (userId) {
      results = { isDuplicated: true };
    } else {
      results = { isDuplicated: false };
    }
    return res.status(StatusCodes.OK).json(results);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { id, password } = req.body;
    const getUserInfoResult = await pool.query(userQuery.getUserInfo, id);
    const loginUser = getUserInfoResult[0][0];

    if (loginUser) {
      const hashPassword = convertHashPassword(password, loginUser.salt);

      if (loginUser.password === hashPassword) {
        // 토큰 발행
        const token = jwt.sign(
          {
            id: loginUser.user_id,
          },
          process.env.JWT_PRIVATE_KEY,
          {
            expiresIn: process.env.TOKEN_EXPIRED_TIME,
            issuer: "DevSimQuiz",
          }
        );

        // 토큰 쿠키에 담기
        res.cookie("token", token, COOKIE_OPTION);
        console.log("로그인, access token 발급 성공");

        return res.status(StatusCodes.NO_CONTENT).end();
      } else {
        console.log("로그인, 잘못된 아이디, 비밀번호를 입니다.");
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: "잘못된 아이디, 비밀번호를 입니다.",
        });
      }
    }
    console.log("로그인, 잘못된 아이디, 비밀번호를 입니다.");
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "잘못된 아이디, 비밀번호를 입니다.",
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await res.clearCookie("token", COOKIE_OPTION);
    console.log("로그아웃");
    res.status(StatusCodes.NO_CONTENT).end();
  } catch (err) {
    console.error(err);
    next(err);
  }
};

/**
 * 현재 비밀번호를 제대로 입력헀는지 확인
 */
const isCurrentPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const token = req.cookies.token;

    const payload = await verifyToken(token);
    const userId = payload.id;
    const getUserPasswordInfoResult = await pool.query(
      userQuery.getUserPasswordInfo,
      userId
    );
    const loginUser = getUserPasswordInfoResult[0][0];

    if (!loginUser) {
      throw createHttpError(
        StatusCodes.NOT_FOUND,
        "사용자 정보를 찾을 수 없습니다."
      );
    }

    const hashPassword = convertHashPassword(password, loginUser.salt);

    if (loginUser.password === hashPassword) {
      return res.status(StatusCodes.OK).json({
        success: true,
      });
    } else {
      return res.status(StatusCodes.OK).json({
        success: false,
        message: "비밀번호가 틀렸습니다.",
      });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
};

/**
 * 현재 비밀번호와 이전 비밀번호가 다른지 비교
 */
const isAvailablePassword = async (req, res, next) => {
  try {
    const { password, newPassword } = req.body;
    let result;

    if (password === newPassword) {
      result = {
        success: false,
        message: "현재 비밀번호와 같은 비밀번호는 사용할 수 없습니다.",
      };
    } else {
      result = {
        success: true,
      };
    }
    return res.status(StatusCodes.OK).json(result);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

/**
 * 현재 비밀번호가 맞는지 확인,
 * 변경 비밀번호와 현재 비밀번호가 다른지 확인
 */
const resetPassword = async (req, res, next) => {
  try {
    const { password, newPassword } = req.body;
    const token = req.cookies.token;

    const payload = await verifyToken(token);
    const userId = payload.id;
    const getUserPasswordInfoResult = await pool.query(
      userQuery.getUserPasswordInfo,
      userId
    );
    const loginUser = getUserPasswordInfoResult[0][0];

    if (!loginUser) {
      throw createHttpError(
        StatusCodes.NOT_FOUND,
        "사용자 정보를 찾을 수 없습니다."
      );
    }

    const hashPassword = convertHashPassword(password, loginUser.salt);

    if (loginUser.password === hashPassword) {
      if (password === newPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "현재 비밀번호와 같은 비밀번호는 사용할 수 없습니다.",
        });
      }
      const salt = generateSalt();
      const hashNewPassword = convertHashPassword(newPassword, salt);
      const values = [hashNewPassword, salt, userId];

      await pool.query(userQuery.resetPassword, values);
      console.log("비밀번호 변경 완료");
      // TODO: 쿠키 삭제방식 통일, maxAge 바꾸는 형태로 테스트
      res.cookie("token", "", { maxAge: 0 });
      return res.status(StatusCodes.NO_CONTENT).end();
    } else {
      console.log("비밀번호 변경 실패");
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "비밀번호가 틀렸습니다.",
      });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
};

/**
 * # TODO: 갯수가 많이 늘어나도 이렇게 정렬하고 값을 찾을 수 있는가?
 * Data
  {
    "id": "jake",
    "myRank": 6,      // 나의 순위
    "solvedCount": 30// 지금까지 푼 문제 수
  }
 */
const mypage = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    const payload = await verifyToken(token);
    const userId = payload.id;
    const getUserIdResult = await pool.query(userQuery.getUserId, userId);
    const userNumId = getUserIdResult[0][0]?.id;

    if (!userNumId) {
      throw createHttpError(
        StatusCodes.NOT_FOUND,
        "사용자 정보를 찾을 수 없습니다."
      );
    }

    const myRankInfo = await gerRankInfo(userNumId);

    if (myRankInfo === -1) {
      console.log("사용자 순위를 찾을 수 없습니다.");
      throw createHttpError(
        StatusCodes.NOT_FOUND,
        "사용자 순위를 찾을 수 없습니다."
      );
    }

    const mypageInfo = {
      id: userId,
      myRank: myRankInfo["myRank"],
      solvedCount: myRankInfo["solvedCount"],
    };
    console.log(`mypageInfo : `, mypageInfo);

    return res.status(StatusCodes.OK).json(mypageInfo);
  } catch (err) {
    console.error("mypage error : ", err);
    next(err);
  }
};

module.exports = {
  join,
  checkLoginId,
  login,
  logout,
  isCurrentPassword,
  isAvailablePassword,
  resetPassword,
  mypage,
};
