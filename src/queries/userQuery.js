exports.join = `INSERT INTO user (user_id, password, salt) VALUES (?, ?, ?)`;
exports.getUserId = `SELECT id FROM user WHERE user_id = ?`;
exports.getUserInfo = `SELECT user_id, password, salt FROM user WHERE user_id = ?`;
exports.getUserPasswordInfo = `SELECT password, salt FROM user WHERE user_id = ?`;
exports.resetPassword = `UPDATE user SET password = ?, salt = ? WHERE user_id = ?`;
exports.getThreeUsersInfo = `SELECT user_id, id FROM user WHERE id IN (?, ?, ?)`;
exports.removeUserAccount = `DELETE FROM user WHERE id = ?`;

// Function to dynamically generate query for up to 3 user IDs
exports.getThreeUsersInfoQuery = (ids) => {
  if (ids.length === 0) {
    return {
      query: "SELECT user_id, id FROM user WHERE 1=0", // Always returns an empty result set
      params: [],
    };
  }

  const placeholders = ids.map(() => "?").join(", ");
  const query = `SELECT user_id, id FROM user WHERE id IN (${placeholders}) LIMIT 3`;
  return {
    query,
    params: ids,
  };
};
