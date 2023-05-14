const express = require('express');
const router = express.Router();

router.use('/', require("./Index"))
router.use('/Index', require("./Index"))
router.use('/Auth', require("./Auth.js"))
router.use('/Servers', require("./Servers.js"))

module.exports = router