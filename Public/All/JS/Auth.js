$(() =>
{

})

function onRecaptchaResponse(response)
{
	document.getElementById('captchaResponse').value = response;
}

var onloadCallback = function()
{
	grecaptcha.execute();
};