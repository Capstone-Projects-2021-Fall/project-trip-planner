/**
 * Get the value of a cookie based on the name provided, in string format.
 * @param {string} cname name of the cookie to get.
 * @returns {string} the value of the cookie, or null if no cookie with the given name exists.
 */
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

/**
 * Given the JSON from an HTTP Response (or hard-code, we're not picky, i guess) and the status code returned from that response, fill the itineraries into the container. 
 * This function can be for both the account and itinerary search page, even though the itinerary search page also provides the creator information. To handle this, an isAccount flag is used.
 * @param {Element} container The container element (usually a 'div' tag) to place all the create itinerary items in.
 * @param {JSON} jsonListOfItems the list of itinerary items in a json format.
 * @param {number} status the response status from the HTTP Response.
 * @param {boolean} isAccount true if this is going on the account page, false if it's the itinerary search page.
 * @
 */
function fillItineraries(container, jsonListOfItems, status, isAccount, ownPage = true)
{
	if (status == 200)
	{
		let res = jsonListOfItems;
		if (!res || res.length == 0)
		{

			var elem = document.createElement("div");
			elem.classList.add("itinerary-empty");

			var niceText;
			if (isAccount && ownPage)
			{
				niceText = document.createTextNode("You have no itineraries. Create one!");
			}
			else if (isAccount)
			{
				niceText = document.createTextNode("This user has no itineraries.");
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

/**
 * Acts like response.JSON(), but properly handles a null object, response.JSON() does not. 
 * @param {Response} response the http response to parse.
 * @param {function(JSON): Promise} callback the callback to process the json object.
 */
async function JsonOrNull(response, callback)
{
	await response.text().then(text =>
	{
		var result;
		if (text)
		{
			result = JSON.parse(text);
		}
		else 
		{
			result = null;
		}
		return callback(result);
	});
}

/**
 * Gets the 'ID' cookie value, or null if no such cookie exists.
 * @returns {number} an integer for the user id, or null. 
 */
function GetIDCookie()
{
	var id = GetCookie("id");
	return id ? parseInt(id) : null;
}

//Not strictly speaking required, but good practice i guess.
/**
 * Parse the given string as a Date object. If the data can be parsed as a date but does not represent a valid date, returns null instead.
 * @param {string} value the string to parse as a Date object.
 * @returns {Date} the date the string represents, or null if no such date can be found.
 */
module.exports = function GetDateTimeOrNull(value)
{
	var temp = new Date(value);
	if (!temp || isNaN(temp))
	{
		return null;
	}
	else
	{
		return temp;
	}
}


/**
 * JS doesn't have a pure "date" format (Yet. Temporal looks promising), and making it a date adds a bunch of shit. This checks to see if we are in "YYYY-MM-DD" format, returns the string unaltered if it is, or null if it isn't.
 * @param {string} value the current representation of the string
 * @returns {string} the original string if it represents a Date (and not a DateTime), or null if it does not
 */
function GetDateOrNull(value)
{
	if (!value)
	{
		return null;
	}
	var regEx = /^\d{4}-\d{2}-\d{2}$/;
	if (!value.match(regEx)) return false;  // Invalid format
	var d = new Date(value);
	var dNum = d.getTime();
	if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
	return d.toISOString().slice(0, 10) === value ? value : null;
}

/**
 * Checks to see if a string is null or whitespace. Returns true if it is, false if not.
 *
 * @param {string} str - The text to check
 * @returns {boolean} - true if null or whitespace, false if valid.
 */
function IsNullOrWhitespace(str)
{
	return !str || !str.trim();
}

/**
 * Checks to see if a string is null or whitespace. If it is, returns null, otherwise returns the string, unaltered.
 *
 * @param {string} str - The text to check
 * @returns {string} - the unaltered string, or null if it is invalid.
 */
function GetValidStringOrNull(str)
{
	return IsNullOrWhitespace(str) ? null : str;
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate)
{
	var timeout;
	return function ()
	{
		var context = this, args = arguments;
		var later = function ()
		{
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

/**
 * retrieves the parameter of the given name from the url, or null if no such parameter exists.
 * @param {string} name - the name of the query parameter to check.
 * @returns {string} - the decoded string associated with that query parameter, or null if the query parameter has no value or does not exist.
 */
function getParameterByName(name)
{
	var searchSection = new URLSearchParams(window.location.search);
	var result = searchSection.get(name);
	//truthy conversion is false if null or empty. i'll leave the result unaltered if either case, as the empty string may be valid and using null instead would not be.
	return result ? decodeURIComponent(result) : result;
}


function GetMapStyling()
{
	return MAP_STYLING;
}

/**
 * A complex web of formatting rules to make the google map integration we're using have less shit all over the place. It was interfering with our UI.
 * See https://mapstyle.withgoogle.com/
 * @type {JSON} 
 */
const MAP_STYLING =
	[
		{
			"featureType": "landscape",
			"stylers": [
				{
					"visibility": "simplified"
				}
			]
		},
		{
			"featureType": "landscape",
			"elementType": "labels.icon",
			"stylers": [
				{
					"visibility": "off"
				}
			]
		},
		{
			"featureType": "poi",
			"stylers": [
				{
					"visibility": "simplified"
				}
			]
		},
		{
			"featureType": "poi",
			"elementType": "labels.icon",
			"stylers": [
				{
					"visibility": "off"
				}
			]
		},
		{
			"featureType": "poi.park",
			"stylers": [
				{
					"visibility": "simplified"
				}
			]
		},
		{
			"featureType": "poi.park",
			"elementType": "geometry.fill",
			"stylers": [
				{
					"visibility": "off"
				}
			]
		},
		{
			"featureType": "poi.park",
			"elementType": "geometry.stroke",
			"stylers": [
				{
					"visibility": "off"
				}
			]
		},
		{
			"featureType": "poi.park",
			"elementType": "labels.icon",
			"stylers": [
				{
					"visibility": "off"
				}
			]
		},
		{
			"featureType": "road",
			"elementType": "labels.icon",
			"stylers": [
				{
					"visibility": "off"
				}
			]
		},
		{
			"featureType": "transit",
			"stylers": [
				{
					"visibility": "off"
				}
			]
		}
	]