const { loadData, generateQuizSet } = require("../quizGeneration/quizModule");

(async () => {
  // 퀴즈용 엑셀 파일 로드, 최초 한번만 호출
  await loadData("data/words.xlsx");
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
