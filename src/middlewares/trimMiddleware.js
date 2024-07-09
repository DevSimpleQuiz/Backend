const trimMiddleware = (req, res, next) => {
  Object.keys(req.body).map((key) => {
    if (typeof req.body[key] === "string") {
      req.body[key] = req.body[key].trim();
    }
  });
  next();
};

module.exports = trimMiddleware;
