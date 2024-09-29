const ExcelJS = require("exceljs");
const pool = require("../db/mysqldb");
const {
  WORD_QUIZ_TYPE,
  DEFAULT_CORRECT_PEOPLE_COUNT,
  DEFAULT_TOTAL_ATTEMPTS_COUNT_BEFORE_CORRECT,
  KST_OFFSET,
} = require("../constant/constant");
const quizQuery = require("../queries/quizQuery.js");

const quizChallengeIdMap = new Map();

// 메모리에 퀴즈 데이터를 저장할 변수
let data = [];

// 한글 유니코드 범위 및 초성 계산을 위한 상수
const HANGUL_SYLLABLE_BASE = 0xac00; // '가'의 유니코드 값
const HANGUL_SYLLABLE_COUNT = 11172; // 한글 음절 개수
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

      await connection.execute(quizQuery.insertQuiz, [
        WORD_QUIZ_TYPE,
        word,
        definition,
        initialConstant,
      ]);
      const quizIdQueryResult = await connection.execute(
        quizQuery.getQuizIdByWord,
        [word]
      );
      const quizId = quizIdQueryResult[0][0]["id"];
      await connection.execute(quizQuery.insertQuizStatistics, [
        quizId,
        DEFAULT_CORRECT_PEOPLE_COUNT,
        DEFAULT_TOTAL_ATTEMPTS_COUNT_BEFORE_CORRECT,
      ]);
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

const validateQuizChallengeId = (challengeId) => {
  // challengeId가 유효한가?
  if (!challengeId) return false;
  // challengeId가 현재 메모리에 있는가?
  const challengeData = quizChallengeIdMap.get(challengeId);
  console.log("challengeData in validateQuizChallengeId() : ", challengeData);
  if (!challengeData) return false;
  // isChallengeActive flag는 true인가? // 채점에서는 틀렸지만 결과 api에서 반영되게 하기 위해서 challengeId를 지우지 않고 놔둠
  // 유효시간을 지나지는 않았는가?
  if (
    challengeData.isChallengeActive == false &&
    challengeData?.expiredTime < Date.now() + KST_OFFSET
  ) {
    // 유효시간이 지난 challengeId는 메모리에서 삭제한다.
    quizChallengeIdMap.delete(challengeId);
    return false;
  }

  return true;
};

module.exports = {
  loadData,
  saveQuizDataToDatabase,
  validateQuizChallengeId,
  quizChallengeIdMap,
};
