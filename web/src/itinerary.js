

  document.addEventListener('DOMContentLoaded', function() {
 //SCRIPT FOR MODAL ITINERARY MODAL FORM
    // Get the modal
    var modal = document.getElementById("myModal");

    // Get the button that opens the modal
    //var btn = document.getElementById("myBtn");

    //Get the button that saves the modal
    var saveBtn = document.getElementById("saveBtn");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];


    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
      modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }

    saveBtn.onclick = function() {
      console.log("save click funciton called");
      modal.style.display = "none";
      var date1 = new Date(document.getElementById("startDate").value);
      var date2 = new Date(document.getElementById("endDate").value);

      createAndLoadCalendar(date1, date2);

    }//end onclick save button
 //END OF SCRIPT FOR MODAL ITINERARY MODAL FORM

 //SCRIPT FOR EVENT DETAILS MODAL
 //get the modal
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

    }//end onclick save button

    function createAndLoadCalendar(startDate, endDate){
    console.log("create function called");
  var calendarEl = document.getElementById('calendar');
  //calculate how many days the trip is
      //var date1 = new Date(document.getElementById("startDate").value);
      //var date2 = new Date(document.getElementById("endDate").value);
      var diffTime = Math.abs(endDate - startDate);
      var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    var calendar = new FullCalendar.Calendar(calendarEl, {
      initialDate: startDate,
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
              duration: { days: diffDays +1 },
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
      eventClick: function(arg) {//when they click on an event
        eventDetailsModal.style.display = "block";
        //need to change the event start time or end time or title here
        //then apply those changes using event functions

        document.getElementById("eventName").innerHTML=arg.event.title;
        document.getElementById("startDateEventDetails").innerHTML = arg.event.start;
        document.getElementById("endDateEventDetails").innerHTML = arg.event.end;


        //console.log(arg);
        //calendar.destroy();//probs dont do this, doesnt seem like a good idea
      },
      dayMaxEvents: true, // allow "more" link when too many events
    });

  var button2 = document.getElementById("saveBtn");
  button2.onclick = function(){console.log("clicked");}

    calendar.render();

  }//end create calendar function

  });//end of dom content loaded