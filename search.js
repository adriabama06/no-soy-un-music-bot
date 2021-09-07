const config = require('./config.json');

/**
 * @see 
 * @returns {Promise<string | false>}
 * @param {string} title 
 * @param {string | number} safesearch 
 */
module.exports = async (title, safesearch = "1") => {
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
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?q=${title}&safeSearch=${s}&type=video&key=${config.youtube.token}`, { method: 'GET' });
    const data = await res.json();
    if(data.items && data.items[0]) {
        return data.items[0];
    }
    return false;
}