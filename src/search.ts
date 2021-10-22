import request from 'request';
import config from './config';

export default async function (title: string, safesearch: string = "1"): Promise<string | undefined> {
    return new Promise(async (resolve) => {
        var s;
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
                resolve(undefined);
                return;
            }
            if(!body.items || !body.items[0]) {
                resolve(undefined);
                return;
            }
            resolve("https://www.youtube.com/watch?v=" + body.items[0].id.videoId);
            return;
        });
    });
}