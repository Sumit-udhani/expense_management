const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { User, Roles } = require("../model");
require("dotenv").config();

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, roleId } = req.body;

    let finalRoleId = roleId;

    if (!finalRoleId) {
    
      const defaultRole = await Roles.findOne({ where: { name: "USER" } });
      if (!defaultRole) {
        return res.status(500).json({ message: 'Default role "USER" not found' });
      }
      finalRoleId = defaultRole.id;
    }

    const hashPw = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashPw,
      roleId: finalRoleId,
    });

    // Fetch role name for response
    const role = await Roles.findByPk(finalRoleId);

    res.status(201).json({
      message: "User created",
      id: user.id,
      email: user.email,
      role: role?.name || "Unknown",
    });
  } catch (error) {
    console.log(error);
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
      process.env.JWT_SECRET || "somesecretsuperKey",
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
