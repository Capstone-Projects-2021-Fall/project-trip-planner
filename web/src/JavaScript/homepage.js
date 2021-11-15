document.addEventListener('DOMContentLoaded', OnLoad);

function OnLoad(event)
{
	var userID = GetIDCookie("id");
	console.log(typeof(userID));

	if (userID != null)
	{
		document.location = "account.html";
	}
}