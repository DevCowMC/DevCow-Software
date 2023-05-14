const express = require('express');
const router = express.Router();

router.use('/', require("./Index"))

module.exports = router