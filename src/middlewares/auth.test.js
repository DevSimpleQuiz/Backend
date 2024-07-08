// const request = require("supertest");
// const express = require("express");
// const cookieParser = require("cookie-parser");
// const { body, validationResult } = require("express-validator");
// const jwt = require("jsonwebtoken");
// const userValidators = require("../validators/userValidators");
// const {
//   isAuthenticated,
//   isNotAuthenticated,
// } = require("../middlewares/authMiddleware");
// const createError = require("http-errors");
// const { StatusCodes } = require("http-status-codes");

// // Load environment variables
// require("dotenv").config();

// const app = express();
// app.use(express.json());
// app.use(cookieParser());

// // Read environment variables
// const PORT = process.env.PORT || 4242;
// const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY || "defaultsecret";

// // Mock JWT service
// const generateToken = (payload) =>
//   jwt.sign(payload, JWT_PRIVATE_KEY, { expiresIn: "1h" });
// const verifyToken = (token) => jwt.verify(token, JWT_PRIVATE_KEY);

// // Dummy user data
// const dummyUser = { id: "validid123@", password: "Valid123!" };

// // Mock auth middleware
// app.post(
//   "/login",
//   userValidators.id,
//   userValidators.password,
//   (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res
//         .status(StatusCodes.BAD_REQUEST)
//         .json({ errors: errors.array() });
//     }
//     const { id, password } = req.body;
//     if (id === dummyUser.id && password === dummyUser.password) {
//       const token = generateToken({ id: dummyUser.id });
//       res.cookie("token", token, { httpOnly: true });
//       return res.status(StatusCodes.OK).json({ message: "로그인 성공" });
//     }
//     return next(
//       createError(
//         StatusCodes.UNAUTHORIZED,
//         "아이디 또는 비밀번호가 일치하지 않습니다."
//       )
//     );
//   }
// );

// app.post("/logout", isAuthenticated, (req, res) => {
//   res.clearCookie("token");
//   res.status(StatusCodes.OK).json({ message: "로그아웃 성공" });
// });

// app.post(
//   "/change-password",
//   isAuthenticated,
//   userValidators.password,
//   userValidators.newPassword,
//   (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res
//         .status(StatusCodes.BAD_REQUEST)
//         .json({ errors: errors.array() });
//     }
//     const { password, newPassword } = req.body;
//     if (password === dummyUser.password) {
//       dummyUser.password = newPassword;
//       return res.status(StatusCodes.OK).json({ message: "비밀번호 변경 성공" });
//     }
//     return next(
//       createError(
//         StatusCodes.UNAUTHORIZED,
//         "현재 비밀번호가 일치하지 않습니다."
//       )
//     );
//   }
// );

// describe("Authentication and User Validators", () => {
//   let server;
//   beforeAll(() => {
//     server = app.listen(PORT);
//   });
//   afterAll((done) => {
//     server.close(done);
//   });

//   describe("Login", () => {
//     const loginTestCases = [
//       {
//         description: "should login with valid credentials",
//         body: { id: dummyUser.id, password: dummyUser.password },
//         expectedStatus: StatusCodes.OK,
//         expectedMessage: "로그인 성공",
//         expectCookie: true,
//       },
//       {
//         description: "should not login with invalid id",
//         body: { id: "wrongid", password: dummyUser.password },
//         expectedStatus: StatusCodes.UNAUTHORIZED,
//         expectedMessage: "아이디 또는 비밀번호가 일치하지 않습니다.",
//         expectCookie: false,
//       },
//       {
//         description: "should not login with invalid password",
//         body: { id: dummyUser.id, password: "wrongpassword" },
//         expectedStatus: StatusCodes.UNAUTHORIZED,
//         expectedMessage: "아이디 또는 비밀번호가 일치하지 않습니다.",
//         expectCookie: false,
//       },
//       {
//         description: "should not login with empty id",
//         body: { id: "", password: dummyUser.password },
//         expectedStatus: StatusCodes.BAD_REQUEST,
//         expectedMessage: "아이디는 5~20자 영어 소문자, 숫자만 가능합니다.",
//         expectCookie: false,
//       },
//       {
//         description: "should not login with empty password",
//         body: { id: dummyUser.id, password: "" },
//         expectedStatus: StatusCodes.// console.error(err);QUEST,
//         expectedMessage:
//           "비밀번호는 8~20자 영어 대소문자, 숫자, 특수문자(? ! @ # $ %)만 가능합니다.",
//         expectCookie: false,
//       },
//       {
//         description: "should not login with short id",
//         body: { id: "abcd", password: dummyUser.password },
//         expectedStatus: StatusCodes.BAD_REQUEST,
//         expectedMessage: "아이디는 5~20자 영어 소문자, 숫자만 가능합니다.",
//         expectCookie: false,
//       },
//       {
//         description: "should not login with long id",
//         body: { id: "a".repeat(21), password: dummyUser.password },
//         expectedStatus: StatusCodes.BAD_REQUEST,
//         expectedMessage: "아이디는 5~20자 영어 소문자, 숫자만 가능합니다.",
//         expectCookie: false,
//       },
//       {
//         description: "should not login with special characters in id",
//         body: { id: "inv@lid", password: dummyUser.password },
//         expectedStatus: StatusCodes.BAD_REQUEST,
//         expectedMessage: "아이디는 5~20자 영어 소문자, 숫자만 가능합니다.",
//         expectCookie: false,
//       },
//     ];

