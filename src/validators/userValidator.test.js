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
      const req = mockReq({ id: "validid123" });
      const res = mockRes();

      await Promise.all(
        userValidators.id.map((validator) => validator(req, res, mockNext))
      );
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(true);
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should fail for invalid id", async () => {
      const req = mockReq({ id: "inv@lid" });
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
    });
  });

  describe("password validator", () => {
    it("should pass for valid password", async () => {
      const req = mockReq({ password: "Valid123!" });
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
    });

    it("should fail for invalid password", async () => {
      const req = mockReq({ password: "short" });
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
