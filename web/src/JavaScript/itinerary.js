let modalMap;
let modalMarker = null;
let calendarMap;
let geocoder;
let mapWithPins;
let directionsService;
let matrixService;
let directionsRenderer;
var infowindow;
let userID = null;

/**
 * @type {FullCalendar.Calendar}
 */
var calendar;


let inEditMode = false;
var places = [];

/**
 * @type{Array<FileWithMetadata>} 
 */
let imageList = null;

//ok, we need to use map in two locations, potentially, but i don't know how the Google Maps API works with that, so i'll just create the div here. Then we can add that div to the place it's being used.
//export function initMap()
function initMap()
{

	let modalContainer = document.getElementById('item-modal-map');
	let mapContainer = document.getElementById('map-with-multiple-pins');

	modalMap = new google.maps.Map(modalContainer, {
		zoom: 12,
		center: { lat: 37, lng: -95 },
		mapTypeControl: false,
		streetViewControl: true,
		clickableIcons: true,
		fullscreenControl: false,
		styles: GetMapStyling(),
	});

	mapWithPins = new google.maps.Map(mapContainer, {
		zoom: 12,
		center: { lat: 40, lng: -75 },
		mapTypeControl: false,

	});

	directionsService = new google.maps.DirectionsService();
	matrixService = new google.maps.DistanceMatrixService();
	directionsRenderer = new google.maps.DirectionsRenderer();
	directionsRenderer.setMap(mapWithPins);
	infowindow = new google.maps.InfoWindow();

	let latLongMode = document.getElementById('item-modal-radio-latlong');
	let latField = document.getElementById('item-modal-latitude');
	let longField = document.getElementById('item-modal-longitude');
	let itemModal = document.getElementById('item-modal');

	modalMap.addListener("click", function (e)
	{
		//ignore clicks if the item modal is somehow collapsed and this map can still be clicked. use
		if (latLongMode.checked && !itemModal.classList.contains("item-modal-collapsed"))
		{
			let loc = e.latLng;
			createOrUpdateMarker(loc, true, false);
			latField.value = Number(loc.lat()).toFixed(4);
			longField.value = Number(loc.lng()).toFixed(4);
		}
	});

	geocoder = new google.maps.Geocoder();
	//codeAddress(places); //call the function that sets multiple pins on map

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
	let displayMode = getParameterByName("mode"); //we'll ignore this for now.
	userID = GetIDCookie();

	//Only used if the itinerary is owned by the current logged in user. Will force a page into edit mode from word go. Useful when the user creates a new itinerary and chooses save and continue.
	let inEditMode = displayMode == "edit";

	/**
	 * Our save itinerary button should only do something if the data changes. Otherwise, we're just killing our database/lambdas with identical data. 
	 * markDirty is a bool we can use to signify the data has changed and thus can actually save. It'll proc on eventChange for the calendar, as well as any itinerary fields when they change.
	 * As of now, i don't really know a good way to save our data so an "undo" reverts us back to a "clean" state, and frankly that's probably out of the scope of this project anyway.
	 * @type {boolean} 
	 */
	var markDirty = false;


	if (!itineraryID && !userID)
	{
		document.location = "itinerarySearch.html";
	}

	if (itineraryID)
	{
		itineraryID = Number(itineraryID);
	}

	function initializeItemModal()
	{
		function initializePhotoModal()
		{
			// Get the modal
			var modal = document.getElementById("photo-modal");
			// Get the image and insert it inside the modal - use its "alt" text as a caption
			var modalImg = document.getElementById("modal-img");
			// Get the <span> element that closes the modal
			let span = document.getElementById("photo-close");

			// When the user clicks on <span> (x), close the modal
			span.onclick = function ()
			{
				modal.classList.add("photo-modal-hidden");
				modalImg.src = null;
				modalImg.alt = "<no photo loaded>";
			}
		}

		//should clean up the display photo modal and move all the onclick and blur stuff here (if possible. readonly stuff prob can't). but for now it's staying where it is.

		initializePhotoModal();
	}

	/**
	 * Displays an event on the calendar as a modal, saving the data to the provided event if the user show chooses. If event is null, this is a "create", otherwise, this is an "update". 
	 * This is essentially a helper function; if the event is not null it will already have all this data, if not, the data will mostly be empty. 
	 * This modal will have a "save" button, as well as a "discard changes" or "cancel" button. if the event is not null, it will also have a "delete" button. 
	 * @param {FullCalendar.Event} event the event to update, or null if a new event should be created instead.
	 * @param {Date} start the time the event starts
	 * @param {Date} end the time the event ends. 
	 * @param {boolean} allDay a fullCalendar argument that deals with all day events, idk what it actually does lol.
	 * @param {boolean} readonly if true, disabled all interaction, if false, allows normal editing. 
	 */
	function displayItemModal(event, start, end, allDay, readonly, autoLat = null, autoLng = null, autoPhoto = null, successCallback = null, deleteCallback = null)
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

		let updateAddressBtn = document.getElementById("fill-address-btn");

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
		let addressDescription = document.getElementById('address-description');
		let uploadPhotoBtn = document.getElementById("uploadPhotosEventDetails");

		itemModal.classList.remove("item-modal-collapsed");
		itemModalSave.disabled = false;

		itemModalStartDate.value = LocalStringFromDate(start); //these are in UTC time, i need them in Local time. fuck

		itemModalEndDate.value = LocalStringFromDate(end);

		let isLLMode = false;

		//ensure photo collection is clear.
		while (photoCollection.firstChild)
		{
			photoCollection.removeChild(photoCollection.lastChild);
		}

		let hasPhotos = false;

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


			event.extendedProps.Photos.forEach(function (x, index)
			{
				addPhoto(photoCollection, x, index);
				hasPhotos = true;
			});

			itemModalDelete.classList.remove('nothing-to-change');
			itemModalRevert.classList.remove('nothing-to-change');

			//google maps api: put the pin on the lat long. 

		}
		else
		{
			if (!itemModalDelete.classList.contains('nothing-to-change'))
			{
				itemModalDelete.classList.add('nothing-to-change');
			}
			if (!itemModalRevert.classList.contains('nothing-to-change'))
			{
				itemModalRevert.classList.add('nothing-to-change');
			}
			if (!photoCollection.classList.contains("no-photos-attached"))
			{
				photoCollection.classList.add("no-photos-attached");
			}
			if (modalMarker)
			{
				modalMarker.setMap(null);
			}
		}

		if (autoPhoto && autoPhoto.length > 0)
		{
			let items = photoCollection.getElementsByClassName("item-modal-photo") || [];
			let index = items.length;

			for (const photo of autoPhoto)
			{
				addPhoto(photoCollection, photo, index++);
			}
			hasPhotos = true;
		}
		if (autoLat && autoLng)
		{
			latField.value = autoLat;
			longField.value = autoLng;

			latLongMode.checked = true;

			isLLMode = false; //so handleRadio correctly toggles it to true.
			createOrUpdateMarker({ lat: Number(latField.value), lng: Number(longField.value) }, true);
			handleRadio(latLongMode);
			updateAddress();
		}
		if (hasPhotos)
		{
			photoCollection.classList.remove("no-photos-attached");
		}
		else if (!photoCollection.classList.contains("no-photos-attached"))
		{
			photoCollection.classList.add("no-photos-attached");
		}

		itemModalTitle.readOnly = readonly;
		addressField.readOnly = readonly;
		updateCoordBtn.readOnly = readonly;

		latLongMode.disabled = readonly;
		addressMode.disabled = readonly;

		itemModalStartDate.readOnly = readonly;
		itemModalEndDate.readOnly = readonly;
		itemModalDescription.readOnly = readonly;


		//wire up the save
		itemModalSave.onclick = function ()
		{
			if (!readonly)
			{
				//debounce check
				itemModalSave.disabled = true;

				let title = itemModalTitle.value;

				let start = DateFromLocalString(itemModalStartDate.value);
				let end = DateFromLocalString(itemModalEndDate.value);

				let description = itemModalDescription.value;
				let photoList = photoCollection.getElementsByClassName("item-modal-photo-img");
				//photoList isn't an array, it's a HTMLElementCollection. the spread operator aka "[...args]" converts an iterable to an array. array.map is equivalent to C#'s LINQ Select.
				//In simple terms: take the photoList, create a new list with just the url attribute from them.
				let photos = [...photoList].map(x => x.src);

				function addOrUpdateItem(lat, long, address)
				{
					if (event)
					{
						event.setProp("title", title);
						event.setAllDay(allDay);
						event.setStart(start);
						event.setEnd(end);
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

				if (isItemValid(title, start, end) && modalMarker && modalMarker.getMap()) 
				{
					addOrUpdateItem(Number(latField.value), Number(longField.value), IsNullOrWhitespace(addressField.value) ? null : addressField.value);
					//collapse the item modal.
					clearFieldsAndClose();
					if (successCallback) 
					{
						successCallback();
					}
				}
				else
				{
					//clear debounce
					itemModalSave.disabled = false;
				}
			}
		};

		//cancel
		itemModalCancel.onclick = function ()
		{
			clearFieldsAndClose();
		};

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
		itemModalRevert.onclick = function ()
		{
			if (!readonly) 
			{
				if (event)
				{
					itemModalTitle.value = event.title;
					addressField.value = event.extendedProps.Address;
					itemModalDescription.value = event.extendedProps.AdditionalInformation;
					latField.value = Number(event.extendedProps.Latitude);
					longField.value = Number(event.extendedProps.Longitude);

					//ensure photo collection is clear.
					while (photoCollection.firstChild)
					{
						photoCollection.removeChild(photoCollection.lastChild);
					}
					//and reload them.
					let hasPhotos = false;
					event.extendedProps.Photos.forEach(function (x, index)
					{
						addPhoto(photoCollection, x, index);
						hasPhotos = true;
					});
					if (hasPhotos)
					{
						photoCollection.classList.remove("no-photos-attached");
					}
					else if (!photoCollection.classList.contains("no-photos-attached"))
					{
						photoCollection.classList.add("no-photos-attached");
					}

					createOrUpdateMarker({ lat: Number(latField.value), lng: Number(longField.value) }, latLongMode.checked, true);
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

					if (!photoCollection.classList.contains("no-photos-attached"))
					{
						photoCollection.classList.add("no-photos-attached");
					}

					if (modalMarker)
					{
						modalMarker.setMap(null);
					}
				}
			}
		};
		//and delete
		itemModalDelete.onclick = function ()
		{
			if (!readonly)
			{
				if (event)
				{
					event.remove();
				}
				clearFieldsAndClose();
				resetPhotoModal();
			}
		};

		uploadPhotoBtn.onclick = function ()
		{
			if (!readonly) 
			{
				const client = filestack.init("AzDBLWEvORZajUBUZlIdgz");
				const options = {
					accept: ["image/*"],
					onUploadDone: file =>
					{
						var url = file["filesUploaded"]["0"]["url"];
						//not added yet, so it is length.
						let index = document.getElementsByClassName("item-modal-photo-img").length;

						addPhoto(photoCollection, url, index);

						photoCollection.classList.remove("no-photos-attached");
					}//end on upload done
				};//end options
				client.picker(options).open();
			}
		}//end on click upload photos button

		if (readonly) 
		{
			if (!itemModalSave.classList.contains("readonly-item-hide-button"))
			{
				itemModalSave.classList.add("readonly-item-hide-button");
			}
			if (!itemModalRevert.classList.contains("readonly-item-hide-button"))
			{
				itemModalRevert.classList.add("readonly-item-hide-button");
			}
			if (!itemModalDelete.classList.contains("readonly-item-hide-button"))
			{
				itemModalDelete.classList.add("readonly-item-hide-button");
			}
			if (!uploadPhotoBtn.classList.contains("readonly-item-hide-button"))
			{
				uploadPhotoBtn.classList.add("readonly-item-hide-button");
			}
			if (!addressDescription.classList.contains("hide-in-view-mode"))
			{
				addressDescription.classList.add("hide-in-view-mode");
			}
			itemModalCancel.textContent = "Close";

			let readonlyAwareLabels = itemModal.getElementsByClassName("readonly-aware-content");
			Array.prototype.forEach.call(readonlyAwareLabels, x =>
			{
				if (!x.classList.contains("readonly-content"))
				{
					x.classList.add("readonly-content");
				}
			});

			readonlyAwareLabels = itemModal.getElementsByClassName("readonly-aware-content-light");
			Array.prototype.forEach.call(readonlyAwareLabels, x =>
			{
				if (!x.classList.contains("readonly-content-light"))
				{
					x.classList.add("readonly-content-light");
				}
			});


			//window.onclick = function ()
			//{
			//	clearFieldsAndClose();
			//}
		}
		else
		{
			itemModalSave.classList.remove("readonly-item-hide-button");
			itemModalRevert.classList.remove("readonly-item-hide-button");
			itemModalDelete.classList.remove("readonly-item-hide-button");
			uploadPhotoBtn.classList.remove("readonly-item-hide-button");
			addressDescription.classList.remove("hide-in-view-mode");

			itemModalCancel.textContent = "Cancel";

			let readonlyAwareLabels = itemModal.getElementsByClassName("readonly-aware-content");
			Array.prototype.forEach.call(readonlyAwareLabels, x =>
			{
				x.classList.remove("readonly-content");
			});

			readonlyAwareLabels = itemModal.getElementsByClassName("readonly-aware-content-light");
			Array.prototype.forEach.call(readonlyAwareLabels, x =>
			{
				x.classList.remove("readonly-content-light");
			});

			//window.onclick = null;
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
				updateAddressBtn.classList.remove("hidden-on-address-mode");

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
				updateAddressBtn.classList.add("hidden-on-address-mode");

				isLLMode = false;
			}
		}

		async function submitAddressField(force = false)
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

						latField.value = Number(loc.lat()).toFixed(4);
						longField.value = Number(loc.lng()).toFixed(4);
					}
					else
					{
						if (!modalMap.getMap())
						{
							modalMap.setMap(map);
						}

						modalMap.setCenter(loc);
					}

				}).catch(y =>
				{ /**/
					//log something in addressWarning?
				});
			}
		}

		function resetPhotoModal()
		{
			let k = calendar.getEvents();
			let found = [];

			console.log("break here");

			for (const item of imageList)
			{
				for (let q of k)
				{
					let photos = q.extendedProps.Photos;

					if (photos.some(x => x === item.imgElement.src))
					{
						found.push(item);
						console.log("Hello");
						console.log(item.imgElement);
						if (item.imgElement.classList.contains("meta-selected"))
						{
							item.imgElement.classList.remove("meta-selected");
						}
					}
				}
			}

			let container = document.getElementById("uploadedPhotoContainer");

			for (const allItems of imageList)
			{
				if (!found.some(x => allItems === x))
				{
					container.appendChild(allItems.imgElement.parentElement);
				}
			}
		}

		updateCoordBtn.onclick = _ =>
		{
			if (latLongMode.checked)
			{
				submitAddressField(true);
			}
		};

		//wire up the address to mark the map.
		addressField.onblur = async _ => await submitAddressField();

		autoUpdateCoordBox.onclick = _ =>
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
		};

		latLongMode.onclick = _ => handleRadio(latLongMode);
		addressMode.onclick = _ => handleRadio(addressMode);

		function updateMapFromCoordinate()
		{
			if (latLongMode.checked && isFinite(latField.value) && isFinite(longField.value))
			{
				let latNum = Number(latField.value);
				let longNum = Number(longField.value);
				if (latNum <= 90 && latNum >= -90 && longNum <= 180 && longNum >= -180)
				{
					createOrUpdateMarker({ lat: latNum, lng: longNum }, true, true);
				}
			}
		};

		latField.onblur = updateMapFromCoordinate;
		longField.onblur = updateMapFromCoordinate;

		function updateAddress()
		{
			if (latLongMode.checked && isFinite(latField.value) && isFinite(longField.value))
			{
				let latNum = Number(latField.value);
				let longNum = Number(longField.value);
				if (latNum <= 90 && latNum >= -90 && longNum <= 180 && longNum >= -180) 
				{
					geocoder.geocode({ location: { lat: latNum, lng: longNum } }).then(response =>
					{
						if (response.results[0])
						{
							addressField.value = response.results[0].formatted_address;
						}
					}, failure =>
					{
						addressField.value = "";
					});
				}
			}
		}

		updateAddressBtn.onclick = updateAddress;
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

	function addPhoto(container, url, index)
	{
		let div = document.createElement('div');
		div.classList.add("item-modal-photo");
		let img = document.createElement("img");
		img.src = url;
		img.classList.add("item-modal-photo-img");
		img.alt = "itinerary photo #" + index;
		div.appendChild(img);
		container.appendChild(div);

		// Get the modal
		var modal = document.getElementById("photo-modal");

		// Get the image and insert it inside the modal - use its "alt" text as a caption
		var modalImg = document.getElementById("modal-img");
		img.onclick = function ()
		{
			modal.classList.remove("photo-modal-hidden");
			modalImg.src = img.src;
			modalImg.alt = img.alt;

			let metadata = document.getElementById("photo-metadata");
			let latM = document.getElementById("latitude-metadata");
			let lngM = document.getElementById("longitude-metadata");
			let tM = document.getElementById("timestamp-metadata");
			let locM = document.getElementById("location-metadata");

			if (!metadata.classList.contains("no-metadata"))
			{
				metadata.classList.add("no-metadata");
			}
			latM.textContent = "";
			lngM.textContent = "";
			tM.textContent = "";
			locM.textContent = "";

			EXIF.getData(img, function ()
			{
				let lat = EXIF.getTag(this, "GPSLatitude");
				let latDir = EXIF.getTag(this, "GPSLatitudeRef");
				let lng = EXIF.getTag(this, "GPSLongitude");
				let lngDir = EXIF.getTag(this, "GPSLongitudeRef");

				let time = EXIF.getTag(this, "DateTimeOriginal")

				let t2 = time.substring(0, 4) + '-' + time.substring(5, 7) + '-' + time.substring(8, 10) + 'T' + time.substring(11);

				let d = DateFromLocalString(t2);

				if (lat && lng && GetDateTimeOrNull(d))
				{
					let latNum = ConvertDMSToDD(lat[0], lat[1], lat[2], latDir)
					let lngNum = ConvertDMSToDD(lng[0], lng[1], lng[2], lngDir)

					let trueTime = GetDateTimeOrNull(d);

					metadata.classList.remove("no-metadata");

					latM.textContent = "Latitude: " + latNum;
					lngM.textContent = "Longitude: " + lngNum;
					tM.textContent = "Time Taken: " + trueTime;

					geocoder.geocode({ location: { lat: latNum, lng: lngNum } }).then(response =>
					{
						locM.textContent = "Could not approximate address";

						if (response.results.length > 0)
						{
							for (let i = 0; i < response.results.length; i++)
							{
								let resultItem = response.results[i];
								if (resultItem && !resultItem.types.includes("plus_code"))
								{
									locM.textContent = "Estimated Address: " + resultItem.formatted_address;
									break;
								}
							}
						}
					}, failure =>
					{
						locM.textContent = "Could not approximate address";
					});

				}
			});

		}
	}

	/**
	 * Creates a calendar and loads any database data into it.
	 * @param {DBData} initialDB the initial data from the database. if null, we're in create mode.
	 */
	function createAndLoadCalendar(initialDB)
	{
		function eventsAltered(arg)
		{
			markDirty = true;
		}

		//if the initial DB is null, use the current date. that's actually harder than it sounds. 
		//workaround for the JS Date being terrible. new Date() returns UTC now. getting the date from that is wrong if your local offset is not 0. 
		//(for us, that means EST, so anything > 7PM is treated as the next day)
		//so, get the utc now, convert it to local format, strip off the time, then convert that to a date (which sets hour, minute, second set to UTC 0:00:00), and then strip off the time from that.
		//it's ugly as all hell but it's what we've got.
		let buzz = GetDateOrNull(initialDB?.startDate) ?? new Date(new Date().toLocaleString().substring(0, 10)).toISOString().substring(0, 10);

		let start = document.getElementById("itinerary-startdate");
		let end = document.getElementById("itinerary-enddate");

		let calendarEl = document.getElementById('calendar');

		function tryGetData(startTime, endTime)
		{
			/**
			 * @type {Array<FileWithMetadata>}
			 */
			let matches = [];
			let latSum = 0;
			let lngSum = 0;
			let validCount = 0;

			let urls = [];
			if (imageList)
			{
				matches = imageList.filter(x => x.time >= startTime && x.time <= endTime);
			}

			for (const item of matches)
			{
				if (item.time >= startTime && item.time <= endTime)
				{
					validCount++;
					urls.push(item.imgElement.src);
					latSum += item.latitude;
					lngSum += item.longitude;
				}
			}


			if (validCount > 0)
			{
				return new AutofillHelper(latSum / validCount, lngSum / validCount, urls, function ()
				{
					matches.forEach(x =>
					{
						x.imgElement.parentElement.parentElement.removeChild(x.imgElement.parentElement);
						x.imgElement.classList.remove("meta-selected");
					});
				});
			}
			else
			{
				return new AutofillHelper(null, null, null, null);
			}
		}

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
			//timeZone: 'UTC',
			//nowIndicator: false,
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
						days: 7
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
			navLinks: false, // can click day/week names to navigate views
			editable: false,
			selectable: false,
			selectMirror: false,
			select: function (arg)
			{
				let temp = tryGetData(arg.start, arg.end);
				displayItemModal(null, arg.start, arg.end, arg.allDay, false, temp.avgLat, temp.avgLng, temp.urls, temp.callback);
			},
			eventClick: function (arg)
			{
				let event = arg.event;
				displayItemModal(event, event.start, event.end, event.allDay, !inEditMode);
			},
			eventAdd: eventsAltered,
			eventChange: eventsAltered,
			eventRemove: eventsAltered,
			//may be able to use eventsSet instead?
			dayMaxEvents: true, // allow "more" link when too many events
			events: []
		});

		var dbEventList = initialDB?.items ?? [];
		dbEventList.forEach(dbEvent =>
		{
			calendar.addEvent({
				title: dbEvent.activityName,
				start: dbEvent.startTime,
				end: dbEvent.endTime,
				extendedProps: {
					Latitude: dbEvent.latitude,
					Longitude: dbEvent.longitude,
					Address: dbEvent.address,
					AdditionalInformation: dbEvent.additionalInformation,
					Photos: dbEvent.photos.map(x => x["URL"]),
				}
			});
		});

		return calendar;
	}

	/**
	 * Fill in calendar with activities from database
	 * @param {number} id the itinerary id to pull from the database with
	 * @returns {DBData} the data from the database. this will be null if creating a new itinerary; when reading, it will not be null but the itinerary item list may be empty.
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
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
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
					console.log(jsonData);
					//first, make sure we got something, we could somehow get a null.
					if (jsonData)
					{
						let creator = Number(jsonData["CreatorID"]);
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
							places.push(value["Address"]);

							var startSelect = document.getElementById('start');
							var endSelect = document.getElementById('end');
							var opt = document.createElement('option');
							opt.value = value["Address"];
							opt.innerHTML = value["Address"];
							var optClone = opt.cloneNode(true);
							startSelect.appendChild(opt);
							endSelect.appendChild(optClone);
						});
						dbItems = new DBData(creator, name, startDate, endDate, desc, coll);
					}//end json null check
				}//end json data function
				);//end fetch.then
			}
			//indicates the code was successful, but the database had no itinerary with that index. this needs to be handled. 
			else if (response.status == 404)
			{
				document.location = "404.html";
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

		//and the rest of the data
		title.value = dbData?.itineraryName ?? null;
		start.value = dbData?.startDate ?? "";
		end.value = dbData?.endDate ?? "";
		description.value = dbData?.description ?? null;

		start.defaultValue = start.value ?? "1970-01-01";
		end.defaultValue = end.value ?? "9999-12-31";

		title.defaultValue = title.value;
		description.defaultValue = description.value;
	}

	function initializeRemainingData(dbData)
	{
		let title = document.getElementById("itinerary-title");
		let start = document.getElementById("itinerary-startdate");
		let end = document.getElementById("itinerary-enddate");
		let description = document.getElementById("itinerary-description");

		let create_mode = document.getElementById("create-mode");
		let create_save_cont = document.getElementById("create-save-cont");
		let create_save_exit = document.getElementById("create-save-exit");
		let create_clear = document.getElementById("create-clear");
		let create_cancel = document.getElementById("create-cancel");

		let logged_out_wrapper = document.getElementById("logged-out-wrapper");
		let logged_out_note = document.getElementById("logged-out-note");

		let view_mode_other = document.getElementById("view-mode-other");
		let other_create_copy = document.getElementById("other-create-copy");
		let other_cancel = document.getElementById("other-cancel");

		let view_mode_self = document.getElementById("view-mode-self");
		let self_enable_edit = document.getElementById("self-enable-edit");
		let self_go_back = document.getElementById("self-go-back");
		let self_view_delete = document.getElementById("self-view-delete");

		let copy_edit_mode = document.getElementById("copy-edit-mode");
		let save_copy_cont = document.getElementById("save-copy-cont");
		let save_copy_exit = document.getElementById("save-copy-exit");
		let copy_revert = document.getElementById("copy-revert");
		let copy_cancel = document.getElementById("copy-cancel");

		let normal_edit_mode = document.getElementById("normal-edit-mode");
		let save_cont = document.getElementById("save-cont");
		let save_exit = document.getElementById("save-exit");
		let revert_cont = document.getElementById("revert-cont");
		let revert_exit = document.getElementById("revert-exit");
		let experiment = document.getElementById("experimental-photo-tool");
		let edit_delete = document.getElementById("edit-delete");

		/**
		 * Saves the current itinerary information stored on the page and in the calendar to the database with the itinerary id set to null. If successfully saved, either reloads this saved itinerary or goes to the account page, based on the stayOnPage flag.
		 * @param {boolean} stayOnPage if true, the redirect comes back to itinerary (with the new itinerary id appended), if false, directs to account.html
		 */
		async function SaveNewItineraryToDatabase(stayOnPage)
		{
			let x = await handleSaving(null);
			if (x)
			{
				if (stayOnPage)
				{
					document.location = "itinerary.html?itinerary_id=" + x + "&mode=edit";
				}
				else
				{
					document.location = "account.html";
				}
			}
		}

		/** 
		 * Update itinerary everytime the user saves it. If there is nothing to save, this does nothing and the itinerary id is returned.
		 * @param {number} itineraryID the itinerary id to save this entry to. for create and create copy, this value is null.
		 * @returns {number} the id of the itinerary saved. If no changes were made, but it is otherwise valid, this is the itineraryID passed in. If it fails to save, this value is null.
		 **/
		async function handleSaving(itineraryID)
		{
			let title = document.getElementById("itinerary-title");
			let start = document.getElementById("itinerary-startdate");
			let end = document.getElementById("itinerary-enddate");
			let description = document.getElementById("itinerary-description");

			//first, make sure we can save.
			let valid = isItemValid(title.value, GetDateTimeOrNull(start.value), GetDateTimeOrNull(end.value));
			if (valid && markDirty)
			{


				//change itinerary id when creating new itinerary feature is added
				let saveEvents = {
					"ItineraryID": itineraryID,
					"UserID": userID,
					"Title": title.value,
					"StartDate": start.value,
					"EndDate": end.value,
					"Description": description.value,
					"ItineraryItems": []
				};
				calendarArr = calendar.getEvents();

				let removeList = [];
				//loop through events from calendar and prepare them into an array to be sent off to the database
				calendarArr.forEach(entry => 
				{
					let itemTitle = entry["_def"]["title"];
					let itemAdditionalInformation = entry["_def"]["extendedProps"]["AdditionalInformation"];
					let itemLatitude = entry.extendedProps.Latitude;
					let itemLongitude = entry["_def"]["extendedProps"]["Longitude"];
					let itemAddress = entry["_def"]["extendedProps"]["Address"];
					let itemStart = entry.start;
					let itemEnd = entry.end;
					let itemPhotos = entry["_def"]["extendedProps"]["Photos"]

					let itineraryStart = GetDateTimeOrNull(start.value);
					let itineraryEnd = GetDateTimeOrNull(end.value);

					itineraryStart.setDate(itineraryStart.getDate() + 1);
					itineraryStart.setHours(0, 0, 0, 0);

					itineraryEnd.setDate(itineraryEnd.getDate() + 2);
					itineraryEnd.setHours(0, 0, 0, 0);

					let itemStartObj = GetDateTimeOrNull(itemStart);
					let itemEndObj = GetDateTimeOrNull(itemEnd);


					//if they are invalid, set them aside to be deleted.
					if (itemStartObj < itineraryStart || itemEndObj <= itineraryStart || itemStartObj >= itineraryEnd || itemEndObj > itineraryEnd)
					{
						removeList.push(entry);
					}
					//else, add to the save list.
					else 
					{
						itemStart = new Date();
						itemEnd = new Date();

						itemStart.setUTCFullYear(itemStartObj.getFullYear(), itemStartObj.getMonth(), itemStartObj.getDate());
						itemStart.setUTCHours(itemStartObj.getHours(), itemStartObj.getMinutes(), itemStartObj.getSeconds(), 0);

						itemEnd.setUTCFullYear(itemEndObj.getFullYear(), itemEndObj.getMonth(), itemEndObj.getDate());
						itemEnd.setUTCHours(itemEndObj.getHours(), itemEndObj.getMinutes(), itemEndObj.getSeconds(), 0);

						saveEvents["ItineraryItems"].push({
							"ActivityName": itemTitle,
							"StartTime": itemStart,
							"EndTime": itemEnd,
							"Address": itemAddress,
							"AdditionalInformation": itemAdditionalInformation,
							"Latitude": itemLatitude,
							"Longitude": itemLongitude,
							"Photos": itemPhotos
						});
					}
				});
				//delete all the invalid items we marked earlier
				removeList.forEach(x =>
				{
					x.remove();
				});

				var json = JSON.stringify(saveEvents);
				// create a JSON object with parameters for API call and store in a variable
				var requestOptions = {
					method: 'POST',
					body: json,
				};

				console.log(json);

				// make API call with parameters and use promises to get response
				let g = await fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/CreateReadUpdateItinerary", requestOptions).then(async gucci =>
				{
					//maybe pop up "your shit was saved" in a temporary div that collapses after a few seconds or when the user hits the 'x'.
					if (gucci.status == 200) 
					{
						markDirty = false; //clear the dirty-ness.
						let q = await gucci.text().then(data =>
						{
							return Number(data);
						});
						return q;
					}
					else if (gucci.status == 404)
					{
						document.location = "404.html";
						return null;
					}
					else
					{
						console.log("status code: " + gucci.status);
						//maybe pop up "something broke" in a temporary div that collapses after a few seconds or when the user hits the 'x'.
						return null;
					}
				}, notgucci =>
				{
					//maybe pop up "something broke" in a temporary div that collapses after a few seconds or when the user hits the 'x'.
					return null;
				});

				return g;
			}
			else if (valid)
			{
				console.log("no changes");
				//maybe pop up "nothing to save" in a temporary div that collapses after a few seconds or when the user hits the 'x'.
				return itineraryID;
			}
			else
			{
				return null;
			}
		}

		/**
		 * Calendar is disabled in view mode. This re-enables it. 
		 */
		function enableCalendar()
		{
			calendar.setOption("navLinks", true);
			calendar.setOption("editable", true);
			calendar.setOption("selectable", true);
			calendar.setOption("selectMirror", true);

			let calendarEl = document.getElementById('calendar');
			calendarEl.classList.remove("calendar-disabled");
		}

		/**
		 * Disabled the calendar. useful when the start and end are invalid (create mode, clear changes).
		 */
		function disableCalendar()
		{
			calendar.setOption("navLinks", false);
			calendar.setOption("editable", false);
			calendar.setOption("selectable", false);
			calendar.setOption("selectMirror", false);

			calendar.classList.add("calendar-disabled");
		}

		/**
		 * Makes the content editable. removes all the readonly stuff and sets in edit mode to true so item modals will work properly. If calendar too is set, enables the calendar too.
		 * @param {boolean} calendarToo
		 */
		function makeEditable(calendarToo)
		{
			inEditMode = true;

			title.readOnly = false;
			start.readOnly = false;
			end.readOnly = false;
			description.readOnly = false;

			document.getElementById("explain-dates").classList.remove("hide-in-view-mode");
			let header = document.getElementById("main-itinerary-data");

			let readonlyAwareLabels = header.getElementsByClassName("readonly-aware-content");
			Array.prototype.forEach.call(readonlyAwareLabels, x =>
			{
				x.classList.remove("readonly-content");
			});
			if (calendarToo)
			{
				enableCalendar();
			}
		}

		function resetToInitialDB()
		{
			calendarArr = calendar.getEvents();
			calendarArr.forEach(x => x.remove());

			start.value = dbData?.startDate ?? "";
			end.value = dbData?.endDate ?? "";
			title.value = dbData?.itineraryName ?? null;
			description.value = dbData?.description ?? null;



			var dbEventList = dbData?.items ?? [];
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
						Photos: dbEvent.photos.map(x => x["URL"]),
					}
				});
			});

			if (!start.value || !end.value)
			{
				disableCalendar();
			}

			markDirty = false;
		}

		//create mode.
		if (!dbData)
		{

			//make this visible
			create_mode.classList.remove("not-create-mode");

			makeEditable(false);

			create_save_cont.addEventListener("click", _ =>
			{
				create_save_cont.disabled = true;
				create_save_exit.disabled = true;
				create_clear.disabled = true;
				create_cancel.disabled = true;

				SaveNewItineraryToDatabase(true);

				create_clear.disabled = false;
				create_cancel.disabled = false;
				create_save_exit.disabled = false;
				create_save_cont.disabled = false;
			});

			create_save_exit.addEventListener("click", _ =>
			{
				create_save_cont.disabled = true;
				create_save_exit.disabled = true;
				create_clear.disabled = true;
				create_cancel.disabled = true;

				SaveNewItineraryToDatabase(false);

				create_clear.disabled = false;
				create_cancel.disabled = false;
				create_save_exit.disabled = false;
				create_save_cont.disabled = false;
			});

			create_clear.addEventListener("click", _ =>
			{
				create_save_cont.disabled = true;
				create_save_exit.disabled = true;
				create_clear.disabled = true;
				create_cancel.disabled = true;

				resetToInitialDB();
				//since empty was our initial state, we should mark dirty to false. 
				markDirty = false;

				create_clear.disabled = false;
				create_cancel.disabled = false;
				create_save_exit.disabled = false;
				create_save_cont.disabled = false;
			});

			create_cancel.addEventListener("click", _ =>
			{
				document.location = "account.html";
			});
		}
		//view mode. the options here differ based on who's logged in.
		//no one logged in.
		else if (!userID)
		{
			logged_out_wrapper.classList.remove("not-logged-out");
		}
		//logged in, not the creator
		else if (userID != dbData.creatorID)
		{
			view_mode_other.classList.remove("not-view-mode-other");
			other_create_copy.addEventListener("click", _ =>
			{
				//disable view other mode.
				other_create_copy.disabled = true;
				other_cancel.disabled = true;
				other_cancel.onclick = null;
				other_create_copy.onclick = null;

				copy_edit_mode.classList.remove("not-copy-edit-mode");
				//enable to edit copy mode.
				view_mode_other.classList.add("not-view-mode-other");

				makeEditable(true);

				markDirty = true;
				save_copy_cont.addEventListener("click", _ =>
				{
					save_copy_cont.disabled = true;
					save_copy_exit.disabled = true;
					copy_revert.disabled = true;
					copy_cancel.disabled = true;

					SaveNewItineraryToDatabase(true);

					save_copy_cont.disabled = false;
					save_copy_exit.disabled = false;
					copy_revert.disabled = false;
					copy_cancel.disabled = false;
				});

				save_copy_exit.addEventListener("click", _ =>
				{
					save_copy_cont.disabled = true;
					save_copy_exit.disabled = true;
					copy_revert.disabled = true;
					copy_cancel.disabled = true;

					SaveNewItineraryToDatabase(false);

					save_copy_cont.disabled = false;
					save_copy_exit.disabled = false;
					copy_revert.disabled = false;
					copy_cancel.disabled = false;
				});

				copy_revert.addEventListener("click", _ =>
				{
					resetToInitialDB();
					markDirty = true;
				});

				//i could go back to view mode but it's easier to just redirect to account or go back. right now it goes back.
				copy_cancel.addEventListener("click", _ =>
				{
					history.back();
					//document.location = "account.html";
				});
			});
			other_cancel.addEventListener("click", _ =>
			{
				other_create_copy.disabled = true;
				other_cancel.disabled = true;

				history.back();
			});
		}
		//logged in and creator
		else
		{
			/**
			 * Attempts to delete the current itinerary. if the user does not have permission, this will fail. 
			 * @returns {boolean} true if the data was removed from the database, false otherwise.
			 */
			async function handleDeleting()
			{
				let id_wrapper = { "UserID": userID, "ItineraryID": itineraryID };
				let json = JSON.stringify(id_wrapper);
				let requestOptions = {
					method: 'POST',
					body: json,
				};
				let ret = await fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/DeleteItinerary", requestOptions).then(gucci =>
				{
					if (gucci.status == 200) 
					{
						return true;
					}
					else
					{
						gucci.text().then(data => console.log(data));
						//maybe pop up "something broke" in a temporary div that collapses after a few seconds or when the user hits the 'x'.
						return false;
					}
				}, notgucci =>
				{
					//maybe pop up "something broke" in a temporary div that collapses after a few seconds or when the user hits the 'x'.
					return false;
				});

				return ret;
			}

			function initializeEditMode()
			{
				normal_edit_mode.classList.remove("not-normal-edit-mode");

				makeEditable(true);

				save_cont.addEventListener("click", function ()
				{
					save_cont.disabled = true;
					save_exit.disabled = true;
					revert_cont.disabled = true;
					revert_exit.disabled = true;
					edit_delete.disabled = true;

					handleSaving(itineraryID);

					save_cont.disabled = false;
					save_exit.disabled = false;
					revert_cont.disabled = false;
					revert_exit.disabled = false;
					edit_delete.disabled = false;
				});
				save_exit.addEventListener("click", async function ()
				{
					save_cont.disabled = true;
					save_exit.disabled = true;
					revert_cont.disabled = true;
					revert_exit.disabled = true;
					edit_delete.disabled = true;

					let k = await handleSaving(itineraryID);
					if (k) 
					{
						document.location = "account.html";
					}
					else
					{
						save_cont.disabled = false;
						save_exit.disabled = false;
						revert_cont.disabled = false;
						revert_exit.disabled = false;
						edit_delete.disabled = false;
					}
				});
				revert_cont.addEventListener("click", function ()
				{
					save_cont.disabled = true;
					save_exit.disabled = true;
					revert_cont.disabled = true;
					revert_exit.disabled = true;
					edit_delete.disabled = true;

					resetToInitialDB();

					save_cont.disabled = false;
					save_exit.disabled = false;
					revert_cont.disabled = false;
					revert_exit.disabled = false;
					edit_delete.disabled = false;
				});
				revert_exit.addEventListener("click", function ()
				{
					save_cont.disabled = true;
					save_exit.disabled = true;
					revert_cont.disabled = true;
					revert_exit.disabled = true;
					edit_delete.disabled = true;

					document.location = "account.html";
				});

				experiment.onclick = PerformMinorMiracle;

				edit_delete.addEventListener("click", _ =>
				{
					save_cont.disabled = true;
					save_exit.disabled = true;
					revert_cont.disabled = true;
					revert_exit.disabled = true;
					edit_delete.disabled = true;

					handleDeleting().then(x =>
					{
						//this only happens if x is false.
						if (x)
						{
							document.location = "account.html";
						}
						else 
						{
							save_cont.disabled = false;
							save_exit.disabled = false;
							revert_cont.disabled = false;
							revert_exit.disabled = false;
							edit_delete.disabled = false;
						}
					});
				});
			}

			if (!inEditMode) 
			{

				view_mode_self.classList.remove("not-view-mode-self");
				self_enable_edit.addEventListener("click", _ =>
				{
					self_enable_edit.disabled = true;
					self_go_back.disabled = true;
					self_view_delete.disabled = true;

					self_enable_edit.onclick = null;
					self_go_back.onclick = null;
					self_view_delete.onclick = null;

					view_mode_self.classList.add("not-view-mode-self");

					initializeEditMode();
				});
				self_go_back.addEventListener("click", _ =>
				{
					self_enable_edit.disabled = true;
					self_go_back.disabled = true;
					self_view_delete.disabled = true;

					history.back();
				});
				self_view_delete.addEventListener("click", _ =>
				{
					self_enable_edit.disabled = true;
					self_go_back.disabled = true;
					self_view_delete.disabled = true;

					handleDeleting().then(x =>
					{
						//this only happens if x is false.
						if (x)
						{
							document.location = "account.html";
						}
						else 
						{
							self_enable_edit.disabled = false;
							self_go_back.disabled = false;
							self_view_delete.disabled = false;
						}
					});
				});
			}
			else
			{
				initializeEditMode();
			}
		}



		start.addEventListener("blur", _ =>
		{
			if (inEditMode)
			{
				let temp = GetDateOrNull(start.value);
				if (temp) 
				{
					markDirty |= start.defaultValue != temp;
					start.defaultValue = temp;
				}

				if (!calendar.getOption("selectable") && GetDateOrNull(start.value) && GetDateOrNull(end.value) && new Date(end.value) >= new Date(start.value))
				{
					enableCalendar();
					//workaround to refresh the display. Go to the currently selected date, refresh.
					calendar.gotoDate(start.value);
				}
				else
				{
					//workaround to refresh the display. Go to the currently selected date, refresh.
					calendar.gotoDate(calendar.getDate());
				}

			}
		});

		end.addEventListener("blur", _ =>
		{
			if (inEditMode)
			{
				let temp = GetDateOrNull(end.value);
				if (temp) 
				{
					markDirty |= end.defaultValue != temp;
					end.defaultValue = temp;
				}
				else
				{
					end.value = end.defaultValue;
				}

				if (!calendar.getOption("selectable") && GetDateOrNull(start.value) && GetDateOrNull(end.value) && new Date(end.value) >= new Date(start.value))
				{
					enableCalendar();
					calendar.gotoDate(start.value);
				}
				else
				{
					calendar.gotoDate(calendar.getDate());
				}
			}
		});

		title.addEventListener("blur", _ =>
		{
			if (inEditMode)
			{
				if (title.value != title.defaultValue)
				{
					markDirty = true;
					title.defaultValue = title.value;
				}
			}
		});

		description.addEventListener("blur", _ =>
		{
			if (inEditMode)
			{
				if (description.value != description.defaultValue)
				{
					markDirty = true;
					description.defaultValue = description.value;
				}
			}
		});
	}


	function PerformMinorMiracle()
	{
		let k = document.getElementById("batch-upload-modal");
		k.style.display = "block";

		let q = document.getElementById("closeThatShit");
		q.onclick = NegateSaidMiracle;
		let g = document.getElementById("photoList");
		g.onchange = CaffeineExclamationPoint;
	}

	function NegateSaidMiracle()
	{
		let k = document.getElementById("batch-upload-modal");
		k.style.display = "none";
		let q = document.getElementById("closeThatShit");
		q.onclick = null;
		let g = document.getElementById("photoList");
		g.onchange = null;
	}

	function ConvertDMSToDD(degrees, minutes, seconds, direction)
	{
		var dd = degrees + minutes / 60 + seconds / (60 * 60);

		if (direction == "S" || direction == "W")
		{
			dd = dd * -1;
		} // Don't do anything for N or E

		return dd;
	}

	function createObjectURL(object)
	{
		return (window.URL) ? window.URL.createObjectURL(object) : window.webkitURL.createObjectURL(object);
	}

	async function CaffeineExclamationPoint() 
	{
		function addPhoto(image, index, lat, lng, time)
		{
			let container = document.getElementById("uploadedPhotoContainer");

			let url = createObjectURL(image);

			let div = document.createElement('div');
			div.classList.add("item-modal-photo");
			let img = document.createElement("img");
			img.src = url;
			img.classList.add("item-modal-photo-img");
			img.alt = "batch photo #" + index;
			div.appendChild(img);
			container.appendChild(div);

			imageList.push(new FileWithMetadata(img, lat, lng, time));

			img.addEventListener("click", _ =>
			{
				if (img.classList.contains("meta-selected"))
				{
					img.classList.remove("meta-selected");
				}
				else
				{
					img.classList.add("meta-selected");
				}

				updateDisplay();
			});
		}

		function updateDisplay()
		{
			let s = document.getElementById("select-msg");
			let l = document.getElementById("lat-text");
			let n = document.getElementById("lng-text");
			let t = document.getElementById("time-text");
			let g = document.getElementById('generate-item');

			let container = document.getElementById("uploadedPhotoContainer");

			let selected = container.getElementsByClassName("meta-selected");

			if (selected.length > 0)
			{
				let latSum = 0;
				let lngSum = 0;
				/**
				 * @type {Date}
				 */
				let minTime = null;
				/**
				 * @type {Date}
				 */
				let maxTime = null;
				let validCount = 0;
				let selectedArr = Array.from(selected);
				selectedArr.forEach(x =>
				{
					let metaData = imageList.find(y => x == y.imgElement);
					if (metaData)
					{
						if (!minTime || minTime > metaData.time)
						{
							minTime = metaData.time;
						}
						if (!maxTime || maxTime < metaData.time)
						{
							maxTime = metaData.time;
						}

						latSum += metaData.latitude;
						lngSum += metaData.longitude;

						validCount++;
					}
				});

				let latAverage = validCount > 0 ? latSum / validCount : 0;
				let lngAverage = validCount > 0 ? lngSum / validCount : 0;

				let text = selected.length + " file" + (selected.length > 1 ? "s" : "") + " selected";

				if (validCount == 0)
				{
					text += " (No valid metadata)";
					l.textContent = "No info available.";
					n.textContent = "No info available.";
					t.textContent = "No info available.";
				}
				else if (validCount == 1)
				{
					text += (selected.length > 1 ? " (1 " : " (") + "has valid metadata)";
					l.textContent = latAverage;
					n.textContent = lngAverage;
					t.textContent = minTime;
				}
				else
				{
					text += " (" + validCount + " have valid metadata)";
					l.textContent = latAverage + " (Average)";
					n.textContent = lngAverage + " (Average)";
					t.textContent = minTime + " - " + maxTime;
				}
				s.textContent = text;
				if (validCount > 0) 
				{
					g.onclick = function ()
					{
						//if only one photo selected, make a one minute event. 
						if (minTime == maxTime)
						{
							maxTime = new Date(maxTime.getTime() + 1 * 60000); //60,000 ms or 1 minute.
						}
						//round down to the previous minute by chopping off the seconds/ ms. 
						minTime.setSeconds(0, 0);

						if (maxTime.getSeconds() != 0)
						{
							//round up to the next minute by adding a minute
							maxTime = new Date(maxTime.getTime() + 1 * 60000); //60,000 ms or 1 minute.
							//then chopping off the seconds and milliseconds.
							maxTime.setSeconds(0, 0);
						}

						displayItemModal(null, minTime, maxTime, false, false, latAverage, lngAverage, selectedArr.map(k => k.src), function ()
						{
							selectedArr.forEach(x =>
							{
								container.removeChild(x.parentElement);
								x.classList.remove("meta-selected");
							});

							updateDisplay();
						});
					};
					g.disabled = false;
				}
				else
				{
					g.disabled = true;
					g.onclick = null;
				}
			}
			else
			{
				s.textContent = "no files selected";
				l.textContent = "";
				n.textContent = "";
				t.textContent = "";

				g.disabled = true;
				g.onclick = null;
			}
		}

		if (imageList == null)
		{
			imageList = [];
		}

		let photoList = document.getElementById("photoList");
		let theList = Array.from(photoList.files || []);



		let calendarArr = calendar.getEvents();

		let infoField = document.getElementById("upload-info");
		let photoAddCount = 0;

		let photosIncluded = theList.length;
		let addedTo = [];

		for (const y of theList)
		{
			let q = 0;
			await new Promise(resolve => EXIF.getData(y, function ()
			{
				let lat = EXIF.getTag(this, "GPSLatitude");
				let latDir = EXIF.getTag(this, "GPSLatitudeRef");
				let lng = EXIF.getTag(this, "GPSLongitude");
				let lngDir = EXIF.getTag(this, "GPSLongitudeRef");

				let time = EXIF.getTag(this, "DateTimeOriginal")
				let t2 = time.substring(0, 4) + '-' + time.substring(5, 7) + '-' + time.substring(8, 10) + 'T' + time.substring(11);

				let d = DateFromLocalString(t2);

				if (lat && lng && GetDateTimeOrNull(d))
				{
					let latNum = ConvertDMSToDD(lat[0], lat[1], lat[2], latDir)
					let lngNum = ConvertDMSToDD(lng[0], lng[1], lng[2], lngDir)

					let trueTime = GetDateTimeOrNull(d);

					let found = calendarArr.some(z =>
					{
						if (z.start <= trueTime && z.end >= trueTime && Math.sqrt(Math.pow(latNum - z.extendedProps.Latitude, 2) + Math.pow(lngNum - z.extendedProps.Longitude, 2)) < 0.5)
						{
							/**@type {Array<string>} */
							let temp = z.extendedProps.Photos;
							temp.push(createObjectURL(y));
							let replacement = [...temp];
							z.setExtendedProp("Photos", replacement);

							if (!addedTo.includes(z))
							{
								addedTo.push(z);
							}

							photoAddCount++;
							return true;
						}
						return false;
					});

					if (!found)
					{
						addPhoto(y, q, latNum, lngNum, trueTime);
						q++;
					}
					resolve(true);
				}
				else
				{
					addPhoto(y, q++, null, null, null);
					resolve(true);
				}
			}));
		}

		infoField.textContent = photosIncluded + " photos added. " + photoAddCount + " of them were included in " + addedTo.length + " different activity(ies)";

		photoList.files = null;
	}

	//Load Itinerary

	let temp = await loadItinerary(itineraryID);
	initializeNonCalendarData(temp);
	calendar = createAndLoadCalendar(temp);
	initializeRemainingData(temp);
	initializeItemModal();
	calendar.render();
	codeAddress(places); //call the function that sets multiple pins on map

	const onChangeHandler = function ()
	{
		calculateAndDisplayRoute(directionsService, directionsRenderer, matrixService);
	};

	document.getElementById("start").addEventListener("change", onChangeHandler);
	document.getElementById("end").addEventListener("change", onChangeHandler);
	document.getElementById("mode").addEventListener("change", onChangeHandler);

	//display
});//end of dom content loaded

