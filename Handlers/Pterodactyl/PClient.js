const axios = require("axios")
const json = require(handlersDir + "Storage/File/JSONHandler.js");

const pteroc = "Private/Pterodactyl.json";

const baseURL = json.GetConfig(pteroc, "BASE_URL");
const clientAPIKey = json.GetConfig(pteroc, "CLIENT_KEY");

async function GetServer()
{
    let clientHeader =
        {
            'Accept': 'application/json',
            'content=type': 'application/json',
            'Authrization': 'Bearer ' + clientAPIKey
        };
    let clientConfig =
        {
            headers: clientHeader
        };

    let data = await axios.get(baseURL + "/client/servers/" + serverID, clientConfig);

    return data.data;
}

module.exports = {
    GetServer,
    GetServerResourceUsage
};
