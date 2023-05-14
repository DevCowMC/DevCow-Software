const BCrypt = require("bcrypt");
const DatabaseHandler = require(handlersDir + "Storage/Database/DatabaseHandler");
const httpStatus = require("http-status");
const UserService = require(serviceDir + "UserService");
const CryptoHandler = require(handlersDir + "Crypto/CryptoHandler");

const CreateUser = async (req) =>
{
	let username = CryptoHandler.GetInstance().EncryptWithKey(req.body.Username)
	let email = CryptoHandler.GetInstance().EncryptWithKey(req.body.EmailAddress)

	if(await DatabaseHandler.GetInstance().GetModel("user").isEmailUsernameTaken(email, username))
	{
		return {Success: false, Message: "Username or Email Is Already In Use", User: null, HTTPStatus: httpStatus.BAD_REQUEST}
	}

	let userData = {
		Username: username,
		EmailAddress: email,
		Password: await BCrypt.hash(req.body.Password, 10),
		Role: "user"
	}

	let UserModel = DatabaseHandler.GetInstance().GetModel("user");

	let user = await UserModel.create(userData);

	return {Success: true, Message: "", User: user};
}
const QueryUsers = async (id) => {
	return undefined;
};

const GetUserByUserId = async (userID) => {
	let UserModel = DatabaseHandler.GetInstance().GetModel("user");

	let User = await UserModel.findOne({where: {UserID: userID}});

	return User;
};

const GetUserByEmail = async (EmailAddress) =>
{
	let email = CryptoHandler.GetInstance().EncryptWithKey(EmailAddress)

	let UserModel = DatabaseHandler.GetInstance().GetModel("user");

	let User = await UserModel.findOne({where: {EmailAddress: email}});

	return User;
};

const UpdateUserByUserId = async (userId, updateBody) => {
	let User = await UserService.GetUserByUserId(userId)

	if (User)
	{
		User = await User.update(updateBody)

		return {Success: true, Message: "", User: User}
	}
	else
	{
		return {Success: false, Message: "User Not found", User: null, HTTPStatus: httpStatus.NOT_FOUND};
	}
};

const DeleteUserByUserId = async (userId) => {
	const User = await UserService.GetUserByUserId(userId)

	if (User)
	{
		await User.destroy()

		return {Success: true, Message: "", User: null}
	}
	else
	{
		return {Success: false, Message: "User Not found", User: null, HTTPStatus: httpStatus.NOT_FOUND};
	}
};


module.exports = {
	CreateUser,
	QueryUsers,
	GetUserByUserId,
	GetUserByEmail,
	UpdateUserByUserId,
	DeleteUserByUserId,
};