const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const userController = require("../src/controllers/userController");
const connection = require("../src/db/mysqldb");
const userQuery = require("../src/queries/userQuery");
const { verifyToken } = require("../src/services/jwtService");
const {
  SALT_BYTE_SEQUENCE_SIZE,
  HASH_REPEAT_TIMES,
  DIGEST_ALGORITHM,
  ENCODING_STYLE,
} = require("../src/constant/constant");
const {
  convertHashPassword,
  generateSalt,
} = require("../src/services/userService");

jest.mock("jsonwebtoken");

describe("User Controller Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      cookies: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });
  /*
  describe("join function", () => {
    it("should return 201 status and 'OK' message when successfully joined", async () => {
      // Mock getUserId query to simulate user not existing
      connection.query = jest.fn().mockResolvedValueOnce([[], null]);

      req.body.id = "testid123";
      req.body.password = "Test123!";

      await userController.join(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith({ message: "OK" });
    });

    it("should return 400 status and 'Invalid ID format' message if ID format is incorrect", async () => {
      req.body.id = "invalid_id!";
      req.body.password = "Test123!";

      await userController.join(req, res, next);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        errors: [
          {
            msg: "아이디는 5~20자 영어 소문자, 숫자만 가능합니다.",
            param: "id",
            location: "body",
          },
        ],
      });
    });

    it("should return 400 status and 'Invalid password format' message if password format is incorrect", async () => {
      req.body.id = "testid123";
      req.body.password = "invalidpassword";

      await userController.join(req, res, next);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        errors: [
          {
            msg: "비밀번호는 8~20자 영어 대소문자, 숫자, 특수문자(? ! @ # $ %)만 가능합니다.",
            param: "password",
            location: "body",
          },
        ],
      });
    });

    it("should return 409 status and '이미 사용 중인 아이디입니다.' message if user ID already exists", async () => {
      // Mock getUserId query to simulate user already existing
      connection.query = jest.fn().mockResolvedValueOnce([[{ id: 1 }], null]);

      req.body.id = "existingid";
      req.body.password = "Test123!";

      await userController.join(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
      expect(res.json).toHaveBeenCalledWith({
        message: "이미 사용 중인 아이디입니다.",
      });
    });

    it("should return 500 status and 'Internal Server Error' message if database query fails", async () => {
      // Mock getUserId query to simulate database query failure
      connection.query = jest
        .fn()
        .mockRejectedValueOnce(new Error("Database query failed"));

      req.body.id = "testid123";
      req.body.password = "Test123!";

      await userController.join(req, res);

      expect(res.status).toHaveBeenCalledWith(
        StatusCodes.INTERNAL_SERVER_ERROR
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal Server Error",
      });
    });
  });

  describe("login function", () => {
    it("should return NO_CONTENT status and set token cookie on successful login", async () => {
      const mockUser = {
        id: 1,
        password: "hashed_password",
        salt: "test_salt",
      };

      // Mock getUserPasswordInfo query to simulate user existing
      connection.query = jest.fn().mockResolvedValueOnce([[mockUser], null]);

      req.body.id = "existingid";
      req.body.password = "Test123!";

      // Mock jwt.sign
      jwt.sign.mockReturnValue("mock_token");

      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
      expect(res.cookie).toHaveBeenCalledWith("token", "mock_token", {
        httpOnly: true,
      });
    });

    it("should return 400 status and 'Invalid ID or password' message if login credentials are incorrect", async () => {
      const mockUser = {
        id: 1,
        password: "hashed_password",
        salt: "test_salt",
      };

      // Mock getUserPasswordInfo query to simulate user existing
      connection.query = jest.fn().mockResolvedValueOnce([[mockUser], null]);

      req.body.id = "existingid";
      req.body.password = "InvalidPassword123!";

      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "아이디 또는 비밀번호가 올바르지 않습니다.",
      });
    });

    it("should return 400 status and 'Invalid ID format' message if ID format is incorrect", async () => {
      req.body.id = "invalidid!";
      req.body.password = "Test123!";

      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "아이디 형식이 올바르지 않습니다.",
      });
    });

    it("should return 404 status and 'User not found' message if user ID does not exist", async () => {
      // Mock getUserPasswordInfo query to simulate user not existing
      connection.query = jest.fn().mockResolvedValueOnce([[], null]);

      req.body.id = "nonexistingid";
      req.body.password = "Test123!";

      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        message: "사용자를 찾을 수 없습니다.",
      });
    });

    it("should return 500 status and 'Internal Server Error' message if database query fails", async () => {
      // Mock getUserPasswordInfo query to simulate database query failure
      connection.query = jest
        .fn()
        .mockRejectedValueOnce(new Error("Database query failed"));

      req.body.id = "existingid";
      req.body.password = "Test123!";

      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(
        StatusCodes.INTERNAL_SERVER_ERROR
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal Server Error",
      });
    });
  });
  */

  /*
  describe("isCurrentPassword function", () => {
    it("should return NO_CONTENT status if current password is correct", async () => {
      const mockUser = {
        id: 1,
        password: "hashed_password",
        salt: "test_salt",
      };

      // Mock verifyToken
      verifyToken.mockResolvedValue({ id: mockUser.id });

      // Mock getUserPasswordInfo query to simulate user existing
      connection.query = jest.fn().mockResolvedValueOnce([[mockUser], null]);

      req.body.password = "Test123!";
      req.cookies.token = "mock_token";

      await userController.isCurrentPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
    });

    it("should return 403 status if token is not provided", async () => {
      await userController.isCurrentPassword(req, res, next);

      expect(next).toHaveBeenCalledWith(
        createError(
          StatusCodes.FORBIDDEN,
          "인증되지 않은 사용자입니다. 로그인 후 시도해주세요."
        )
      );
    });

    it("should return 404 status if user information cannot be found", async () => {
      // Mock verifyToken
      verifyToken.mockResolvedValue({ id: 1 });

      // Mock getUserPasswordInfo query to simulate user not existing
      connection.query = jest.fn().mockResolvedValueOnce([[], null]);

      req.body.password = "Test123!";
      req.cookies.token = "mock_token";

      await userController.isCurrentPassword(req, res, next);

      expect(next).toHaveBeenCalledWith(
        createError(StatusCodes.NOT_FOUND, "사용자 정보를 찾을 수 없습니다.")
      );
    });

    it("should return 500 status and 'Internal Server Error' message if database query fails", async () => {
      // Mock verifyToken
      verifyToken.mockResolvedValue({ id: 1 });

      // Mock getUserPasswordInfo query to simulate database query failure
      connection.query = jest
        .fn()
        .mockRejectedValueOnce(new Error("Database query failed"));

      req.body.password = "Test123!";
      req.cookies.token = "mock_token";

      await userController.isCurrentPassword(req, res, next);

      expect(next).toHaveBeenCalledWith(
        createError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal Server Error")
      );
    });
  });

  describe("isAvailablePassword function", () => {
    it("should return OK status and isValid true if new password is available", async () => {
      req.body.password = "Test123!";
      req.body.newPassword = "NewPassword123!";

      const result = await userController.isAvailablePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it("should return OK status and isValid false if new password is not available", async () => {
      req.body.password = "Test123!";
      req.body.newPassword = "Test123!";

      const result = await userController.isAvailablePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({ success: false });
    });
  });

  describe("changePassword function", () => {
    it("should return NO_CONTENT status and update user password if current password is correct", async () => {
      const mockUser = {
        id: 1,
        password: "hashed_password",
        salt: "test_salt",
      };

      // Mock verifyToken
      verifyToken.mockResolvedValue({ id: mockUser.id });

      // Mock getUserPasswordInfo query to simulate user existing
      connection.query = jest.fn().mockResolvedValueOnce([[mockUser], null]);

      req.body.password = "Test123!";
      req.body.newPassword = "NewPassword123!";
      req.cookies.token = "mock_token";

      const result = await userController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
    });

    it("should return FORBIDDEN status if token is not provided", async () => {
      await userController.changePassword(req, res, next);

      expect(next).toHaveBeenCalledWith(
        createError(
          StatusCodes.FORBIDDEN,
          "인증받지 않은 사용자입니다. 로그인 해주세요."
        )
      );
    });

    it("should return NOT_FOUND status if user information cannot be found", async () => {
      // Mock verifyToken
      verifyToken.mockResolvedValue({ id: 1 });

      // Mock getUserPasswordInfo query to simulate user not existing
      connection.query = jest.fn().mockResolvedValueOnce([[], null]);

      req.body.password = "Test123!";
      req.body.newPassword = "NewPassword123!";
      req.cookies.token = "mock_token";

      await userController.changePassword(req, res, next);

      expect(next).toHaveBeenCalledWith(
        createError(StatusCodes.NOT_FOUND, "사용자 정보를 찾을 수 없습니다.")
      );
    });

    it("should return 500 status and 'Internal Server Error' message if database query fails", async () => {
      // Mock verifyToken
      verifyToken.mockResolvedValue({ id: 1 });

      // Mock getUserPasswordInfo query to simulate database query failure
      connection.query = jest
        .fn()
        .mockRejectedValueOnce(new Error("Database query failed"));

      req.body.password = "Test123!";
      req.body.newPassword = "NewPassword123!";
      req.cookies.token = "mock_token";

      await userController.changePassword(req, res, next);

      expect(next).toHaveBeenCalledWith(
        createError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal Server Error")
      );
    });
  });
  */
});
