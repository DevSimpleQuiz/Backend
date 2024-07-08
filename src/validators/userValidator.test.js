const { validationResult } = require("express-validator");
const userValidators = require("./userValidators");
const {
  isAuthenticated,
  isNotAuthenticated,
} = require("../middlewares/authMiddleware");

const mockReq = (body) => ({ body });

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe("User Validators", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("id validator", () => {
    it("should pass for valid id", async () => {
      const mockRequestMessage = [
        mockReq({ id: "validid123" }),
        mockReq({ id: "01234567890123456789" }),
      ];

      for (const message of mockRequestMessage) {
        const req = message;
        const res = mockRes();

        await Promise.all(
          userValidators.id.map((validator) => validator(req, res, mockNext))
        );

        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(true);
        expect(mockNext).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      }
    });

    it("should fail for invalid id", async () => {
      const mockRequestMessage = [
        mockReq({ id: "012345678901234567891" }),
        mockReq({ id: "inv@lid" }),
        mockReq({ id: "V1234567890123456789" }),
        mockReq({ id: "0123456789V012345678" }),
        mockReq({ id: "0123456789@123456789" }),
        mockReq({ id: "0123456789123456789B" }),
        mockReq({ id: "012345678901234567890123456" }),
      ];

      for (const message of mockRequestMessage) {
        const req = message;
        const res = mockRes();

        await Promise.all(
          userValidators.id.map((validator) => validator(req, res, mockNext))
        );

        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: "아이디는 5~20자 영어 소문자, 숫자만 가능합니다.",
            }),
          ])
        );
      }
    });
  });

  describe("password validator", () => {
    it("should pass for valid password", async () => {
      const mockRequestMessages = [
        mockReq({ password: "01234567@" }), // 특수 문자 포함
        mockReq({ password: "01234567890123456789" }), // 20자 초과
        mockReq({ password: "V123456780123456789" }), // 대문자 포함
        mockReq({ password: "0123456789V012345678" }), // 대문자 포함
        mockReq({ password: "@@@@@@@@@@@" }), // 특수 문자 포함
        mockReq({ password: "?!@#$%?!@#$%?!@#$%" }), // 대문자 포함
      ];

      for (const message of mockRequestMessages) {
        console.log("message : ", message);
        const req = message;
        const res = mockRes();

        await Promise.all(
          userValidators.password.map((validator) =>
            validator(req, res, mockNext)
          )
        );
        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(true);
        expect(mockNext).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      }
    });

    it("should fail for invalid password", async () => {
      const mockRequestMessages = [
        mockReq({ password: "short" }), // 짧은 문자
        mockReq({ password: "short   " }), // 짧은 문자 + 공백
        mockReq({ password: "V12345678 0123456789" }), // 대문자 포함
        mockReq({ password: "......... " }),
        // mockReq({ password: "0123456789@123456789" }), // 특수 문자 포함
        // mockReq({ password: "0123456789123456789B" }), // 대문자 포함
      ];

      for (const message of mockRequestMessages) {
        // console.log("message : ", message);
        const req = message;
        const res = mockRes();

        await Promise.all(
          userValidators.password.map((validator) =>
            validator(req, res, mockNext)
          )
        );
        const errors = validationResult(req);

        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              msg: "비밀번호는 8~20자 영어 대소문자, 숫자, 특수문자(? ! @ # $ %)만 가능합니다.",
            }),
          ])
        );
      }
    });
  });

  describe("newPassword validator", () => {
    it("should pass for valid newPassword", async () => {
      const req = mockReq({ newPassword: "Valid123!" });
      const res = mockRes();

      await Promise.all(
        userValidators.newPassword.map((validator) =>
          validator(req, res, mockNext)
        )
      );
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(true);
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should fail for invalid newPassword", async () => {
      const req = mockReq({ newPassword: "short" });
      const res = mockRes();

      await Promise.all(
        userValidators.newPassword.map((validator) =>
          validator(req, res, mockNext)
        )
      );
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: "비밀번호는 8~20자 영어 대소문자, 숫자, 특수문자(? ! @ # $ %)만 가능합니다.",
          }),
        ])
      );
    });
  });
});
