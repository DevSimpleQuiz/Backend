const express = require("express");
const router = express.Router();
// const { isLoggedIn, isNotLoggedIn } = require("../middlewares"); // 로그인 중에는 작동안하도록 처리 필요!!
const { validateId, validatePassword } = require("../middlewares");

const { join, checkLoginId } = require("../controllers/joinController.js");

router.use(express.json());

router.post("/", [validateId, validatePassword], join); // 회원가입
router.post("/check-login-id", checkLoginId); // 아이디 중복 검사

module.exports = router;
