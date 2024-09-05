const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/authMiddleware");
const {
  topRankersInfo,
  myRankInfo,
  nearRankersInfo,
} = require("../controllers/rankController.js");

router.get("/top", topRankersInfo);
router.get("/my", isAuthenticated, myRankInfo);
router.get("/near", isAuthenticated, nearRankersInfo);

module.exports = router;
