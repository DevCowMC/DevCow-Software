const logger = require("morgan");
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const createError = require("http-errors");

const json = require("../Handlers/Storage/File/JSONHandler.js")

const apiRoute = require("../Routes/API/Main.js");
const staffRoute = require("../Routes/Staff/Main.js");
const clientRoute = require("../Routes/Client/Main.js");
const mainRoute = require("../Routes/Main/Main.js");


let SetupAPI = (apiApp) =>
{
    apiApp.use(logger('dev'));
    apiApp.use(cors());
    apiApp.use(express.json());
    apiApp.use(express.urlencoded({ extended: true }));
    apiApp.use(apiRoute)
    apiApp.use(function(req, res, next)
    {
        next(createError(404));
    });

    apiApp.use(function(err, req, res, next)
    {
        res.locals.message = err.message;
        res.locals.error =  err;

        res.status(err.status || 500);
        res.render('Error.ejs');
    });
}

let SetupStaff = (staffApp) =>
{
    let staffViewsArray = [templatesDir + json.GetConfig("config.json", "APP_THEME") + "/Staff"]

    staffApp.set('views', staffViewsArray);
    staffApp.set('view engine', 'ejs');
    staffApp.use(logger('dev'));
    staffApp.use(cors());
    staffApp.use(express.json());
    staffApp.use(express.urlencoded({ extended: true }));
    staffApp.use(cookieParser());
    staffApp.use(express.static(publicDir + "Staff/"));
    staffApp.use(express.static(publicDir + "All/"));
    staffApp.use(staffRoute)
    staffApp.use(function(req, res, next)
    {
        next(createError(404));
    });

    staffApp.use(function(err, req, res, next)
    {
        res.locals.message = err.message;
        res.locals.error =  err;

        res.status(err.status || 500);
        res.render('Error.ejs');
    });
}

let SetupClient = (clientApp) =>
{
    let clientViewsArray = [templatesDir + json.GetConfig("config.json", "APP_THEME") + "/Client"]

    clientApp.set('views', clientViewsArray);
    clientApp.set('view engine', 'ejs');
    clientApp.use(logger('dev'));
    clientApp.use(cors());
    clientApp.use(express.json());
    clientApp.use(express.urlencoded({ extended: true }));
    clientApp.use(cookieParser());
    clientApp.use(express.static(publicDir + "Client/"));
    clientApp.use(express.static(publicDir + "All/"));
    clientApp.use(clientRoute)

    clientApp.use(function(req, res, next)
    {
        next(createError(404));
    });

    clientApp.use(function(err, req, res, next)
    {
        res.locals.message = err.Message;
        res.locals.error =  err;

        res.status(err.status || 500);
        res.render('Error.ejs');
    });
}

let SetupMain = (mainApp) =>
{
    let mainViewsArray = [templatesDir + json.GetConfig("config.json", "APP_THEME") + "/Main"]

    mainApp.set('views', mainViewsArray);
    mainApp.set('view engine', 'ejs');
    mainApp.use(logger('dev'));
    mainApp.use(cors());
    mainApp.use(express.json());
    mainApp.use(express.urlencoded({ extended: true }));
    mainApp.use(cookieParser());
    mainApp.use(express.static(publicDir + "Main/"));
    mainApp.use(express.static(publicDir + "All/"));
    mainApp.use(mainRoute)

    mainApp.use(function(req, res, next)
    {
        next(createError(404));
    });

    mainApp.use(function(err, req, res, next)
    {
        res.locals.message = err.message;
        res.locals.error =  JSON.stringify(err);

        res.status(err.status || 500);
        res.render('Error.ejs');
    });
}

module.exports =
    {
        SetupMain,
        SetupAPI,
        SetupStaff,
        SetupClient
    }
