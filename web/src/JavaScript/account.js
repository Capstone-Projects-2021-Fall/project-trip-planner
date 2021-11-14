document.addEventListener('DOMContentLoaded', OnLoad);

function OnLoad(event)
{
	var userID = parseInt(GetCookie("id"));

	if (userID == null)
	{
		document.location = "login.html";
	}
	else 
	{
		var raw = JSON.stringify({ "id": userID});

		// create a JSON object with parameters for API call and store in a variable
		var requestOptions = {
			method: 'POST',
			body: raw,
		};

		var container = document.getElementById('itinerary-list-holder');

		fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/GetUserItineraries", requestOptions).then(response => fillItineraries(container, response, true));
	}
}
