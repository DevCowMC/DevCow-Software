const Joi = require('joi');
const  CustomValidation = require(validationDir + 'CustomValidation');
const {Password} = require("./CustomValidation");

const Register = {
	body: Joi.object().keys({
		Username: Joi.string().required(),
		EmailAddress: Joi.string().required().email(),
		Password: Joi.string().required().custom(CustomValidation.Password),
		ConfirmPassword: Joi.string().required().valid(Joi.ref('Password')),
		captchaResponse: Joi.string().required(),
	}),
};

const Login = {
	body: Joi.object().keys({
		EmailAddress: Joi.string().required(),
		Password: Joi.string().required(),
		captchaResponse: Joi.string().required(),
	}),
};

const Logout = {
	body: Joi.object().keys({
		RefreshToken: Joi.string().required(),
	}),
};

const RefreshTokens = {
	body: Joi.object().keys({
		RefreshToken: Joi.string().required(),
	}),
};

const ForgotPassword = {
	body: Joi.object().keys({
		email: Joi.string().email().required(),
	}),
};

const ResetPassword = {
	query: Joi.object().keys({
		token: Joi.string().required(),
	}),
	body: Joi.object().keys({
		password: Joi.string().required().custom(CustomValidation.Password),
	}),
};

const VerifyEmail = {
	query: Joi.object().keys({
		token: Joi.string().required(),
	}),
};

module.exports = {
	Register,
	Login,
	Logout,
	RefreshTokens,
	ForgotPassword,
	ResetPassword,
	VerifyEmail,
};