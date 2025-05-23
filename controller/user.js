const { User, Roles, UserProfile } = require("../model");
const { use } = require("../routes/category");
const {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
} = require("../utils/auth");
const { generateOtp } = require("../utils/otp");
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require("../utils/email");
require("dotenv").config();
const { Op } = require("sequelize");
exports.signup = async (req, res) => {
  try {
    const { name, email, password, roleId } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(409).json({ message: "Email already exists" });

    const hashed = await hashPassword(password);
    const { otp, expiresAt } = generateOtp();

    const finalRoleId = roleId || 1;

    const role = await Roles.findByPk(finalRoleId);
    if (!role) {
      return res.status(400).json({ error: "Role not found" });
    }

    const user = await User.create({
      name,
      email,
      password: hashed,
      roleId: finalRoleId,
      otp,
      otpExpiresAt: expiresAt,
      isActive: false,
    });

    const token = generateToken(
      { userId: user.id, email },
      process.env.JWT_EMAIL_SECRET_KEY
    );
    await sendVerificationEmail(email, otp, token);

    res.status(201).json({
      message: "User created, verification email sent",
      userId: user.id,
      email,
      role: role?.name || "Unknown",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const decoded = verifyToken(token, process.env.JWT_EMAIL_SECRET_KEY);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(400).json({ error: "Invalid verification link" });
    }

    if (user.IsEmailVerifed) {
      return res.status(200).json({ message: "Email is already verified" });
    }

    user.IsEmailVerifed = true;
    user.isActive = true;
    user.otp = null;
    user.otpExpiresAt = null;

    await user.save();

    res.status(200).json({ message: "Email verified successfully via link" });
  } catch (error) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { otp } = req.query;

    if (!otp) {
      return res.status(400).json({ error: "OTP is required" });
    }

    const user = await User.findOne({ where: { otp } });

    if (!user) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    user.IsEmailVerifed = true;
    user.isActive = true;
    user.otp = null;
    user.otpExpiresAt = null;

    await user.save();

    res.status(200).json({ message: "Email verified successfully using OTP" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: { model: Roles, attributes: ["name"] },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (!user.IsEmailVerifed) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in." });
    }
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "User account is inactive." });
    }
    
    const token = generateToken(
      { userId: user.id, email: user.email, role: user.Role.name },
      process.env.JWT_LOGIN_SECRET_KEY
    );
    res.status(200).json({
      message: "Login successful",
      token,
      userId: user.id,
      email: user.email,
      role: user.Role.name,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found with this email" });
    }
    const resetToken = generateToken(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_RESET_PASS_KEY,
      "15m"
    );
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    const resetlink = `http://localhost:5173/reset-password?token=${resetToken}`;
    await sendResetPasswordEmail(email, resetlink);
    res.status(200).json({ message: "password reset email sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.query;
    const { newPassword, confirmPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token and new password are required" });
    }
    const decoded = verifyToken(token, process.env.JWT_RESET_PASS_KEY);
    const user = await User.findOne({
      where: {
        id: decoded.userId,
        resetToken: token,
        resetTokenExpiry: {
          [Op.gt]: new Date(),
        },
      },
    });
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired Token" });
    }
    const hashPw = await hashPassword(newPassword);
    user.password = hashPw;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserProfile =  async(req,res,next) =>{
  try {
    
    const userId = req.query.id || req.userId;

    
    const user = await User.findByPk(userId,{
      include: {
        model: UserProfile,
        attributes: [ 'mobileNo']
      },
      attributes: ['name','email', 'image']
    })
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user)
  } catch (error) {
    console.log(error)
    res.status(500).json({error:error.message})
  }
}
exports.uploadProfileImage = async(req,res,next) =>{
  try {
    
    const userId = req.userId;
    if (!req.file) {
      return res.status(400).json({error:'No image uploaded'})
    }
    const imagePath = req.file.filename;
    const user = await User.findByPk(userId)
    if (!user) return res.status(404).json({ error: "User not found" });
    user.image = imagePath;
    await user.save();
    res.status(200).json({
      message: "Profile image uploaded successfully",
      image: imagePath,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({error:error.message})
  }
}
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, mobileNo } = req.body;

    let profile = await UserProfile.findOne({ where: { userId } });

    if (profile) {
     
      profile.name = name || profile.name;
      profile.mobileNo = mobileNo || profile.mobileNo;
      await profile.save();
    } else {
      
      profile = await UserProfile.create({
        userId,
        name,
        mobileNo,
      });
    }

    res.status(200).json({ message: "Profile saved successfully", profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

