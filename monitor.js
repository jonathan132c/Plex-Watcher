const cron = require('node-cron');
const RSSParser = require('rss-parser');
const db = require('./database');
const axios = require('axios');
require('dotenv').config();

const parser = new RSSParser();

const sonarrUrl = process.env.SONARR_API_URL;
const sonarrAPIKey = process.env.SONARR_API_KEY;

const radarrURL = process.env.RADARR_API_URL;
const radarrAPIKey = process.env.RADARR_API_KEY;

// Function to get all import lists
async function getImportLists(url, apiKey) {
    const endpoint = `${url}/api/v3/importlist`;
    try {
        const response = await axios.get(endpoint, {
            headers: {
                'X-Api-Key': apiKey,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error getting import lists:', error.response?.data || error.message);
        throw error;
    }
}

async function getMovies() {
    const endpoint = `${radarrURL}/api/v3/movie`;
    try {
        const response = await axios.get(endpoint, {
            headers: {
                'X-Api-Key': radarrAPIKey,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error getting import lists:', error.response?.data || error.message);
        throw error;
    }
}

async function getSeries() {
    const endpoint = `${sonarrUrl}/api/v3/series`;
    try {
        const response = await axios.get(endpoint, {
            headers: {
                'X-Api-Key': sonarrAPIKey,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error getting import lists:', error.response?.data || error.message);
        throw error;
    }
}

// Function to resave an import list
async function resaveImportList(url, apiKey, importList) {
    const endpoint = `${url}/api/v3/importlist/${importList.id}`;
    try {
        await axios.put(endpoint, importList, {
            headers: {
                'X-Api-Key': apiKey,
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error(`Error resaving import list with ID ${importList.id}:`, error.response?.data || error.message);
        throw error;
    }
}

// Sync and resave Sonarr import lists
async function refreshSonarrPlexImportLists(importLists) {
    try {
        for (const importList of importLists) {
            if (importList.listType === 'plex' && importList.enableAutomaticAdd) {
                importList.enableAutomaticAdd = !importList.enableAutomaticAdd;
                await resaveImportList(sonarrUrl, sonarrAPIKey, importList);

                if (!importList.enableAutomaticAdd) {
                    importList.enableAutomaticAdd = true;
                    await resaveImportList(sonarrUrl, sonarrAPIKey, importList);
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
                await resaveImportList(radarrURL, radarrAPIKey, importList);

                if (!importList.enabled) {
                    importList.enabled = true;
                    await resaveImportList(radarrURL, radarrAPIKey, importList);
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
    const radarrMovies = await getMovies();
    const radarrImdbIds = radarrMovies.map(movie => movie.imdbId);

    const importLists = await getImportLists(radarrURL, radarrAPIKey);
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
const sonarrImportListSync = async () => {
    console.log("syncing sonarr");
    const sonarrSeries = await getSeries();
    const sonarrTvdbIds = sonarrSeries.map(serie => serie.tvdbId);

    const importLists = await getImportLists(sonarrUrl, sonarrAPIKey);
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
    const plexWatchlist = [];
    for (const importList of importLists) {
        if (importList.listType === 'plex') {
            const urlField = importList.fields.find(field => field.name === 'url');
            if (urlField) {
                plexWatchlist.push(await parser.parseURL(urlField.value));
            }
        }
    }
    return plexWatchlist
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