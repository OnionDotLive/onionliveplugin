'use strict';
function handleMessage(request, sender, sendResponse) {
  browser.browserAction.setPopup({popup: 'popup/popup.html'})
  browser.browserAction.openPopup();
  console.log("Message from the content script: " + request.message);
  sendResponse({response: "Response from background script"});
  browser.browserAction.setIcon({tabId: sender.tab.id, path: "icons/"+request.icon+".png"});
  browser.notifications.create({
	"type": "basic",
	"iconUrl": browser.extension.getURL("icons/"+request.icon+".png"),
	"title": request.title,
	"message": request.message
  });
}

browser.runtime.onMessage.addListener(handleMessage);
