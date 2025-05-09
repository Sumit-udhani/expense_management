const express = require("express");
const router = express.Router();
const budgetController = require('../controller/budget')
const isAuth = require('../middleware/isAuth')
const validator = require('../middleware/validators')
const handleValidation = require('../middleware/validatorHandler')
router.use(isAuth)
router.post('/',validator.budgetValidator,handleValidation,budgetController.setMonthlyBudget)
router.get("/status", budgetController.getMonthlyBudgetStatus);
router.get('/monthly-total', budgetController.getMonthlyTotals);
router.get('/category-distribution', budgetController.getCategoryDistribution);
module.exports = router;