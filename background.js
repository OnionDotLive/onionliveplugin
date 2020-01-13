'use strict';
function handleMessage(request, sender, sendResponse) {
  sendResponse({response: "Response from background script"});

  browser.browserAction.setIcon({tabId: sender.tab.id, path: "icons/"+request.icon+".png"});
  var checked = localStorage.getItem(sender.tab.id);
  localStorage.setItem('value', request.icon);
  browser.runtime.sendMessage(request).then({})

  if(checked != request.host) {
    browser.notifications.create({
	"type": "basic",
	"iconUrl": browser.extension.getURL("icons/"+request.icon+".png"),
	"title": request.title,
	"message": request.message
    });
    localStorage.setItem(sender.tab.id, request.host);
  }
}

browser.runtime.onMessage.addListener(handleMessage);
