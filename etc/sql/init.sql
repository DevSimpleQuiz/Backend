-- 기존 데이터베이스 제거
DROP DATABASE IF EXISTS devsimplequiz;

-- 데이터베이스 생성
CREATE DATABASE devsimplequiz;

-- 데이터베이스 사용
USE devsimplequiz;

-- user 테이블 생성
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id varchar(20) NOT NULL UNIQUE,
    password char(45) NOT NULL,
    salt char(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- quiz 테이블 생성
CREATE TABLE quiz (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_type INT NOT NULL,
    word VARCHAR(40) NOT NULL UNIQUE,
    definition TEXT NOT NULL,
    initial_constant VARCHAR(40) NOT NULL
);

-- score 테이블 생성
CREATE TABLE score (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    total_quiz_count INT NOT NULL DEFAULT 0,
    total_solved_count INT NOT NULL DEFAULT 0,
    total_score INT NOT NULL DEFAULT 0,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- 유저별 푼 퀴즈를 기록하는 테이블 생성
CREATE TABLE solved_quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quiz(id),
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- 퀴즈 정답률 관련 데이터 테이블 생성
CREATE TABLE quiz_accuracy_statistics (
    quiz_id INT PRIMARY KEY,
    correct_people_count INT DEFAULT 0,
    total_attempts_count_before_correct INT DEFAULT 0,
    FOREIGN KEY (quiz_id) REFERENCES quiz (id)
);

-- infinite_quiz_summary 테이블 생성
CREATE TABLE infinite_quiz_summary (
    user_id INT PRIMARY KEY,               -- 사용자 ID (Primary Key)
    correct_streak INT DEFAULT 0,            -- 최고 연속 정답 기록
    challenge_count INT DEFAULT 0,           -- 도전 횟수
    FOREIGN KEY (user_id) REFERENCES user(id)  -- user 테이블의 id를 참조
);

-- infinite_quiz_details 테이블 생성
CREATE TABLE infinite_quiz_details (
    challenge_id CHAR(36) PRIMARY KEY,      -- 도전 ID (UUID 사용 가능)
    user_id INT,                            -- 사용자 ID (Foreign Key)
    correct_streak INT NOT NULL,            -- 해당 도전에서의 연속 정답 기록
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id)  -- user 테이블의 id를 참조
);

/* infinite_quiz_summary
infinite_quiz_summary
- user_id (PK)
- correct_streak (최고 기록)
- challenge_count (도전 횟수)
*/

/* infinite_quiz_details
- challenge_id (PK)
- user_id (FK)
- correct_streak (해당 도전에서의 기록)
- start_time (도전 시작 시간)
- end_time (도전 종료 시간)
*/

/* infinite_quiz_progress
- challenge_id (PK, FK)
- user_id (FK)
- current_question_count (현재까지 맞춘 문제 수)


-- 유저가 문제를 맞출 때마다 current_question_count 증가
UPDATE infinite_quiz_progress
SET current_question_count = current_question_count + 1
WHERE challenge_id = :challenge_id;

-- 현재까지 맞춘 문제 수 확인
SELECT current_question_count
FROM infinite_quiz_progress
WHERE challenge_id = :challenge_id;


*/
