const express = require("express");
const { validateId, validatePassword } = require("../middlewares");
const router = express.Router();

const {
  join,
  checkLoginId,
  login,
  passwordResetRequest,
  passwordReset,
} = require("../controllers/userController");

router.post("/join", [validateId, validatePassword], join);
router.post("/join/check-login-id", checkLoginId); // 아이디 중복 검사

router.post("/login", login);

router.post("/reset", passwordResetRequest);
router.put("/reset", passwordReset);

module.exports = router;
