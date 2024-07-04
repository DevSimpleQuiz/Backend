const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();
PORT = process.env.PORT || 3000;

app = express();

app.use(cookieParser());
app.use(express.json());

const joinRouter = require("./src/routes/join");
const loginRouter = require("./src/routes/login");
const quizRouter = require("./src/routes/quiz");

app.use("/join", joinRouter);
app.use("/login", loginRouter);
app.use("/quiz-result", quizRouter); // quizRoutes를 method만으로 구분 중이라 분리 필요
app.use("/quiz", quizRouter);

app.listen(PORT, () => {
  console.log(`Server is on ${PORT}`);
});
