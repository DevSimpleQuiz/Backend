const express = require("express");
const router = express.Router();

const { isLoggedIn, isNotLoggedIn } = require("../middlewares");
const { login } = require("../controllers/usersController");

router.post("/", login); // 로그인

module.exports = router;
