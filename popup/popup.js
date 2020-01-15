/* initialise variables */

//document.addEventListener("DOMContentLoaded", function () {
//	var inputTitle = document.querySelector('.content');
//	var ret = browser.storage.local.get(null);
//	inputTitle.innerHTML='ret';
//});


//browser.runtime.onMessage.addListener(function(message,sender,sendResponse) {
//	var inputTitle = document.querySelector('.content');
//	inputTitle.innerHTML=message.icon;
//});
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

function getAjax(url, data, success) {
	var params = typeof data == 'string' ? data : Object.keys(data).map(
		function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
	).join('&');
	var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	xhr.open('GET', url);
	xhr.setRequestHeader('X-CSRF-TOKEN', $('meta[name="_token"]').attr('content'));
	xhr.onreadystatechange = function() {
		if (xhr.readyState>3 && xhr.status==200) { success(xhr.responseText); }
		if (xhr.readyState>3 && xhr.status!==200) { success(xhr.responseText); }
	};
	xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.send(params);
	return xhr;
}

function getCurrentTab() {
	browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
		url = tabs[0].url;
		if(url) {
			handleURL(url);
		} else {
			dispList();
		}
	})
}

function dispList(){
	var inputTitle = document.querySelector('.content');
}

function handleURL(url){

}

document.addEventListener("DOMContentLoaded", function () {
	getCurrentTab();
});
