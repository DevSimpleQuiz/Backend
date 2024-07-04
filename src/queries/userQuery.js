exports.join = `INSERT INTO users (user_id, password, salt) VALUES (?, ?, ?)`;
exports.getUserId = `SELECT id FROM users WHERE user_id = ?`;
// exports.getUserPasswordInfo = `SELECT * FROM users WHERE user_id = ?`;
exports.getUserPasswordInfo = `SELECT password, salt FROM users WHERE user_id = ?`;
// exports.getUserId = `SELECT id FROM users`;
