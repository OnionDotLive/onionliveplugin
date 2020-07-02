'use strict';
function handleMessage(request, sender, sendResponse) {
	browser.browserAction.setIcon({tabId: sender.tab.id, path: "icons/"+request.icon+".png"});
	var checked = localStorage.getItem(sender.tab.id+"-host");
	var type = localStorage.getItem(sender.tab.id+"-type");
    browser.runtime.sendMessage(request).then({});
	if(checked != request.host || type != request.type) {
		browser.notifications.create({
			"type": "basic",
			"iconUrl": browser.extension.getURL("icons/"+request.icon+".png"),
			"title": request.title,
			"message": request.message
		});
		localStorage.setItem(sender.tab.id+"-host", request.host);
		localStorage.setItem(sender.tab.id+"-type", request.type);
	}
	sendResponse({response: "Response from background script" + checked + "-" +request.host});
}

browser.runtime.onMessage.addListener(handleMessage);
