let runtime;

// Get the runtime API (chromium vs firefox)
if(typeof browser !== "undefined") {
    runtime = browser.runtime;
}
else if(typeof chrome !== "undefined") {
    runtime = chrome.runtime;
}

// Route our fetch requests through the background script due to chromium security thing:
// https://www.chromium.org/Home/chromium-security/extension-content-script-fetches
runtime.onMessage.addListener((request, sender, sendResponse) => {
    // console.log("message received: ");
    // console.log(request);

    if(request.action == "fetch") {
        fetch(request.url).then((resp) => {

            // console.log("fetch completed.");
            // console.log(resp);

            if(request.type == "text") {
                return resp.text();
            }
            else if(request.type == "json") {
                return resp.json();
            }

        }).then(r => {
            sendResponse(r);
        });
    }
    return true;
});


