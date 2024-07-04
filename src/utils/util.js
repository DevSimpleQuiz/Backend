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

module.exports = {
  isAlphaNumeric,
  isLowerAlphaNumeric,
};
