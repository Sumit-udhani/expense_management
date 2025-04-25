
const { User, Roles } = require("../model");
const { use } = require("../routes/category");
const { hashPassword, comparePassword, generateToken, verifyToken } = require("../utils/auth");
const { generateOtp } = require("../utils/otp");
const { sendVerificationEmail } = require("../utils/email");
require('dotenv').config()
exports.signup = async (req, res) => {
  try {
    const { name, email, password, roleId } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already exists' });

    const hashed = await hashPassword(password);
    const { otp, expiresAt } = generateOtp();

    const roleIds = await User.findOne({where :{roleId}})
    if (!roleIds) {
      res.status(400).json({error:'roleId not found'})
    }
    const user = await User.create({
      name,
      email,
      password: hashed,
      roleId: roleId || 1,
      otp,
      otpExpiresAt: expiresAt,
      isActive: false,
    });

    const token = generateToken({ userId: user.id, email }, process.env.JWT_EMAIL_SECRET_KEY );
    await sendVerificationEmail(email, otp, token);

    const role = await Roles.findByPk(user.roleId);
    
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
      return res.status(400).json({ error: 'Invalid verification link' });
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
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { otp } = req.query;

    if (!otp) {
      return res.status(400).json({ error: 'OTP is required' });
    }

    const user = await User.findOne({ where: { otp } });

    if (!user) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ error: 'OTP has expired' });
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
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }
    const isMatch = await comparePassword(password,user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" });
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
exports.forgotPassword = async (req,res,next) =>{
 try {
   const {email} = req.body
   const user = await User.findOne({where: {email}})
 } catch (error) {
  
 }
}
