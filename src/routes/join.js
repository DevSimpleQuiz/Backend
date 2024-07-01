const express = require("express");
const router = express.Router();

// const { isLoggedIn, isNotLoggedIn } = require("../middlewares"); // 로그인 중에는 작동안하도록 처리 필요!!
const { join, checkLoginId } = require("../controllers/joinController.js");

router.use(express.json());

router.post("/", join); // 회원가입
// 회원가입시 아이디 중복검사를 위한 적절한 네이밍은 무엇인가?
router.post("/check-login-id", checkLoginId); // 아이디 중복 검사

module.exports = router;
