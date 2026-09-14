const https = require('https');

function fetchPlaylist(playlistId) {
    const url = `https://www.youtube.com/list_ajax?style=json&action_get_list=1&list=${playlistId}`;

    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

fetchPlaylist("PLCHP10F0t3kjEdSJIjD9z0cGSJn1cTKWP")
    .then(data => console.log(JSON.stringify(data.video, null, 2)))
    .catch(console.error);
