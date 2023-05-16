const express = require('express');
const router = express.Router();

router.use("/ptero", require("./Pterodactyl"));
module.exports = router