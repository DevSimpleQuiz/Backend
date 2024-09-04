const constants = {
  HASH_REPEAT_TIMES: 10000,
  SALT_BYTE_SEQUENCE_SIZE: 32,
  DIGEST_ALGORITHM: "sha512",
  ENCODING_STYLE: "base64",
  COOKIE_OPTION: { httpOnly: true, secure: true, sameStie: "strict" },
  WORD_QUIZ_TYPE: 1,
};

module.exports = constants;
