const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/authMiddleware");
const { rankInfo } = require("../controllers/rankController.js");

router.get("/", isAuthenticated, rankInfo);

module.exports = router;
