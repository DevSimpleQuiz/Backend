exports.insertQuiz = `INSERT INTO quiz (quiz_type, word, definition, initial_constant) VALUES (?, ?, ?, ?)`;
exports.getQuizIdByWord = `SELECT id FROM quiz WHERE word = ?`;
exports.insertQuizStatistics = `INSERT INTO quiz_accuracy_statistics (quiz_id, correct_people_count, total_attempts_count_before_correct) VALUES (?, ?, ?)`;
exports.generateQuizzes = `SELECT q.id AS quizId, q.word, q.initial_constant AS initialConstant, q.definition,
                                s.correct_people_count AS correctAnswersCount, s.total_attempts_count_before_correct AS totalAttemptsUntilFirstCorrectAnswer
                            FROM quiz q
                            JOIN quiz_accuracy_statistics s ON q.id = s.quiz_id
                            ORDER BY RAND()
                            LIMIT ?`;
exports.getQuizWord = `SELECT word FROM quiz WHERE id = ?`;
exports.isQuizSolved = `SELECT id FROM solved_quizzes WHERE user_id = ? AND quiz_id = ?`;
exports.recordQuizSolved = `INSERT INTO solved_quizzes (quiz_id, user_id) VALUES (?, ?)`;
exports.updateQuizStatistics = `UPDATE quiz_accuracy_statistics \
                                    SET correct_people_count = correct_people_count  + ?, \
                                        total_attempts_count_before_correct = total_attempts_count_before_correct + ? \
                                    WHERE quiz_id = ?`;
exports.removeUserSolvedQuizHistory = `DELETE FROM solved_quizzes WHERE user_id = ?`;

exports.addInfiniteChallengeSummary = `INSERT INTO infinite_quiz_summary (user_id) VALUES (?)`;
exports.addInfiniteQuizChallengeDetail = `INSERT INTO infinite_quiz_detail (challenge_id, user_id) VALUES(?, ?)`;
exports.increaseInfiniteQuizCount = `UPDATE infinite_quiz_summary SET challenge_count = challenge_count + 1 WHERE user_id = ?`;
