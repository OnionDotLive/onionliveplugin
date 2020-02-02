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

window.verify = function(host) {
	document.querySelector('.note-container').style.display = "inline-block";
	getAjax('https://onion.live/api/public/verify?host='+host, '', function(data){
		obj = JSON.parse(data);
		if(obj.type.code == "1") {
			document.querySelector('.mainresults').innerHTML += '<img class="statuslogo" src="error.png" width="100"/><br/><span class="statuswarn status">Phishing Mirror !!!</span>';
			statusclass='statuswarn';
		// Trusted
		} else if(obj.type.code == "2") {
			document.querySelector('.mainresults').innerHTML += '<img class="statuslogo" src="verified.png" width="100"/><br/><span class="statusok status">Trusted Mirror !!!</span>';
			statusclass='statusok';
		// Official
		} else if(obj.type.code == "3") {
			document.querySelector('.mainresults').innerHTML += '<img class="statuslogo" src="official.png" width="100"/><br/><span class="statusok status">Official Mirror !!!</span>'
			statusclass='statusok';
		// Unknown
		} else {
			searchSites('');
		}
		document.querySelector('.note-container').style.display = "none";
		if(obj.site.id) {
			site = obj.site;
			document.querySelector('.mainresults').innerHTML += '<br/><span class="'+statusclass+' status">'+site.name+'</span>';
			showsite(site.id);
		}
		var input = document.querySelector('.search');
		input.addEventListener('keyup', (event) => {
			searchSites(event.target.value);
		});
	});
};

window.showsite = function(site) {
	document.querySelector('.note-container').style.display = "inline-block";
	document.querySelector('.mirrs').innerHTML = '<table class="restbl"><thead><tr><td class="urltd">URL</td><td>Uptime</td><td>Connection Time</td></tr></thead><tbody class="mirrbdy"></tbody></table>';
	getAjax('https://onion.live/api/public/mirrors?site='+site ,'', function(data){
		document.querySelector('.note-container').style.display = "none";
		obj = JSON.parse(data);
		for(i=0;i<obj.length;i++) {
			document.querySelector('.mirrbdy').innerHTML += '<tr><td class="urltd"><a href="'+obj[i].url+'">'+obj[i].url+'</a></td><td>'+obj[i].uptime+'%</td><td>'+obj[i].ctime+'s</td></tr>';
		}
		if(obj.length === 0) {
			document.querySelector('.mirrbdy').innerHTML += '<tr><td colspan=4>Site has no working mirrors.</td></tr>';
		}
	});
};

window.searchSites = function(search = null) {
	document.querySelector('.note-container').style.display = "inline-block";
	getAjax('https://onion.live/api/public/search?q='+search, '', function(data){
		logo = document.querySelector('.statuslogo');
		if(logo) {
			logo.parentNode.removeChild(logo);
		}
		warn = document.querySelector('.status');
		if(warn) {
			warn.parentNode.removeChild(warn);
		}
		document.querySelector('.note-container').style.display = "none";
		var resclass = document.querySelector('.results');
		resclass.innerHTML = '<ul class="resul"></ul><div class="mirrs"></div>';
		obj = JSON.parse(data);
		for(i=0;i<obj.length;i++) {
			document.querySelector('.resul').innerHTML += "<li><a href='#' id='"+obj[i].id+"' class='site'>"+obj[i].name+"</a></li>";
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
		if(url && url != 'about:blank' && url != 'about:tor') {
			handleURL(url);
		} else {
			dispList(1);
		}
	})
}

function dispList(featured){
	var contentclass = document.querySelector('.content');
	contentclass.innerHTML += '<div class="results"><div>';
	if(featured === 1) {
		searchSites();
	}
	var input = document.querySelector('.search');
	input.addEventListener('keyup', (event) => {
		searchSites(event.target.value);
	});
}

function handleURL(url){
	var urlclass = document.querySelector('.url');
	urlclass.value = url;
	var parser = document.createElement('a');
	parser.href = url;
	dispList(0);
	var results = document.querySelector('.results');
	results.innerHTML = '<ul class="resul"></ul><div class="mirrs"></div>';
	verify(parser.hostname);
}

document.addEventListener("DOMContentLoaded", function () {
	getCurrentTab();
});
