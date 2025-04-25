const { body } = require("express-validator");
exports.signupvalidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 5 })
    .withMessage("Password must be 5 characters long"),
  body("roleId").optional().isInt().withMessage("roleId must be number"),
];
exports.loginValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .notEmpty()
    .withMessage("password is required")
    
];
