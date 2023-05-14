const express = require('express');
const router = express.Router();

const AuthChecks = require(handlersDir + "Authentication/AuthMiddleware")
const PermissionsHandler = require(handlersDir + "Permissions/PermissionsHandler");
const ptc = require(handlersDir + "Pterodactyl/PClient");

router.get("/", async (req, res, next)=>
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
            ptc.GetServers();
            return res.render("Servers.ejs")
        }

    }
    return res.redirect("/Auth/Login");

});

module.exports = router