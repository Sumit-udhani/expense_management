const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.hashPassword = (password) => bcrypt.hash(password, 12);
exports.comparePassword = (password, hashed) => bcrypt.compare(password, hashed);

exports.generateToken = (payload, secret, expiresIn = "1h") => {
  return jwt.sign(payload, secret, { expiresIn });
};

exports.verifyToken = (token, secret) => jwt.verify(token, secret);
