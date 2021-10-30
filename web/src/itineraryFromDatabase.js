

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
        var title = prompt('Event Title:');
        if (title) {
          calendar.addEvent({
            title: title,
            start: arg.start,
            end: arg.end,
            allDay: arg.allDay
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
    var requestItinerary = {
        method: 'GET',
        headers: {
          "Access-Control-Allow-Headers":"*"
          }

      };
      // make API call with parameters and use promises to get response
      fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/ItineraryManagement", requestItinerary).then(response => response.text()) // <---
      .then( function(data){let value = JSON.parse(data);
    console.log(value);
     let count = (Object.keys(value).length);
    for(let index = 0; index < count; index++){
      calendar.addEvent({
            title: value[index]["title"],
            start: Date.parse(value[index]["day"] + " " + value[index]["start"]),
            end: Date.parse(value[index]["day"] + " " + value[index]["end"])
          });
    } }//end data function

    );//end fetch.then





    calendar.render();
  });//end of dom content loaded
