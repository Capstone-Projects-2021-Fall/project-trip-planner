function CallAPI(email, password) 
{
	// instantiate a headers object
	var myHeaders = new Headers();
	// add content type header to object
	myHeaders.append("Content-Type", "application/json");
	// using built in JSON utility package turn object to string and store in a variable
	var raw = JSON.stringify({ "email": email, "password": password });

	// create a JSON object with parameters for API call and store in a variable
	var requestOptions = {
		method: 'POST',
		body: raw,
	};
	// make API call with parameters and use promises to get response
	fetch("https://hhd3reswr9.execute-api.us-west-2.amazonaws.com/NormalUserLogin", requestOptions).then(response =>
	{
		var errWrapper = document.getElementById('login-error-msg-holder');
		var errMsg = document.getElementById('login-error-msg');

		errWrapper.style.visibility = "hidden";
		errMsg.textContent = "";

		if (response.status == 200)
		{
			//eval();
			response.text().then(output =>
			{
				console.log(output);
				document.cookie = "id=" + output + "; max-age=7200";
				document.location = "account.html";
			});
		}
		else 
		{
			response.json().then(output =>
			{
				errWrapper.style.visibility = "visible";

				var err = output["errorCode"];
				if (err == 1)
				{
					errMsg.textContent = "invalid user";
				}
				else if (err == 2)
				{
					errMsg.textContent = "invalid user and/or password";
				}
				else
				{
					errMsg.textContent = "unexpected error";
				}
			});
		}
	});
}