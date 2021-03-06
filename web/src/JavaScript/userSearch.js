document.addEventListener('DOMContentLoaded', _ =>
{
	//null if not found. that works here.
	var query = getParameterByName("query");

	var container = document.getElementById('itinerary-list-holder');

	var queryField = document.getElementById("query");


	/*
	TODO: maybe add these? allow end user to refine user search? wasn't part of spec, isn't strictly speaking hard, but more work for frontend devs. 
	var firstName = searchSection.get("firstName");
	var lastName = searchSection.get("lastName");
	*/

	if (query)
	{
		query = decodeURIComponent(query);

		queryField.value = query;

		var raw = JSON.stringify({ "query": query });

		// create a JSON object with parameters for API call and store in a variable
		var requestOptions = {
			method: 'POST',
			body: raw,
		};

		fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/SearchForUser", requestOptions).then(response =>
		{
			if (response.status == 200)
			{
				var userID = GetIDCookie();

				JsonOrNull(response, results =>
				{
					if (!results || results.length == 0)
					{

						var elem = document.createElement("div");
						elem.classList.add("users-empty");

						var niceText = document.createTextNode("No results. That's unfortunate! Try using different or more general search terms.");

						elem.appendChild(niceText);

						container.appendChild(elem);
					}
					else
					{
						//json elements are formatted as such:
						results.forEach(element => 
						{

							var elem = document.createElement("div");
							elem.classList.add("user-item");

							var screenHolder = document.createElement("div");
							screenHolder.classList.add("user-screenname");
							var screenContent = document.createTextNode(element["ScreenName"]);
							screenHolder.appendChild(screenContent);
							elem.appendChild(screenHolder);

							var nameHolder = document.createElement("div");
							nameHolder.classList.add("item-fullname");

							var fName = element["FirstName"];
							var lName = element["LastName"];

							var nameText;
							if (fName && lName)
							{
								nameText = "Name: " + fName + " " + lName;
							}
							else if (fName)
							{
								nameText = "Name: " + fName + " (no last name provided)";
							}
							else if (lName)
							{
								nameText = "Last Name: " + fName + " (no first name provided)";
							}
							else 
							{
								nameText = "No name provided";
							}
							var nameContent = document.createTextNode(nameText);
							nameHolder.appendChild(nameContent);
							elem.appendChild(nameHolder);

							var dobHolder = document.createElement("div");
							dobHolder.classList.add("item-dob");

							var dob = element["DateOfBirth"];
							var dobText;
							if (dob)
							{
								dobText = "Date of Birth: " + dob;
							}
							else 
							{
								dobText = "No date of birth provided";
							}

							var dobContent = document.createTextNode(dobText);
							dobHolder.appendChild(dobContent);
							elem.appendChild(dobHolder);

							var id = element["UserID"];

							elem.onclick = function () 
							{
								document.location = "viewUser.html?id=" + id;
							};

							container.appendChild(elem);
						});
					}
				});
			}
		});
	}
	else 
	{
		var elem = document.createElement("div");
		elem.classList.add("no-search");

		var niceText = document.createTextNode("no search information provided. try refining your search.");

		elem.appendChild(niceText);

		container.appendChild(elem);
	}
});