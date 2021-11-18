document.addEventListener('DOMContentLoaded', OnLoad);

function OnLoad(event)
{
	var itineraryID = 20;

	var ItineraryItems = [];

	var title = "This is a TEEEEEST";
	var start = "2022-10-15T12:00:00";
	var end = "2022-10-20T12:00:00";
	var address = "";
	var additionalInformation = "";
	var latitude = 89.6969;
	var longitude = 89.4200;
	var photos = ["1", "2", "3"];

	ItineraryItems.push({
		"ActivityName": title,
		"StartTime": start,
		"EndTime": end,
		"Address": address,
		"AdditionalInformation": additionalInformation,
		"Latitude": latitude,
		"Longitude": longitude,
		"Photos": photos
	});

	title = "This is a second mfing TEEEEEST";
	start = "2023-11-15T12:00:00";
	end = "2023-11-20T12:00:00";
	address = null;
	additionalInformation = null;
	latitude = 89.6969;
	longitude = 89.4200;
	photos = ["1"];

	ItineraryItems.push({
		"ActivityName": title,
		"StartTime": start,
		"EndTime": end,
		"Address": address,
		"AdditionalInformation": additionalInformation,
		"Latitude": latitude,
		"Longitude": longitude,
		"Photos": photos
	});

	var saveEvents = {
		//change itinerary id when creating new itinerary feature is added
		"ItineraryID": itineraryID,
		"ItineraryItems": ItineraryItems
	};

	var json = JSON.stringify(saveEvents);

	var requestOptions = {
		method: 'POST',
		body: json,
	};

	console.log(requestOptions);
}