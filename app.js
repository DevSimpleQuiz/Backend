const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();
const PORT = process.env.PORT || 3000;

app = express();

app.use(cookieParser());
app.use(express.json());

const userRouter = require("./src/routes/user");
const quizRouter = require("./src/routes/quiz");

// logout 구현
app.use("/users", userRouter);
app.use("/quiz-result", quizRouter); // quizRoutes를 method만으로 구분 중이라 분리 필요
app.use("/quiz", quizRouter);

// app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server is on ${PORT}`);
});
