let modalMap;
let modalMarker = null;
let calendarMap;
let geocoder;

let userID = null;

let inEditMode = false;

//ok, we need to use map in two locations, potentially, but i don't know how the Google Maps API works with that, so i'll just create the div here. Then we can add that div to the place it's being used.
function initMap()
{
	let modalContainer = document.getElementById('item-modal-map');
	modalMap = new google.maps.Map(modalContainer, {
		zoom: 12,
		center: { lat: 37, lng: -95 },
		mapTypeControl: false,
		streetViewControl: false,
		clickableIcons: false,
		fullscreenControl: false,
		styles: GetMapStyling(),
	});

	geocoder = new google.maps.Geocoder();
}

//NOTE TO SELF: WE CAN TOGGLE SELECTIONS ON BY going calendar.setOption('selectable', true);
//this means we can default to view mode, and give the user an "enable editing" button. 

document.addEventListener('DOMContentLoaded', async function ()
{
	//most important: determine what's going on here. This page is basically responsible for our entire application, and has a lot of functionality, but as a result is a pain to work with.
	//First, we need two things: the state of the If this page does not have any url parameters, it means we are creating a new itinerary from scratch. However, this requires a user be logged in. If there are no parameters and no one is logged in, redirect them to the login page.
	//
	//
	let itineraryID = getParameterByName("itinerary_id");
	let displayMode = getParameterByName("mode");
	userID = GetIDCookie();

	if (!displayMode && !itineraryID && !userID)
	{
		document.location = "itinerarySearch.html";
	}

	if (itineraryID)
	{
		itineraryID = Number(itineraryID);
	}
	//if the user somehow forces us to default to edit mode. cool. 
	if (displayMode == "edit")
	{
		inEditMode = true;
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

		//edit: nope, i need it. i'm dumb.
		let addressMode = document.getElementById('item-modal-radio-address');
		let latLongMode = document.getElementById('item-modal-radio-latlong');

		let addressField = document.getElementById('item-modal-address');

		let latField = document.getElementById('item-modal-latitude');
		let longField = document.getElementById('item-modal-longitude');

		let updateCoordBtn = document.getElementById('use-this-address-btn');
		let autoUpdateCoordBox = document.getElementById('advanced-mode-auto-update');
		let autoUpdateLabel = document.getElementById("auto-update-label");


		let itemModalStartDate = document.getElementById('item-modal-start'); //value
		let itemModalEndDate = document.getElementById('item-modal-end'); //value
		let itemModalDescription = document.getElementById('item-modal-description'); //value
		let photoCollection = document.getElementById('item-modal-photo-list');

		let itemModalSave = document.getElementById('save-itinerary-item');
		let itemModalCancel = document.getElementById('cancel-itinerary-item');
		let itemModalDelete = document.getElementById('delete-itinerary-item');
		let itemModalRevert = document.getElementById('revert-itinerary-item');
		
		itemModal.classList.remove("item-modal-collapsed");
		itemModalSave.disabled = false;

		itemModalStartDate.value = start;
		itemModalEndDate.value = end;

		let isLLMode = false;

		if (event)
		{
			itemModalTitle.value = event.title;
			addressField.value = event.extendedProps.Address;
			itemModalDescription.value = event.extendedProps.AdditionalInformation;
			latField.value = event.extendedProps.Latitude;
			longField.value = event.extendedProps.Longitude;

			let displayMe;
			let draggable;
			if (event.extendedProps.Address)
			{
				addressMode.checked = true;
				displayMe = addressMode;
				draggable = false;
				//this should be false, but handle radio only updates stuff if it's toggled. the initial case, therefore, needs to be the opposite so handle radio actually does what it should
				isLLMode = true;
			}
			else
			{
				latLongMode.checked = true;
				displayMe = latLongMode;
				draggable = true;
				//this should be true, but handle radio only updates stuff if it's toggled. the initial case, therefore, needs to be the opposite so handle radio actually does what it should
				isLLMode = false;
			}
			//console.lo

			createOrUpdateMarker({ lat: Number(latField.value), lng: Number(longField.value) }, draggable);
			handleRadio(displayMe);

			//ensure photo collection is clear.
			while (photoCollection.firstChild)
			{
				photoCollection.removeChild(photoCollection.lastChild);
			}

			event.extendedProps.Photos.forEach(x =>
			{
				addPhoto(photoCollection, x);
			});

			itemModalDelete.classList.remove('nothing-to-change');
			itemModalRevert.classList.remove('nothing-to-change');

			//google maps api: put the pin on the lat long. 
			
		}
		else
		{
			itemModalDelete.classList.add('nothing-to-change');
			itemModalRevert.classList.add('nothing-to-change');

			if (modalMarker)
			{
				modalMarker.setMap(null);
			}
		}

		//wire up the save
		itemModalSave.onclick = function ()
		{
			//debounce check
			itemModalSave.disabled = true;

			let title = itemModalTitle.value;
			let start = GetDateTimeOrNull(itemModalStartDate.value);
			let end = GetDateTimeOrNull(itemModalEndDate.value);
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
					event.setAllDay(allDay);
					event.setExtendedProp("Latitude", lat);
					event.setExtendedProp("Longitude", long);
					event.setExtendedProp("AdditionalInformation", description);
					event.setExtendedProp("Photos", photos);
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
							Photos: photos
						}
					});
				}
			}
			
			if (isItemValid(title, start, end) && modalMarker) 
			{
				addOrUpdateItem(Number(latField.value), Number(longField.value), IsNullOrWhitespace(addressField.value) ? null : addressField.value);
					//collapse the item modal.
				clearFieldsAndClose();
			}
			else
			{
				//clear debounce
				itemModalSave.disabled = false;
			}
		}

		//cancel
		itemModalCancel.onclick = function ()
		{
			clearFieldsAndClose();
		} 

		function clearFieldsAndClose()
		{
			itemModalTitle.value = "";
			itemModalDescription.value = "";

			addressField.value = "";
			latField.value = "";
			longField.value = "";
			event = null;

			//ensure photo collection is clear.
			while (photoCollection.firstChild)
			{
				photoCollection.removeChild(photoCollection.lastChild);
			}

			itemModal.classList.add("item-modal-collapsed");

			//clears marker from map.
			if (modalMarker) 
			{
				modalMarker.setMap(null);
			}
		}

		//revert
		itemModalRevert.onclick = function()
		{
			if (event)
			{
				itemModalTitle.value = event.title;
				addressField.value = event.extendedProps.Address;
				itemModalDescription.value = event.extendedProps.AdditionalInformation;
				latField.value = event.extendedProps.Latitude;
				longField.value = event.extendedProps.Longitude;

				//ensure photo collection is clear.
				while (photoCollection.firstChild)
				{
					photoCollection.removeChild(photoCollection.lastChild);
				}
				//and reload them.
				event.extendedProps.Photos.forEach(x =>
				{
					addPhoto(photoCollection, x);
				});
			}
			else
			{
				itemModalTitle.value = "";
				itemModalDescription.value = "";

				addressField.value = "";
				latField.value = "";
				longField.value = "";

				//ensure photo collection is clear.
				while (photoCollection.firstChild)
				{
					photoCollection.removeChild(photoCollection.lastChild);
				}
			}
		};
		//and delete
		itemModalDelete.onclick = function()
		{
			if (event)
			{
				event.remove();
			}
			clearFieldsAndClose();
		}

		//wire up the map
		function createOrUpdateMarker(loc, draggable, center = true)
		{
			if (!modalMarker)
			{
				modalMarker = new google.maps.Marker({
					position: loc,
					map: modalMap,
					draggable: draggable,
				});

				modalMarker.addListener("dragend", e =>
				{
					let loc = e.latLng;
					latField.value = Number(loc.lat()).toFixed(4);
					longField.value = Number(loc.lng()).toFixed(4);
				});

				modalMarker.addListener("drag", e =>
				{
					let loc = e.latLng;
					latField.value = Number(loc.lat()).toFixed(4);
					longField.value = Number(loc.lng()).toFixed(4);
				});
			}
			else
			{
				modalMarker.setMap(modalMap);
				modalMarker.setPosition(loc);
				modalMarker.setDraggable(draggable);
			}

			if (center)
			{
				modalMap.setCenter(loc);
			}
		}

		function handleRadio(srcElement)
		{
			let latFieldLabel = document.getElementById("lat-label");
			let longFieldLabel = document.getElementById("long-label");
			//lat long mode. 
			if (srcElement.value == "LatLong" && !isLLMode)
			{
				latField.readOnly = false;
				longField.readOnly = false;

				latFieldLabel.classList.remove("label-readonly");
				longFieldLabel.classList.remove("label-readonly");

				if (modalMarker)
				{
					modalMarker.setDraggable(true);
				}

				updateCoordBtn.classList.remove("hidden-on-address-mode");
				autoUpdateCoordBox.classList.remove("hidden-on-address-mode");
				autoUpdateLabel.classList.remove("hidden-on-address-mode");

				isLLMode = true;
			}
			//fallback to address mode. Code will not break if you add a third one that does nothing.
			else if (srcElement.value != "LatLong" && isLLMode)
			{
				latField.readOnly = true;
				longField.readOnly = true;

				latFieldLabel.classList.add("label-readonly");
				longFieldLabel.classList.add("label-readonly");

				if (modalMarker)
				{
					modalMarker.setDraggable(false);
				}

				updateCoordBtn.classList.add("hidden-on-address-mode");
				autoUpdateCoordBox.classList.add("hidden-on-address-mode");
				autoUpdateLabel.classList.add("hidden-on-address-mode");

				isLLMode = false;
			}
		}

		function submitAddressField(force = false)
		{
			if (!IsNullOrWhitespace(addressField.value))
			{
				geocoder.geocode({ address: addressField.value }).then(x =>
				{
					const { results } = x;

					let loc = results[0].geometry.location;
					if (addressMode.checked || autoUpdateCoordBox.checked || force)
					{
						createOrUpdateMarker(loc, latLongMode.checked, true);
					}
					else
					{
						modalMap.setCenter(loc);
					}
					latField.value = Number(loc.lat()).toFixed(4);
					longField.value = Number(loc.lng()).toFixed(4);
				}).catch(y =>
				{ /**/
					//log something in addressWarning?
				});
			}
		}

		modalMap.addListener("click", function (e)
		{
			if (latLongMode.checked)
			{
				let loc = e.latLng;
				createOrUpdateMarker(loc, true, false);
				latField.value =  Number(loc.lat()).toFixed(4);
				longField.value = Number(loc.lng()).toFixed(4);
			}
		});

		updateCoordBtn.addEventListener("click", _ =>
		{
			if (latLongMode.checked)
			{
				submitAddressField(true);
			}
		});

		//wire up the address to mark the map.
		addressField.addEventListener("blur", _ => submitAddressField());

		autoUpdateCoordBox.addEventListener("click", _ =>
		{
			if (autoUpdateCoordBox.checked) 
			{
				updateCoordBtn.disabled = true;
				if (latLongMode)
				{
					submitAddressField();
				}
			}
			else
			{
				updateCoordBtn.disabled = false;
			}
		});

		latLongMode.addEventListener("click", _ => handleRadio(latLongMode));
		addressMode.addEventListener("click", _ => handleRadio(addressMode));

		
	}

	/**
	 * Checks to see if all the parameters for an itinerary item are valid.
	 * @param {string} title
	 * @param {Date} start
	 * @param {Date} end
	 */
	function isItemValid(title, start, end)
	{
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
		console.log("Url:" + url);
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

		console.log(new Date().toLocaleString().substring(0, 10));
		//if the initial DB is null, use the current date. that's actually harder than it sounds. 
		//workaround for the JS Date being terrible. new Date() returns UTC now. getting the date from that is wrong if your local offset is not 0. 
		//	(for us, that means EST, so anything > 7PM is treated as the next day)
		//so, get the utc now, convert it to local format, strip off the time, then convert that to a date (which sets hour, minute, second set to UTC 0:00:00), and then strip off the time from that.
		//it's ugly as all hell but it's what we've got.
		let buzz = GetDateOrNull(initialDB?.startDate) ?? new Date(new Date().toLocaleString().substring(0, 10)).toISOString().substring(0,10);
		
		let start = document.getElementById("itinerary-startdate");
		let end = document.getElementById("itinerary-enddate");

		let calendarEl = document.getElementById('calendar');
		calendar = new FullCalendar.Calendar(calendarEl, {
			initialDate: buzz,
			validRange: _ =>
			{
				let zzub = GetDateOrNull(end.value);
				if (zzub) 
				{
					let zzubTemp = new Date(zzub);
					zzubTemp.setUTCDate(zzubTemp.getUTCDate() + 1);
					zzub = zzubTemp.toISOString().substring(0, 10);
				}

				return { start: GetDateOrNull(start.value) ?? start.defaultValue, end: GetDateOrNull(zzub) ?? end.defaultValue }
			},
			initialView: 'timeGridAnyDay',
			nowIndicator: true,
			headerToolbar: {
				left: 'prev,next today',
				center: 'title',
				right: 'timeGridAnyDay,listViewDaily,listViewYearly' // buttons for switching between views
			},
			views: {
				timeGridAnyDay: {
					type: 'timeGrid',
					duration: {
						days: 4
					},
					buttonText: 'Whole Trip'
				},

				listViewDaily:
				{
					type: 'listWeek',
					buttonText: 'Daily View'
				},

				listViewYearly:
				{
					type: 'listYear',
					buttonText: 'Yearly View'
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

		console.log("DbEvent Photos: ");
		

		var dbEventList = initialDB?.items ?? [];
		dbEventList.forEach(dbEvent =>
		{
			dbEvent.photos
			calendar.addEvent({
				title: dbEvent.activityName,
				start: dbEvent.startTime,
				end: dbEvent.endTime,
				extendedProps: {
					Latitude: dbEvent.latitude,
					Longitude: dbEvent.longitude,
					Address: dbEvent.address,
					AdditionalInformation: dbEvent.additionalInformation,
					Photos: dbEvent.photos.map(x=> x["URL"]),
				}
			});
		});

		return calendar;
	}

	/**
	 * Fill in calendar with activities from database
	 * @param {number} id the itinerary id to pull from the database with
	 * @returns {DBData} the data from the database. this should not be null but the items may be empty.
	 */
	async function loadItinerary(id)
	{
		if (!id)
		{
			return null;
		}

		//HTTP request parameters to get the itinerary with its ID
		var requestItinerary = {
			method: 'GET',
			headers: {
				"Access-Control-Allow-Headers": "*",
				"Access-Control-Allow-Origin": "*"
			}

		};

		/**
		 * @type {DBData}
		 */
		var dbItems = null;

		//
		// make API call with parameters and use promises to get response
		await fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/CreateReadUpdateItinerary?page=" + Number(id), requestItinerary).then(async response =>
		{
			if (response.status == 200) 
			{
				await JsonOrNull(response, jsonData => 
				{
					//first, make sure we got something, we could somehow get a null.
					if (jsonData)
					{
						let values = jsonData["ItineraryItems"];
						let name = jsonData["ItineraryName"];
						let startDate = GetDateOrNull(jsonData["StartDate"]);
						let endDate = GetDateOrNull(jsonData["EndDate"]);
						let desc = jsonData['Description'];

						let coll = [];
						//loops through returned json file to extract every activity from the itinerary
						values.forEach(value =>
						{
							coll.push(new DBItem(value["ActivityName"], value["Latitude"], value["Longitude"], value["Address"], GetDateTimeOrNull(value["StartTime"]), GetDateTimeOrNull(value["EndTime"]), value["AdditionalInformation"], value["Photos"]))
						});
						dbItems = new DBData(name, startDate, endDate, desc, coll);
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

	/**
	 * 
	 * @param {DBData} dbData
	 */
	function initializeNonCalendarData(dbData)
	{
		let title = document.getElementById("itinerary-title");
		let start = document.getElementById("itinerary-startdate");
		let end = document.getElementById("itinerary-enddate");
		let description = document.getElementById("itinerary-description");

		title.value = dbData?.itineraryName ?? null;
		start.value = dbData?.startDate ?? "";
		end.value = dbData?.endDate ?? "";
		description.value = dbData?.description ?? null;

		start.defaultValue = start.value ?? "1970-01-01";
		end.defaultValue = end.value ?? "9999-12-31";

		title.defaultValue = title.value;
		description.defaultValue = description.value;

		//workaround to refresh the display. Go to the currently selected date, refresh.
		start.addEventListener("blur", _ =>
		{
			let temp = GetDateOrNull(start.value);
			if (temp) 
			{
				markDirty |= start.defaultValue != temp;
				start.defaultValue = temp;
			}
			calendar.gotoDate(calendar.getDate());
		});

		end.addEventListener("blur", _ =>
		{
			let temp = GetDateOrNull(end.value);
			if (temp) 
			{
				markDirty |= end.defaultValue != temp;
				end.defaultValue = temp;
			}
			calendar.gotoDate(calendar.getDate());
		});

		title.addEventListener("blur", _ =>
		{
			if (title.value != title.defaultValue)
			{
				markDirty = true;
				title.defaultValue = title.value;
			}
		});

		description.addEventListener("blur", _ =>
		{
			if (description.value != description.defaultValue)
			{
				markDirty = true;
				description.defaultValue = description.value;
			}
		});
	}

	//Load Itinerary

	let temp = await loadItinerary(itineraryID);
	initializeNonCalendarData(temp);
	calendar = createAndLoadCalendar(temp);
	calendar.render();


	/** 
	 * Update itinerary everytime the user saves it
	 **/
	async function handleSaving()
	{
		if (markDirty)
		{
			let title = document.getElementById("itinerary-title");
			let start = document.getElementById("itinerary-startdate");
			let end = document.getElementById("itinerary-enddate");
			let description = document.getElementById("itinerary-description");

			let saveEvents = {
				//change itinerary id when creating new itinerary feature is added
				"ItineraryID": itineraryID,
				"UserID": userID,
				"Title": title.value,
				"StartDate": start.value,
				"EndDate": end.value,
				"Description": description.value,
				"ItineraryItems": []
			};
			calendarArr = calendar.getEvents();

			//loop through events from calendar and prepare them into an array to be sent off to the database
			for (let index = 0; index < calendarArr.length; index++)
			{
				let title = calendarArr[index]["_def"]["title"];
				let additionalInformation = calendarArr[index]["_def"]["extendedProps"]["AdditionalInformation"];
				let latitude = calendarArr[index]["_def"]["extendedProps"]["Latitude"];
				let longitude = calendarArr[index]["_def"]["extendedProps"]["Longitude"];
				let address = calendarArr[index]["_def"]["extendedProps"]["Address"];
				let start = calendarArr[index]["_instance"]["range"]["start"].toJSON();
				let end = calendarArr[index]["_instance"]["range"]["end"].toJSON();
				let photos = calendarArr[index]["_def"]["extendedProps"]["Photos"]

				saveEvents["ItineraryItems"].push({
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
			await fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/CreateReadUpdateItinerary", requestOptions).then(gucci =>
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
	}

	document.getElementById("save-cont").addEventListener("click", function ()
	{
		handleSaving();
	});

	document.getElementById("save-exit").addEventListener("click", async function ()
	{
		await handleSaving();
		document.location = "account.html";
	});

	//reload the page when they hit clear. that's the fastest way to reset everything lol.
	document.getElementById("revert-cont").addEventListener("click", function ()
	{
		window.location.reload();
	});

	document.getElementById("revert-exit").addEventListener("click", function ()
	{
		document.location = "account.html";
	});

	document.getElementById("delete").addEventListener("click", function ()
	{
		let id_wrapper = { "UserID" : userID, "ItineraryID": itineraryID };
		let json = JSON.stringify(id_wrapper);
		let requestOptions = {
			method: 'POST',
			body: json,
		};
		fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/DeleteItinerary", requestOptions).then(gucci =>
		{
			document.location = "account.html";
		}, notgucci =>
		{
			//maybe pop up "something broke" in a temporary div that collapses after a few seconds or when the user hits the 'x'.
		});
	});

});//end of dom content loaded

class DBData
{
	/**
	 * 
	 * @param {string} itineraryName
	 * @param {string} startDate //in the YYYY-MM-DD format. Date makes them all screwy. 
	 * @param {string} endDate //in the YYYY-MM-DD format. Date makes them all screwy. 
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