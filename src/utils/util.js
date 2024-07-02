const users = require('../db/users.js');

const findUser = function (id) {
  for (const [_, user] of users) {
    if (user['id'] === id) {
      return user;
    }
  }
  return null;
};

const findScoreInfo = function (id) {
  const userInfo = findUser(id);

  if (userInfo === null) {
    return null;
  }

  return score.get(userInfo['scoreId']);
};

module.exports = { findUser, findScoreInfo };
