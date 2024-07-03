const express = require("express");
const router = express.Router();

// const { isLoggedIn, isNotLoggedIn } = require("../middlewares");
const {
  generateQuiz,
  handleQuizResult,
} = require("../controllers/quizController");

router.get("/", generateQuiz);
router.post("/", handleQuizResult);

module.exports = router;
