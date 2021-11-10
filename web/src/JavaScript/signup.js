CallAPI = (username, email, password, firstName, lastName, dob)
{
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
    fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/UserManagement", requestOptions).then(response =>
    {
        /* ERROR CODES
         * 1: Email already taken.
         * 2: Screen name already taken.
         * 3: Password invalid (too short, needs to be 8+ characters, maxed at 64)
         * 4: Email invalid format NOT IMPLEMENTED YET!
         */

		var errWrapper = document.getElementById('error-msg-holder');
		var errMsg = document.getElementById('error-msg');

		errWrapper.style.visibility = "hidden";
		errMsg.textContent = "";

		if (response.status == 200)
		{
			document.location = "signupSuccess.html";
		}
		else 
		{
			response.json().then(output =>
			{
				errWrapper.style.visibility = "visible";

				var err = output["errorCode"];
				if (err == 1)
				{
					errMsg.textContent = "a user with this email already exists. did you mean to login?";
				}
				else if (err == 2)
				{
					errMsg.textContent = "that username is already taken";
				}
				else if (err == 3)
				{
					errMsg.textContent = "your password is too short. It must be at least 8 characters, up to a max of 64 characters.";
				}
				else if (err == 4)
				{
					errMsg.textContent = "Your email is not valid. This isn't enforced as of this writing so you should never see this!";
				}
				else
				{
					errMsg.textContent = "unexpected error";
				}
			});
		}
	});
}; 
