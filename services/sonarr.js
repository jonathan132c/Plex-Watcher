const axios = require('axios');
require('dotenv').config();

const url = process.env.SONARR_API_URL;
const apiKey = process.env.SONARR_API_KEY;

// Function to get all import lists

async function getImportLists() {
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

// Function to resave an import list
async function putImportList(importList) {
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

async function getSeries() {
    const endpoint = `${url}/api/v3/series`;
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

module.exports = {
    getImportLists,
    putImportList,
    getSeries
};