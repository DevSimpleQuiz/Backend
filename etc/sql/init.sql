-- 데이터베이스 생성
CREATE DATABASE devsimplequiz;

-- 데이터베이스 사용
USE devsimplequiz;

-- user 테이블 생성
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id varchar(20) NOT NULL,
    password char(45) NOT NULL,
    salt char(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- quiz 테이블 생성
CREATE TABLE quiz (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_type INT NOT NULL,
    word VARCHAR(40) NOT NULL,
    definition TEXT NOT NULL,
    initial_constant VARCHAR(40) NOT NULL
);

-- score 테이블 생성
CREATE TABLE score (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_quiz_count INT NOT NULL DEFAULT 0,
    total_solved_count INT NOT NULL DEFAULT 0,
    total_score INT NOT NULL DEFAULT 0,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id)
);

