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

function getLatestVersion() {
    getAjax('https://onion.live/api/v2/public/version', '', function(data){
        obj = JSON.parse(data);
        version = obj.version;
        pversion = 0.1;
        if(pversion >= version) {
            document.querySelector('.latestver').innerHTML = 'Your plugin is up to date.<br/>';
        } else if (pversion < version) { 
            document.querySelector('.latestver').innerHTML = 'Your plugin is outdated.<br/><a href="https://addons.mozilla.org/en-US/firefox/addon/onion-live/">Update to latest version (v'+version+')</a>';
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
	getLatestVersion();
});
