document.addEventListener('DOMContentLoaded', initCreateMatch);

function initCreateMatch() {
	var button = document.getElementById('find-user');
	button.addEventListener('click', findUser);
}

function findUser() {
	var req = new XMLHttpRequest(),
		user = document.getElementById('opponent').value,
		url = "http://localhost:9001/api/users/"+user;

	req.open('GET', url, true);

	req.addEventListener('load', function() {
		if (req.status >= 200 && req.status < 400){
			data = JSON.parse(req.responseText);
	    	var foundUser = document.getElementById('foundUser'),
	    		opponentName = document.getElementById('opponentName');
	    		continent = document.getElementById('continent'),
	    		country = document.getElementById('country'),
	    		city = document.getElementById('city');
	    	if(data.found === true) {
	    		opponentName.innerHTML = 'Player: ' + data.username;
	    		continent.innerHTML = 'Continent: ' + data.geolocation.continent;
	    		country.innerHTML = 'Country: ' + data.geolocation.country;
	    		city.innerHTML = 'City: ' + data.geolocation.city; 
	    		foundUser.innerHTML = ''; //If user has successful search after a failed one.
	    	} else {
	    		foundUser.innerHTML = 'User could not be found.';
	    		//If user does following searches after success, divs need to be cleared.
	    		opponentName.innerHTML = '';
	    		continent.innerHTML = '';
	    		country.innerHTML = '';
	    		city.innerHTML = ''
	    	}
		} 
	});
	req.send();
}