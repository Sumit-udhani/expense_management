const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sumitudhani9@gmail.com',
    pass: 'xjld olsc lbcn dzka',
  },
});

exports.sendVerificationEmail = (email, otp, token) => {
  const verificationUrl = `http://localhost:8085/auth/verify-email?token=${token}`;
  return transporter.sendMail({
    to: email,
    subject: 'Verify your Email and OTP',
    html: `
      <h2>Email Verification</h2>
      <p>You can verify your email in two ways:</p>
      <ul>
        <li><strong>Option 1:</strong> Click <a href="${verificationUrl}">this link</a>.</li>
        <li><strong>Option 2:</strong> Use this OTP code: <strong>${otp}</strong></li>
      </ul>
      <p>This OTP will expire in 10 minutes.</p>
    `
  });
};
