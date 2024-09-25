const pool = require("../db/mysqldb.js");
const quizQuery = require("../queries/quizQuery.js");

// 랜덤으로 10개의 문제 생성 함수
// TODO: quizSetSize 내부에서 개발자가 넣는 것이지만, 파리미터 검증 추가 처리
const generateQuizSet = async (quizSetSize) => {
  const quizGeneratorQuery = quizQuery.generateQuizzes;
  const selectedData = await pool.query(quizGeneratorQuery, quizSetSize);

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
