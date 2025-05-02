const express = require('express')
const router = express.Router()
const isAuth = require('../middleware/isAuth')
const categoryController = require('../controller/category')
router.use(isAuth)
router.post('/',categoryController.createCategory)
router.get('/',categoryController.getAll)
router.delete('/:id',categoryController.deleteCategory)
module.exports = router