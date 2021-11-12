document.addEventListener('DOMContentLoaded', function() {
    var userID = document.cookie;
    userID = userID.replace(/\D/g, "");

    let json = {
        "userID":userID
    }
    json = JSON.stringify(json);
    
    var requestItinerary2 = {
        method: 'POST',
        body:json
    };

    // make API call with parameters and use promises to get response
    fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/GetUserItineraries", requestItinerary2)  .then(function (a) {
        return a.json(); // call the json method on the response to get JSON
    })
    .then(function (json) {
        let list = document.getElementById("itineraryList");
        for(let index = 0; index < json.length; index++){
            var entry = document.createElement('h5');
            var aTag = document.createElement('a');
            aTag.innerHTML = json[index]["ItineraryName"];
            aTag.setAttribute("href", "itineraryFromDatabase.html?page="+json[index]["ItineraryName"]);
            entry.appendChild(aTag)
            list.appendChild(entry);
            console.log(json[index]);
            }//end data function
    });/*.then( 
        function(data){
            let value = JSON.parse(data);
            let count = (Object.keys(value).length);
            let list = document.getElementById("itineraryList");
            for(let index = 0; index < count; index++){
                var entry = document.createElement('li');
                var aTag = document.createElement('a');
                aTag.innerHTML = value[index];
                aTag.setAttribute("href", "itineraryFromDatabase.html?page="+value[index][0]);
                entry.appendChild(aTag)
                list.appendChild(entry);
                console.log(value[index]);
             }//end data function
        });*/

});//end of dom content loaded