document.addEventListener('DOMContentLoaded', _ => 
{
	var user = getParameterByName("id");

	// create a JSON object with parameters for API call and store in a variable
	var requestItinerary = {
		method: 'GET',
		headers: {
			"Access-Control-Allow-Headers": "*",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
		}

	};

	var container = document.getElementById('itinerary-list-holder');
	//let temp = userID;
	//userID = 28;
	//fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/CreateReadUpdateItinerary?page=" + userID, requestItinerary).then(response =>
	fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/AccountHandler?user=" + user, requestItinerary).then(response =>
	{
		let status = response.status;
		JsonOrNull(response, data => 
		{
			if (status == 200) 
			{
				let editMode = false;

				//fill the user information.
				let fname = data["FirstName"];
				let lname = data["LastName"];
				let dob = data['DateOfBirth'];

				let screen = data["ScreenName"];
				let welcomeText = document.getElementById("user");
				welcomeText.textContent = screen + "'s Profile";

				let fnameField = document.getElementById("fname");
				fnameField.textContent = fname ? "First Name: " + fname : "No first name provided";

				let lnameField = document.getElementById("lname");
				lnameField.textContent = lname ? "Last Name: " + lname : "No last name provided";

				let dobField = document.getElementById("dob");
				dobField.textContent = dob ? "Date of Birth: " + dob : "No date of birth provided.";
			}
			//fill the itineraries.
			fillItineraries(container, data["Itineraries"], status, true, false);
		});
	});
	//userID = temp;
});
