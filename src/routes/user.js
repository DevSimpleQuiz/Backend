const express = require("express");
const { validateId, validatePassword } = require("../middlewares");
const router = express.Router();

const {
  join,
  checkLoginId,
  login,
  isAvailablePassword, // naming 결 고려
  isCurrentPassword,
  passwordResetRequest,
  passwordReset,
} = require("../controllers/userController");

router.post("/join", [validateId, validatePassword], join);
router.post("/join/check-login-id", checkLoginId); // 아이디 중복 검사

router.post("/login", login);

router.post("/action/is-current-password", isCurrentPassword);
router.post("/action/is-available-password", isAvailablePassword);
router.put("/reset", passwordReset);

module.exports = router;
