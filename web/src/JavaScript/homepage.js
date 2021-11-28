document.addEventListener('DOMContentLoaded', OnLoad);

function OnLoad(event)
{
	var userID = GetIDCookie("id");

	if (userID != null)
	{
		document.location = "account.html";
	}
}