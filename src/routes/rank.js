const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/authMiddleware");
const { rankValidators } = require("../validators/rankValidators");
const {
  topRankersInfo,
  myRankInfo,
  nearRankersInfo,
  rankingPagesInfo,
} = require("../controllers/rankController.js");
const { handleValidationResult } = require("../validators/rankValidators.js");

router.get("/top", topRankersInfo);
router.get("/my", isAuthenticated, myRankInfo);
router.get("/nearby", isAuthenticated, nearRankersInfo);

// TODO: isAuthenticated
// router.get("/", isAuthenticated, rankValidators, handleValidationResult, rankingPagesInfo);
router.get("/", rankValidators, handleValidationResult, rankingPagesInfo);

module.exports = router;
