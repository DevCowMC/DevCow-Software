const httpStatus = require('http-status');
const UserService = require(serviceDir + "UserService");
const TokenService = require(serviceDir + "TokenService");

const DatabaseHandler = require(handlersDir + "Storage/Database/DatabaseHandler");
const Sequelize = require("sequelize");
const BCrypt = require("bcrypt");

const LoginWithEmailPassword = async (email, password) =>
{
	const User = await UserService.GetUserByEmail(email);

	if(!User || !(await User.isPasswordCorrect(password)))
	{
		return {Success: false, Message: "Incorrect Email Address or Password", User: null, HTTPStatus: httpStatus.UNAUTHORIZED};
	}

	return {Success: true, Message: "", User: User, HTTPStatus: httpStatus.OK};
}

const Logout = async (refreshToken) =>
{
	let BlankTokenModel = DatabaseHandler.GetInstance().GetModel("token");

	const RefreshTokenModel = await BlankTokenModel.findOne({
		where: {
			[Sequelize.Op.and]: [{ Token: refreshToken }, { Type: "refresh" }, { Blacklisted: false }]
		}
	});

	if(!RefreshTokenModel)
	{
		return {Success: false, Message: "Token Not found", Token: null, HTTPStatus: httpStatus.NOT_FOUND};
	}

	return {Success: true, Message: "", Token: RefreshTokenModel, HTTPStatus: httpStatus.OK};
}

const RefreshAuth = async (RefreshToken) =>
{
	let RefreshTokenCheck = await TokenService.VerifyToken(RefreshToken, "refresh");

	if(RefreshTokenCheck.Success == true)
	{
		const User = await UserService.GetUserByUserId(RefreshTokenCheck.Token.UserID)

		if (User)
		{
			await RefreshTokenCheck.Token.destroy()
			let tokenResult = await TokenService.GenerateAuthTokens(User)

			return {Success: true, Message: "", Token: tokenResult, User: User, HTTPStatus: httpStatus.OK}
		}
		else
		{
			return {Success: false, Message: "User Not found", Token: null, User: null, HTTPStatus: httpStatus.NOT_FOUND};
		}
	}
	else
	{
		return RefreshTokenCheck;
	}
}

const ResetPassword = async (resetPasswordToken, newPassword) =>
{
	let BlankTokenModel = DatabaseHandler.GetInstance().GetModel("token");

	const ResetPasswordTokenModel = await BlankTokenModel.findOne({
		where: {
			[Sequelize.Op.and]: [{ Token: resetPasswordToken }, { Type: "resetPassword" }, { Blacklisted: false }]
		}
	});

	if(!ResetPasswordTokenModel)
	{
		return {Success: false, Message: "Token Not found", Token: null, HTTPStatus: httpStatus.NOT_FOUND};
	}

	let password = await BCrypt.hash(newPassword, 10);

	let response = await UserService.UpdateUserByUserId(ResetPasswordTokenModel.Token.UserID, {Password: password})

	if (response.Success == true)
	{
		await BlankTokenModel.destroy({
			where: {
				[Sequelize.Op.and]: [{ UserID: ResetPasswordTokenModel.Token.UserID }, { Type: "resetPassword" }]
			}
		});

		return {Success: true, Message: "", Token: null}
	}
	else
	{
		return response
	}
}

const VerifyEmail = async (verifyEmailToken) =>
{
	let BlankTokenModel = DatabaseHandler.GetInstance().GetModel("token");

	const VerifyEmailTokenModel = await BlankTokenModel.findOne({
		where: {
			[Sequelize.Op.and]: [{ Token: verifyEmailToken }, { Type: "verifyEmail" }, { Blacklisted: false }]
		}
	});

	if(!VerifyEmailTokenModel)
	{
		return {Success: false, Message: "Token Not found", Token: null, HTTPStatus: httpStatus.NOT_FOUND};
	}

	let response = await UserService.UpdateUserByUserId(VerifyEmailTokenModel.Token.UserID, {EmailVerified: true})

	if (response.Success == true)
	{
		await BlankTokenModel.destroy({
			where: {
				[Sequelize.Op.and]: [{ UserID: VerifyEmailTokenModel.Token.UserID }, { Type: "verifyEmail" }]
			}
		});

		return {Success: true, Message: "", Token: null}
	}
	else
	{
		return response
	}
}

const Lock = async (refreshToken) =>
{
	let tokenResponse = await TokenService.VerifyToken(refreshToken.token, "refresh");

	const User = await UserService.GetUserByUserId(tokenResponse.Token.UserID)

	if(User)
	{
		tokenResponse.User = User
	}
	else
	{
		tokenResponse.Success = false;
		tokenResponse.Message = "User Not Found"
		tokenResponse.Token = null
	}

	return tokenResponse;
}

const Unlock = async (refreshToken, UserID) =>
{
	let tokenResponse = await TokenService.VerifyToken(refreshToken, "refresh");

	if(tokenResponse.Success == true)
	{
		if(tokenResponse.Token.UserID != UserID) return {Success: false, Message: "User ID Dosnt Match", Token: null, User: null, HTTPStatus: httpStatus.UNAUTHORIZED};

		let User = await UserService.GetUserByUserId(tokenResponse.Token.UserID)

		if(User)
		{
			return {Success: true, Message: "", User: User, Token: tokenResponse.Token, HTTPStatus: httpStatus.CREATED};
		}
		else
		{
			return {Success: false, Message: "User Not Found", User: null, Token: tokenResponse.Token, HTTPStatus: httpStatus.UNAUTHORIZED};
		}
	}
	else
	{
		return tokenResponse;
	}
}

module.exports =
{
	LoginWithEmailPassword,
	Lock,
	Logout,
	Unlock,
	RefreshAuth,
	ResetPassword,
	VerifyEmail
};