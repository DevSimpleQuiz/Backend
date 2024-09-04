const constants = {
  HASH_REPEAT_TIMES: 10000,
  SALT_BYTE_SEQUENCE_SIZE: 32,
  DIGEST_ALGORITHM: "sha512",
  ENCODING_STYLE: "base64",
  c: { httpOnly: true, secure: false, sameStie: "None" },
};

module.exports = constants;
