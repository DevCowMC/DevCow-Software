const axios = require("axios")
const json = require(handlersDir + "Storage/File/JSONHandler.js");

const pteroc = "Private/Pterodactyl.json";

function ptero(key)
{
    return json.GetConfig(pteroc, key);
}

let baseURL = ptero("BASE_URL");
let apiKey = ptero("API_KEY");
let clientAPIKey = ptero("CLIENT_KEY");
let allowedServerIDS = ptero("ALLOWED_SERVERIDS");

async function GetServers()
{

    let applicationHeader =
        {
        'Accept': 'application/json',
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
    };

    let applicationConfig =
        {
        headers: applicationHeader
    };

    let data = await axios.get(baseURL + "/application/servers/", applicationConfig);

    let serverArray = data.data.data;
    console.log(serverArray)
}

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

    for (let i = 0; i < allowedServerIDS.length; i++)
    {
        let data = await axios.get(baseURL + "/client/servers" + allowedServerIDS[i], clientConfig);
        let usageData = await axios.get(baseurl + "/client/servers/" + allowedServerIDs[i] + "/resources", clientConfig);

        let usage = usageData.data;
        console.log(usage["attributes"]["current_state"]);
        console.log(data.data.attributes.name);
    };
}

module.exports =
    {
    GetServers,
    GetServer
};
