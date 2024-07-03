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
const usersRouter = require("./src/routes/users");
const quizRouter = require("./src/routes/quiz");
// const rankRouter = require("./src/routes/rank");

// const categoryRouter = require("./routes/category");
// const likeRouter = require("./routes/likes");
// const cartRouter = require("./routes/carts");
// const orderRouter = require("./routes/orders");

app.get("/", (req, res) => {
  return res.send("JS version express setting.");
});

// app.get("/quiz", (req, res) => {
//   return res.send("quiz.");
// });

app.use("/join", joinRouter);
app.use("/login", loginRouter);
app.use("/users", usersRouter);
app.use("/quiz-result", quizRouter); // quizRoutes를 method만으로 구분 중이라 분리 필요
app.use("/quiz", quizRouter);

/**
 * login한 유저인지 확인, JWT를 이용한다.
 * cookie에 담아둔다.
 */
app.post("/quiz-result", (req, res) => {
  return res.send("quiz.");
});

app.listen(PORT, () => {
  console.log(`Server is on ${PORT}`);
});
