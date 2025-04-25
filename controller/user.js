const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer')
const { User, Roles } = require("../model");
const { use } = require("../routes/category");


exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, roleId } = req.body;
    const IsEmailExist = await User.findOne({where:{email}})
    if (IsEmailExist) {
      res.status(400).json({message:'Email already exists'})
    }

    let finalRoleId = roleId;

    if (!finalRoleId) {
    
      const defaultRole = await Roles.findOne({ where: { name: "User" } });
      if (!defaultRole) {
        return res.status(500).json({ message: 'Default role "USER" not found' });
      }
      finalRoleId = defaultRole.id;
    }

    const hashPw = await bcrypt.hash(password, 12);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const user = await User.create({
      name,
      email,
      password: hashPw,
      roleId: finalRoleId,
      otp,
      otpExpiresAt,
      isActive: false,
    });
    const token = jwt.sign({
      userId: user.id,
      email: user.email
    },'emailSecretKey')
    const transport = nodemailer.createTransport({
      service:'gmail',
      auth:{
        user:'sumitudhani9@gmail.com',
        pass:'xjld olsc lbcn dzka'
      }
    })
    const verificationUrl = `http://localhost:8085/auth/verify-email?token=${token}`;
    await transport.sendMail({
      to:email,
      subject:'Verify your Email and Otp',
      html:`   <h2>Email Verification</h2>
      <p>You can verify your email in two ways:</p>
      <ul>
        <li><strong>Option 1:</strong> Click <a href="${verificationUrl}">this link</a>.</li>
        <li><strong>Option 2:</strong> Use this OTP code: <strong>${otp}</strong></li>
      </ul>
      <p>This OTP will expire in 10 minutes.</p>`
    })
    const role = await Roles.findByPk(finalRoleId);
    res.status(201).json({
      message: "User created, verification email sent",
      userId: user.id,
      email: user.email,
      role: role?.name || "Unknown",
    });

   
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const decoded = jwt.verify(token, 'emailSecretKey');
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
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.Role.name, 
      },
      "somesecretsuperKey",
      { expiresIn: "1h" }
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
