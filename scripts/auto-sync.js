require('dotenv').config();

async function runSync() {
  const secret = process.env.CRON_SECRET || 'manipuri_sync_secret_2026';
  const url = `http://localhost:3000/api/cron/sync-movies?key=${secret}`;

  console.log('Initiating YouTube catalog sync...');
  try {
    const res = await fetch(url);
    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error(`\nServer returned HTTP ${res.status} (Non-JSON response):`);
      console.error(text.slice(0, 300));
      return;
    }

    if (data.success) {
      console.log(`\nSuccessfully added ${data.addedCount} new titles:`);
      data.newTitles.forEach((t) => console.log(` - ${t.title}`));
    } else {
      console.error('Sync failed:', data);
    }
  } catch (err) {
    console.error('Failed to contact sync API. Make sure "npm run dev" is running on port 3000:', err.message);
  }
}

runSync();