function codeAddress(address)
{
	for (var i = 0; i < address.length; i++)
	{
		geocoder.geocode({
			address: address[i]
		}, function (results, status)
		{
			if (status == google.maps.GeocoderStatus.OK)
			{
				mapWithPins.setCenter(results[0].geometry.location); //center the map over the result
				//place a marker at the location
				var marker = new google.maps.Marker({
					map: mapWithPins,
					position: results[0].geometry.location
				});
				/*marker.addListener("click", () => {
				   infowindow.open({
					 anchor: marker,
					 map,
					 shouldFocus: false,
				   });
				 });*/
				//marker.setMap(marker);
			} else
			{
				alert('Geocode was not successful for the following reason: ' + status);
			}
		});
	}
}

function calculateAndDisplayRoute(directionsService, directionsRenderer, matrixService)
{
	const selectedMode = document.getElementById("mode").value;
	let startAddress = document.getElementById("start").value;
	let endAddress = document.getElementById("end").value;
	infowindow.close();
	directionsService
		.route({
			origin: {
				query: startAddress,
			},
			destination: {
				query: endAddress,
			},
			travelMode: google.maps.TravelMode[selectedMode],
		})
		.then((response) =>
		{
			directionsRenderer.setDirections(response);
		})
		.catch((e) => window.alert("Directions request failed due to " + status));

	const request = {
		origins: [startAddress],
		destinations: [endAddress],
		travelMode: selectedMode,
		unitSystem: google.maps.UnitSystem.METRIC,
		avoidHighways: false,
		avoidTolls: false
	};


	geocoder.geocode({ 'address': endAddress }, function (results, status)
	{
		if (status == google.maps.GeocoderStatus.OK && startAddress != endAddress)
		{
			matrixService.getDistanceMatrix(request).then((response) =>
			{
				infowindow.close();
				infowindow.setContent("Distance:" + response["rows"][0]["elements"][0]["distance"]["text"] +
					"Time: " + response["rows"][0]["elements"][0]["duration"]["text"]);
				infowindow.open(mapWithPins, new google.maps.Marker({
					position: new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng()),
					map: mapWithPins
				}));
			});
		}
	});

}

