const Sequelize = require("sequelize");
const BCrypt = require("bcrypt");
const DatabaseHandler = require(handlersDir + "Storage/Database/DatabaseHandler");

let dataTypes = Sequelize.DataTypes;

const TokenModelStruct = {
	ID: {
		type: dataTypes.INTEGER,
		allowNull: false,
		primaryKey: true,
		autoIncrement: true
	},
	Token: {
		type: dataTypes.TEXT,
		allowNull: false
	},
	UserID: {
		type: dataTypes.UUID,
		allowNull: false
	},
	Type: {
		type: dataTypes.ENUM("refresh", "verifyEmail", "resetPassword"),
		allowNull: false
	},
	Expires: {
		type: dataTypes.DATE,
		allowNull: false
	},
	Blacklisted: {
		type: dataTypes.BOOLEAN,
		allowNull: false
	}
}

const TokenModel = DatabaseHandler.GetInstance().GetDatabase("Authentication").define("token", TokenModelStruct);

module.exports = TokenModel;