const express = require("express");
const router = express.Router();
const authController = require("../controller/user");
const isAuth = require("../middleware/isAuth");
const validators = require("../middleware/validators");
const handleValidation = require("../middleware/validatorHandler");
const User = require("../model/user");
const upload = require('../middleware/file')
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
router.get("/me", isAuth, authController.getUserProfile);
router.post(
  "/forgot-password",
  validators.forgotPasswordValidator,
  handleValidation,
  authController.forgotPassword
);
router.post(
  "/upload-profile-image",
  isAuth,
  upload.single("image"),
  authController.uploadProfileImage
);
router.post(
  "/reset-password",
  validators.resetPasswordValidator,
  handleValidation,
  authController.resetPassword
);
router.put('/update-profile',isAuth,validators.userProfileValidator,handleValidation,authController.updateUserProfile)
module.exports = router;
