const pool = require("../db/mysqldb.js");
const quizQuery = require("../queries/quizQuery.js");
const { QUIZ_SET_SIZE } = require("../constant/constant.js");

// 랜덤으로 10개의 문제 생성 함수
const generateQuizSet = async () => {
  const quizGeneratorQuery = quizQuery.generateQuizzes;
  const selectedData = await pool.query(quizGeneratorQuery, QUIZ_SET_SIZE);

  const result = selectedData[0].map((quizData) => {
    return {
      quizId: quizData.quizId,
      definition: quizData.definition,
      initialConstant: quizData.initialConstant,
      wordLength: quizData.initialConstant.length,
      quizAnswerStats: {
        correctAnswersCount: quizData.correctAnswersCount,
        totalAttemptsUntilFirstCorrectAnswer:
          quizData.totalAttemptsUntilFirstCorrectAnswer,
      },
    };
  });
  return { quizzes: result };
};

module.exports = {
  generateQuizSet,
};
