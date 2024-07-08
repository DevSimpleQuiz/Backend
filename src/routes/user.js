// src/routes/user.js
const express = require("express");
const validationMiddleware = require("../middlewares/validationMiddleware");
const userValidators = require("../validators/userValidators");
const {
  isAuthenticated,
  isNotAuthenticated,
} = require("../middlewares/authMiddleware");

const trimMiddleware = require("../middlewares/trimMiddleware");

const router = express.Router();

const {
  join,
  checkLoginId,
  login,
  logout,
  isAvailablePassword, // naming 결 고려
  isCurrentPassword,
  resetPassword,
} = require("../controllers/userController");

router.post(
  "/join",
  isNotAuthenticated,
  trimMiddleware,
  userValidators.id,
  userValidators.password,
  validationMiddleware,
  join
);

// 아이디 중복 검사
router.post(
  "/join/check-login-id",
  isNotAuthenticated,
  trimMiddleware,
  userValidators.id,
  validationMiddleware,
  checkLoginId
);

router.post(
  "/login",
  isNotAuthenticated,
  trimMiddleware,
  userValidators.id,
  userValidators.password,
  validationMiddleware,
  login
);

/**
 * TODO
 */
// 로그아웃 처리
router.post("/logout", isAuthenticated, logout);

router.post(
  "/action/is-current-password",
  isAuthenticated,
  trimMiddleware,
  userValidators.password,
  validationMiddleware,
  isCurrentPassword
);

router.post(
  "/action/is-available-password",
  isAuthenticated,
  trimMiddleware,
  userValidators.password,
  userValidators.newPassword,
  validationMiddleware,
  isAvailablePassword
);

router.put(
  "/password",
  isAuthenticated,
  trimMiddleware,
  userValidators.password,
  userValidators.newPassword,
  validationMiddleware,
  resetPassword
);

module.exports = router;
