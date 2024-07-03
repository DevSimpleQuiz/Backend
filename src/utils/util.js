const users = require("../db/users.js");
const score = require("../db/score.js");

const isAlphaNumeric = (str) => {
  for (const code of str) {
    if (
      !(code >= "a" && code <= "z") &&
      !(code >= "A" && code <= "Z") &&
      !(code >= "0" && code <= "9")
    ) {
      return false;
    }
  }
  return true;
};

const isLowerAlphaNumeric = (str) => {
  if (isAlphaNumeric(str) === false) return false;

  // 대문자가 껴있다면 false
  for (const code of str) {
    if (code >= "A" && code <= "Z") {
      return false;
    }
  }
  return true;
};

const findUser = function (id) {
  for (const [_, user] of users) {
    if (user["id"] === id) {
      return user;
    }
  }
  return null;
};

const findScoreInfo = function (id) {
  const userInfo = findUser(id);

  console.log("userInfo in findScoreInfo : ", userInfo);

  if (userInfo === null) {
    return null;
  }

  return score.get(userInfo["scoreId"]);
};

// overflow 고려가 필요한가?
const accumulateScoreInfo = function (id, quizResultInfo) {
  console.log("id : ", id);
  scoreInfo = findScoreInfo(id);

  console.log("scoreInfo : ", scoreInfo);
  if (!scoreInfo) return false;

  scoreInfo.totalQuizCount += quizResultInfo.totalQuizCount;
  scoreInfo.solvedQuizCount += quizResultInfo.solvedQuizCount;
  scoreInfo.totalQuizScore += quizResultInfo.totalQuizScore;
  return true;
};

module.exports = {
  isAlphaNumeric,
  isLowerAlphaNumeric,
  findUser,
  findScoreInfo,
  accumulateScoreInfo,
};
