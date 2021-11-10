document.addEventListener('DOMContentLoaded', OnLoad);
});

function OnLoad(event)
{
	var userID = parseInt(GetCookie("id"));

	if (userID == null)
	{
		document.location = "login.html";
	}
	else 
	{
		var container = document.getElementById("itinerary-list-holder");
		

		fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/GetUserItineraries", postItinerary).then(response => fillItineraries(container, response, true);
	}
}

function fillItineraries(container, response, isUserSearch)
{
	//container.setHTML()
	//container.innerHTML = 
	if (response.status == 200)
	{
		var userID = parseInt(GetCookie("id"));

		response.json().then(output =>
		{
			//i am expecting a list of json object, the array/list/whatever in an entry called results. if you can do it without this extra step, by all means change it.
			var results = output["results"];

			if (results.length == 0)
			{

				var elem = document.createElement("div");
				elem.classList.add("itinerary-empty");

				var niceText;
				if (isUserSearch)
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
				results.forEach(element => 
				{
					
					var elem = document.createElement("div");
					elem.classList.add("itinerary-item");

					var nameHolder = document.createElement("div");
					nameHolder.classList.add("item-title");
					var nameContent = document.createTextNode(element["ItineraryName"]);
					nameHolder.appendChild(nameContent);
					elem.appendChild(nameHolder);

					var startHolder = document.createElement("div");
					startHolder.classList.add("item-date");
					var startContent = document.createTextNode("Starts: "element["StartDate"]);
					startHolder.appendChild(startContent);
					elem.appendChild(startHolder);

					var endHolder = document.createElement("div");
					endHolder.classList.add("item-date");
					var endContent = document.createTextNode("Ends: " + element["EndDate"]);
					endHolder.appendChild(endContent);
					elem.appendChild(endHolder);

					var nameHolder = document.createElement("div");
					nameHolder.classList.add("item-author");


					var creatorText = "Creator: " element["CreatorName"];
					var creatorID = element["CreatorID"];
					var id = element["ItineraryID"];

					if (creatorID == userID)
					{
						creatorText += " (you)";
					}

					var nameContent= document.createTextNode(creatorText);
					nameHolder.appendChild(nameContent);
					elem.appendChild(nameHolder);

					elem.onclick = function() 
					{
						document.location = "itinerary.html?id=" + id;
					};

					container.appendChild(elem);
				});
			}
		});
	}

	

}