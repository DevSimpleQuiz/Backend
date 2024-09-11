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
router.get("/nearby", isAuthenticated, nearRankersInfo);

router.get("/", (req, res, next) => {
  const queryParameter = req.query;
  console.log("queryParameter : ", queryParameter);

  const { page, limit } = queryParameter;
  console.log("page : ", page);
  console.log("limit : ", limit);

  return res.json({ message: `endpoint: /ranks/${queryParameter}` });
});

module.exports = router;
