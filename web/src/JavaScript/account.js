document.addEventListener('DOMContentLoaded', _ => 
{
	var userID = GetIDCookie();

	if (userID == null)
	{
		document.location = "login.html";
	}
	else 
	{

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
		fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/AccountHandler?user=" + userID, requestItinerary).then(response =>
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
					let welcomeText = document.getElementById("welcome-user");
					welcomeText.textContent = "Welcome, " + screen;

					let fnameField = document.getElementById("fname");
					fnameField.value = fname;
					fnameField.defaultValue = fname;

					let lnameField = document.getElementById("lname");
					lnameField.value = lname;
					lnameField.defaultValue = lname;

					let dobField = document.getElementById("dob");
					dobField.value = dob;
					dobField.defaultValue = dob;

					let enableEditBtn = document.getElementById("enable-edit-btn");
					enableEditBtn.addEventListener("click", _ =>
					{
						if (!editMode)
						{
							enableEditBtn.disabled = true;

							editMode = true;

							fnameField.readOnly = false;
							lnameField.readOnly = false;
							dobField.readOnly = false;

							revertBtn.disabled = false;
							saveBtn.disabled = false;
						}
					});

					let revertBtn = document.getElementById("revert-btn");
					revertBtn.addEventListener("click", _ =>
					{
						if (editMode) 
						{
							fnameField.value = fnameField.defaultValue;
							lnameField.value = lnameField.defaultValue;
							dobField.value = dobField.defaultValue;
						}
					});

					let saveBtn = document.getElementById("save-btn");
					saveBtn.addEventListener("click", _ =>
					{
						//debounce
						saveBtn.disabled = true;
						revertBtn.disabled = true;
						if (editMode)
						{
							fnameField.readOnly = true;
							lnameField.readOnly = true;
							dobField.readOnly = true;

							let userData =
							{
								"UserID": userID,
								"FirstName": fnameField.value,
								"LastName": lnameField.value,
								"DateOfBirth": dobField.value || null,
							}

							var json = JSON.stringify(userData);

							let requestOptions = {
								method: 'POST',
								body: json,
							};

							fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/AccountHandler", requestOptions).then(gucci =>
							{
								revertBtn.disabled = true;
								saveBtn.disabled = true;

								editMode = false;

								enableEditBtn.disabled = false;

								fnameField.defaultValue = fnameField.value;
								lnameField.defaultValue = lnameField.value;
								dobField.defaultValue = dobField.value;
							})/*.catch(notgucci =>
							{
								//Maybe have an error div say "something went wrong".
								saveBtn.disabled = false;
								revertBtn.disabled = false;

								fnameField.readOnly = false;
								lnameField.readOnly = false;
								dobField.readOnly = false;
							})*/;
						}
					});
				}
				//fill the itineraries.
				fillItineraries(container, data["Itineraries"], status, true);
			});
		});
		//userID = temp;
	}
});
