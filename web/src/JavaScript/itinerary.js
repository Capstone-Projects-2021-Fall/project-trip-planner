document.addEventListener('DOMContentLoaded', function() {


    let map;
    let marker;
    let geocoder;
    let responseDiv;
    let response;


    function initMap() {

        // Generate Second Map
        map2 = new google.maps.Map(document.getElementById("map2"), {
             zoom: 16,
             center: { lat: 37, lng: -95},
             mapTypeControl: false,
             });
  
          // Generate First Map
           map = new google.maps.Map(document.getElementById("map"), {
                zoom: 16,
                center: { lat: 37, lng: -95},
                mapTypeControl: false,
                });
  
  
  
  
  
  
  
  
  
  
  
          marker = new google.maps.Marker({
                map,
                });
  
          marker2 = new google.maps.Marker({
                map2,
                });
  
        geocoder = new google.maps.Geocoder();
  
  
  
    }

    function clear() {
    marker.setMap(null);
    responseDiv.style.display = "none";
    }
    function geocode(request) {
    clear();
    geocoder
    .geocode(request)
    .then((result) => {
    const { results } = result;

    map.setCenter(results[0].geometry.location);
    marker.setPosition(results[0].geometry.location);
    marker.setMap(map);
    responseDiv.style.display = "block";
    response.innerText = JSON.stringify(result, null, 2);
    return results;
    })
    .catch((e) => {
    alert("Geocode was not successful for the following reason: " + e);
    });
    }

    
    var eventDetailsModal = document.getElementById("eventDetailsModal");
    //Get the button that saves the modal
    var saveBtnEventDetails = document.getElementById("saveBtnEventDetails");
    // Get the <span> element that closes the modal
    var spanEventDetails = document.getElementsByClassName("close")[0];
    // When the user clicks on <span> (x), close the modal
    spanEventDetails.onclick = function() {
        eventDetailsModal.style.display = "none";
    }
    saveBtnEventDetails.onclick = function() {
        eventDetailsModal.style.display = "none";
    } //end onclick save button

    saveBtnEventDetails.onclick = function() {
      eventDetailsModal.style.display = "none";
      document.getElementById("map").style.display = "none";

    }//end onclick save button

    
    function createAndLoadCalendar() {
      var calendarEl = document.getElementById('calendar');
      var calendar = new FullCalendar.Calendar(calendarEl, {
        initialDate: '2021-10-00',
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
        select: function(arg) {
          var title = prompt('Event Title: ');
          var address = prompt("Address: ");
          var description = prompt("Description: ");
          var longitude = prompt("Longitude: ");
          var latitude = prompt("Latitude: ");
          if (title) {
            calendar.addEvent({
              title: title,
              start: arg.start,
              end: arg.end,
              allDay: arg.allDay,
              extendedProps: {
                Latitude: longitude,
                Longitude: latitude,
                Address: address,
                AdditionalInformation: description,
                photos: []
              }
            })
          }
          calendar.unselect()
        },
        eventClick: function(arg) { //when they click on an event
            eventDetailsModal.style.display = "block";
            eventDetailsModal.style.display = "block";
            document.getElementById("map").style.display = "block";




        //MAP SCRIPT
        geocode({ address: arg.event.extendedProps.Address });


      function geocode(request) {
      clear();
      geocoder
      .geocode(request)
      .then((result) => {
      const { results } = result;

      map.setCenter(results[0].geometry.location);
      marker.setPosition(results[0].geometry.location);
      marker.setMap(map);
      responseDiv.style.display = "block";
      response.innerText = JSON.stringify(result, null, 2);
      return results;
      })
      .catch((e) => {
      alert("Geocode was not successful for the following reason: " + e);
      });
      }






            eventDetailsModal.style.display = "block";
          //need to change the event start time or end time or title here
          //then apply those changes using event functions
          document.getElementById("eventName").innerHTML = arg.event.title;
          document.getElementById("startDateEventDetails").innerHTML = arg.event.start;
          document.getElementById("endDateEventDetails").innerHTML = arg.event.end;
          //get the button for uploading photos
          var uploadPhotosButton = document.getElementById("uploadPhotosEventDetails");
          uploadPhotosButton.onclick = function() {
            const client = filestack.init("AzDBLWEvORZajUBUZlIdgz");
            const options = {
              accept: ["image/*"],
              onUploadDone: file => {
                //console.log(file);
                //loop through uploaded photos and add them to the photos array for the event
                //console.log(file["filesUploaded"]["0"]["url"]);//should be the url
                var url = file["filesUploaded"]["0"]["url"];
                //console.log("url " + url);
                //console.log("photos array:" + arg.event.extendedProps.photos);
                var currentPhotoArray = arg.event.extendedProps.photos.slice(0);
                //console.log("currentPhotoArray " + currentPhotoArray);
                currentPhotoArray.push(url);
                var addedPhotoArray = currentPhotoArray.slice(0);
                //console.log("addedPhotoArray: " + addedPhotoArray);
                arg.event.setExtendedProp("photos", addedPhotoArray);
                console.log("photos array: " + arg.event.extendedProps.photos);
                var slideshowContainer = document.getElementsByClassName("slideshow-container")[0];
                //var imgs = ["https://cdn.filestackcontent.com/qsW95M8aRQ2cI5GKZ4I6"];
                //remove all children from slide show container, except the prev and next arrows
                const removeChilds = (parent) => {
                  var done = 0;
                  while (parent.lastChild && done == 0) {
                    //console.log(parent.lastChild);
                    //console.log(parent.lastChild.className);
                    if (parent.lastChild.className != "next" && parent.lastChild.className != "prev") {
                      parent.removeChild(parent.lastChild);
                    } else {
                      done = 1;
                    }
                  }
                };
                // remove all child nodes
                removeChilds(slideshowContainer);
                arg.event.extendedProps.photos.forEach(function(url, index, originalArray) {
                  var div1 = document.createElement('div');
                  div1.className = "mySlides fade";
                  var tempImg = document.createElement('img');
                  tempImg.style.width = "100%";
                  tempImg.src = url;
                  div1.appendChild(tempImg);
                  slideshowContainer.appendChild(div1);
                });
                //display image in carousel
                var slideIndex = 1;
                showSlides(slideIndex);
                // Next/previous controls
                function plusSlides(n) {
                  showSlides(slideIndex += n);
                }
                // Thumbnail image controls
                function currentSlide(n) {
                  showSlides(slideIndex = n);
                }
    
                function showSlides(n) {
                  var i;
                  var slides = document.getElementsByClassName("mySlides");
                  var dots = document.getElementsByClassName("dot");
                  if (n > slides.length) {
                    slideIndex = 1
                  }
                  if (n < 1) {
                    slideIndex = slides.length
                  }
                  for (i = 0; i < slides.length; i++) {
                    slides[i].style.display = "none";
                  }
                  for (i = 0; i < dots.length; i++) {
                    dots[i].className = dots[i].className.replace(" active", "");
                  }
                  slides[slideIndex - 1].style.display = "block";
                  dots[slideIndex - 1].className += " active";
                }
              } //end on upload done
            }; //end options
            client.picker(options).open();
          } //end on click upload photos button
        },
        dayMaxEvents: true, // allow "more" link when too many events
        events: []
      });
      return calendar;
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
  
    /**
     * Fill in calendar with activities from database
     */
    function loadItinerary(id){
      //HTTP request parameters to get the itinerary with its ID
      var requestItinerary = {
        method: 'GET',
        headers: {
          "Access-Control-Allow-Headers":"*"
          }
  
      };
  
      // make API call with parameters and use promises to get response
      fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/GetActivitiesForItinerary?page="+ Number(id), requestItinerary).then(response => response.text()) // <---
      .then( function(data){let value = JSON.parse(data);
      
      let count = (Object.keys(value).length);
      //loops through returned json file to extract every activity from the itinerary
      for(let index = 0; index < count; index++){
        calendar.addEvent({
          title: value[index]["ActivityName"],
          start: Date.parse(value[index]["StartTime"]),
          end: Date.parse(value[index]["EndTime"]),
          extendedProps: {
            Latitude: value[index]["Latitude"],
            Longitude: value[index]["Longitude"],
            Address: value[index]["Address"],
            AdditionalInformation: value[index]["AdditionalInformation"],
          }
        });
      } 
    }//end data function
      );//end fetch.then
    }
    
  
    //Load Itinerary
    let calendar = createAndLoadCalendar();
    let itineraryID = getParameterByName("itinerary_id");
    loadItinerary(itineraryID);
    calendar.render();
  
      
    /** 
     * Update itinerary everytime the user saves it
     **/
    document.getElementById("save").addEventListener("click", function(){
      let index = 0;
      let saveEvents = {
        //change itinerary id when creating new itinerary feature is added
        "sourceItineraryID": itineraryID,
        "activities":[]             
      };
      calendarArr = calendar.getEvents();
    
      //loop through events from calendar and prepare them into an array to be sent off to the database
      for(index; index < calendarArr.length; index++){
        let title = calendarArr[index]["_def"]["title"];
        let additionalInformation = calendarArr[index]["_def"]["extendedProps"]["AdditionalInformation"];
        let latitude = calendarArr[index]["_def"]["extendedProps"]["Latitude"];
        let longitude = calendarArr[index]["_def"]["extendedProps"]["Longitude"];
        let address = calendarArr[index]["_def"]["extendedProps"]["Address"]
        let start = calendarArr[index]["_instance"]["range"]["start"].toJSON();
        let end = calendarArr[index]["_instance"]["range"]["end"].toJSON();
        saveEvents.activities.push({
          "ActivitiyName":title,
          "StartTime":start,
          "EndTime":end,
          "Address":address,
          "AdditionalInformation": additionalInformation,
          "Latitude": latitude,
          "Longitude":longitude
          });
      }
      
      var json = JSON.stringify(saveEvents);
      // create a JSON object with parameters for API call and store in a variable
      var requestOptions = {
        mode: 'no-cors',
        method: 'POST',
        body:json,
      };
      // make API call with parameters and use promises to get response
      fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/GetActivitiesForItinerary", requestOptions)  
    });
  
  
  
  
  
    var slideIndex = 1;
    showSlides(slideIndex);
  
    // Next/previous controls
    function plusSlides(n) {
        showSlides(slideIndex += n);
    }
  
    // Thumbnail image controls
    function currentSlide(n) {
        showSlides(slideIndex = n);
    }
  
    function showSlides(n) {
        var i;
        var slides = document.getElementsByClassName("mySlides");
        var dots = document.getElementsByClassName("dot");
        if (n > slides.length) {
            slideIndex = 1
        }
        if (n < 1) {
            slideIndex = slides.length
        }
        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
        for (i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(" active", "");
        }
        slides[slideIndex - 1].style.display = "block";
        dots[slideIndex - 1].className += " active";
    }
  
  });//end of dom content loaded
  
  var slideIndex = 1;
          showSlides(slideIndex);
  
          // Next/previous controls
          function plusSlides(n) {
            showSlides(slideIndex += n);
          }
  
          // Thumbnail image controls
          function currentSlide(n) {
            showSlides(slideIndex = n);
          }
  
          function showSlides(n) {
            var i;
            var slides = document.getElementsByClassName("mySlides");
            var dots = document.getElementsByClassName("dot");
            if (n > slides.length) {slideIndex = 1}
            if (n < 1) {slideIndex = slides.length}
            for (i = 0; i < slides.length; i++) {
                slides[i].style.display = "none";
            }
            for (i = 0; i < dots.length; i++) {
                dots[i].className = dots[i].className.replace(" active", "");
            }
            slides[slideIndex-1].style.display = "block";
            dots[slideIndex-1].className += " active";
          }
  
  
