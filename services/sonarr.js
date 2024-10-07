const axios = require('axios');
require('dotenv').config();

// Function to get all import lists

async function getImportLists() {
    const endpoint = `${process.env.SONARR_API_URL}/api/v3/importlist`;
    try {
        const response = await axios.get(endpoint, {
            headers: {
                'X-Api-Key': process.env.SONARR_API_KEY,
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
    const endpoint = `${process.env.SONARR_API_URL}/api/v3/importlist/${importList.id}`;
    try {
        await axios.put(endpoint, importList, {
            headers: {
                'X-Api-Key': process.env.SONARR_API_KEY,
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error(`Error resaving import list with ID ${importList.id}:`, error.response?.data || error.message);
        throw error;
    }
}

async function getSeries() {
    const endpoint = `${process.env.SONARR_API_URL}/api/v3/series`;
    try {
        const response = await axios.get(endpoint, {
            headers: {
                'X-Api-Key': process.env.SONARR_API_KEY,
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