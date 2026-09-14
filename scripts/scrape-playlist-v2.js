const { execSync } = require('child_process');

function getPlaylistVideos(playlistId) {
    // Attempting a simpler approach or using a CLI tool if youtube-sr is failing
    console.log(`Attempting to list videos for playlist: ${playlistId}`);
    // If we have yt-dlp installed, it's very reliable.
    try {
        const output = execSync(`yt-dlp --flat-playlist --get-id --get-title "https://www.youtube.com/playlist?list=${playlistId}"`).toString();
        return output.trim().split('\n').map((line, i, arr) => {
             if (i % 2 === 0) return { title: arr[i+1], id: line };
        }).filter(Boolean);
    } catch (e) {
        console.error("yt-dlp failed (is it installed?)", e);
        return [];
    }
}

const videos = getPlaylistVideos("PLCHP10F0t3kjEdSJIjD9z0cGSJn1cTKWP");
console.log(videos);
