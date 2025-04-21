const express = require('express')
const router = express.Router()
const authController = require('../controller/user')
const isAuth = require('../middleware/isAuth')
const isAdmin = require('../middleware/isAdmin')
const User = require('../model/user')
router.post('/signup',authController.signup)
router.post('/login',authController.login)
router.get('/admin/users', isAuth, isAdmin, async (req, res) => {
    const users = await User.findAll();
    res.json({ users });
  });
  
 
  router.get('/me/expenses', isAuth, async (req, res) => {
    const userId = req.userId;
  res.json({ message: 'Your expenses will be here.', userId });
  });
module.exports = router