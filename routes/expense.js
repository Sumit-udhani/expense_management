const express = require('express')
const router = express.Router()
const isAuth = require('../middleware/isAuth')
const expensecontroller = require('../controller/expense')
const validators = require("../middleware/validators");
const handleValidation = require("../middleware/validatorHandler");
router.use(isAuth)
router.post('/',validators.expenseValidator,handleValidation,expensecontroller.createExpense)
router.get('/:id',expensecontroller.getExpense)
router.put('/:id',validators.expenseValidator,handleValidation,expensecontroller.expenseUpdate)
router.delete('/:id',expensecontroller.expenseDelete)
module.exports = router