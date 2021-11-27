var map;
var marker;
var geocoder;
var searchSection = new URLSearchParams(window.location.search);

function initMap()
{
	let mapContainer = document.getElementById('map');
	map = new google.maps.Map(mapContainer, {
		zoom: 12,
		center: { lat: 37, lng: -95 },
		mapTypeControl: false,
		streetViewControl: false,
		clickableIcons: false,
		fullscreenControl: false,
		styles: GetMapStyling(),
	});

	geocoder = new google.maps.Geocoder();

	let lat = searchSection.get("lat");
	let lng = searchSection.get("lng");

	let position;
	let m;
	if (lat && lng && isFinite(lat) && isFinite(lng))
	{
		position = { lat: Number(lat), lng: Number(lng) };
		m = map;
		map.setCenter(position);
		geocoder.geocode({ location: position }).then(response =>
		{
			if (response.results[0])
			{
				let addressField = document.getElementById("address");
				addressField.value = response.results[0].formatted_address;
			}
		});
	}
	else
	{
		position = { lat: 0, lng: 0 };
		m = null;
	}

	marker = new google.maps.Marker({
		position: position,
		map: m,
		draggable: false,
	});
}

document.addEventListener('DOMContentLoaded', _ =>
{
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

	let itineraryQueryField = document.getElementById("itineraryQuery");
	let activityQueryField = document.getElementById("activityQuery");
	let latField = document.getElementById("lat");
	let lngField = document.getElementById("lng");
	let maxDistanceField = document.getElementById("maxDistance");

	let coordContainer = document.getElementById("coordinate-container");
	let coordEnabler = document.getElementById("enableLatLong");

	coordEnabler.addEventListener("click", _ => CheckboxToggle());
	coordEnabler.addEventListener("change", _ => CheckboxToggle());

	let addressField = document.getElementById("address");

	function SetMarker(loc, draggable)
	{
		if (!loc)
		{
			marker.setMap(null);
		}
		else
		{
			marker.setMap(map);
			marker.setPosition(loc);
			marker.setDraggable(draggable);
			map.setCenter(loc);
		}
	}

	addressField.addEventListener("blur", _ =>
	{
		if (!IsNullOrWhitespace(addressField.value))
		{
			geocoder.geocode({ address: addressField.value }).then(x =>
			{
				const { results } = x;

				let loc = results[0].geometry.location;
				SetMarker(loc, coordEnabler.checked);

				latField.value = Number(loc.lat()).toFixed(4);
				lngField.value = Number(loc.lng()).toFixed(4);
			});
		}
		else
		{
			SetMarker(null, coordEnabler.checked);
			latField.value = null;
			lngField.value = null;
		}
	});

	function CheckboxToggle()
	{
		if (coordEnabler.checked)
		{
			coordContainer.classList.remove("hidden-by-default");
			latField.readOnly = false;
			lngField.readOnly = false;
		}
		else
		{
			coordContainer.classList.add("hidden-by-default");
			latField.readOnly = true;
			lngField.readOnly = true;
		}
	}

	/*
	TODO: add these. if both latitude and longitude aren't provided, these should be ignored. if maxDistance is missing, default to 25 miles.
	var latitude = searchSection.get("latitude");
	var longitude = searchSection.get("longitude");
	var distanceAway = searchSection.get("maxDistance");
	*/

	itineraryQueryField.value = itineraryQuery;
	activityQueryField.value = activityQuery;
	latField.value = lat;
	lngField.value = lng;
	maxDistanceField.value = maxDistance;

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

		fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/AdvancedItinerarySearch", requestOptions).then(response =>
		{
			let status = response.status;
			JsonOrNull(response, x => fillItineraries(container, x, status, false));
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