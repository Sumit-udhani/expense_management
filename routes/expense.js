const express = require('express')
const router = express.Router()
const isAuth = require('../middleware/isAuth')
const expensecontroller = require('../controller/expense')
const validators = require("../middleware/validators");
const handleValidation = require("../middleware/validatorHandler");
const upload = require('../middleware/file')
router.use(isAuth)
router.post('/',upload.single('attachment'),validators.expenseValidator,handleValidation,expensecontroller.createExpense)
router.get('/',expensecontroller.getAllExpensesForUser)
router.put('/:id',upload.single('attachment'),validators.expenseValidator,handleValidation,expensecontroller.expenseUpdate)
router.delete('/:id',expensecontroller.expenseDelete)
module.exports = router