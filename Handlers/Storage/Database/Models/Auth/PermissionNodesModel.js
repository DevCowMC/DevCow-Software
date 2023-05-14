const Sequelize = require("sequelize");
const DatabaseHandler = require(handlersDir + "Storage/Database/DatabaseHandler");

let dataTypes = Sequelize.DataTypes;
let sequelize = DatabaseHandler.GetInstance().GetDatabase("Authentication");

const PermissionNodesModelStruct = {
	ID: {
		type: dataTypes.INTEGER,
		allowNull: false,
		primaryKey: true,
		autoIncrement: true
	},
	Role: {
		type: dataTypes.STRING(255),
		allowNull: false
	},
	Node: {
		type: dataTypes.STRING(255),
		allowNull: false
	}
}

const PermissionNodesModel = sequelize.define("permissionnodes", PermissionNodesModelStruct);

module.exports = PermissionNodesModel;