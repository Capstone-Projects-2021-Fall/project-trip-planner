    var callAPI = (username, password)=>{
        // instantiate a headers object
        var myHeaders = new Headers();
        // add content type header to object
        myHeaders.append("Content-Type", "application/json");
        // using built in JSON utility package turn object to string and store in a variable
        var raw = JSON.stringify({"username":username, "password": password});

        // create a JSON object with parameters for API call and store in a variable
        var requestOptions = {
            method: 'GET',
        };
        console.log(username, password);
        // make API call with parameters and use promises to get response
        fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/UserManagement?username=" + username + "&password=" + password, requestOptions).then(response => response.text())
      .then( function(data){
          let value = JSON.parse(data);
          console.log(value);
      });
    }