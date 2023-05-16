const express = require('express');
const router = express.Router();
const json = require(handlersDir + "Storage/File/JSONHandler.js");
const pclient = require(handlersDir + "Pterodactyl/PClient.js");


router.get("/GetServerStatus", async function (req, res, next)
{
    const allowedServerIDsArray = json.GetConfig("Private/Pterodactyl.json", "ALLOWED_SERVERIDS");

    let serverDisplayData = [];

    for(let i = 0; i < allowedServerIDsArray.length; i++)
    {
        let serverID = allowedServerIDsArray[i];

        let serverData = await pclient.GetServer(serverID);
        let serverResourceData = await pclient.GetServerResourceUsage(serverID);

        let data = {
            ServerName: serverData["attributes"]["name"],
            ServerStatus: FirstToUpper(serverResourceData["attributes"]["current_state"]),
        }

        serverDisplayData.push(data);
    }

    return res.json({ServerData: serverDisplayData});
});

function FirstToUpper(str)
{
    return str[0].toUpperCase() + str.slice(1);
}

module.exports = router