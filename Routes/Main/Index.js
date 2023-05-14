const express = require('express');
const router = express.Router();

router.get("/", function (req, res, next)
{
    return res.render("./Index.ejs")
});

module.exports = router