const { loadData, generateQuizSet } = require("../quizGeneration/quizModule");
// const { isLoggedIn, isNotLoggedIn } = require("../middlewares");

(async () => {
  // 엑셀 파일 로드
  await loadData("data/words.xlsx");

  // 랜덤 퀴즈 세트 생성
  // const quizSet = generateQuizSet();
  // console.log(JSON.stringify(quizSet, null, 2));
})();

const quizGeneration = (req, res) => {
  try {
    // 랜덤 퀴즈 세트 생성
    const quizSet = generateQuizSet();
    return res.json(quizSet);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  quizGeneration,
};
