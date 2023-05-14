const express = require('express');
const router = express.Router();
const AuthController = require(handlersDir + "Authentication/AuthenticationController");
const AuthChecks = require(handlersDir + "Authentication/AuthMiddleware")
const PermissionsHandler = require(handlersDir + "Permissions/PermissionsHandler");
const json = require(handlersDir + "Storage/File/JSONHandler.js");
const jwt = require('jsonwebtoken');

router.get("/", async function (req, res, next)
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
            return res.redirect("/Index")
        }
    }

    return res.render("Auth/Login.ejs")
});

router.get("/Login", async function (req, res, next)
{
    let response = await AuthChecks.IsLoggedIn(req, res, next);

    if(response.Success == true)
    {
        if(response.User.EmailVerified == false)
        {
            return res.redirect("/Auth/VerifyEmail")
        }

        let permissionResponse = await PermissionsHandler.GetInstance().HasPermission(response.User, null, "client.index.view");

        if (permissionResponse.Success == true)
        {
            return res.redirect("/Index")
        }
    }

    return res.render("./Auth/Login.ejs", {SiteKey: json.GetConfig("config.json", "RECAPTCHA_SITE_KEY")})
});

router.get("/Register", function (req, res, next)
{
    return res.render("./Auth/Register.ejs", {SiteKey: json.GetConfig("config.json", "RECAPTCHA_SITE_KEY")})
});

router.get("/Logout",  async function (req, res)
{
    let response = await AuthController.Logout(req, res);

    if(response.Success == true)
    {
        res.clearCookie("Session", {httpOnly: true, secure: true, sameSite: "strict", domain: "." + json.GetConfig("config.json", "BASE_URL")});
    }

    res.status(response.HTTPStatus);
    return res.render("Auth/Logout.ejs")
});

router.get("/ForgotPassword", function (req, res, next)
{
    return res.render("Auth/ForgotPassword.ejs")
});

router.get("/ResetPassword", function (req, res, next)
{
    return res.render("Auth/ResetPassword.ejs")
});

router.get("/SendEmailVerification", async function (req, res, next)
{
    let response = await AuthChecks.IsLoggedIn(req, res, next);

    if(response.Success == true)
    {
        if(response.User.EmailVerified == false)
        {
            return res.render("Auth/SendEmailVerification.ejs")
        }

        let permissionResponse = await PermissionsHandler.GetInstance().HasPermission(response.User, null, "client.index.view");

        if (permissionResponse.Success == true)
        {
            return res.redirect("/Index")
        }
    }

    return res.redirect("/Auth/Login")

});

router.get("/VerifyEmail", function (req, res, next)
{
    return res.render("/Auth/VerifyEmail.ejs")
});

router.post("/login", async (req, res, next) =>
{
    let response = await AuthController.Login(req, res);

    if(response.Success == true)
    {
        return res.status(response.HTTPStatus).cookie("Session", response.Token, {httpOnly: true, secure: true, sameSite: "strict", domain: "." + json.GetConfig("config.json", "BASE_URL")}).redirect("/index");
    }

    return res.status(response.HTTPStatus).render("Auth/Login", {"Error": response.Message, SiteKey: json.GetConfig("config.json", "RECAPTCHA_SITE_KEY")})
});

router.get("/lock", async (req, res, next) =>
{
    let response = await AuthController.Lock(req, res);

    if(response.Success == true)
    {
        res.cookie("Session", response.Token, {httpOnly: true, secure: true, sameSite: "strict", domain: "." + json.GetConfig("config.json", "BASE_URL")});
        res.status(response.HTTPStatus)
        return res.render("/Auth/Lock", {UserID: response.User.UserID});
    }
    else
    {
        return res.redirect("/Auth/Login")
    }
})

router.post("/unlock", async (req, res, next) =>
{
    if(req.cookies.Session == undefined)
    {
        res.clearCookie("Session");
        return res.redirect("/Auth/Login")
    }

    let response = await AuthController.Unlock(req, res);

    if(response.Success == true)
    {
        res.cookie("Session", response.Token, {httpOnly: true, secure: true, sameSite: "strict", domain: "." + json.GetConfig("config.json", "BASE_URL")});
        res.status(response.HTTPStatus)
        return res.redirect("/Index")
    }
    else
    {
        return res.redirect("/Auth/Login")
    }
})

router.post("/register",  async (req, res, next) =>
{
    console.log(req.body);
    let response = await AuthController.Register(req, res);

    if(response.Success == true)
    {
        return res.status(response.HTTPStatus).cookie("Session", response.Token, {httpOnly: true, secure: true, sameSite: "strict", domain: "." + json.GetConfig("config.json", "BASE_URL")}).redirect("/index");
    }

    return res.status(response.HTTPStatus).render("Auth/Register", {"Error": response.Message, SiteKey: json.GetConfig("config.json", "RECAPTCHA_SITE_KEY")})
});

router.get("/refreshtoken", async (req, res, next) =>
{
    let response = await AuthController.RefreshTokens(req, res);

    if(response.Success == true)
    {
        res.cookie("Session", response.Token, {httpOnly: true, secure: true, sameSite: "strict", domain: "." + json.GetConfig("config.json", "BASE_URL")});
    }

    res.status(response.HTTPStatus);
    let body = {"Success": response.Success};
    res.json(body);
});


module.exports = router