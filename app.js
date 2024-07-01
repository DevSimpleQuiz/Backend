const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
PORT = process.env.PORT || 3000;

app = express();

const joinRouter = require("./src/routes/join");
const usersRouter = require("./src/routes/users");
const quizRouter = require("./src/routes/quiz");
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
app.use("/users", usersRouter);
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