class DBData
{
	/**
	 * @param {number} creatorID //creator
	 * @param {string} itineraryName //name
	 * @param {string} startDate //in the YYYY-MM-DD format. Date makes them all screwy. 
	 * @param {string} endDate //in the YYYY-MM-DD format. Date makes them all screwy. 
	 * @param {string} description //description
	 * @param {DBItem[]} items // all items currently on itinerary.
	 */
	constructor(creatorID, itineraryName, startDate, endDate, description, items)
	{
		this.creatorID = creatorID;
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

class FileWithMetadata
{
	/**
	 * 
	 * @param {HTMLImageElement} imgElement
	 * @param {number} latitude
	 * @param {number} longitude
	 * @param {Date} time
	 */
	constructor(imgElement, latitude, longitude, time)
	{
		this.imgElement = imgElement;
		this.latitude = latitude;
		this.longitude = longitude;
		this.time = time;
	}
}

class AutofillHelper
{
	/**
	 * 
	 * @param {number} avgLat
	 * @param {number} avgLng
	 * @param {Array<string>} urls
	 * @param {function()} callback
	 */
	constructor(avgLat, avgLng, urls, callback)
	{
		this.avgLat = avgLat;
		this.avgLng = avgLng;
		this.urls = urls;
		this.callback = callback;
	}
}

//class MetaPhoto
//{
//	/**
//	 * @param {string} name
//	 * @param {number} size
//	 * @param {number} age
//	 * @param {number | null} latitude
//	 * @param {number | null} longitude
//	 * @param {Date | null} time
//	 */
//	constructor(name, size, age, latitude, longitude, time)
//	{
//		this.name = name;
//		this.size = size;
//		this.age = age;

//		this.latitude = latitude;
//		this.longitude = longitude;
//		this.time = time;
//	}

//	getHashCode()
//	{
//		function doubleHashCode(value)
//		{
//			let k = new Uint32Array(new Float64Array([value]).buffer, 0, 2);
//			return k[0] ^ k[1];
//		}

//		function stringHashCode(value)
//		{
//			var hash = 0, i, chr;
//			if (value.length === 0) return hash;
//			for (i = 0; i < value.length; i++)
//			{
//				chr = value.charCodeAt(i);
//				hash = ((hash << 5) - hash) + chr;
//				hash |= 0; // Convert to 32bit integer
//			}
//			return hash;
//		}

//		let hashCode = 2021072037;
//		hashCode = hashCode * -1521134295 + stringHashCode(value);
//		hashCode = hashCode * -1521134295 + this.size;
//		hashCode = hashCode * -1521134295 + this.age;

//		hashCode = this.latitude == null ? hashCode : hashCode * -1521134295 + doubleHashCode(this.latitude);
//		hashCode = this.longitude == null ? hashCode: hashCode * -1521134295 + doubleHashCode(this.longitude);
//		hashCode = this.time == null ? hashCode : hashCode * -1521134295 + this.time.getTime();

//		return hashCode;
//	}

//	checkEqual(other)
//	{
//		if ('latitude' in other && 'longitude' in other && 'time' in other && 'age' in other && 'size' in other && 'name' in other)
//		{
//			return this.latitude === other.latitude && this.longitude === other.longitude && this.time.getTime() === other.time?.getTime() && other.name === this.name && this.size === other.size && this.age === other.age;
//		}
//		else
//		{
//			return false;
//		}
//	}

//	static areEqual(value, other)
//	{
//		if (value instanceof MetaPhoto)
//		{
//			return value.checkEqual(other);
//		}
//		else
//		{
//			return false;
//		}
//	}

//	static hashCodeOf(value)
//	{
//		if (value instanceof MetaPhoto)
//		{
//			return value.getHashCode();
//		}
//		else
//		{
//			return undefined;
//		}
//	}
//}

///**
// * A representation of a mutable hash set with a custom equality comparison. The hashset is the standard sort that does not handle mutable data well. Hashing Collisions are handled via chaining.
// */
//class HashSet
//{
//	/**
//	 * 
//	 * @callback getHashCodeCallback
//	 * @param {any} value the value to get the hashcode for
//	 * @returns {number}
//	 * 
//	 * @callback getEqualityCompare
//	 * @param {any} first first value to check
//	 * @param {any} second the second value to check
//	 * @returns {boolean} true if both values should be considered equal, false otherwise
//	 */
//	/**
//	 * 
//	 * @param {getHashCodeCallback} getHashCodeCallback the hashcode algorithm for the given value. if null or not provided, uses the default === operator. 
//	 * @param {getEqualityCompare} getEqualityCompare the value equality for the algorithm. 
//	 */
//	constructor(getHashCodeCallback, getEqualityCompare = null)
//	{
//		function fallbackEquals(x, y)
//		{
//			return x === y;
//		}

//		function justUseHashCode(x, y)
//		{
//			return true;
//		}

//		function fallbackHashCode(x)
//		{
//			return 0;
//		}

//		if (getHashCodeCallback != null)
//		{
//			this.getHashCodeCallback = getHashCodeCallback;
//			this.getEqualityCompare = getEqualityCompare ?? justUseHashCode;
//		}
//		else
//		{
//			this.getHashCodeCallback = fallbackHashCode;
//			this.getEqualityCompare = getEqualityCompare ?? fallbackEquals;
//		}

//		/**
//		 * @type{Map<number, Array<any>}
//		 */
//		this.map = new Map();
//	}

//	clear()
//	{
//		this.map.clear();
//	}

//	/**
//	 * Adds the value. if the value is already part of the set, this will return false, otherwise it will add it and return true.
//	 * @param {any} value
//	 */
//	add(value)
//	{
//		if (this.contains(value))
//		{
//			return false;
//		}
//		else
//		{
//			let k = this.getHashCodeCallback(value);
//			if (this.map.has(k))
//			{
//				let l = this.map.get(k);
//				(this.map.get(k)).push(value);
//			}
//			else
//			{
//				this.map.set(k, [value]);
//			}

//			return true;
//		}
//	}

//	any(predicate)
//	{
//		return this.values.some(x => predicate(x));
//	}

//	remove(value)
//	{
//		if (!this.contains(value))
//		{
//			return false;
//		}
//		else
//		{
//			let k = this.getHashCodeCallback(value);
//			let g = this.map.get(k);
//			let index = g.findIndex(x => this.getEqualityCompare(x, value));
//			if (index > -1)
//			{
//				let l = g.splice(index, 1);
//				if (l.length > 0) 
//				{
//					this.map.set(k, l);
//				}
//				else
//				{
//					this.map.delete(k);
//				}
//				return true;
//			}
//			else
//			{
//				return false;
//			}
//		}
//	}

//	forEach(callback)
//	{
//		this.values.forEach(callback);
//	}

//	/**
//	 * Determines if this collection contains the given value. 
//	 * @param {any} value the value to check for
//	 * @returns {boolean} true 
//	 */
//	contains(value)
//	{
//		let k = this.getHashCodeCallback(value);
//		return this.map.has(k) && this.map.get(k).some(x => this.getEqualityCompare(x, value));
//	}

//	values()
//	{
//		return (Array.from(this.map.values)).flat();
//	}

//	get size()
//	{
//		return this.map.size;
//	}
//}