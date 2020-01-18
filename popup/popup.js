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

window.verify = function(host) {
	document.querySelector('.note-container').style.display = "inline-block";
	// Checking for phishing
	postAjax('https://onion.live/api/store/reports/search', 'url$re='+host+'/&type=2000349', function(data){
		obj = JSON.parse(data);
		if(obj.total > 0) {
			document.querySelector('.mainresults').innerHTML += '<img class="statuslogo" src="error.png" width="100"/><br/><span class="statuswarn status">Phishing Mirror !!!</span>';
			if(obj.data[0].site.id) {
				site = obj.data[0].site;
				document.querySelector('.mainresults').innerHTML += '<br/><span class="statuswarn status">'+site.name+'</span>';
				showsite(site.id);
			}
		}
		var input = document.querySelector('.search');
		input.addEventListener('keyup', (event) => {
			searchSites(event.target.value);
		});
	});

	// Checking if mirror is listed in our DB
	postAjax('https://onion.live/api/store/mirrors/search', 'url=http://'+host+'&url$eq$or=https://'+host+'&url$is$or=http://'+host+'/&url$as$or=https://'+host+'/&page=1&perpage=1', function(data){
		obj = JSON.parse(data);
		if(obj.total > 0) {
			if(obj.data[0].official !== "1") {
				document.querySelector('.mainresults').innerHTML += '<img class="statuslogo" src="verified.png" width="100"/><br/><span class="statusok status">Trusted Mirror !!!</span>';
			} else {
				document.querySelector('.mainresults').innerHTML += '<img class="statuslogo" src="official.png" width="100"/><br/><span class="statusok status">Official Mirror !!!</span>';
			}
			if(obj.data[0].site.id) {
				site = obj.data[0].site;
				document.querySelector('.mainresults').innerHTML += '<br/><span class="statusok status">'+site.name+'</span>';
				showsite(site.id);
			}
		}
		document.querySelector('.note-container').style.display = "none";
		var input = document.querySelector('.search');
		input.addEventListener('keyup', (event) => {
			searchSites(event.target.value);
		});
	});
};

window.showsite = function(site) {
	document.querySelector('.note-container').style.display = "inline-block";
	document.querySelector('.mirrs').innerHTML = '<table class="restbl"><thead><tr><td>URL</td><td>Uptime</td><td>Connection Time</td></tr></thead><tbody class="mirrbdy"></tbody></table>';
	postAjax('https://onion.live/api/store/mirrors/search', 'site='+site+"&ctime$ne=60&orderby=official&orderas=DESC&page=1&perpage=10", function(data){
		document.querySelector('.note-container').style.display = "none";
		obj = JSON.parse(data);
		for(i=0;i<obj.data.length;i++) {
			document.querySelector('.mirrbdy').innerHTML += '<tr><td class="urltd"><a href="'+obj.data[i].url+'">'+obj.data[i].url+'</a></td><td>'+obj.data[i].uptime+'%</td><td>'+obj.data[i].ctime+'s</td></tr>';
		}
	});
};

window.searchSites = function(search = null) {
	document.querySelector('.note-container').style.display = "inline-block";
	if(search) {
		query = 'name$re='+search+'&description$re$or='+search+'&page=1&perpage=10&orderby=featured&orderas=DESC';
	} else {
		query = 'featured=1&page=1&perpage=10';
	}
	postAjax('https://onion.live/api/store/sites/search', query, function(data){
		logo = document.querySelector('.statuslogo');
		if(logo) {
			logo.parentNode.removeChild(logo);
		}
		warn = document.querySelector('.status');
		if(warn) {
			warn.parentNode.removeChild(warn);
		}
		document.querySelector('.note-container').style.display = "none";
		var inputTitle = document.querySelector('.results');
		inputTitle.innerHTML = '<ul class="resul"></ul><div class="mirrs"></div>';
		obj = JSON.parse(data);
		for(i=0;i<obj.data.length;i++) {
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
			dispList(1);
		}
	})
}

function dispList(featured){
	var inputTitle = document.querySelector('.content');
	inputTitle.innerHTML += '<div class="results"><div>';
	if(featured === 1) {
		searchSites();
	}
	var input = document.querySelector('.search');
	input.addEventListener('keyup', (event) => {
		searchSites(event.target.value);
	});
}

function handleURL(url){
	var inputTitle = document.querySelector('.url');
	inputTitle.value = url;
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
