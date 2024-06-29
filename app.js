const express = require("express");
const {
  loadData,
  generateQuizSet,
} = require("./srcs/quizGeneration/quizModule.js");

app = express();
PORT = 4242;

(async () => {
  // 엑셀 파일 로드
  await loadData("data/words.xlsx");

  // 랜덤 퀴즈 세트 생성
  // const quizSet = generateQuizSet();

  // console.log(JSON.stringify(quizSet, null, 2));
})();

app.get("/", (req, res) => {
  return res.send("JS version express setting.");
});

// app.get("/quiz", (req, res) => {
//   return res.send("quiz.");
// });

app.get("/quiz", (req, res) => {
  try {
    // 랜덤 퀴즈 세트 생성
    const quizSet = generateQuizSet();
    res.json(quizSet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * login한 유저인지 확인, JWT를 이용한다.
 * cookie에 담아둔다.
 */
app.post("/quiz-result", (req, res) => {
  return res.send("quiz.");
});

app.listen(PORT, () => {
  console.log(`Server is on ${PORT}`);
});
