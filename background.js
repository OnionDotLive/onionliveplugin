'use strict';

var registered = null;

function registerScript() {
  let hosts = "*://*.onion/*";
  let code = "document.body.innerHTML = '<h1>This page has been eaten</h1>'";

  if (registered) {
    registered.unregister();
  }

  registered = await browser.contentScripts.register({
    matches: hosts,
    js: [{code}],
    runAt: "document_idle"
  });

}

browser.runtime.onStartup.addListener(registerScript);
