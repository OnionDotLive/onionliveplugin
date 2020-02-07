function saveOptions(e) {
	e.preventDefault();
	browser.storage.sync.set({
		checkevery: document.querySelector("#checkevery").value,
		realtime: document.querySelector("#realtime").checked
	});
	document.querySelector("#result").innerHTML = "";
	setTimeout(function () {
		document.querySelector("#result").innerHTML = "<label class='success'>Settings Saved Successfully</label>";
	}, 50);
	setTimeout(function () {
		document.querySelector("#result").innerHTML = "";
	}, 5000);
}

function restoreOptions() {
	function setCurrentChoice(result) {
		document.querySelector("#checkevery").value = result.checkevery || "10";
		document.querySelector("#realtime").checked = result.realtime || false;
	}
	function onError(error) {
		document.querySelector("#result").innerHTML = "<label class='error'>Error: "+error+"</label>";
	}
	let getting = browser.storage.sync.get(["checkevery", "realtime"]);
	getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
