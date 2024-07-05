// src/middleware/errorMiddleware.js
const { StatusCodes } = require("http-status-codes");
const createError = require("http-errors");

const errorMiddleware = (err, req, res, next) => {
  if (createError.isHttpError(err)) {
    res
      .status(err.status || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: err.message });
  } else {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

module.exports = errorMiddleware;
