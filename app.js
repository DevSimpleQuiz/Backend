const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./src/middlewares/errorMiddleware");

dotenv.config();
const PORT = process.env.PORT || 3000;

app = express();

app.use(cookieParser());
app.use(express.json());

const userRouter = require("./src/routes/user");
const quizRouter = require("./src/routes/quiz");

// logout 구현
app.use("/users", userRouter);
app.use("/quiz", quizRouter);

app.use(errorMiddleware);

app.listen(PORT, () => {
  const currentTime = new Date();
  console.log(`Server started at: ${currentTime.toISOString()}`);
  console.log(`Server is on ${PORT}`);
});
