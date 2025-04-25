const express = require('express')
const router = express.Router()
const authController = require('../controller/user')
const isAuth = require('../middleware/isAuth')

const User = require('../model/user')
router.post('/signup',authController.signup)
router.post('/login',authController.login)
router.get('/verify-email',authController.verifyEmail )
router.get('/verify-email-otp', authController.verifyOtp); 
 
 
module.exports = router