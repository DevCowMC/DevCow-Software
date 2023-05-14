const httpStatus = require('http-status');
const UserService = require(serviceDir + "UserService");
const TokenService = require(serviceDir + "TokenService");
const AuthService = require(serviceDir + "AuthService");
const Validation = require(validationDir + 'Validation');

const Register = async (req, res) =>
{
	let validation = Validation.Validate(Validation.AuthValidation.Register, req, res);

	if(validation.Success == false)
	{
		let errorMessage = validation.Message
		return {Success: false, Message: errorMessage, User: null, Token: null, HTTPStatus: validation.HTTPStatus};
	}

	console.log(validation)

	const User = await UserService.CreateUser(req);

	if(User.Success == true)
	{
		let userData = User.User;

		const tokens = await TokenService.GenerateAuthTokens(userData);
		const DestroyRefreshTokenResponse = await AuthService.Logout(tokens.refresh.token);

		if(DestroyRefreshTokenResponse.Success == true)
		{
			DestroyRefreshTokenResponse.Token.destroy();

			return {Success: true, Message: "", User: userData, Token: tokens, HTTPStatus: httpStatus.CREATED};
		}
		else
		{
			let errorMessage = DestroyRefreshTokenResponse.Message;
			return {Success: true, Message: errorMessage, User: null, Token: DestroyRefreshTokenResponse, HTTPStatus: DestroyRefreshTokenResponse.HTTPStatus};
		}
	}
	else
	{
		let errorMessage = User.Message;
		return {Success: false, Message: errorMessage, User: null, Token: null, HTTPStatus: User.HTTPStatus};
	}
}

const Login = async (req, res) =>
{
	let validation = Validation.Validate(Validation.AuthValidation.Login, req);

	if(validation.Success == false)
	{
		let errorMessage = validation.Message

		return {Success: false, Message: errorMessage, User: null, Token: null, HTTPStatus: validation.HTTPStatus};
	}

	let email = req.body.EmailAddress;
	let password = req.body.Password;
	const User = await AuthService.LoginWithEmailPassword(email, password)


	if(User.Success == true)
	{
		let userData = User.User;

		const tokens = await TokenService.GenerateAuthTokens(userData);

		return {Success: true, Message: "", User: userData, Token: tokens, HTTPStatus: httpStatus.CREATED};
	}
	else
	{
		let errorMessage = User.Message;
		return {Success: false, Message: errorMessage, User: null, Token: null, HTTPStatus: User.HTTPStatus};
	}
}

