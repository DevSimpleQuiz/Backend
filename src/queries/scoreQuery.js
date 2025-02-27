exports.getScoreInfo = `SELECT total_quiz_count, total_solved_count, total_score FROM score WHERE user_id = ?`;
exports.updateScoreInfo = `UPDATE score \
                            SET total_quiz_count = total_quiz_count + ?, \
                                total_solved_count = total_solved_count + ?, \
                                total_score = total_score + ? 
                            WHERE user_id = ?`;
exports.addScoreInfo = `INSERT INTO score (user_id) VALUES (?)`;

exports.getMyRank = `WITH ranked_scores AS (
                        SELECT 
                            user_id, 
                            total_quiz_count, 
                            total_solved_count, 
                            total_score,
                            RANK() OVER (ORDER BY total_score DESC, user_id ASC) AS user_rank
                        FROM 
                            score
                    )
                    SELECT * 
                    FROM ranked_scores 
                    WHERE user_id = ?
                    `;
exports.getAllrankInfo = `SELECT user_id, total_quiz_count, total_solved_count, total_score FROM score ORDER BY totaL_score DESC, user_id ASC`;
// TODO: challenge_count 가져올 join query 필요
exports.getMypageInfo = `SELECT 
                                s.user_id, 
                                s.total_quiz_count, 
                                s.total_solved_count, 
                                s.total_score, 
                                iqs.correct_streak AS challenge_count 
                            FROM score s 
                            JOIN infinite_quiz_summary iqs 
                            ON iqs.user_id = s.user_id 
                            WHERE iqs.user_id = ?`;
exports.getRankingPageItemsCount = `SELECT COUNT(id) AS totalItemCount FROM score`;
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
exports.removeUserScoreHistory = `DELETE FROM score WHERE user_id = ?`;
