const express = require('express');
const { validateId, validatePassword } = require('../middlewares');
const { join, checkLoginId } = require('../controllers/joinController.js');

const router = express.Router();

router.use(express.json());

router.post('/', [validateId, validatePassword], join); // 회원가입
router.post('/check-login-id', checkLoginId); // 아이디 중복 검사

module.exports = router;
