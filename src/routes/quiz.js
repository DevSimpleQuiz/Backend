const express = require('express');
const { quizGeneration } = require('../controllers/quizController');

const router = express.Router();

router.get('/', quizGeneration);

module.exports = router;
