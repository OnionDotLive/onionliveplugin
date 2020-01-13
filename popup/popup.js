/* initialise variables */

document.addEventListener("DOMContentLoaded", function () {
	var inputTitle = document.querySelector('.content');
//	var ret = browser.storage.local.get(null);
//	inputTitle.innerHTML='ret';
});


browser.runtime.onMessage.addListener(function(message,sender,sendResponse) {
	var inputTitle = document.querySelector('.content');
	inputTitle.innerHTML=message.icon;
});
