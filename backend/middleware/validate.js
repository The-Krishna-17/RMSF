const { z } = require("zod");

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: error.errors[0].message,
        errors: error.errors,
      });
    }
    next(error);
  }
};

module.exports = validate;
