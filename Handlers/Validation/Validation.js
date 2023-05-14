const Joi = require('joi');
const httpStatus = require('http-status');

const CustomValidation = require(validationDir + 'CustomValidation');
const AuthValidation = require(validationDir + 'AuthValidation');
const UserValidation = require(validationDir + 'UserValidation');

const Validate = (Schema, req) =>
{
	const validSchema = Pick(Schema, ['params', 'query', 'body']);
	const object = Pick(req, Object.keys(validSchema));
	const { value, error } = Joi.compile(validSchema)
		.prefs({ errors: { label: 'key' }, abortEarly: false })
		.validate(object);

	if (error)
	{
		let msg = [];

		error.details.map((details) =>
		{
			msg.push(details.message.replaceAll("\"", ""))
		});
		return {Success: false, Message: msg, HTTPStatus: httpStatus.UNAUTHORIZED};
	}

	Object.assign(req, value);
	return {Success: true, Message: "", HTTPStatus: httpStatus.OK};
}

const Pick = (object, keys) => {
	return keys.reduce((obj, key) => {
		if (object && Object.prototype.hasOwnProperty.call(object, key))
		{
			obj[key] = object[key];
		}
		return obj;
	}, {});
};

module.exports =
	{
		CustomValidation,
		AuthValidation,
		UserValidation,
		Validate,
		Pick
	}