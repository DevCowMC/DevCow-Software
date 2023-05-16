const express = require('express');
const router = express.Router();

router.get("/", function (req, res, next)
{
    return res.render("./Index.ejs")
});

router.get("/ServerStatus", function (req, res, next)
{
    return res.render("./ServerStatus.ejs")
});
module.exports = router