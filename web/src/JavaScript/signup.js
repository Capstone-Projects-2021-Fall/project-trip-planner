var callAPI = (username, email, password, firstName, lastName, dob)=>{
    // instantiate a headers object
    var myHeaders = new Headers();
    // add content type header to object
    myHeaders.append("Content-Type", "application/json");
    // using built in JSON utility package turn object to string and store in a variable
    var raw = JSON.stringify({"username":username,"email":email, "password": password, "firstName":firstName,"lastName": lastName, "DOB":dob});

    // create a JSON object with parameters for API call and store in a variable
    var requestOptions = {
        method: 'POST',
        body:raw
    };
    // make API call with parameters and use promises to get response
    fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/UserManagement", requestOptions)
    .catch(error => console.log('error', error));
}; 
