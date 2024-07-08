exports.join = `INSERT INTO user (user_id, password, salt) VALUES (?, ?, ?)`;
exports.getUserId = `SELECT id FROM user WHERE user_id = ?`;
exports.getUserInfo = `SELECT user_id, password, salt FROM user WHERE user_id = ?`;
exports.getUserPasswordInfo = `SELECT password, salt FROM user WHERE user_id = ?`;
exports.resetPassword = `UPDATE user SET password = ?, salt = ? WHERE user_id = ?`;
