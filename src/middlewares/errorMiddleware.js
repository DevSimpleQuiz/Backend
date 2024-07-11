const { StatusCodes } = require("http-status-codes");
const createHttpError = require("http-errors");

const errorMiddleware = (err, req, res, next) => {
  if (createHttpError.isHttpError(err)) {
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
