const express = require('express');
const router = express.Router();

router.use('/', require("./Index"))
router.use('/Index', require("./Index"))

module.exports = router