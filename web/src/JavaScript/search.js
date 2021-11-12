document.addEventListener('DOMContentLoaded', OnLoad);

function OnLoad(event)
{
	var userID = parseInt(GetCookie("id"));

	if (userID == null)
	{
		document.location = "login.html";
	}
    //currently is not validating the users login info. just compares if they have a cookie
    else{
        var container = document.getElementById("search-results");

        //convert user input to json
        let search = getParameterByName("search");
        let raw = {
            "search": search
        }
        raw = JSON.stringify(raw);
        console.log(raw);

        //HTTP request parameters to get the activities with user input
        var searchActivities = {
          method: 'POST',
          body:raw,
          headers: {
            "Access-Control-Allow-Headers":"*"
            }
    
        };
        // make API call with parameters and use promises to get response
        fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/SearchItinerariesByActivity", searchActivities).then(response => searchResults(container, response));
    }
}

function searchResults(container, response)
{
	//container.setHTML()
	//container.innerHTML = 
	if (response.status == 200)
	{
		response.json().then(output =>
		{
            console.log((output));
			//i am expecting a list of json object, the array/list/whatever in an entry called results. if you can do it without this extra step, by all means change it.

			if (output.length == 0)
			{
				var elem = document.createElement("div");
				elem.classList.add("itinerary-empty");
                var niceText = document.createTextNode("No results. That's unfortunate! Try expanding your search area or using more general search terms.");
                elem.appendChild(niceText);
				container.appendChild(elem);
			}
			else
			{
				//json elements are formatted as such:
				output.forEach(element => 
				{			
					var elem = document.createElement("div");
					elem.classList.add("w3-padding-24");

					var nameHolder = document.createElement("div");
					nameHolder.classList.add("item-title");
					var nameContent = document.createTextNode("Activity Name: " + element["ActivityName"]);
					nameHolder.appendChild(nameContent);
					elem.appendChild(nameHolder);

					var startHolder = document.createElement("div");
					startHolder.classList.add("item-date");
					var startContent = document.createTextNode("Starts: " + element["Address"]);
					startHolder.appendChild(startContent);
					elem.appendChild(startHolder);

					var endHolder = document.createElement("div");
					endHolder.classList.add("item-date");
					var endContent = document.createTextNode("Ends: " + element["Latitude"]);
					endHolder.appendChild(endContent);
					elem.appendChild(endHolder);

					elem.onclick = function() 
					{
						document.location = "itineraryFromDatabase.html?id=" + id;
					};

					container.appendChild(elem);
				});
			}
		});
	}
}


/**getParameterByName parses through the query parameters passed when the user chooses an itinerary from
 the list of itineraries. It retrieves the value from the name it is being passed as and then returns that 
value**/
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

