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
      modal.style.display = "none";
     
      //HARDCODED USERID VALUE, MUST CHANGE!
      var userID = 2;
      //visibility variable most likely not working cause it has to check which option has been selected
      //var visibility = document.getElementById("visibility").value;
      var newItinerary = {
        "itineraryName": itineraryName,
        "startDate":startDate,
        "endDate":endDate,
        "userID": userID
      };
      newItinerary = JSON.stringify(newItinerary);
      /*
        Post the created itinerary to the database
      */ 
      var postItinerary = {
        method: 'POST',
        body:newItinerary,
        headers: {
          "Access-Control-Allow-Headers":"*"
          }
      };
  
      // make API call with parameters and use promises to get response
      fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/ItineraryManagement", postItinerary).then(response => response.text());
      createAndLoadCalendar(startDate, endDate);      
  } //end onclick save button

  
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

  } //end onclick save button



  function createAndLoadCalendar(startDate, endDate) {
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
                  duration: {
                      days: diffDays + 1
                  },
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
                      allDay: arg.allDay,
                      extendedProps: {
                          photos: []
                      } //end extended props
                  })
              }
              calendar.unselect()
          },
          eventClick: function(arg) { //when they click on an event
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
                          //console.log(slideshowContainer);



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

      var button2 = document.getElementById("saveBtn");
      button2.onclick = function() {
          console.log("clicked");
      }

      calendar.render();
  } //end create calendar function




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


}); //end of dom content loaded