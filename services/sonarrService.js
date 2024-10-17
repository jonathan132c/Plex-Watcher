const axios = require('axios');
require('dotenv').config();

const settingsService = require('./settingsService');

class SonarrService {
    async getConfig() {
        const settings = await settingsService.getSettings();
        const { sonarrApiUrl, sonarrApiKey } = settings;
        return { sonarrApiUrl, sonarrApiKey };
    }
    // Function to get all import lists
    async getImportLists() {
        const { sonarrApiUrl, sonarrApiKey } = await this.getConfig();
        const endpoint = `${sonarrApiUrl || process.env.SONARR_API_URL}/api/v3/importlist`;
        try {
            const response = await axios.get(endpoint, {
                headers: {
                    'X-Api-Key': sonarrApiKey || process.env.SONARR_API_KEY,
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
    async putImportList(importList) {
        const { sonarrApiUrl, sonarrApiKey } = await this.getConfig();
        const endpoint = `${sonarrApiUrl || process.env.SONARR_API_URL}/api/v3/importlist/${importList.id}`;
        try {
            await axios.put(endpoint, importList, {
                headers: {
                    'X-Api-Key': sonarrApiKey || process.env.SONARR_API_KEY,
                    'Content-Type': 'application/json',
                },
            });
        } catch (error) {
            console.error(`Error resaving import list with ID ${importList.id}:`, error.response?.data || error.message);
            throw error;
        }
    }

    async getSeries() {
        const { sonarrApiUrl, sonarrApiKey } = await this.getConfig();
        const endpoint = `${sonarrApiUrl || process.env.SONARR_API_URL}/api/v3/series`;
        try {
            const response = await axios.get(endpoint, {
                headers: {
                    'X-Api-Key': sonarrApiKey || process.env.SONARR_API_KEY,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error getting import lists:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new SonarrService();