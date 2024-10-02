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
const validationMiddleware = require("../middlewares/validationMiddleware.js");

router.get("/", generateQuiz);

router.get(
  "/:quizId/mark",
  quizValidators.markQuizAnswer,
  validationMiddleware,
  markQuizAnswer
);

router.post(
  "/result",
  isAuthenticated,
  quizValidators.saveQuizResult,
  validationMiddleware,
  saveQuizResult
);

// TODO: challengeId가 query parameter로 들어오는 경우에 대한 유효성 검사 추가
router.get("/infinite-challenge", infiniteChallenge);

module.exports = router;
