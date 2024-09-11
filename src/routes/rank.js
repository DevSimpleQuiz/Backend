const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/authMiddleware");
const {
  topRankersInfo,
  myRankInfo,
  nearRankersInfo,
  rankingPagesInfo,
} = require("../controllers/rankController.js");

router.get("/top", topRankersInfo);
router.get("/my", isAuthenticated, myRankInfo);
router.get("/nearby", isAuthenticated, nearRankersInfo);

// TODO: isAuthenticated
router.get("/", rankingPagesInfo);

module.exports = router;
