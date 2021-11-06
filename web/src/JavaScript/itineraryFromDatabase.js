document.addEventListener('DOMContentLoaded', function() {



    //calculate how many days the trip is
    //var date1 = new Date(document.getElementById("startDate").value);//get from database
    //var date2 = new Date(document.getElementById("endDate").value);
    //var diffTime = Math.abs(date2 - date1);
    //var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));


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
            duration: { days: 4 },
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
          AdditionalInformation: description
        }
        })
      }
      calendar.unselect()
    },
    eventClick: function(arg) {
      if (confirm('Are you sure you want to delete this event?')) {
        arg.event.remove()
      }
    },
    dayMaxEvents: true, // allow "more" link when too many events
    events: []
  });


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
    fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/ItineraryManagement?page="+ Number(id), requestItinerary).then(response => response.text()) // <---
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
  let itineraryID = getParameterByName("page");
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
        "title":title,
        "start":start,
        "end":end,
        "address":address,
        "additionalInformation": additionalInformation,
        "latitude": latitude,
        "longitude":longitude
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
    fetch(" https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/ActivityManagement", requestOptions)  
  });
});//end of dom content loaded


