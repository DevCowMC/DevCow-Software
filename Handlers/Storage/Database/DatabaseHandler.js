const Sequelize = require('sequelize');
const fs = require("fs");
const json = require(handlersDir + "Storage/File/JSONHandler.js");


class DatabaseHandler
{
	sequelizeInstance = {};
	dbConfig = {};

	constructor()
	{

	}

	async Init()
	{
		for (let i = 0; i < json.GetConfig("MySQL.json", "DATABASE_NAMES").length; i++)
		{
			let dbName = json.GetConfig("MySQL.json", "DATABASE_NAMES")[i]

			this.dbConfig.dialect = json.GetConfig("MySQL.json", "DATABASE_ENGINE");
			this.dbConfig.host = json.GetConfig("MySQL.json", "DATABASE_HOST");
			this.dbConfig.port = json.GetConfig("MySQL.json", "DATABASE_PORT");
			this.dbConfig.logging = false;
			this.dbConfig.pool = {
					max: json.GetConfig("MySQL.json", "DATABASE_POOL_MAX_SIZE"),
						min: json.GetConfig("MySQL.json", "DATABASE_POOL_MIN_SIZE"),
						acquire: json.GetConfig("MySQL.json", "DATABASE_CONNECTION_TIMEOUT"),
						idle: json.GetConfig("MySQL.json", "DATABASE_IDLE_TIMEOUT"),
				}

			if(json.GetConfig("MySQL.json", "DATABASE_USE_SSL") == true)
			{
				let dialectOptions = {
					ssl:
						{
							rejectUnauthorized: false,
							ca: fs.readFileSync(configsDir + "Certificates/Database/" + json.GetConfig("MySQL.json", "DATABASE_SSL_CA_CERT"))
								.toString(),
							key: fs.readFileSync(configsDir + "Certificates/Database/" + json.GetConfig("MySQL.json", "DATABASE_SSL_KEY"))
								.toString(),
							cert: fs.readFileSync(configsDir + "Certificates/Database/" + json.GetConfig("MySQL.json", "DATABASE_SSL_CERT"))
								.toString(),
						}
				}
				this.dbConfig.dialectOptions = dialectOptions;
			}

			this.sequelizeInstance[dbName] = new Sequelize(dbName, json.GetConfig("MySQL.json", "DATABASE_USERNAME"), json.GetConfig("MySQL.json", "DATABASE_PASSWORD"), this.dbConfig)

		}

		await this.TestAllConnections().then((connectionTest) =>
		{
			if (connectionTest.Success == true)
			{
				this.LoadModels()

				for (const [dbName, instance] of Object.entries(this.sequelizeInstance))
				{
					instance.sync({force: false}).then(() =>
						{

						});
				}
			}
			else
			{
				console.log(connectionTest)
				return;
			}
		});
	}

	async TestConnection(instance)
	{
		try
		{
			await instance.authenticate()

			return {Success: true}
		}
		catch (error)
		{
			return {
				Success: false,
				Error: {Code: error.parent.errno, Category: error.parent.code, Message: error.parent.sqlMessage}
			}
		}
	}

	async TestAllConnections()
	{
		let instanceResponse = {}

		for (const [dbName, instance] of Object.entries(this.sequelizeInstance))
		{
			return this.TestConnection(instance)
		}

		for (const response in instanceResponse)
		{
			if (response.success == false)
			{
				return response
			}
		}

		return {success: true}
	}

	GetDatabase(name)
	{
		if (this.sequelizeInstance.hasOwnProperty(name))
		{
			return this.sequelizeInstance[name]
		}

		return undefined;
	}

	GetModel(name)
	{
		switch (name.toLowerCase())
		{
			case "user":
				return this.UserModel;
			case "token":
				return this.TokenModel;
			case "permissionnodes":
				return this.PermissionNodesModel;
			case "userpermissions":
				return this.UserPermissionModel;
		}
	}

	LoadModels()
	{
		this.UserModel = require("./Models/Auth/UserModel");
		this.TokenModel = require("./Models/Auth/TokenModel");
		this.PermissionNodesModel = require("./Models/Auth/PermissionNodesModel");
		this.UserPermissionModel = require("./Models/Auth/UserPermissionModel");
	}

	static GetInstance()
	{
		if (!this.instance)
		{
			this.instance = new DatabaseHandler();
		}

		return this.instance;
	}
}

module.exports = DatabaseHandler;