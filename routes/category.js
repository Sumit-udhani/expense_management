const express = require('express')
const router = express.Router()
const isAuth = require('../middleware/isAuth')
const categoryController = require('../controller/category')
router.use(isAuth)
router.post('/',categoryController.createCategory)
router.delete('/:id',categoryController.deleteCategory)
module.exports = router