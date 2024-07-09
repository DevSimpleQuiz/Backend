const { validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");

const validationMiddleware = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessage = errors.array()[0].msg;
    return res.status(StatusCodes.BAD_REQUEST).json({ message: errorMessage });
  }
  next();
};

module.exports = validationMiddleware;
