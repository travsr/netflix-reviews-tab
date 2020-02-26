/** 
 * Utils.js 
 * @desc a class that contains a set of static functions that come in handy repeatedly throughout the project
 * @author travsr
*/


class Utils {
    
    /**
     * Return the platform (firefox vs chrome-based browser)
     *
     */
    static getPlatform() {

        if(typeof browser !== "undefined") {
            return "firefox";
        }
        else if(typeof chrome !== "undefined") {
            return "chrome";
        }
        else {
            return "unknown";
        }
    }


    /**
     * Return the api object (firefox vs chrome-based browser)
     *
     */
    static getAPI() {

        if(typeof browser !== "undefined") {
            return browser;
        }
        else if(typeof chrome !== "undefined") {
            return chrome;
        }
        else {
            return {};
        }
    }

    /**
     * cross-platform send message (Firefox uses promises as a callback wheras chromium just uses a callback function. 
     * We want to use promises for greater convenience)
     */
    static sendMessage(message) {

        let api = this.getAPI();
        let platform = this.getPlatform();

        //console.log("Sending message...");
        //console.log(api);

        // If it's firefox go ahead and pass it through
        if(platform == "firefox") {
           // console.log("got message.");

            return api.runtime.sendMessage(message);
        }
        // If it's chrome use the callback function to wrap in a promise
        else if(platform == "chrome") {

            let promise = new Promise((resolve, reject) => {
                api.runtime.sendMessage(message, (response) => {
                    resolve(response);
                });
            });
            
            return promise;
        }
    }
}




export default Utils;