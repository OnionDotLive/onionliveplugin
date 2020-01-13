'use strict';
function handleMessage(request, sender, sendResponse) {
  browser.browserAction.setPopup({popup: 'popup/popup.html'})
//  browser.browserAction.enable();
  browser.browserAction.openPopup();
  console.log("Message from the content script: " + request.message);
  sendResponse({response: "Response from background script"});
  browser.notifications.create({
	"type": "basic",
	"iconUrl": browser.extension.getURL("icons/logo.png"),
	"title": request.title,
	"message": request.message
  });
}

browser.runtime.onMessage.addListener(handleMessage);
