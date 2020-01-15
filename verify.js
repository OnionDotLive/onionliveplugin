//'use strict';

function appendMirr(data) {
	mirr = JSON.parse(data).data[0];
	if(mirr.url) {
		var div = document.createElement("h1");
		div = '<br/><a style="background: #2d2d2d; color:yellow; text-align: center" href="'+mirr.url+'">Try this working mirror instead</a>';
		var element = document.getElementById('mainwarn');
		element.innerHTML += div;
	}
}

function newMirr(site, success) {
	if(site) {
		postAjax('https://onion.live/api/store/mirrors/search', 'site='+site+"&ctime$ne=60&orderby=official&orderas=DESC&page=1&perpage=1", success);
	}
}

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

function checkWorking(url, site) {
	var MrChecker = new XMLHttpRequest(),
	CheckThisUrl = "http://"+url+"/";
	MrChecker.open('get', CheckThisUrl, true);
	MrChecker.onreadystatechange = checkReadyState;
	function checkReadyState() {
		if (MrChecker.readyState === 4) {
			if (MrChecker.status >= 200 || MrChecker.status < 304) {
				var element = document.getElementById('mainwarn');
				if(element) {
					element.parentNode.removeChild(element);
				}
			} else {
				var send = browser.runtime.sendMessage({title: "Mirror is down", message: "URL: "+url+" is down at the moment.", type: "down", icon: "error", host: url});
				var element = document.getElementById('mainwarn');
				if(element) {
					element.parentNode.removeChild(element);
				}
				const h1 = document.createElement("h1");
				h1.textContent = "WARNING: Mirror Disconnected !!!";
				h1.setAttribute("style", "background: #2d2d2d; color:red; font-size:4em; text-align: center");
				h1.setAttribute("id", "mainwarn");
				document.body.insertBefore(h1, document.body.firstChild);
				newMirr(site.id, appendMirr);
				send.then(handleResponse, handleError);
			}
		}
	}
        MrChecker.send(null);
}

host = window.location.hostname;
if(host) {
	// Checking for phishing
	postAjax('https://onion.live/api/store/reports/search', 'url$re='+host+'/&type=2000349', function(data){
		obj = JSON.parse(data);
		if(obj.total > 0) {
			if(obj.data[0].site.id) {
				site = obj.data[0].site;
				newMirr(site.id, appendMirr);
				var sending = browser.runtime.sendMessage({title: "Phishing Mirror", message: "URL: "+host+" has been reported as a phishing mirror of "+site.name+".", type: "phishing", icon: "error", host: host});
			} else {
				var sending = browser.runtime.sendMessage({title: "Phishing Mirror", message: "URL: "+host+" has been reported as a phishing mirror.", type: "phishing", icon: "error", host: host});
			}
			const h1 = document.createElement("h1");
			h1.textContent = "WARNING: Phishing Mirror !!!";
			h1.setAttribute("style", "background: #2d2d2d; color:red; font-size:4em; text-align: center");
			h1.setAttribute("id", "mainwarn");
			document.body.insertBefore(h1, document.body.firstChild);
			sending.then(handleResponse, handleError);
		}
	});

	// Checking if mirror is listed in our DB
	postAjax('https://onion.live/api/store/mirrors/search', 'url=http://'+host+'&page=1&perpage=1', function(data){
		obj = JSON.parse(data);
		if(obj.total > 0) {
			if(obj.data[0].site.id) {
				site = obj.data[0].site;
				window.setInterval(function(){
					checkWorking(host, site);
				}, 10000);
			}
			if(obj.data[0].official !== "1") {
				var sending = browser.runtime.sendMessage({title: "Trusted Mirror", message: "URL: "+host+" is listed on our directory.", type: "trusted", icon: "verified", host: host});
			} else {
				var sending = browser.runtime.sendMessage({title: "Trusted Mirror", message: "URL: "+host+" is marked official in our directory.", type: "trusted", icon: "official", host: host});
			}
			sending.then(handleResponse, handleError);
		}
	});
}
