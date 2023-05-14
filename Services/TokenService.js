const jwt = require('jsonwebtoken');
const Moment = require("moment")
const Sequelize = require("sequelize");
const httpStatus = require("http-status");

const DatabaseHandler = require(handlersDir + "Storage/Database/DatabaseHandler");
const CryptoHandler = require(handlersDir + "Crypto/CryptoHandler");
const UserService = require(serviceDir + "UserService");
const json = require(handlersDir + "Storage/File/JSONHandler.js");

const GenerateAuthTokens = async (user) =>
{
	const accessTokenExpires = Moment().add(json.GetConfig("config.json", "JWT_ACCESS_EXPIRATION_MINUTES"), "minutes");
	const accessToken = await GenerateToken(user.UserID, accessTokenExpires, "access");

	const refreshTokenExpires = Moment().add(json.GetConfig("config.json", "JWT_REFRESH_EXPIRATION_DAYS"), "days");
	const refreshToken = await GenerateToken(user.UserID, refreshTokenExpires, "refresh");

	await SaveToken(refreshToken, user.UserID, refreshTokenExpires, "refresh");

	let tokens = {
		access: {
			token: accessToken,
			expires: accessTokenExpires.toDate(),
		},
		refresh: {
			token: refreshToken,
			expires: refreshTokenExpires.toDate(),
		},
	};

	return tokens;
}
const CheckUserAuthTokens = async(user) =>
{
	if (jwt.TokenExpiredError)
	{
		await GenerateAuthTokens(user);
	}
}
const GenerateResetPasswordTokens = async (email) =>
{
	const user = await UserService.GetUserByEmail(email);
	if(!user) return {Success: false, Message: "No User Found With This Email", User: null, HTTPStatus: httpStatus.NOT_FOUND};

	const expires = Moment().add(json.GetConfig("config.json", "JWT_RESET_PASSWORD_EXPIRATION_MINUTES"), "minutes");
	const resetPasswordToken = await GenerateToken(user.ID, expires, "resetPassword");

	await SaveToken(resetPasswordToken, user.ID, expires, "resetPassword");

	return resetPasswordToken;
}

const GenerateVerifyEmailTokens = async (user) =>
{
	const expires = Moment().add(json.GetConfig("config.json", "JWT_VERIFY_EMAIL_EXPIRATION_MINUTES"), "minutes");
	const verifyEmailToken = await GenerateToken(user.ID, expires, "verifyEmail");

	await SaveToken(verifyEmailToken, user.ID, expires, "verifyEmail");

	return verifyEmailToken;
}

const GenerateToken = async (UserID, Expires, Type) =>
{
	let CryptoHandlerInstance = CryptoHandler.GetInstance();

	const payload = {
		sub: UserID,
		iat: Moment().unix(),
		exp: Expires.unix(),
		Type,
	};

	let Token = CryptoHandlerInstance.SignJWT(payload)

	return Token;
}

const VerifyToken = async (token, type) =>
{
	let CryptoHandlerInstance = CryptoHandler.GetInstance();
	let TokenModel = DatabaseHandler.GetInstance().GetModel("token");

	let payload = CryptoHandlerInstance.VerifyJWT(token)

	const tokenResult = await TokenModel.findOne({
		where: {
			[Sequelize.Op.and]: [{ Token: token }, { Type: type }, { UserID: payload.sub }, { Blacklisted: false }]
		}
	});

	if(!tokenResult) return {Success: false, Message: "Token Doesn't Exist", Token: null, User: null}

	return {Success: true, Message: "", Token: tokenResult, User: null}
}

const VerifyAccessToken = async (token) =>
{
	let CryptoHandlerInstance = CryptoHandler.GetInstance();

	let payload = CryptoHandlerInstance.VerifyJWT(token);

	if(payload == undefined) return {Success: false, Message: "Invalid Payload", User: null, Token: null}

	if(payload.Type != "access") return {Success: false, Message: "Invalid Token Type Expected Access Got" + payload.Type, User: null, Token: null}

	return {Success: true, Message: "", User: null, Token: null, Payload: payload};
};

const SaveToken = async (token, userID, expires, type, blacklisted) =>
{
	let TokenModel = DatabaseHandler.GetInstance().GetModel("token");

	let TokenData = {
		Token: token,
		UserID: userID,
		Type: type,
		Expires: expires,
		Blacklisted: false,
	}

	const savedToken = await TokenModel.create(TokenData);

	return savedToken;
}

module.exports = {
	GenerateToken,
	SaveToken,
	VerifyToken,
	VerifyAccessToken,
	GenerateAuthTokens,
	GenerateResetPasswordTokens,
	GenerateVerifyEmailTokens,
}