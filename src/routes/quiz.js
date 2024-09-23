const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/authMiddleware");
const {
  generateQuiz,
  markQuizAnswer,
  saveQuizResult,
} = require("../controllers/quizController");
const trimMiddleware = require("../middlewares/trimMiddleware");
const quizValidators = require("../validators/quizValidators.js");

router.get("/", generateQuiz);
router.get("/:quizId/mark", markQuizAnswer);
router.post(
  "/result",
  isAuthenticated,
  quizValidators.saveQuizResult,
  saveQuizResult
);

module.exports = router;
