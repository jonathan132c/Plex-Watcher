const cron = require('node-cron');
const RSSParser = require('rss-parser');
const sonarr = require('./services/sonarr');
const radarr = require('./services/radarr');
require('dotenv').config();

const parser = new RSSParser();

// Refresh Sonarr import lists
async function refreshSonarrPlexImportLists(importLists) {
    try {
        for (const importList of importLists) {
            if (importList.listType === 'plex' && importList.enableAutomaticAdd) {
                importList.enableAutomaticAdd = !importList.enableAutomaticAdd;
                await sonarr.putImportList(importList);

                if (!importList.enableAutomaticAdd) {
                    importList.enableAutomaticAdd = true;
                    await sonarr.putImportList(importList);
                }
            }
        }
    } catch (error) {
        console.error('Failed to resave Sonarr import lists:', error.message);
    }
}

// Refresh Radarr import lists
async function refreshRadarrPlexImportLists(importLists) {
    try {
        for (const importList of importLists) {
            if (importList.listType === 'plex' && importList.enabled) {
                importList.enabled = !importList.enabled;
                await radarr.putImportList(importList);

                if (!importList.enabled) {
                    importList.enabled = true;
                    await radarr.putImportList(importList);
                }
            }
        }
    } catch (error) {
        console.error('Failed to resave Radarr import lists:', error.message);
    }
}

// Sync Radarr import lists with Plex watchlists
async function radarrImportListSync() {
    try {
        const radarrMovies = await radarr.getMovies();
        const radarrImdbIds = radarrMovies.map(movie => movie.imdbId);

        const importLists = await radarr.getImportLists();
        const plexWatchlists = await getPlexWatchLists(importLists);

        for (const plexWatchlist of plexWatchlists) {
            const watchlistMovies = plexWatchlist.items.filter(item => item.categories.includes('movie'));
            const watchlistImdbIds = watchlistMovies.map(item => item.guid.replace('imdb://', ''));
            const unsyncedImdbIds = watchlistImdbIds.filter(id => !radarrImdbIds.includes(id));

            if (unsyncedImdbIds.length > 0) {
                console.log(`[${Date.now()}][RADARR] Updating Plex Watchlist: ${plexWatchlist.description}`);
                await refreshRadarrPlexImportLists(importLists);
            }
        }
    } catch (error) {
        console.error(`[${Date.now()}][RADARR] Error syncing import lists: ${error.message}`);
    }
}

// Sync Sonarr import lists with Plex watchlists
async function sonarrImportListSync() {
    try {
        const sonarrSeries = await sonarr.getSeries();
        const sonarrTvdbIds = sonarrSeries.map(serie => serie.tvdbId);

        const importLists = await sonarr.getImportLists();
        const plexWatchlists = await getPlexWatchLists(importLists);

        for (const plexWatchlist of plexWatchlists) {
            const watchlistSeries = plexWatchlist.items.filter(item => item.categories.includes('show'));
            const watchlistTvdbIds = watchlistSeries.map(item => Number(item.guid.replace('tvdb://', '')));
            const newTvdbIds = watchlistTvdbIds.filter(tvdbId => !sonarrTvdbIds.includes(tvdbId));

            if (newTvdbIds.length > 0) {
                console.log(`[${Date.now()}][SONARR] Updating Plex Watchlist: ${plexWatchlist.description}`);
                await refreshSonarrPlexImportLists(importLists);
            }
        }
    } catch (error) {
        console.error(`[${Date.now()}][SONARR] Error syncing import lists: ${error.message}`);
    }
}

// Get Plex watchlists from the import lists
async function getPlexWatchLists(importLists) {
    const plexWatchlists = [];
    for (const importList of importLists) {
        if (importList.listType === 'plex') {
            const urlField = importList.fields.find(field => field.name === 'url');
            if (urlField) {
                const watchlist = await parser.parseURL(urlField.value);
                plexWatchlists.push(watchlist);
            }
        }
    }
    return plexWatchlists;
}

// Main monitor function to sync Sonarr and Radarr import lists
async function monitorFeeds() {
    try {
        await sonarrImportListSync()
    } catch (error) {
        console.error(`[${Date.now()}][SONARR] Error monitoring feed: ${error.message}`);
    }

    try {
        await radarrImportListSync();
    } catch (error) {
        console.error(`[${Date.now()}][RADARR] Error monitoring feed: ${error.message}`);
    }
}

// Schedule the monitoring task to run every minute
cron.schedule('* * * * *', () => {
    // console.log('Checking for new items in Plex watchlists...');
    monitorFeeds();
});

// Initial run when the script starts
monitorFeeds();