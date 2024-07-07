const express = require("express");
// const { validateId, validatePassword } = require("../middlewares");
const userValidators = require("../validators/userValidators");
const {
  isAuthenticated,
  isNotAuthenticated,
} = require("../middlewares/authMiddleware");

const router = express.Router();

const {
  join,
  checkLoginId,
  login,
  isAvailablePassword, // naming 결 고려
  isCurrentPassword,
  passwordReset,
} = require("../controllers/userController");

router.post(
  "/join",
  [isNotAuthenticated, userValidators.id, userValidators.password],
  join
);
router.post(
  "/join/check-login-id",
  [isNotAuthenticated, userValidators.id],
  checkLoginId
); // 아이디 중복 검사

router.post(
  "/login",
  [isNotAuthenticated, userValidators.id, userValidators.password],
  login
);

router.post(
  "/action/is-current-password",
  [isAuthenticated, userValidators.password],
  isCurrentPassword
);

router.post(
  "/action/is-available-password",
  [isAuthenticated, userValidators.newPassword],
  isAvailablePassword
);

router.put(
  "/reset",
  [isAuthenticated, userValidators.password, userValidators.newPassword],
  passwordReset
);

/**
 * TODO
 */
const clearCookie = (res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "strict" });
};
// 로그아웃 처리
router.post("/logout", isAuthenticated, (req, res) => {
  // 쿠키에서 token 제거
  clearCookie(res); // 쿠키 삭제 함수 호출

  // 클라이언트에 성공 응답 보내기
  res.status(200).json({ message: "로그아웃 되었습니다." });
});

module.exports = router;
