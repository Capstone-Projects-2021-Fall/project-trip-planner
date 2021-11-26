//JS code for pages that have a navbar. This is separate from the "common" js code because it's possible to have global utilities that apply everywhere, even on pages that don't have a nav bar.

//First, add a listener. our last two buttons are now dynamic - they display account and log out if logged in, sign up and login in if logged out.
document.addEventListener("DOMContentLoaded", function ()
{
	var userID = GetIDCookie("id");

	let lya = document.getElementById("login-your-account");
	let lyas = document.getElementById("login-your-account-small");
	let sl = document.getElementById("signup-logout");
	let sls = document.getElementById("signup-logout-small");

	if (userID && !isNaN(Number(userID)))
	{
		lya.textContent = "Your Account";
		lyas.textContent = "Your Account";

		lya.href = "account.html";
		lyas.href = "account.html";

		sl.textContent = "Log Out";
		sls.textContent = "Log Out";

		sl.href = "logout.html";
		sls.href = "logout.html";
	}
	else
	{
		lya.textContent = "Login";
		lyas.textContent = "Login";

		lya.href = "login.html";
		lyas.href = "login.html";

		sl.textContent = "Sign Up";
		sls.textContent = "Sign Up";

		sl.href = "signup.html";
		sls.href = "signup.html";
	}
});

// Used to toggle the menu on small screens when clicking on the menu button
function MenuToggle()
{
	var x = document.getElementById("navDemo");
	if (x.classList.contains("w3-show"))
	{
		x.classList.remove("w3-show");
	}
	else
	{
		x.classList.add("w3-show");
	}
}

/**
 * Provides the functionality for the search bar we have on each page. redirects the page to the search page with the content the user provided. 
 */
function PerformSearch()
{
	var selectBox = document.getElementById("dropdown");
	var content = document.getElementById("quick-search").value;

	if (selectBox.value == "Itineraries")
	{
		document.location = "itinerarySearch.html?itineraryQuery=" + encodeURIComponent(content);
	}
	else if (selectBox.value == "Activities")
	{
		document.location = "itinerarySearch.html?activityQuery=" + encodeURIComponent(content);
	}
	//fallback to users if something breaks. should just be these three but whatever.
	else //if (selectBox.value == "Users")
	{
		document.location = "userSearch.html?query=" + encodeURIComponent(content);
	}
}