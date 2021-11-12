document.addEventListener('DOMContentLoaded', function() {
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

function loadItinerary(search){
    let raw = {
        "search": search
    }
    raw = JSON.stringify(raw);
    console.log(raw);
    //HTTP request parameters to get the itinerary with its ID
    var searchActivities = {
      method: 'POST',
      body:raw,
      headers: {
        "Access-Control-Allow-Headers":"*"
        }

    };
    // make API call with parameters and use promises to get response
    fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/SearchItinerariesByActivity", searchActivities).then(response => response.text())
    .then( 
        function(data){
            let value = JSON.parse(data);
            console.log(value);
            }//end data function
            );//end fetch.then
            }
  let search = getParameterByName("search");
  loadItinerary(search);
  
});