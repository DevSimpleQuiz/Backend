const crypto = require("crypto");

const {
  HASH_REPEAT_TIMES,
  SALT_BYTE_SEQUENCE_SIZE,
  DIGEST_ALGORITHM,
  ENCODING_STYLE,
} = require("../constant/constant.js");

const generateSalt = () => {
  return crypto.randomBytes(SALT_BYTE_SEQUENCE_SIZE).toString(ENCODING_STYLE);
};

const convertHashPassword = (password, salt) => {
  const hashPassword = crypto
    .pbkdf2Sync(
      password,
      salt,
      HASH_REPEAT_TIMES,
      SALT_BYTE_SEQUENCE_SIZE,
      DIGEST_ALGORITHM
    )
    .toString(ENCODING_STYLE);

  return hashPassword;
};

module.exports = { convertHashPassword, generateSalt };
