const httpStatus = require("http-status");

const TokenService = require(serviceDir + "TokenService");
const UserService = require(serviceDir + "UserService");
const jwt = require('jsonwebtoken');

module.exports.IsLoggedIn = async (req, res) =>
{
	let sessionCookie = req.cookies.Session;

	if(sessionCookie)
	{
		if(sessionCookie.access == undefined) return {Success: false, Message: "Please Authenticate", User: null, Token: null, HTTPStatus: httpStatus.UNAUTHORIZED};
		let tokenResponse = await TokenService.VerifyAccessToken(sessionCookie.access.token);

		if(tokenResponse.Success == true)
		{
			const userResult = await UserService.GetUserByUserId(tokenResponse.Payload.sub);

			if (userResult)
			{
				return {Success: true, Message: "", User: userResult, Token: null, HTTPStatus: httpStatus.OK};
			}
			else
			{
				return {Success: false, Message: "Please Authenticate", User: null, Token: null, HTTPStatus: httpStatus.UNAUTHORIZED};
			}
		}
		else
		{
			return {Success: false, Message: "Please Authenticate", User: null, Token: null, HTTPStatus: httpStatus.UNAUTHORIZED};
		}
	}
	else
	{
		return {Success: false, Message: "Please Authenticate4", User: null, Token: null, HTTPStatus: httpStatus.UNAUTHORIZED};
	}
}