const express = require("express");
const router = express.Router();

const {
  generateQuiz,
  handleQuizResult,
} = require("../controllers/quizController");

router.get("/", generateQuiz);
router.post("/", handleQuizResult);

module.exports = router;
