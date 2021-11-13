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
		response.json().then(res =>
		{
			//console.log(res);
			console.log("Type: " + typeof(res));
			if (res.length == 0)
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

					var id = element["ItineraryID"];

					//User search does not pull the creator id or name because it's the same as the current user. so these wouldn't be valid.
					if (!isAccount)
					{
						var nameHolder = document.createElement("div");
						nameHolder.classList.add("item-author");

						var userID = parseInt(GetCookie("id"));

						var creatorText = "Creator: " + element["CreatorName"];
						var creatorID = element["CreatorID"];
					
						//may be null if a user not logged in does a search. 
						if (userID && creatorID == userID)
						{
							creatorText += " (you)";
						}

						var nameContent= document.createTextNode(creatorText);
						nameHolder.appendChild(nameContent);
						elem.appendChild(nameHolder);
					}
					elem.onclick = function() 
					{
						document.location = "itineraryRewrite.html?id=" + id;
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

function PerformSearch()
{
	var selectBox = document.getElementById("dropdown");
	var content = document.getElementById("quick-search").value;

	if (selectBox.value == "Itineraries")
	{
		document.location = "itinerarySearch.html?query=" + encodeURIComponent(content);
	}
	//fallback to users if something breaks. should just be users and itineraries but whatever.
	else if (selectBox.value == "Users")
	{
		document.location = "userSearch.html?query=" + encodeURIComponent(content);
	}
	else if (selectBox.value == "Activities"){
		document.location = "activitySearch.html?query=" + encodeURIComponent(content);
	}
}