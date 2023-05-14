const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const json = require(handlersDir + "Storage/File/JSONHandler.js");
const fs = require("fs");

class CryptoHandler
{
	constructor()
	{
		this.key = json.GetConfig("config.json", "APP_KEY").replaceAll('-', '');
		this.iv = this.ReverseString(this.key)
			.toString("hex")
			.slice(0, 16);
	}

	Init()
	{
		if (!fs.existsSync(configsDir + "Certificates/JWT/"))
		{
			fs.mkdirSync(configsDir + "Certificates/JWT");

			let keys = this.GenerateJWTKeys();

			fs.writeFileSync(configsDir + "Certificates/JWT/" + json.GetConfig("config.json", "JWT_PUBLIC_KEY"), keys.publicKey, {encoding: "utf8"})
			fs.writeFileSync(configsDir + "Certificates/JWT/" + json.GetConfig("config.json", "JWT_PRIVATE_KEY"), keys.privateKey, {encoding: "utf8"})

		}
	}

	EncryptWithKey(data)
	{
		if(data == "" || data == undefined) return data;

		let encrypter = crypto.createCipheriv("aes-256-cbc", this.key, this.iv);
		let encryptedMsg = encrypter.update(data, "utf8", "base64");

		encryptedMsg += encrypter.final("base64");

		return encryptedMsg;
	}

	DecryptWithKey(data)
	{
		let decrypter = crypto.createDecipheriv("aes-256-cbc", this.key, this.iv);
		let decryptedMsg = decrypter.update(data, "base64", "utf8");

		decryptedMsg += decrypter.final("utf8");

		return decryptedMsg;
	}

	EncryptWithCert(data)
	{

	}

	DecryptWithCert(data)
	{

	}

	SignJWT(payload)
	{
		let privateKey = fs.readFileSync(configsDir + "Certificates/JWT/" + json.GetConfig("config.json", "JWT_PRIVATE_KEY"), 'utf8')

		let token = jwt.sign(payload, privateKey, {algorithm: 'RS256'})

		return token;
	}

	VerifyJWT(token)
	{
		let publicKey = fs.readFileSync(configsDir + "Certificates/JWT/" + json.GetConfig("config.json", "JWT_PUBLIC_KEY"), 'utf8');

		try
		{
			let payload = jwt.verify(token, publicKey, {})

			return payload;
		}
		catch (error)
		{

		}
	}

	GenerateJWTKeys()
	{
		let AppKey = json.GetConfig("config.json", "JWT_PUBLIC_KEY")

		let keys = crypto.generateKeyPairSync("rsa", {
			modulusLength: 4096,
			publicKeyEncoding: {
				format: "pem",
				type: "pkcs1"
			},
			privateKeyEncoding: {
				type: "pkcs1",
				format: "pem"
			}
		})

		return keys;
	}

	ReverseString(str)
	{
		return str.split("")
			.reverse()
			.join("");
	}

	static GetInstance()
	{
		return new CryptoHandler();
	}
}

module.exports = CryptoHandler;