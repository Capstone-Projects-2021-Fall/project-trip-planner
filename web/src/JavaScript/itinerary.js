let map;
let geocoder;

let mapContainer;

//ok, we need to use map in two locations, potentially, but i don't know how the Google Maps API works with that, so i'll just create the div here. Then we can add that div to the place it's being used.
function initMap()
{
	mapContainer = document.createElement("div");
	mapContainer.id = "map";

	map = new google.maps.Map(mapContainer, {
		zoom: 16,
		center: { lat: 37, lng: -95 },
		mapTypeControl: false,
	});
	geocoder = new google.maps.Geocoder();
}

document.addEventListener('DOMContentLoaded', async function ()
{
	//most important: get the itinerary id. if it's missing, we can't do anything here and should display a 404 and immediately stop doing whatever we're doing.
	let itineraryID = getParameterByName("itinerary_id");
	if (!itineraryID)
	{
		document.location = "404.html";
		return;
	}

	/**
	 * Our save itinerary button should only do something if the data changes. Otherwise, we're just killing our database/lambdas with identical data. 
	 * markDirty is a bool we can use to signify the data has changed and thus can actually save. It'll proc on eventChange for the calendar, as well as any itinerary fields when they change.
	 * As of now, i don't really know a good way to save our data so an "undo" reverts us back to a "clean" state, and frankly that's probably out of the scope of this project anyway.
	 * @type {boolean} 
	 */
	var markDirty = false;

	/**
	 * @type {FullCalendar.Calendar}
	 */
	var calendar;

	/**
	 * Displays an event on the calendar as a modal, saving the data to the provided event if the user show chooses. If event is null, this is a "create", otherwise, this is an "update". 
	 * This is essentially a helper function; if the event is not null it will already have all this data, if not, the data will mostly be empty. 
	 * This modal will have a "save" button, as well as a "discard changes" or "cancel" button. if the event is not null, it will also have a "delete" button. 
	 * @param {FullCalendar.Event} event the event to update, or null if a new event should be created instead.
	 * @param {Date} start the time the event starts
	 * @param {Date} end the time the event ends. 
	 * @param {boolean} allDay a fullCalendar argument that deals with all day events, idk what it actually does lol.
	 */
	function displayItemModal(event, start, end, allDay)
	{
		let itemModal = document.getElementById('item-modal'); //need this to toggle visibility.
		let itemModalTitle = document.getElementById('item-modal-title'); //value
		//address is a bit more complicated. I'm just going to get the mode for now.
		let mode = document.querySelector('input[name="address-mode"]:checked')?.value;

		let itemModalStartDate = document.getElementById('item-modal-start'); //value
		let itemModalEndDate = document.getElementById('item-modal-end'); //value
		let itemModalDescription = document.getElementById('item-modal-description'); //value
		let photoCollection = document.getElementById('item-modal-photo-list');

		let itemModalSave = document.getElementById('save-itinerary-item');
		let itemModalCancel = document.getElementById('cancel-itinerary-item');
		let itemModalDelete = document.getElementById('delete-itinerary-item');

		itemModal.classList.remove("item-modal-collapsed");


		itemModalStartDate.value = start;
		itemModalEndDate.value = end;

		if (event) 
		{
			itemModalTitle.value = event.title;
			itemModalAddress.value = event.extendedProps.Address;
			itemModalDescription.value = event.extendedProps.AdditionalInformation;

			//ensure photo collection is clear.
			while (photoCollection.firstChild)
			{
				photoCollection.removeChild(photoCollection.lastChild);
			}

			event.extendedProps.photos.forEach(x =>
			{
				addPhoto(photoCollection, x);
			});

			//google maps api: put the pin on the lat long. 
		}

		itemModalSave.onclick = function ()
		{
			//debounce check
			itemModalSave.disabled = true;

			let title = itemModalTitle.value;
			let start = GetDateOrNull(itemModalStartDate.value);
			let end = GetDateOrNull(itemModalEndDate.value);
			let description = itemModalDescription.value;
			let photoList = document.getElementsByClassName("item-modal-photo-img");
			//photoList isn't an array, it's a HTMLElementCollection. the spread operator aka "[...args]" converts an iterable to an array. array.map is equivalent to C#'s LINQ Select.
			//In simple terms: take the photoList, create a new list with just the url attribute from them.
			let photos = [...photoList].map(x => x.url);

			function addOrUpdateItem(lat, long, address)
			{
				if (event)
				{
					event.setProp("title", title);
					event.setProp("allDay", allDay);
					event.setExtendedProp("Latitude", lat);
					event.setExtendedProp("Longitude", long);
					event.setExtendedProp("AdditionalInformation", description);
					event.setExtendedProp("photos", photos);
					event.setExtendedProp("Address", address);
				}
				else 
				{
					calendar.addEvent({
						title: title,
						start: start,
						end: end,
						allDay: allDay,
						extendedProps: {
							Latitude: lat,
							Longitude: long,
							Address: address,
							AdditionalInformation: description,
							photos: photos
						}
					});
				}
			}
			
			if (isModeValid(mode) && isItemValid(title, start, end)) 
			{
				if (mode == 'Address')
				{
					let address = document.getElementById('item-modal-address').value;
					latlongReq = { address: address };
					geocoder.geocode(latlongReq).then(latlong =>
					{
						var pullShit = latlong.results[0].geometry.location;
						addOrUpdateItem(pullShit.lat(), pullShit.lng(), address);
						//collapse the item modal.
						itemModal.classList.add("item-modal-collapsed");
					});
				}
				else //mode == 'LatLong' //we know this is the case by the isModeValid check.
				{
					let lat = document.getElementById('item-modal-latitude').value;
					let long = document.getElementById('item-modal-longitude').value;
					addOrUpdateItem(lat, long, null);
					//collapse the item modal.
					itemModal.classList.add("item-modal-collapsed");
				}
			}
			else
			{
				//clear debounce
				itemModalSave.disabled = false;
			}
		}
	}

	/**
	 * Checks to see if all the parameters for an itinerary item are valid.
	 * @param {string} title
	 * @param {Date} start
	 * @param {Date} end
	 */
	function isItemValid(title, start, end)
	{
		console.log("Start: " + typeof (start) + ", End: " + typeof (end));
		if (!title || !title.trim())
		{
			return false;
		}
		else if (!start || !end || start.getTime() >= end.getTime())
		{
			return false;
		}
		else
		{
			return true;
		}
	}

	/**
	 * Checks to see if the mode is something we can work with.
	 * @param {string} mode the value obtained from the radio buttons.
	 */
	function isModeValid(mode)
	{
		return mode == 'Address' || mode == 'LatLong';
	}

	function addPhoto(container, url)
	{
		let div = document.createElement('div');
		div.classList.add("item-modal-photo");
		let img = document.createElement("img");
		img.src = url;
		img.classList.add("item-modal-photo-img");
		div.appendChild(img);
		container.appendChild(div);
	}

	/**
	 * Creates a calendar and loads any database data into it.
	 * @param {DBData} initialDB the initial data from the database.
	 */
	function createAndLoadCalendar(initialDB)
	{
		function eventsAltered(arg)
		{
			markDirty = true;
		}

		console.log(initialDB);

		console.log('There');

		let buzz = initialDB.startDate;
		let zzub = initialDB.endDate;
		let calendarEl = document.getElementById('calendar');
		calendar = new FullCalendar.Calendar(calendarEl, {
			initialDate: buzz,
			validRange: { start: buzz, end: zzub },
			initialView: 'timeGridAnyDay',
			nowIndicator: true,
			headerToolbar: {
				left: 'prev,next today',
				center: 'title',
				right: 'timeGridAnyDay,listWeek' // buttons for switching between views
			},
			views: {
				timeGridAnyDay: {
					type: 'timeGrid',
					duration: {
						days: 4
					},
					buttonText: 'Whole Trip'
				}
			},
			navLinks: true, // can click day/week names to navigate views
			editable: true,
			selectable: true,
			selectMirror: true,
			select: function (arg)
			{
				displayItemModal(null, arg.start, arg.end, arg.allDay);
			},
			eventClick: function (arg)
			{
				let event = arg.event;
				displayItemModal(event, event.start, event.end, event.allDay);
			},
			eventAdd: eventsAltered,
			eventChange: eventsAltered,
			eventRemove: eventsAltered,
			//may be able to use eventsSet instead?
			dayMaxEvents: true, // allow "more" link when too many events
			events: []
		});
		var dbEventList = initialDB.items;
		dbEventList.forEach(dbEvent => calendar.addEvent({
			title: dbEvent.title,
			start: dbEvent.start,
			end: dbEvent.end,
			extendedProps: {
				Latitude: dbEvent.extendedProps.Latitude,
				Longitude: dbEvent.extendedProps.Longitude,
				Address: dbEvent.extendedProps.Address,
				AdditionalInformation: dbEvent.extendedProps.AdditionalInformation,
				Photos: dbEvent.extendedProps.Photos,
			}
		}));

		return calendar;
	}


	/**
	 * Fill in calendar with activities from database
	 * @param {number} id the itinerary id to pull from the database with
	 * @returns {DBData} the data from the database. this should not be null but the items may be empty.
	 */
	async function loadItinerary(id)
	{
		//HTTP request parameters to get the itinerary with its ID
		var requestItinerary = {
			method: 'GET',
			headers: {
				"Access-Control-Allow-Headers": "*"
			}

		};

		/**
		 * @type {DBData}
		 */
		var dbItems = null;

		console.log("Hello");

		//
		// make API call with parameters and use promises to get response
		await fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/GetActivitiesForItinerary?page=" + Number(id), requestItinerary).then(async response =>
		{
			if (response.status == 200) 
			{
				await JsonOrNull(response, jsonData => 
				{
					//first, make sure we got something, we could somehow get a null.
					if (jsonData)
					{
						let value = jsonData["ItineraryItems"];
						let name = jsonData["ItineraryName"];
						let startDate = GetDateOrNull(jsonData["StartDate"]);
						let endDate = GetDateOrNull(jsonData["EndDate"]);
						let desc = jsonData['Description'];

						let count = (Object.keys(value).length);
						let coll = [];
						//loops through returned json file to extract every activity from the itinerary
						for (let index = 0; index < count; index++)
						{
							coll.push(new DBItem(value["ActivityName"], value["Latitude"], value["Longitude"], value["Address"], GetDateOrNull(value["StartTime"]), GetDateOrNull(value["EndTime"]), value["AdditionalInformation"], value["Photos"]))
						}
						console.log("Batman");
						dbItems = new DBData(name, startDate, endDate, desc, coll);
						console.log(dbItems);
					}//end json null check
				}//end json data function
				);//end fetch.then
			}
			//indicates the code was successful, but the database had no itinerary with that index. this needs to be handled. 
			else if (response.status == 404)
			{
				console.log("we should redirect to 404 page here.");
			}
		}, failure => //only occurs if the server failed. this means our lambdas are broken. this lets us a put a "something went wrong page"
		{
			console.log(failure.body);
			console.log("we should redirect to 500 page here.");
		});

		return dbItems;
	}

	//Load Itinerary

	let temp = await loadItinerary(itineraryID);
	console.log("here");
	console.log(temp);
	calendar = createAndLoadCalendar(temp);
	calendar.render();


	/** 
	 * Update itinerary everytime the user saves it
	 **/
	document.getElementById("save").addEventListener("click", function ()
	{
		if (markDirty)
		{

			let index = 0;
			let saveEvents = {
				//change itinerary id when creating new itinerary feature is added
				"ItineraryID": itineraryID,
				"ItineraryItems": []
			};
			calendarArr = calendar.getEvents();

			//loop through events from calendar and prepare them into an array to be sent off to the database
			for (index; index < calendarArr.length; index++)
			{
				let title = calendarArr[index]["_def"]["title"];
				let additionalInformation = calendarArr[index]["_def"]["extendedProps"]["AdditionalInformation"];
				let latitude = calendarArr[index]["_def"]["extendedProps"]["Latitude"];
				let longitude = calendarArr[index]["_def"]["extendedProps"]["Longitude"];
				let address = calendarArr[index]["_def"]["extendedProps"]["Address"];
				let start = calendarArr[index]["_instance"]["range"]["start"].toJSON();
				let end = calendarArr[index]["_instance"]["range"]["end"].toJSON();
				let photos = calendarArr[index]["_def"]["extendedProps"]["photos"]

				saveEvents.ItineraryItems.push({
					"ActivityName": title,
					"StartTime": start,
					"EndTime": end,
					"Address": address,
					"AdditionalInformation": additionalInformation,
					"Latitude": latitude,
					"Longitude": longitude,
					"Photos": photos
				});
			}
			var json = JSON.stringify(saveEvents);
			console.log(json);
			// create a JSON object with parameters for API call and store in a variable
			var requestOptions = {
				method: 'POST',
				body: json,
			};
			// make API call with parameters and use promises to get response
			fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/GetActivitiesForItinerary", requestOptions).then(gucci =>
			{
				//maybe pop up "your shit was saved" in a temporary div that collapses after a few seconds or when the user hits the 'x'.
				markDirty = false; //clear the dirty-ness.
			}, notgucci =>
			{
				//maybe pop up "something broke" in a temporary div that collapses after a few seconds or when the user hits the 'x'.
			});
		}
		else
		{
			//maybe pop up "nothing to save" in a temporary div that collapses after a few seconds or when the user hits the 'x'.
		}
	});
});//end of dom content loaded

class DBData
{
	/**
	 * 
	 * @param {string} itineraryName
	 * @param {Date} startDate
	 * @param {Date} endDate
	 * @param {string} description
	 * @param {DBItem[]} items
	 */
	constructor(itineraryName, startDate, endDate, description, items)
	{
		this.itineraryName = itineraryName;
		this.startDate = startDate;
		this.endDate = endDate;
		this.description = description;
		this.items = items;
	}
}

class DBItem
{
	/**
	 * 
	 * @param {string} activityName
	 * @param {number} latitude
	 * @param {number} longitude
	 * @param {string} address
	 * @param {Date} startTime
	 * @param {Date} endTime
	 * @param {string} additionalInformation
	 * @param {string[]} photos
	 */
	constructor(activityName, latitude, longitude, address, startTime, endTime, additionalInformation, photos)
	{
		this.activityName = activityName;
		this.latitude = latitude;
		this.longitude = longitude;
		this.address = address;
		this.startTime = startTime;
		this.endTime = endTime;
		this.additionalInformation = additionalInformation;
		this.photos = photos;
	}
}