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
	xhr.onreadystatechange = function() {
		if (xhr.readyState>3 && xhr.status==200) { success(xhr.responseText); }
		if (xhr.readyState>3 && xhr.status!==200) { success(xhr.responseText); }
	};
	xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.send(params);
	return xhr;
}

window.showsite = function(site) {
	document.querySelector('.mirrs').innerHTML = '<table class="restbl"><thead><tr><td>URL</td><td>Uptime</td><td>Connection Time</td></tr></thead><tbody class="mirrbdy"></tbody></table>';
	postAjax('https://onion.live/api/store/mirrors/search', 'site='+site+"&ctime$ne=60&orderby=official&orderas=DESC&page=1&perpage=all", function(data){
		obj = JSON.parse(data);
		for(i=0;i<obj.total;i++) {
			document.querySelector('.mirrbdy').innerHTML += '<tr><td><a href="'+obj.data[i].url+'">'+obj.data[i].url+'</a></td><td>'+obj.data[i].uptime+'%</td><td>'+obj.data[i].ctime+'s</td></tr>';
		}
	});
};

window.searchSites = function(search) {
	postAjax('https://onion.live/api/store/sites/search', 'name$re='+search+"&description$re$or="+search+"&page=1&perpage=all", function(data){
		var inputTitle = document.querySelector('.results');
		inputTitle.innerHTML = '<ul class="resul"></ul><div class="mirrs"></div>';
		obj = JSON.parse(data);
		for(i=0;i<obj.total;i++) {
			document.querySelector('.resul').innerHTML += "<li><a href='#' id='"+obj.data[i].id+"' class='site'>"+obj.data[i].name+"</a></li>";
		}
		for(const k of document.querySelectorAll('.site')) {
			k.addEventListener('click', (event) => {
				showsite(event.target.id);
			});
		}
	});
};

function getCurrentTab() {
	browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
		url = tabs[0].url;
		if(url && url != 'about:blank') {
			handleURL(url);
		} else {
			dispList();
		}
	})
}

function dispList(){
	var inputTitle = document.querySelector('.content');
	inputTitle.innerHTML = '<input type="text" class="search" name="search" placeholder="Search for site">';
	inputTitle.innerHTML += '<div class="results"><div>';
	var input = document.querySelector('.search');
	input.addEventListener('change', (event) => {
		searchSites(event.target.value);
	});
}

function handleURL(url){
	var inputTitle = document.querySelector('.url');
	inputTitle.value = url;
}

document.addEventListener("DOMContentLoaded", function () {
	getCurrentTab();
});
