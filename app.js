const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./src/middlewares/errorMiddleware");
const cors = require("cors");

dotenv.config();
const PORT = process.env.PORT || 4242;

/**
 * No 'Access-Control-Allow-Origin'
 * header is present
 * on the requested resource.
 *
 */
const corsOptions = {
  origin: `http://${process.env.CORS_HOST}:${process.env.CORS_PORT}`,
  credentials: true, // 쿠키와 같은 자격 증명 포함 요청 허용
  optionSuccessStatus: 200, // 사전 요청 성공 상태 코드
};

app = express();

app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));

const userRouter = require("./src/routes/user");
const quizRouter = require("./src/routes/quiz");

// logout 구현
app.use("/users", userRouter);
app.use("/quiz", quizRouter);

// error handler
app.use(errorMiddleware);

app.listen(PORT, () => {
  const currentTime = new Date();
  console.log(`Server started at: ${currentTime.toISOString()}`);
  console.log(`Server is on ${PORT}`);
});
