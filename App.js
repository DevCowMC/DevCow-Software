const express = require('express');
const vhost = require('vhost');
const json = require("./Handlers/Storage/File/JSONHandler.js");
const crypto = require("crypto");

global.baseDir = __dirname;
global.configsDir = baseDir + "/Configs/";
global.handlersDir = baseDir + "/Handlers/";
global.templatesDir = baseDir + "/Templates/";
global.publicDir = baseDir + "/Public/";
global.serviceDir = baseDir + '/Services/';
global.validationDir = handlersDir + "Validation/";
/**
 * Discord Bot Values
 */

global.discordbotDir = baseDir + "/Bot/";
global.configsDir = discordbotDir + "/Configs/";

const appFactory = require('./Bin/AppFactory');


if(json.GetConfig("config.json", "APP_KEY") == "" || json.GetConfig("config.json", "APP_KEY") == undefined)
{
	let uuid = crypto.randomUUID();

	json.EditConfig("config.json", "APP_KEY", uuid);
}

const Handlers = require("./Handlers/Handlers.js");
Handlers.GetInstance();

const mainApp = express();
const staffApp = express();
const apiApp = express();
const clientApp = express();
const licenseApp = express();

mainApp.use(express.static("/Public/Main/"));

mainApp.use(vhost(json.GetConfig("config.json", "STAFF_URL_PREFIX") + "." + json.GetConfig("config.json", "BASE_URL"), staffApp));
mainApp.use(vhost(json.GetConfig("config.json", "CLIENT_URL_PREFIX") + "." + json.GetConfig("config.json", "BASE_URL"), clientApp));
mainApp.use(vhost(json.GetConfig("config.json", "LICENSE_URL_PREFIX") + "." + json.GetConfig("config.json", "BASE_URL"), licenseApp));
mainApp.use(vhost( "api." + json.GetConfig("config.json", "BASE_URL"), apiApp));

global.siteName = "Dev Cow Test";

appFactory.SetupStaff(staffApp);
appFactory.SetupClient(clientApp);
appFactory.SetupLicense(licenseApp);
appFactory.SetupAPI(apiApp);
appFactory.SetupMain(mainApp);

module.exports = mainApp;




