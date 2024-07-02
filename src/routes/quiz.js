const express = require("express");
const router = express.Router();

// const { isLoggedIn, isNotLoggedIn } = require("../middlewares");
const { quizGeneration } = require("../controllers/quizController");

router.get("/", quizGeneration);

module.exports = router;
