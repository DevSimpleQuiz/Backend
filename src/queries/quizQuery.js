exports.insertQuiz = `INSERT INTO quiz (quiz_type, word, definition, initial_constant) VALUES (?, ?, ?, ?)`;
exports.getQuizIdByWord = `SELECT id FROM quiz WHERE word = ?`;
exports.insertQuizStatistics = `INSERT INTO quiz_accuracy_statistics (quiz_id, correct_people_count, total_attempts_count_before_correct) VALUES (?, ?, ?)`;
exports.generateQuizzes = `SELECT q.id AS quizId, q.word, q.initial_constant AS initialConstant, q.definition, LENGTH(q.word) AS wordLength,
                                s.correct_people_count AS correctAnswersCount, s.total_attempts_count_before_correct AS totalAttemptsUntilFirstCorrectAnswer
                            FROM quiz q
                            JOIN quiz_accuracy_statistics s ON q.id = s.quiz_id
                            ORDER BY RAND()
                            LIMIT ?`;
