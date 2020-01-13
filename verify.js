function postAjax(url, data, success) {
	var params = typeof data == 'string' ? data : Object.keys(data).map(
		function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
	).join('&');
	var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	xhr.open('POST', url);
//	xhr.setRequestHeader('X-CSRF-TOKEN', $('meta[name="_token"]').attr('content'));
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
postAjax('https://onion.live/api/store/reports/search', 'url$re='+host+'/&type=2000349', function(data){
	obj = JSON.parse(data);
	if(obj.total > 0) {
		document.body.innerHTML += '<div style="position:absolute;width:100%;background: #000; text-align: center;z-index:100;top: 0px;"><h1 style="color: red">This site has '+obj.total+' phishing reports</h1></div>';
	}
});

