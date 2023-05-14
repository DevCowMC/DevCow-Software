const fs = require('fs');

module.exports.GetConfig = (path, key) =>
{
    let jsonData = this.GetJSON(path)
    return jsonData[key.toUpperCase()];
}

module.exports.GetJSON = (path) =>
{
    let jsonData = JSON.parse(fs.readFileSync(configsDir + path));
    return jsonData;
}

module.exports.EditConfig = (path, key, value) =>
{
    let jsonData = this.GetJSON(path)
    jsonData[key.toUpperCase()] = value;

    try
    {
        fs.writeFileSync(configsDir + path, JSON.stringify(jsonData, null, 4));
    }
    catch(err)
    {
        console.error(err);
    }
}