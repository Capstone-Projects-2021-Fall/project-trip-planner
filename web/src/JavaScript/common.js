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

	return null;
}

function fillItineraries(container, response, isAccount)
{
	if (response.status == 200)
	{
		JsonOrNull(response, res =>
		{

			//console.log(res);
			console.log("Type: " + typeof (res));
			if (!res || res.length == 0)
			{

				var elem = document.createElement("div");
				elem.classList.add("itinerary-empty");

				var niceText;
				if (isAccount)
				{
					niceText = document.createTextNode("You have no itineraries. Create one!");
				}
				else 
				{
					niceText = document.createTextNode("No results. That's unfortunate! Try expanding your search area or using more general search terms.");
				}
				elem.appendChild(niceText);

				container.appendChild(elem);
			}
			else
			{
				//json elements are formatted as such:
				for (const element of res)
				{

					var elem = document.createElement("div");
					elem.classList.add("itinerary-item");

					var nameHolder = document.createElement("div");
					nameHolder.classList.add("item-title");
					var nameContent = document.createTextNode("Itinerary Name: " + element["ItineraryName"]);
					nameHolder.appendChild(nameContent);
					elem.appendChild(nameHolder);

					var startHolder = document.createElement("div");
					startHolder.classList.add("item-date");
					var startContent = document.createTextNode("Starts: " + element["StartDate"]);
					startHolder.appendChild(startContent);
					elem.appendChild(startHolder);

					var endHolder = document.createElement("div");
					endHolder.classList.add("item-date");
					var endContent = document.createTextNode("Ends: " + element["EndDate"]);
					endHolder.appendChild(endContent);
					elem.appendChild(endHolder);

					let _id = element["ItineraryID"];

					//User search does not pull the creator id or name because it's the same as the current user. so these wouldn't be valid.
					if (!isAccount)
					{
						var nameHolder = document.createElement("div");
						nameHolder.classList.add("item-author");

						var userID = GetIDCookie();

						var creatorText = "Creator: " + element["CreatorName"];
						var creatorID = element["CreatorID"];

						//may be null if a user not logged in does a search. 
						if (userID && creatorID == userID)
						{
							creatorText += " (you)";
						}

						var nameContent = document.createTextNode(creatorText);
						nameHolder.appendChild(nameContent);
						elem.appendChild(nameHolder);
					}
					elem.onclick = function () 
					{
						let k = _id;
						document.location = "itinerary.html?itinerary_id=" + k;
					};

					container.appendChild(elem);
				};
			}
		});
	}
	else 
	{
		var elem = document.createElement("div");
		elem.classList.add("something-broke");

		var niceText = document.createTextNode("something went wrong. Try refreshing the page?");

		elem.appendChild(niceText);

		container.appendChild(elem);
	}
}

//function JsonOrNull(response)
//{
//	response.text().then(text =>
//	{
//		console.log("'" + text + "'");
//		if (text)
//		{
//			console.log("parsing");
//			return JSON.parse(text);
//		}
//		else 
//		{
//			console.log("null");
//			return null;
//		}
//	});
//}

function PerformSearch()
{
	var selectBox = document.getElementById("dropdown");
	var content = document.getElementById("quick-search").value;

	if (selectBox.value == "Itineraries")
	{
		document.location = "itinerarySearch.html?query=" + encodeURIComponent(content);
	}
	else if (selectBox.value == "Activities")
	{
		document.location = "itinerarySearch.html?query=" + encodeURIComponent(content) + "&mode=ByActivity";
	}
	//fallback to users if something breaks. should just be these three but whatever.
	else //if (selectBox.value == "Users")
	{
		document.location = "userSearch.html?query=" + encodeURIComponent(content);
	}
}

function JsonOrNull(response, callback)
{
	response.text().then(text =>
	{
		var result;
		if (text)
		{
			console.log("parsing");
			result = JSON.parse(text);
		}
		else 
		{
			console.log("null");
			result = null;
		}
		callback(result);
	});
}

function GetIDCookie()
{
	var id = GetCookie("id");
	return id ? parseInt(id) : null;
}