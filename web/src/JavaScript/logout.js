document.addEventListener('DOMContentLoaded', OnDOMLoad);
window.addEventListener('load', OnLoad);

function OnDOMLoad(event)
{
	document.cookie = "id=;expires=Thu, 01 Jan 1970 00:00:00 GMT;"
}

function OnLoad(event)
{
	setTimeout(function ()
	{
		document.location = 'homepage.html';
	}, 5000);
}