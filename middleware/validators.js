const { body, query } = require("express-validator");
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
  body("password").notEmpty().withMessage("password is required"),
];
exports.forgotPasswordValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
];
exports.resetPasswordValidator = [
  query("token").notEmpty().withMessage("Token is required"),
  body("newPassword")
    .isLength({ min: 5 })
    .withMessage("New password must be long 5 characters"),
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    })
    .withMessage("confirmPassword does not match with newPassword"),
];
