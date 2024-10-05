const cron = require('node-cron');
const RSSParser = require('rss-parser');
const db = require('./database');
const axios = require('axios');
const sonarr = require('./services/sonarr');
const radarr = require('./services/radarr');

require('dotenv').config();

const parser = new RSSParser();

// Sync and resave Sonarr import lists
async function refreshSonarrPlexImportLists(importLists) {
    try {
        for (const importList of importLists) {
            if (importList.listType === 'plex' && importList.enableAutomaticAdd) {
                importList.enableAutomaticAdd = !importList.enableAutomaticAdd;
                await sonarr.putImportList(importList);

                if (!importList.enableAutomaticAdd) {
                    importList.enableAutomaticAdd = true;
                    await sonarr.putImportList(importList);
                    console.log('Sonarr ')
                }
            }
        }
    } catch (error) {
        console.error('Failed to resave all Sonarr import lists:', error.message);
    }
}

// Sync and resave Radarr import lists
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
        console.error('Failed to resave all Radarr import lists:', error.message);
    }
}

// Monitor RSS feeds for new items
const radarrImportListSync = async () => {
    console.log("syncing radarr");
    const radarrMovies = await radarr.getMovies();
    const radarrImdbIds = radarrMovies.map(movie => movie.imdbId);

    const importLists = await radarr.getImportLists();
    const plexWatchlists = await getPlexWatchLists(importLists);

    for (const plexWatchlist of plexWatchlists) {
        const watchlistMovies = plexWatchlist.items.filter(item => item.categories.includes('movie'));
        const watchlistImdbIds = watchlistMovies.map(item => item.guid.replace('imdb://', ''));
        const unsyncedImdbIds = watchlistImdbIds.filter(id => !radarrImdbIds.includes(id));

        if (unsyncedImdbIds.length > 0) {
            await refreshRadarrPlexImportLists(importLists);
        }
    }
}

// Monitor RSS feeds for new items
async function sonarrImportListSync() {
    console.log("syncing sonarr");
    const sonarrSeries = await sonarr.getSeries();
    const sonarrTvdbIds = sonarrSeries.map(serie => serie.tvdbId);

    const importLists = await sonarr.getImportLists();
    const plexWatchlists = await getPlexWatchLists(importLists);

    for (const plexWatchlist of plexWatchlists) {
        const watchlistSeries = plexWatchlist.items.filter(item => item.categories.includes('show'));
        const watchlistTvdbIds = watchlistSeries.map(item => item.guid.replace('tvdb://', ''));
        const newImdbIds = watchlistTvdbIds.filter(tvdbId => !sonarrTvdbIds.includes(tvdbId));

        if (newImdbIds.length > 0) {
            await refreshSonarrPlexImportLists(importLists);
        }
    }
}

const getPlexWatchLists = async (importLists) => {
    const plexWatchlists = [];
    for (const importList of importLists) {
        if (importList.listType === 'plex') {
            const urlField = importList.fields.find(field => field.name === 'url');
            if (urlField) {
                plexWatchlists.push(await parser.parseURL(urlField.value));
            }
        }
    }
    return plexWatchlists
}

const monitorFeeds = async () => {
    try {
        await sonarrImportListSync();
        await radarrImportListSync();
        // await radarrImportListSync();
        // const movies = await getMovies();
        // const series = await getSeries();
        // console.log(series)
        // const importLists = await getImportLists(radarrURL, radarrAPIKey);

        // const watchlistUrls = [];

        // for (const importList of importLists) {
        //     if (importList.listType === 'plex') {
        //         const urlField = importList.fields.find(field => field.label === 'Url');
        //         if (urlField) {
        //             watchlistUrls.push(urlField.value);
        //         }
        //     }
        // }

        // for (const watchlistUrl of watchlistUrls) {
        //     const watchlist = await parser.parseURL(watchlistUrl);
        //     const watchlistMovieImdbIds = watchlist.items.filter(item => item.guid.includes('imdb://')).map(item => item.guid.replace('imdb://', ''));
        //     const radarrMovieImdbIds = movies.map(movie => movie.imdbId);
        //     const newMovieImdbIds = watchlistMovieImdbIds.filter(id => !radarrMovieImdbIds.includes(id));
            
        //     if (newMovieImdbIds.length > 0 || watchlistMovieImdbIds < radarrMovieImdbIds) {
        //         console.log("syncing radarr");
        //         await syncRadarrPlexLists();
        //     }

        //     const watchlistMSeriesTvdbIds = watchlist.items.filter(item => item.guid.includes('tvdb://')).map(item => item.guid.replace('tvdb://', ''));
        //     console.log(watchlistMSeriesTvdbIds);
        //     const sonarrSeriesTvdbIds = series.map(serie => serie.tvdbId);
        //     console.log(sonarrSeriesTvdbIds);
        //     const newSeriesImdbIds = watchlistMSeriesTvdbIds.filter(id => !sonarrSeriesTvdbIds.includes(id));

        //     if (newSeriesImdbIds.length > 0 || watchlistMSeriesTvdbIds < sonarrSeriesTvdbIds) {
        //         console.log("syncing sonarr");
        //         await syncRadarrPlexLists();
        //     }

        //     // const watchlistSeries
        // }
    } catch (error) {
        console.error('Error monitoring feeds:', error.message);
    }
};

// Schedule task to check for new RSS feed items every minute
cron.schedule('* * * * *', () => {
    console.log('Checking for new RSS feed items...');
    monitorFeeds();
});

// Initial run when the script starts
monitorFeeds();