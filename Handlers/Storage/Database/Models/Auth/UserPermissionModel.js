const Sequelize = require("sequelize");
const DatabaseHandler = require(handlersDir + "Storage/Database/DatabaseHandler");

let dataTypes = Sequelize.DataTypes;
let sequelize = DatabaseHandler.GetInstance().GetDatabase("Authentication");

const UserPermissionsModelStruct = {
	ID: {
		type: dataTypes.INTEGER,
		allowNull: false,
		primaryKey: true,
		autoIncrement: true
	},
	UserID: {
		type: dataTypes.UUID,
		allowNull: false
	},
	Node: {
		type: dataTypes.STRING(255),
		allowNull: false
	}
}

const UserPermissionsModel = sequelize.define("userpermissions", UserPermissionsModelStruct);

module.exports = UserPermissionsModel;