//'use strict';


function handleResponse(message) {
  console.log(`Message from the background script:  ${message.response}`);
}

function handleError(error) {
  console.log(`Error: ${error}`);
}

function postAjax(url, data, success) {
	var params = typeof data == 'string' ? data : Object.keys(data).map(
		function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
	).join('&');
	var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	xhr.open('POST', url);
	xhr.onreadystatechange = function() {
		if (xhr.readyState>3 && xhr.status==200) { success(xhr.responseText); }
		if (xhr.readyState>3 && xhr.status!==200) { success(xhr.responseText); }
	};
	xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.send(params);
	return xhr;
}

host = window.location.hostname;

// Checking for phishing
postAjax('https://onion.live/api/store/reports/search', 'url$re='+host+'/&type=2000349', function(data){
	obj = JSON.parse(data);
	if(obj.total > 0) {
		var sending = browser.runtime.sendMessage({title: "Phishing Mirror", message: "URL: "+host+" has been reported as a phishing mirror.", type: "phishing", icon: "error", host: host});
		
		sending.then(handleResponse, handleError);
	}
});

// Checking if mirror is listed in our DB
postAjax('https://onion.live/api/store/mirrors/search', 'url=http://'+host+'&page=1&perpage=1', function(data){
	obj = JSON.parse(data);
	if(obj.total > 0) {
		if(obj.data[0].official !== "1") {
			var sending = browser.runtime.sendMessage({title: "Trusted Mirror", message: "URL: "+host+" is listed on our directory.", type: "trusted", icon: "verified", host: host});
		} else {
			var sending = browser.runtime.sendMessage({title: "Trusted Mirror", message: "URL: "+host+" is marked official in our directory.", type: "trusted", icon: "official", host: host});
		}
		sending.then(handleResponse, handleError);
	}
})

