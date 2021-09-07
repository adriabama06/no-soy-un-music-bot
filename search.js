const config = require('./config.json');
const request = require('request');
/**
 * @see 
 * @returns {Promise<string | false>}
 * @param {string} title 
 * @param {string | number} safesearch 
 */
module.exports = async (title, safesearch = "1") => {
    return new Promise(async (r) => {
        var s;
        if(typeof safesearch === 'number') {
            safesearch = safesearch.toString();
        }
        if(safesearch === "0") {
            s = "none";
        }
        if(safesearch === "1") {
            s = "moderate";
        }
        if(safesearch === "2") {
            s = "strict";
        }
        request({
            url: `https://www.googleapis.com/youtube/v3/search?q=${title}&safeSearch=${s}&type=video&key=${config.youtube.token}`,
            json: true
        }, async (err, res, body) => {
            if(err) {
                console.log(err);
                r(false);
                return;
            };
            if(!body.items[0]) {
                r(false);
                return;
            };
            r("https://www.youtube.com/watch?v=" + body.items[0].id.videoId);
            return;
        });
    });
}