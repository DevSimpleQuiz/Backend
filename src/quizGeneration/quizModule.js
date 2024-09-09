const ExcelJS = require("exceljs");
const pool = require("../db/mysqldb");
const { WORD_QUIZ_TYPE } = require("../constant/constant");
const dotenv = require("dotenv");

dotenv.config();
// 메모리에 퀴즈 데이터를 저장할 변수
let data = [];

// 한글 유니코드 범위 및 초성 계산을 위한 상수
const HANGUL_SYLLABLE_BASE = 0xac00; // '가'의 유니코드 값
const HANGUL_SYLLABLE_COUNT = 11172; // 한글 음절 개수
const INITIAL_CONSONANT_COUNT = 19; // 초성 개수
const MEDIAL_VOWEL_COUNT = 21; // 중성 개수
const FINAL_CONSONANT_COUNT = 28; // 종성 개수

// 초성 리스트
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

// 한글 초성 추출 함수
const getInitialConsonants = (word) => {
  let result = "";
  for (let i = 0; i < word.length; i++) {
    const code = word.charCodeAt(i) - HANGUL_SYLLABLE_BASE;
    if (code >= 0 && code < HANGUL_SYLLABLE_COUNT) {
      const choIndex = Math.floor(
        code / (MEDIAL_VOWEL_COUNT * FINAL_CONSONANT_COUNT)
      );
      result += CHO[choIndex];
    } else {
      result += word.charAt(i); // 한글이 아닌 경우 그대로 사용
    }
  }
  return result;
};

// 엑셀 파일 읽기 및 데이터 정제 함수
const loadData = async (filePath) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(1);

  data = []; // 데이터를 초기화

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      // 첫 번째 행은 헤더로 가정
      data.push({
        word: row.getCell(1).value,
        definition: row.getCell(2).value,
        initialConstant: getInitialConsonants(row.getCell(1).value),
        wordLength: row.getCell(1).value.length,
      });
    }
  });

  console.log("엑셀 데이터를 성공적으로 로드했습니다.");
};

// 랜덤으로 10개의 문제 생성 함수
const generateQuizSet = () => {
  if (data.length === 0) {
    throw new Error(
      "데이터가 로드되지 않았습니다. loadData를 먼저 호출하세요."
    );
  }

  const shuffledData = data.sort(() => 0.5 - Math.random());
  const selectedData = shuffledData.slice(0, 10);

  return { quizzes: selectedData };
};

const saveQuizDataToDatabase = async () => {
  // 데이터가 존재하는지 확인

  if (data.length === 0) {
    throw new Error(
      "데이터가 로드되지 않았습니다. loadData를 먼저 호출하세요."
    );
  }

  const connection = await pool.getConnection(); // pool에서 연결 가져오기

  try {
    const quiz_select_result = await connection.execute(
      `SELECT COUNT(id) as COUNT 
      FROM quiz`
    );
    const result_json = quiz_select_result[0][0];
    if (result_json["COUNT"] > 0) return;
    // 트랜젝션 시작
    await connection.beginTransaction();

    for (let item of data) {
      const { word, definition, initialConstant } = item;

      await connection.execute(
        `INSERT INTO quiz (quiz_type, word, definition, initial_constant) VALUES (?, ?, ?, ?)`,
        [WORD_QUIZ_TYPE, word, definition, initialConstant]
      );
    }

    await connection.commit();

    console.log("quiz 데이터 저장 성공");
  } catch (error) {
    await connection.rollback();
    console.error("데이터 저장 중 오류 발생", error);
  } finally {
    connection.release();
  }
};

module.exports = { loadData, generateQuizSet, saveQuizDataToDatabase };
