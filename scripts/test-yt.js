const { YouTube } = require('youtube-sr');
// Alternative: use search for playlist videos if getPlaylist fails
async function testSearch() {
  try {
     const results = await YouTube.search("https://youtube.com/playlist?list=PLCHP10F0t3kjEdSJIjD9z0cGSJn1cTKWP", { limit: 5 });
     console.log(results);
  } catch (e) {
     console.error(e);
  }
}
testSearch();
