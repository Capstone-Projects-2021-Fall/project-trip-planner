/**
 * Checks to see if the input form for create itinerary is valid. returns true if it is, false if not.
 *
 * @returns {boolean} - true if the form contains all valid data, false if any field is invalid.
 */
function CheckFormValid()
{
	var itineraryName = document.getElementById("tripName").value;
	var startDate = GetDateOrNull(document.getElementById("startDate").value);
	var endDate = GetDateOrNull(document.getElementById("endDate").value);
	
	var valid = true;
	var errWrapper = document.getElementById('create-error-msg-holder');
	var errMsg = document.getElementById('create-error-msg');

	//Currently i have one div for all the errors. we will need there to be a div below each input field that handles that specific field.
	//Also, feel free to make various error messages better.
	if (IsNullOrWhitespace(itineraryName))
	{
		errMsg.textContent = "Itinerary Name must be valid";
		valid = false;
	}
	if (!startDate)
	{
		errMsg.textContent = "Start Date must be valid";
		valid = false;
	}
	if (!endDate)
	{
		errMsg.textContent = "End Date must be valid";
		valid = false;
	}
	if (startDate && endDate && startDate > endDate)
	{
		errMsg.textContent = "Start Date must occur on or before the End Date";
		valid = false;
	}

	if (!valid)
	{
		errWrapper.style.visibility = "visible";
	}

	return valid;
}

function CallAPI()
{
	if (CheckFormValid())
	{

		var itineraryName = document.getElementById("tripName").value;
		var startDate = GetDateOrNull(document.getElementById("startDate").value);
		var endDate = GetDateOrNull(document.getElementById("endDate").value);
		var note = document.getElementById("note").value;

		var errWrapper = document.getElementById('create-error-msg-holder');
		var errMsg = document.getElementById('create-error-msg');

		var userID = GetIDCookie();
		//likely should check here to see if cookie is not null.

		console.log("UserID: '" + userID + "'");
		console.log("Type: '" + typeof (userID) + "'");

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


			errWrapper.style.visibility = "hidden";
			errMsg.textContent = "";

			if (response.status == 200)
			{
				//eval();
				response.text().then(output =>
				{
					console.log(output);
					document.location = "itinerary.html?itinerary_id=" + output;
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
}