const Sequelize = require("sequelize");
const BCrypt = require("bcrypt");
const DatabaseHandler = require(handlersDir + "Storage/Database/DatabaseHandler");
const CryptoHandler = require(handlersDir + "Crypto/CryptoHandler");

let dataTypes = Sequelize.DataTypes;
let sequelize = DatabaseHandler.GetInstance().GetDatabase("Authentication");

const UserModelStruct = {
	ID: {
		type: dataTypes.INTEGER,
		allowNull: false,
		primaryKey: true,
		autoIncrement: true
	},
	UserID: {
		type: dataTypes.UUID,
		defaultValue: dataTypes.UUIDV4,
		allowNull: false
	},
	Username: {
		type: dataTypes.STRING(255),
		allowNull: false
	},
	EmailAddress: {
		type: dataTypes.STRING(255),
		allowNull: false
	},
	Password: {
		type: dataTypes.STRING(255),
		allowNull: false
	},
	Role: {
		type: dataTypes.STRING(128),
		allowNull: false
	},
	EmailVerified: {
		type: dataTypes.BOOLEAN,
		defaultValue: false,
		allowNull: false
	}
}

const UserModel = sequelize.define("user", UserModelStruct);

module.exports = UserModel;

UserModel.prototype.isPasswordCorrect = function(password)
{
	let user = this;

	return BCrypt.compare(password, user.Password)

}

UserModel.prototype.GetDecodedValue = function(value)
{
	return CryptoHandler.GetInstance().DecryptWithKey(value)
}

module.exports.isEmailUsernameTaken = async (email, username) =>
{
	const userEmailSearch = await UserModel.findOne(
		{
			where: {
				[Sequelize.Op.or]: [{EmailAddress: email}, {Username: username}]
			}
		}
	);

	return !!userEmailSearch;
}