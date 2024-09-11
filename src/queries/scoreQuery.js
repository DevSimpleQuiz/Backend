exports.getScoreInfo = `SELECT total_quiz_count, total_solved_count, total_score FROM score WHERE user_id = ?`;
exports.updateScoreInfo = `UPDATE score SET total_quiz_count = ?, total_solved_count = ?, total_score = ? WHERE user_id = ?`;
exports.addScoreInfo = `INSERT INTO score (user_id) VALUES (?)`;
exports.getAllrankInfo = `SELECT user_id, total_quiz_count, total_solved_count, total_score FROM score ORDER BY totaL_score DESC, user_id ASC`;
exports.getRankingPagesInfo = `SELECT u.user_id AS id, \
                                    s.total_score AS score, \
                                    ROW_NUMBER() OVER (ORDER BY s.total_score DESC) AS 'rank', \
                                    s.total_score AS score, \
                                    s.total_quiz_count  AS totalQuizCount, \
                                    s.total_solved_count AS totalSolvedQuizCount \
                                FROM score s \
                                    JOIN user u 
                                    ON u.id = s.user_id
                                LIMIT ? \
                                OFFSET ?`;
