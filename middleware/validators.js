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
exports.expenseValidator = [
  body("title").notEmpty().withMessage("Title is require"),
  body("amount")
  .isFloat({ gt: 0 })
  .withMessage("Amount must be a positive number"),
body("date")
  .isISO8601()
  .toDate()
  .withMessage("Date must be a valid ISO8601 date"),
body("notes").optional().isString().withMessage("Notes must be a string"),

]
exports.budgetValidator = [
  body("amount")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a positive number"),
  body("month")
    .isInt({ min: 1, max: 12 })
    .withMessage("Month must be an integer between 1 and 12"),
  body("year")
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Year must be a valid integer between 2000 and 2100"),
    body("categoryId")
    .optional({ nullable: true }) // allow null or undefined
    .custom((value) => {
      if (value === null || value === undefined) return true; // allow overall budget
      if (!Number.isInteger(Number(value))) {
        throw new Error("Category ID must be an integer or null");
      }
      return true;
    }), // or .isInt() if you're using numeric IDs
];
exports.userProfileValidator = [
  body("mobileNo")
  .isLength({ min: 10, max: 10 })
  .withMessage("Mobile number must be exactly 10 digits")
  .isNumeric()
  .withMessage("Mobile number must be numeric")

]
