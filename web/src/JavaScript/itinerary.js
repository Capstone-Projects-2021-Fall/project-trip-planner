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

      var itineraryName = document.getElementById("tripName").value;
      var startDate = new Date(document.getElementById("startDate").value);
      var endDate = new Date(document.getElementById("endDate").value);
      var location = document.getElementById("location").value;
      //HARDCODED USERID VALUE, MUST CHANGE!
      var userID = 2;

      //visibility variable most likely not working cause it has to check which option has been selected
      //var visibility = document.getElementById("visibility").value;
      var newItinerary = {
        "itineraryName": itineraryName,
        "startDate":startDate,
        "endDate":endDate,
        "userID": userID,
        "location":location
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
      //fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/ItineraryManagement", postItinerary).then(response => response.text());
      fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/GetUserItinerary", postItinerary).then(response => response.text()) // <---
      .then( function(data){
        let page = JSON.parse(data);
        window.location.href = "itineraryFromDatabase.html?page=" + page;
      }      
    );

    } //end onclick save button

  

}); //end of dom content loaded