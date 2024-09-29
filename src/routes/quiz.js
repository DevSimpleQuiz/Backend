const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/authMiddleware");
const {
  generateQuiz,
  markQuizAnswer,
  saveQuizResult,
  infiniteChallenge,
} = require("../controllers/quizController");
const quizValidators = require("../validators/quizValidators.js");

router.get("/", generateQuiz);
router.get("/:quizId/mark", markQuizAnswer);
router.post(
  "/result",
  isAuthenticated,
  quizValidators.saveQuizResult,
  saveQuizResult
);

/**
 * 무한 퀴즈 챌린지
 * 10개 문제 1세트를 전송해준다.
 * 첫 1~10개 문제를 요청할 때는 서버로부터 challengeId 받는다.
 * 무한 퀴즈 챌린지는 문제를 계속 맞추는 동안에는 문제를 제공 받는다.
 * 10개를 맞추고 11개째를 풀기 위해 11~20번째 퀴즈 문제 세트를 받는 경우
 * challengeId를 query param에 포함하여 전송한다.
 * 연속으로 문제를 푸는 것인지, 새로운 무한퀴즈 챌린지 도전인지 분별하려는 용도이다.
 * challengeId를 가지고 현재 도전 중인 챌린지의 맞힌 문제 개수, 최대 연속으로 맞힌 문제 개수에 반영한다.
 * 무한퀴즈 챌린지의 결과를 반영시키기 위해 퀴즈 결과 api를 호출하는 경우
 * 퀴즈 결과 api에서 challengeId를 받아야한다.
 * 퀴즈 결과 api에 challengeId는 일반 퀴즈, 무한 퀴즈 챌린지 여부에 따라 challengeId값이 있을수도 없을수도 있다.
 *
 * 유저로부터 무한 퀴즈 챌린지에 대한 id값을 query param로 받는다.
 * 첫 1~10번째 퀴즈 문제 세트를 요청 받을 때는 유저 입장에서 기존에 받은 challengeId값이 없으므로 null이다.
 * 유저가 값을 조작할 수도 있으므로 일정 시간이 지났으면 만료시킨다.
 * jwt로 하는 것은 어떠한가?
 *
 *
 * challengeId라는 값으로 받는다.
 * challengeId
 */
router.get("/infinite-challenge", infiniteChallenge);

module.exports = router;
