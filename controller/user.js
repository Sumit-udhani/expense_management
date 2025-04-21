const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const User = require('../model/user')
require('dotenv').config()
exports.signup = async (req, res, next) => {
    try {
      const { name, email, password, adminCode } = req.body;
      let role = 'User'; 
  
     
      if (adminCode && adminCode === process.env.ADMIN_SECRET) {
        role = 'Admin'; 
      }
  
     
      const hashPw = await bcrypt.hash(password, 12);
  
 
      const user = await User.create({
        name,
        email,
        password: hashPw,
        role
      });
  
      
      res.status(201).json({
        message: 'User created',
        id: user.id,
        email: user.email,
        role: user.role
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
exports.login = async (req,res,next) =>{

    const {email,password} = req.body;
    const user = await User.findOne({where: {email}})
    if (!user) return res.status(401).json({ message: 'User not found' });
    const isMatch = await bcrypt.compare(password,user.password)
    if (!isMatch) return res.status(401).json({ message: 'Wrong Password' });
    const token = jwt.sign({
        userId: user.id,
        email:user.email
    },'somesecretsuperKey',{expiresIn:'1h'})
    res.status(200).json({ token, userId: user.id });
}