//     loginTestCases.forEach((testCase) => {
//       it(testCase.description, async () => {
//         const res = await request(server).post("/login").send(testCase.body);

//         expect(res.status).toBe(testCase.expectedStatus);
//         if (testCase.expectedStatus === StatusCodes.OK) {
//           expect(res.body.message).toBe(testCase.expectedMessage);
//           if (testCase.expectCookie) {
//             expect(res.headers["set-cookie"]).toBeDefined();
//           }
//         } else {
//           if (testCase.expectedStatus === StatusCodes.BAD_REQUEST) {
//             expect(res.body.errors[0].msg).toBe(testCase.expectedMessage);
//           } else {
//             expect(res.body.message).toBe(testCase.expectedMessage);
//           }
//         }
//       });
//     });
//   });

//   describe("Logout", () => {
//     const logoutTestCases = [
//       {
//         description: "should logout successfully when authenticated",
//         token: generateToken({ id: dummyUser.id }),
//         expectedStatus: StatusCodes.OK,
//         expectedMessage: "로그아웃 성공",
//       },
//       {
//         description: "should not logout when not authenticated",
//         token: null,
//         expectedStatus: StatusCodes.FORBIDDEN,
//         expectedMessage: "인증받지 않은 사용자입니다. 로그인 해주세요.",
//       },
//     ];

//     logoutTestCases.forEach((testCase) => {
//       it(testCase.description, async () => {
//         const res = await request(server)
//           .post("/logout")
//           .set("Cookie", testCase.token ? `token=${testCase.token}` : "");

//         expect(res.status).toBe(testCase.expectedStatus);
//         expect(res.body.message).toBe(testCase.expectedMessage);
//         if (testCase.expectedStatus === StatusCodes.OK) {
//           expect(res.headers["set-cookie"][0]).toMatch(/token=;/);
//         }
//       });
//     });
//   });

//   describe("Change Password", () => {
//     const changePasswordTestCases = [
//       {
//         description: "should change password with valid credentials",
//         token: generateToken({ id: dummyUser.id }),
//         body: { password: dummyUser.password, newPassword: "NewValid123!" },
//         expectedStatus: StatusCodes.OK,
//         expectedMessage: "비밀번호 변경 성공",
//         expectedNewPassword: "NewValid123!",
//       },
//       {
//         description: "should not change password with invalid current password",
//         token: generateToken({ id: dummyUser.id }),
//         body: { password: "wrongpassword", newPassword: "NewValid123!" },
//         expectedStatus: StatusCodes.UNAUTHORIZED,
//         expectedMessage: "현재 비밀번호가 일치하지 않습니다.",
//       },
//       {
//         description: "should not change password without authentication",
//         token: null,
//         body: { password: dummyUser.password, newPassword: "NewValid123!" },
//         expectedStatus: StatusCodes.FORBIDDEN,
//         expectedMessage: "인증받지 않은 사용자입니다. 로그인 해주세요.",
//       },
//       {
//         description: "should not change password with empty new password",
//         token: generateToken({ id: dummyUser.id }),
//         body: { password: dummyUser.password, newPassword: "" },
//         expectedStatus: StatusCodes.BAD_REQUEST,
//         expectedMessage:
//           "비밀번호는 8~20자 영어 대소문자, 숫자, 특수문자(? ! @ # $ %)만 가능합니다.",
//       },
//       {
//         description: "should not change password with short new password",
//         token: generateToken({ id: dummyUser.id }),
//         body: { password: dummyUser.password, newPassword: "short1!" },
//         expectedStatus: StatusCodes.BAD_REQUEST,
//         expectedMessage:
//           "비밀번호는 8~20자 영어 대소문자, 숫자, 특수문자(? ! @ # $ %)만 가능합니다.",
//       },
//       {
//         description: "should not change password with long new password",
//         token: generateToken({ id: dummyUser.id }),
//         body: {
//           password: dummyUser.password,
//           newPassword: "a".repeat(21) + "1A!",
//         },
//         expectedStatus: StatusCodes.BAD_REQUEST,
//         expectedMessage:
//           "비밀번호는 8~20자 영어 대소문자, 숫자, 특수문자(? ! @ # $ %)만 가능합니다.",
//       },
//     ];

//     changePasswordTestCases.forEach((testCase) => {
//       it(testCase.description, async () => {
//         const res = await request(server)
//           .post("/change-password")
//           .set("Cookie", testCase.token ? `token=${testCase.token}` : "")
//           .send(testCase.body);

//         expect(res.status).toBe(testCase.expectedStatus);
//         expect(res.body.message).toBe(testCase.expectedMessage);
//         if (testCase.expectedStatus === StatusCodes.OK) {
//           expect(dummyUser.password).toBe(testCase.expectedNewPassword);
//         }
//       });
//     });
//   });
// });
