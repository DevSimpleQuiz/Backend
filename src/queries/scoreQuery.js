exports.getScoreInfo = `SELECT total_quiz_count, total_solved_count, total_score FROM score WHERE user_id = ?`;
exports.updateScoreInfo = `UPDATE score SET total_quiz_count = ?, total_solved_count = ?, total_score = ? WHERE user_id = ?`;
exports.addScoreInfo = `INSERT INTO score (user_id, total_quiz_count, total_solved_count, total_score) VALUES (?, ?, ?, ?)`;
