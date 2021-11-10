// Used to toggle the menu on small screens when clicking on the menu button
function MenuToggle()
{
	var x = document.getElementById("navDemo");
	if (x.className.indexOf("w3-show") == -1)
	{
		x.className += " w3-show";
	} else
	{
		x.className = x.className.replace(" w3-show", "");
	}
}

function GetCookie(cname)
{
	let name = cname + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for (let i = 0; i < ca.length; i++)
	{
		let c = ca[i];
		while (c.charAt(0) == ' ')
		{
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0)
		{
			return c.substring(name.length, c.length);
		}
	}
	return "";
}