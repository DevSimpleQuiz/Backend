const express = require('express');
const router = express.Router();

// const { isLoggedIn, isNotLoggedIn } = require('../middlewares');
const { login } = require('../controllers/usersController');

router.use(express.json());

router.post('/', login); // 로그인
// router.post("/reset", passwordResetRequest); // 비밀번호 초기화 요청
// router.put("/reset", passwordReset); // 비밀번호 초기화

module.exports = router;
