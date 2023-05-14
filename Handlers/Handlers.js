const DatabaseHandler = require(handlersDir + "Storage/Database/DatabaseHandler");
const EmailHandler = require(handlersDir + "Email/EmailHandler");
const CryptoHandler = require(handlersDir + "Crypto/CryptoHandler");
const PermissionsHandler = require(handlersDir + "Permissions/PermissionsHandler");


class Handlers
{
	constructor()
	{
		this.databaseHandler = DatabaseHandler.GetInstance();
		this.emailHandler = EmailHandler.GetInstance();
		this.cryptoHandler = new CryptoHandler();
		this.permissionsHandler = PermissionsHandler.GetInstance();

		this.Init();
		console.log("handlers loaded")
	}

	async Init()
	{
		await this.GetDatabaseHandler().Init();
		await this.GetEmailHandler().Init();
		this.GetCryptoHandler().Init();
		//Marked this out to Create Tables
		await this.GetPermissionsHandler().Init();
	}

	GetDatabaseHandler()
	{
		return this.databaseHandler;
	}

	GetEmailHandler()
	{
		return this.emailHandler;
	}

	GetCryptoHandler()
	{
		return this.cryptoHandler;
	}


	GetPermissionsHandler()
	{
		return this.permissionsHandler;
	}

	static GetInstance()
	{
		if (!this.instance)
		{
			this.instance = new Handlers();
		}

		return this.instance;
	}
}

module.exports = Handlers