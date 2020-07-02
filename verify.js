//'use strict';

function appendMirr(data) {
	mirr = JSON.parse(data)[0];
	if(mirr.url) {
		var altelem = document.createElement("h1");
		altelem = '<br/><a style="background: #2d2d2d !important; color:yellow !important; text-align: center !important; position: fixed !important; width: 100% !important; line-height: 1.5 !important; z-index: 9999 !important; display: block !important; visibility: visible !important; opacity: 1 !important;" href="'+mirr.url+'">Try this working mirror instead</a>';
		var element = document.getElementById('mainwarn');
		element.innerHTML += altelem;
	}
}

function newMirr(site, success) {
	if(site) {
		getAjax('https://onion.live/api/v2/public/mirrors?site='+site+'&max=1', '', success);
	}
}

function handleResponse(message) {
	console.log(`Message from the background script: ${message.response}`);
}

function handleError(error) {
	console.log(`Error: ${error}`);
}

function getAjax(url, data, success) {
	var params = typeof data == 'string' ? data : Object.keys(data).map(
		function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
	).join('&');
	var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	xhr.open('GET', url);
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
				const warnelem = document.createElement("h1");
				warnelem.textContent = "WARNING: Mirror Disconnected !!!";
				warnelem.setAttribute("style", "background: #2d2d2d !important; color:red !important; font-size:4em !important; text-align: center !important; position: fixed !important; top: 0px !important; width: 100% !important; line-height: 1.5 !important; z-index: 9999 !important; display: block !important; visibility: visible !important; opacity: 1 !important;");
				warnelem.setAttribute("id", "mainwarn");
				document.body.insertBefore(warnelem, document.body.firstChild);
				newMirr(site, appendMirr);
				send.then(handleResponse, handleError);
			}
		}
	}
	MrChecker.send(null);
}

function embedAlert(mirr, alert) {
	const warnelem = document.createElement("h1");
	warnelem.textContent = "WARNING: "+alert+" !!!";
	warnelem.setAttribute("style", "background: #2d2d2d !important; color:red !important; font-size:4em !important; text-align: center !important; position: fixed !important; top: 0px !important; width: 100% !important; line-height: 1.5 !important; z-index: 9999 !important; display: block !important; visibility: visible !important; opacity: 1 !important;");
	warnelem.setAttribute("id", "alertwarn");
	document.body.insertBefore(warnelem, document.body.firstChild);
	if(mirr) {
		var altelem = document.createElement("h1");
		altelem = '<br/><a style="background: #2d2d2d !important; color:yellow !important; text-align: center !important; position: fixed !important; width: 100% !important; line-height: 1.5 !important; z-index: 9999 !important; display: block !important; visibility: visible !important; opacity: 1 !important;" href="'+mirr+'">Try this working mirror instead</a>';
		var element = document.getElementById('alertwarn');
		element.innerHTML += altelem;
	}
}

function onError(error) {
	console.log(`Error: ${error}`);
}

function onGot(item) {
	let checkevery = "10000";
	if (item.checkevery) {
		checkevery = item.checkevery * 1000;
	}
	if(checkevery == 0) {
		return;
	}
	window.setInterval(function(){
		checkWorking(window.host, window.site);
	}, checkevery);

	if(item.realtime && item.realtime == true) {
		verify();
        localStorage.setItem(host, 1);
	}
}

let pversion = 0.1;
checked = localStorage.getItem("versioncheck");
if(checked != 1) {
    getAjax('https://onion.live/api/v2/public/version', '', function(data){
        obj = JSON.parse(data);
        version = obj.version;
        if(pversion < version) {
            var sending = browser.runtime.sendMessage({title: "Plugin Outdated", message: "Version "+version+" is now available for download. Please update to latest version to ensure maximum safety.", type: "trusted", icon: "official", host: 'version'});
            sending.then(handleResponse, handleError);
        }
        localStorage.setItem("versioncheck", 1);
    });
}

let getting = browser.storage.sync.get(["checkevery", "realtime"]);
getting.then(onGot, onError);

function verify() {
	host = window.location.hostname;
	if(host) {
		getAjax('https://onion.live/api/v2/public/verify?host='+host, '', function(data){
			obj = JSON.parse(data);
			if(obj.site.id) {
				site = obj.site.id;
				window.site = site;
				window.host = host;
				let getting = browser.storage.sync.get("checkevery");
				getting.then(onGot, onError);
			}
			// Phishing
			if(obj.type.code == "1") {
				var sending = browser.runtime.sendMessage({title: "Phishing Mirror", message: "URL: "+host+" has been reported as a phishing mirror of "+obj.site.name+".", type: "phishing", icon: "error", host: host});
				mirr = null;
				if(obj.site.mirror) {
					mirr = obj.site.mirror;
				}
				embedAlert(mirr, "Phishing Mirror");
				window.setInterval(function(){
					embedAlert(mirr, "Phishing Mirror");
				}, 10000);
				sending.then(handleResponse, handleError);
			// Closed
            } else if(obj.type.code == "4") {
				var sending = browser.runtime.sendMessage({title: "Site closed", message: obj.site.name+" has been closed.", type: "phishing", icon: "error", host: host});
				mirr = null;
				if(obj.site.mirror) {
					mirr = obj.site.mirror;
				}
				embedAlert(mirr, "Site Closed");
				window.setInterval(function(){
					embedAlert(mirr, "Site Closed");
				}, 10000);
				sending.then(handleResponse, handleError);
			// Ceased
            } else if(obj.type.code == "5") {
				var sending = browser.runtime.sendMessage({title: "Ceased by LE", message: obj.site.name+" has been ceased by Law Enforcement.", type: "phishing", icon: "error", host: host});
				mirr = null;
				if(obj.site.mirror) {
					mirr = obj.site.mirror;
				}
				embedAlert(mirr, "Ceased by LE");
				window.setInterval(function(){
					embedAlert(mirr, "Ceased by LE");
				}, 10000);
				sending.then(handleResponse, handleError);
			// Closed
            } else if(obj.type.code == "6") {
				var sending = browser.runtime.sendMessage({title: "SCAM ALERT", message: obj.site.name+" is a scam or harmful. Please exit immediately.", type: "phishing", icon: "error", host: host});
				mirr = null;
				if(obj.site.mirror) {
					mirr = obj.site.mirror;
				}
				embedAlert(mirr, "Scam site");
				window.setInterval(function(){
					embedAlert(mirr, "Scam site");
				}, 10000);
				sending.then(handleResponse, handleError);
            // Trusted
			} else if(obj.type.code == "2") {
				var sending = browser.runtime.sendMessage({title: "Trusted Mirror", message: "URL: "+host+" is listed on our directory.", type: "trusted", icon: "verified", host: host});
				sending.then(handleResponse, handleError);
			// Official
			} else if(obj.type.code == "3") {
				var sending = browser.runtime.sendMessage({title: "Official Mirror", message: "URL: "+host+" is marked official in our directory.", type: "trusted", icon: "official", host: host});
				sending.then(handleResponse, handleError);
			// Unknown
			} else {

			}
		});
	}
}
