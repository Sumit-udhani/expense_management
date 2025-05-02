const express = require('express');
const router = express.Router();
const tagController = require('../controller/Tag');
const authMiddleware = require('../middleware/isAuth'); // JWT check


router.post('/', authMiddleware, tagController.createTag);
router.get('/',authMiddleware,tagController.getAllTags)
module.exports = router