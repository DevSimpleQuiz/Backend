const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/authMiddleware");
const {
  generateQuiz,
  saveQuizResult,
} = require("../controllers/quizController");
const trimMiddleware = require("../middlewares/trimMiddleware");
const validationMiddleware = require("../middlewares/validationMiddleware");
const quizValidators = require("../validators/quizValidators.js");

router.get("/", generateQuiz);
router.post(
  "/result",
  isAuthenticated,
  trimMiddleware,
  quizValidators.saveQuizResult,
  validationMiddleware,
  saveQuizResult
);

module.exports = router;
