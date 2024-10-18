const cron = require('node-cron');
const syncRadarrImportLists = require('../controllers/radarrController').syncImportLists;
const syncSonarrImportLists = require('../controllers/sonarrController').syncImportLists;
const deleteRemovedItems = require('../controllers/sonarrController').deleteRemovedItems;


// Wrap the function to run every minute
cron.schedule('* * * * *', async () => {
    sync();
});

async function sync() {
    console.log('Running syncImportLists task...');
    Promise.all([
        syncRadarrImportLists(),
        syncSonarrImportLists()
    ]);
}

sync();