const Logout = async (req, res) =>
{
	let sessionCookie = req.cookies.Session;

	if(sessionCookie)
	{
		if(sessionCookie.access == undefined) return {Success: false, Message: "Please Authenticate", User: null, Token: null, HTTPStatus: httpStatus.UNAUTHORIZED};

		let tokenResponse = await TokenService.VerifyToken(sessionCookie.refresh.token, "refresh");

		if(tokenResponse.Success == true)
		{
            const LogoutResponse = await AuthService.Logout(sessionCookie.refresh.token);

            if(LogoutResponse.Success == true)
            {
                LogoutResponse.Token.destroy();

                return {Success: true, Message: null, User: null, Token: null, HTTPStatus: LogoutResponse.HTTPStatus};
            }
            else
            {
                let errorMessage = LogoutResponse.Message;
                return {Success: false, Message: errorMessage, User: null, Token: null, HTTPStatus: LogoutResponse.HTTPStatus};
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

const RefreshTokens = async (req, res) =>
{
	let sessionCookie = req.cookies.Session;

	if(sessionCookie)
	{
		if(sessionCookie.access == undefined) return {Success: false, Message: "Please Authenticate", User: null, Token: null, HTTPStatus: httpStatus.UNAUTHORIZED};

		let tokenResponse = await TokenService.VerifyToken(sessionCookie.refresh.token, "refresh");

		if(tokenResponse.Success == true)
		{
			const Tokens = await AuthService.RefreshAuth(sessionCookie.refresh.token);

			if (Tokens)
			{
				return {Success: true, Message: "", User: Tokens.User, Token: Tokens.Token, HTTPStatus: httpStatus.OK};
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



	if(Tokens.Success == true)
	{

		res.send({...Tokens});
	}
	else
	{
		let errorMessage = Tokens.Message;
		res.status(Tokens.HTTPStatus).send({errorMessage})
	}
}

const ForgotPassword = async (req, res) =>
{
	let validation = Validation.Validate(Validation.AuthValidation.ForgotPassword, req);

	if(validation.Success == false)
	{
		let errorMessage = validation.Message
		res.status(validation.HTTPStatus).send({errorMessage})
		return;
	}
}

const ResetPassword = async (req, res) =>
{
	let validation = Validation.Validate(Validation.AuthValidation.ResetPassword, req);

	if(validation.Success == false)
	{
		let errorMessage = validation.Message
		res.status(validation.HTTPStatus).send({errorMessage})
		return;
	}
}

const SendVerificationEmail = async (req, res) =>
{
	let validation = Validation.Validate(Validation.AuthValidation.SendVerificationEmail, req);

	if(validation.Success == false)
	{
		let errorMessage = validation.Message
		res.status(validation.HTTPStatus).send({errorMessage})
		return;
	}

	const verifyEmailToken = await TokenService.GenerateVerifyEmailTokens(req.user)
}

const VerifyEmail = async (req, res) =>
{
	let validation = Validation.Validate(Validation.AuthValidation.VerifyEmail, req);

	if(validation.Success == false)
	{
		let errorMessage = validation.Message
		res.status(validation.HTTPStatus).send({errorMessage})
		return;
	}

	const VerifyEmailResponse = await AuthService.VerifyEmail(req.query.Token);

	if(VerifyEmailResponse.Success == true)
	{
		res.status(VerifyEmailResponse.HTTPStatus).send();
	}
	else
	{
		let errorMessage = VerifyEmailResponse.Message;
		res.status(VerifyEmailResponse.HTTPStatus).send({errorMessage})
	}
}

const Lock = async (req, res) =>
{
	let validation = Validation.Validate(Validation.AuthValidation.Lock, req);

	if(validation.Success == false)
	{
		let errorMessage = validation.Message

		return {Success: false, Message: errorMessage, User: null, Token: null, HTTPStatus: validation.HTTPStatus};
	}

	if(req.cookies.Session.refresh == undefined) return {Success: false, Message: "Please Authenticate", User: null, Token: null, HTTPStatus: httpStatus.UNAUTHORIZED};

	const LockResponse = await AuthService.Lock(req.cookies.Session.refresh);

	if(LockResponse.Success == true)
		{
			return {Success: true, Message: null, User: LockResponse.User, Token: LockResponse.Token, HTTPStatus: httpStatus.OK};
		}
		else
		{
			let errorMessage = LockResponse.Message;
			return {Success: false, Message: errorMessage, User: null, Token: null, HTTPStatus: httpStatus.UNAUTHORIZED};
		}
}

const Unlock = async (req, res) =>
{
	let validation = Validation.Validate(Validation.AuthValidation.Unlock, req);

	if(validation.Success == false)
	{
		let errorMessage = validation.Message
		return {Success: false, Message: errorMessage, User: null, Token: null, HTTPStatus: validation.HTTPStatus};
	}

	if(req.cookies.Session.Token == undefined || req.body.UserID == undefined || req.body.Password == undefined) return {Success: false, Message: "Please Authenticate", User: null, Token: null, HTTPStatus: httpStatus.UNAUTHORIZED};

	const LockResponse = await AuthService.Unlock(req.cookies.Session.Token, req.body.UserID);

	if(LockResponse.Success == true)
	{
		if(await LockResponse.User.isPasswordCorrect(req.body.Password))
		{
			let userData = LockResponse.User;

			await LockResponse.Token.destroy();

			const tokens = await TokenService.GenerateAuthTokens(userData);

			return {Success: true, Message: "", User: userData, Token: tokens, HTTPStatus: httpStatus.OK};
		}
		else
		{
			let errorMessage = User.Message;
			return {Success: false, Message: errorMessage, User: null, Token: null, HTTPStatus: User.HTTPStatus};
		}
	}

}

module.exports = {
	Register,
	Login,
	Lock,
	Unlock,
	Logout,
	RefreshTokens,
	ForgotPassword,
	ResetPassword,
	SendVerificationEmail,
	VerifyEmail,
};