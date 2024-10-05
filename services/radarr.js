const axios = require('axios');
require('dotenv').config();

const radarrURL = process.env.RADARR_API_URL;
const radarrAPIKey = process.env.RADARR_API_KEY;

// Function to get all import lists for Radarr
async function getImportLists() {
    const endpoint = `${radarrURL}/api/v3/importlist`;
    try {
        const response = await axios.get(endpoint, {
            headers: {
                'X-Api-Key': radarrAPIKey,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error getting Radarr import lists:', error.response?.data || error.message);
        throw error;
    }
}

// Function to resave a Radarr import list
async function resaveImportList(importList) {
    const endpoint = `${radarrURL}/api/v3/importlist/${importList.id}`;
    try {
        await axios.put(endpoint, importList, {
            headers: {
                'X-Api-Key': radarrAPIKey,
                'Content-Type': 'application/json',
            },
        });
        console.log(`Resaved Radarr import list with ID: ${importList.id}`);
    } catch (error) {
        console.error(`Error resaving Radarr import list with ID ${importList.id}:`, error.response?.data || error.message);
        throw error;
    }
}

// Function to sync Radarr Plex lists
async function syncRadarrPlexLists() {
    try {
        const importLists = await getImportLists();
        for (const importList of importLists) {
            if (importList.listType === 'plex' && importList.enabled) {
                importList.enabled = !importList.enabled;
                await resaveImportList(importList);

                if (!importList.enabled) {
                    importList.enabled = true;
                    await resaveImportList(importList);
                }
            }
        }
        console.log('All Radarr import lists have been resaved.');
    } catch (error) {
        console.error('Failed to resave all Radarr import lists:', error.message);
    }
}

module.exports = {
    syncRadarrPlexLists,
};