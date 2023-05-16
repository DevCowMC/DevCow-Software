const express = require('express');
const router = express.Router();

router.use("/v1", require("./Version1.js"))

module.exports = router