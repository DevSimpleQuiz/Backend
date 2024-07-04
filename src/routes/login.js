const express = require("express");
const router = express.Router();

const { login } = require("../controllers/loginController");

router.post("/", login); // 로그인

module.exports = router;
