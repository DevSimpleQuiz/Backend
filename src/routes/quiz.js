const express = require("express");
const router = express.Router();

// const { isLoggedIn, isNotLoggedIn } = require("../middlewares");
const { quizGeneration } = require("../controllers/quizController");

router.post("/", quizGeneration);

module.exports = router;
