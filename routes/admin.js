const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin');
const isAuth = require('../middleware/isAuth')
const authorizeRole = require('../middleware/authorizeRole');
const isAdmin = require('../middleware/isAdmin')
router.get('/users', isAuth, authorizeRole('Admin'), adminController.getAllUsers);
router.get('/expenses',isAuth,isAdmin,adminController.getAllExpense)
router.get("/users/:id/expenses",isAuth,isAdmin ,adminController.getExpensesByUserId);
router.get('/users/:id', isAuth,isAdmin, adminController.getUserById);

router.patch('/users/:id/status',isAuth,authorizeRole('Admin'),adminController.updateUserStatus)
module.exports = router;
