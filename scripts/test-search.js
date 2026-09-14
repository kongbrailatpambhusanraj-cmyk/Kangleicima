const { YouTube } = require('youtube-sr');
// Test search capabilities
async function testSearch() {
  try {
     // Search specifically for the playlist title as a strategy
     const results = await YouTube.search("Manipuri Films Epom Media", { limit: 5 });
     console.log("Search Results:", results.map(r => ({title: r.title, url: r.url})));
  } catch (e) {
     console.error(e);
  }
}
testSearch();
