export const sanitizeInputs = (req, res, next) => {
  for (let prop in req.body) {
    if (typeof req.body[prop] === "string") {
      req.body[prop] = req.body[prop].replace(/[<>]/g, "");
    }
  }
  next();
};
