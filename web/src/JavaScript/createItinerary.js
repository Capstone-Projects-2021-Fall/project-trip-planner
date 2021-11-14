


function CallAPI(email, password) 
{
	var itineraryName = document.getElementById("tripName").value;
	var startDate = new Date(document.getElementById("startDate").value);
	var endDate = new Date(document.getElementById("endDate").value);
	var note = document.getElementById("note").value;

	if (!note)
	{
		note = null;
	}

	var userID = parseInt(GetCookie("id"));
	//likely should check here to see if cookie is not null.

	console.log("UserID: '" + userID + "'");
	console.log("Type: '" + typeof(userID) + "'");

	var newItinerary = {
		"itineraryName": itineraryName,
		"startDate": startDate,
		"endDate": endDate,
		"userID": userID,
		"additionalInformation": note
	};

	newItinerary = JSON.stringify(newItinerary);

	console.log(newItinerary);

	var postItinerary = {
		method: 'POST',
		body: newItinerary
	};

	// make API call with parameters and use promises to get response
	fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/CreateItinerary", postItinerary).then(response =>
	{
		var errWrapper = document.getElementById('create-error-msg-holder');
		var errMsg = document.getElementById('create-error-msg');

		errWrapper.style.visibility = "hidden";
		errMsg.textContent = "";

		if (response.status == 200)
		{
			//eval();
			response.text().then(output =>
			{
				console.log(output);
				document.location = "itineraryFromDatabase.html?itinerary_id=" + output;
			});
		}
		else 
		{
			response.json().then(output =>
			{

				errWrapper.style.visibility = "visible";
				/* 1: Not Unique: This user already has an itinerary with this name, starting and ending at this point.
				 * 2: Invalid Start / End Days - the start is after the end.
				 * 3: Invalid Creator ID.This is an error caused by the API, and should never happen.
				 * 4: Invalid Itinerary Name.It can't be null, empty, or whitespace.
				 */

				 console.log(output)

				var err = output["errorCode"];
				if (err == 1)
				{
					errMsg.textContent = "You already have an itinerary with this name, start date, and end date.";
				}
				else if (err == 2)
				{
					errMsg.textContent = "The start date must be before the end date.";
				}
				else if (err == 3)
				{
					errMsg.textContent = "An timeout error occured. make sure you are still logged in.";
				}
				else if (err == 4)
				{
					errMsg.textContent = "The itinerary name has to be valid - it cannot just be whitespace.";
				}
				else
				{
					errMsg.textContent = "unexpected error";
				}
			});
		}

	});
}