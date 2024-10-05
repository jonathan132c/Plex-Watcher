const axios = require('axios');
require('dotenv').config();

const sonarrUrl = process.env.SONARR_API_URL;
const sonarrAPIKey = process.env.SONARR_API_KEY;

// Function to get all import lists for Sonarr
async function getImportLists() {
    const endpoint = `${sonarrUrl}/api/v3/importlist`;
    try {
        const response = await axios.get(endpoint, {
            headers: {
                'X-Api-Key': sonarrAPIKey,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error getting Sonarr import lists:', error.response?.data || error.message);
        throw error;
    }
}

// Function to resave a Sonarr import list
async function resaveImportList(importList) {
    const endpoint = `${sonarrUrl}/api/v3/importlist/${importList.id}`;
    try {
        await axios.put(endpoint, importList, {
            headers: {
                'X-Api-Key': sonarrAPIKey,
                'Content-Type': 'application/json',
            },
        });
        console.log(`Resaved Sonarr import list with ID: ${importList.id}`);
    } catch (error) {
        console.error(`Error resaving Sonarr import list with ID ${importList.id}:`, error.response?.data || error.message);
        throw error;
    }
}

// Function to sync Sonarr Plex lists
async function syncSonarrPlexLists() {
    try {
        const importLists = await getImportLists();
        for (const importList of importLists) {
            if (importList.listType === 'plex' && importList.enableAutomaticAdd) {
                importList.enableAutomaticAdd = !importList.enableAutomaticAdd;
                await resaveImportList(importList);

                if (!importList.enableAutomaticAdd) {
                    importList.enableAutomaticAdd = true;
                    await resaveImportList(importList);
                }
            }
        }
        console.log('All Sonarr import lists have been resaved.');
    } catch (error) {
        console.error('Failed to resave all Sonarr import lists:', error.message);
    }
}

module.exports = {
    syncSonarrPlexLists,
};