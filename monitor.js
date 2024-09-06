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
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting import lists:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Function to resave an import list
async function resaveImportList(url, apiKey, importList) {
    const importListId = importList.id;
    const endpoint = `${url}/api/v3/importlist`;
    const putEndpoint = `${endpoint}/${importListId}`;
    try {
        const response = await axios.put(putEndpoint, importList, {
            headers: {
                'X-Api-Key': apiKey,
                'Content-Type': 'application/json'
            }
        });
        console.log(`Resaved import list with ID: ${importListId}`);
        return response.data;
    } catch (error) {
        console.error(`Error resaving import list with ID ${importListId}:`, error.response ? error.response.data : error.message);
        throw error;
    }
}

// Main function to get and resave all import lists
async function syncSonarrPlexLists(url, apiKey) {
    try {
        const importLists = await getImportLists(sonarrUrl, sonarrAPIKey);
        console.log(importLists);
        for (const importList of importLists) {
            // Resave each import list
            if (importList.listType == 'plex') {
                importList.enableAutomaticAdd = !importList.enableAutomaticAdd
                await resaveImportList(url, apiKey, importList);
                if (!importList.enableAutomaticAdd) {
                    importList.enableAutomaticAdd = true
                    await resaveImportList(importList);
                }
            }
        }
        console.log('All import lists have been resaved.');
    } catch (error) {
        console.error('Failed to resave all import lists:', error.message);
    }
}

async function syncRadarrPlexLists() {
    try {
        const importLists = await getImportLists(radarrURL, radarrAPIKey);
        console.log(importLists);
        for (const importList of importLists) {
            // Resave each import list
            if (importList.listType == 'plex') {
                importList.enabled = !importList.enabled;
                await resaveImportList(url, apiKey, importList);
                if (!importList.enabled) {
                    importList.enabled = true;
                    await resaveImportList(importList);
                }
            }
        }
        console.log('All import lists have been resaved.');
    } catch (error) {
        console.error('Failed to resave all import lists:', error.message);
    }
}

const monitorFeeds = async () => {
    const feeds = await db.getFeeds();
    for (var i = 0, l = feeds.length; i < l; i++) {
        let feed = feeds[i];
        const feedData = await parser.parseURL(feed.url);
        const existingItems = await db.getFeedItems(feed.id);
        const existingLinks = existingItems.map(item => item.link);
        const newItems = feedData.items.filter(item => !existingLinks.includes(item.link));
        if (newItems.length > 0) {
            await db.addFeedItems(feed.id, newItems);
            console.log(`New items found for feed: ${feed.name}`);
            console.log(newItems);
            await syncSonarrPlexLists();
            await syncRadarrPlexLists();
        }
    }
};

cron.schedule('* * * * *', () => {
    console.log('Checking for new RSS feed items...');
    monitorFeeds();
});

monitorFeeds();  // Initial run when the script starts