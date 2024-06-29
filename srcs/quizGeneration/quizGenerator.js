const ExcelJS = require("exceljs");
const fs = require("fs");

// 한글 초성 추출 함수
const getInitialConsonants = (word) => {
  const CHO = [
    "ㄱ",
    "ㄲ",
    "ㄴ",
    "ㄷ",
    "ㄸ",
    "ㄹ",
    "ㅁ",
    "ㅂ",
    "ㅃ",
    "ㅅ",
    "ㅆ",
    "ㅇ",
    "ㅈ",
    "ㅉ",
    "ㅊ",
    "ㅋ",
    "ㅌ",
    "ㅍ",
    "ㅎ",
  ];

  let result = "";
  for (let i = 0; i < word.length; i++) {
    const code = word.charCodeAt(i) - 44032;
    if (code >= 0 && code <= 11171) {
      result += CHO[Math.floor(code / 588)];
    } else {
      result += word.charAt(i); // 한글이 아닌 경우 그대로 사용
    }
  }
  return result;
};

// 엑셀 파일 읽기
const workbook = new ExcelJS.Workbook();
workbook.xlsx
  .readFile("words.xlsx")
  .then(() => {
    const worksheet = workbook.getWorksheet(1);
    const data = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        // 첫 번째 행은 헤더로 가정
        data.push({
          어휘: row.getCell(1).value,
          정의: row.getCell(2).value,
        });
      }
    });

    // 데이터 무작위로 10개 선택
    const shuffledData = data.sort(() => 0.5 - Math.random());
    const selectedData = shuffledData.slice(0, 10);

    // JSON 포맷으로 변환
    const quizzes = selectedData.map((item) => ({
      word: item["어휘"],
      definition: item["정의"],
      initialConstant: getInitialConsonants(item["어휘"]),
      wordLength: item["어휘"].length,
    }));

    const result = { quizzes };

    // JSON 파일로 저장
    fs.writeFileSync("quizzes.json", JSON.stringify(result, null, 2), "utf8");

    console.log("JSON 데이터가 quizzes.json 파일로 저장되었습니다.");
  })
  .catch((error) => {
    console.error("엑셀 파일을 읽는 중 오류가 발생했습니다:", error);
  });
