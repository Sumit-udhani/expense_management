const express = require("express");
const router = express.Router();
const authController = require("../controller/user");
const isAuth = require("../middleware/isAuth");
const validators = require("../middleware/validators");
const handleValidation = require("../middleware/validatorHandler");
const User = require("../model/user");

router.post(
  "/signup",
  validators.signupvalidator,
  handleValidation,
  authController.signup
);
router.post(
  "/login",
  validators.loginValidator,
  handleValidation,
  authController.login
);
router.get("/verify-email", authController.verifyEmail);
router.get("/verify-email-otp", authController.verifyOtp);
router.post(
  "/forgot-password",
  validators.forgotPasswordValidator,
  handleValidation,
  authController.forgotPassword
);
router.post(
  "/reset-password",
  validators.resetPasswordValidator,
  handleValidation,
  authController.resetPassword
);

module.exports = router;
