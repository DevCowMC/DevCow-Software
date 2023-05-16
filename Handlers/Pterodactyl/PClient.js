const axios = require("axios")
const json = require(handlersDir + "Storage/File/JSONHandler.js");

const pteroc = "Private/Pterodactyl.json";

const baseURL = json.GetConfig(pteroc, "BASE_URL");
const clientAPIKey = json.GetConfig(pteroc, "CLIENT_KEY");

async function GetServer(serverID)
{
    let clientHeader = {
        'Accept': 'application/json',
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + clientAPIKey
    };

    let clientConfig = {
        headers: clientHeader
    };

    let data = await axios.get(baseURL + "/client/servers/" + serverID, clientConfig);

    return data.data;
}

async function GetServerResourceUsage(serverID)
{
    let clientHeader =
        {
            'Accept': 'application/json',
            'content-type': 'application/json',
            'Authorization': 'Bearer ' + clientAPIKey
        };
    let clientConfig =
        {
            headers: clientHeader
        };

    let usageData = await axios.get(baseURL + "/client/servers/" + serverID + "/resources", clientConfig);

    return usageData.data;
}

module.exports = {
    GetServer,
    GetServerResourceUsage
};
