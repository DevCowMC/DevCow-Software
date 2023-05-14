const express = require('express');
const router = express.Router();

const AuthChecks = require(handlersDir + "Authentication/AuthMiddleware")
const PermissionsHandler = require(handlersDir + "Permissions/PermissionsHandler");
const CryptoHandler = require(handlersDir + "Crypto/CryptoHandler");
const Sequelize = require("sequelize");

router.get("/", function (req, res, next)
{
    return res.redirect("/index")
});

router.get("/index", async (req, res, next)=>
{
    let response = await AuthChecks.IsLoggedIn(req, res);

    if(response.Success == true)
    {
        if(response.User.EmailVerified == false)
        {
            return res.redirect("/Auth/VerifyEmail")
        }

        let permissionResponse = await PermissionsHandler.GetInstance().HasPermission(response.User, null, "client.index.view");

        if (permissionResponse.Success == true)
        {
            let username = CryptoHandler.GetInstance().DecryptWithKey(response.User.Username)

            return res.render("Index.ejs", {Username: username})
        }
    }

    return res.redirect("/Auth/Login");

});

module.exports = router