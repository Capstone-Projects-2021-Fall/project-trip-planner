document.addEventListener('DOMContentLoaded', _ =>
{
	var searchSection = new URLSearchParams(window.location.search);
	//null if not found. that works here.
	let itineraryQuery = searchSection.get("itineraryQuery");
	let activityQuery = searchSection.get("activityQuery");
	let lat = searchSection.get("lat");
	let lng = searchSection.get("lng");
	let maxDistance = searchSection.get("maxDistance");

	itineraryQuery = itineraryQuery ? decodeURIComponent(itineraryQuery) : null;
	activityQuery = activityQuery ? decodeURIComponent(activityQuery) : null;
	lat = lat ? decodeURIComponent(lat) : null;
	lng = lng ? decodeURIComponent(lng) : null;
	maxDistance = maxDistance ? decodeURIComponent(maxDistance) : null;

	var container = document.getElementById('itinerary-list-holder');

	let itineraryQueryField = document.GetElementById("itineraryQuery");
	let activityQueryField = document.GetElementById("activityQuery");
	let latField = document.GetElementById("lat");
	let lngField = document.GetElementById("lng");
	let maxDistanceField = document.GetElementById("maxDistance");



	/*
	TODO: add these. if both latitude and longitude aren't provided, these should be ignored. if maxDistance is missing, default to 25 miles.
	var latitude = searchSection.get("latitude");
	var longitude = searchSection.get("longitude");
	var distanceAway = searchSection.get("maxDistance");
	*/

	if (itineraryQuery || activityQuery || (lat && lng && maxDistance))
	{
		raw = JSON.stringify(
			{
				"itineraryQuery": itineraryQuery,
				"activityQuery": activityQuery,
				"latitude": lat,
				"longitude": lng,
				"maxDistanceAway": maxDistance
			});
		var requestOptions =
		{
			method: 'POST',
			body: raw,
		};
		console.log(requestOptions);

		fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/AdvancedItinerarySearch", requestOptions).then(response => fillItineraries(container, response, false));
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