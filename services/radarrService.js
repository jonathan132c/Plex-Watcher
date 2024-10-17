const axios = require('axios');
require('dotenv').config();

const settingsService = require('./settingsService');

class RadarrService {
    async getConfig() {
        const settings = await settingsService.getSettings();
        const { radarrApiUrl, radarrApiKey } = settings;
        return { radarrApiUrl, radarrApiKey };
    }
    
    async getImportLists() {
        const { radarrApiUrl, radarrApiKey } = await this.getConfig();
        const endpoint = `${radarrApiUrl || process.env.RADARR_API_URL}/api/v3/importlist`;
        try {
            const response = await axios.get(endpoint, {
                headers: {
                    'X-Api-Key': radarrApiKey || process.env.RADARR_API_KEY,
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
        const { radarrApiUrl, radarrApiKey } = await this.getConfig();
        const endpoint = `${radarrApiUrl || process.env.RADARR_API_URL}/api/v3/importlist/${importList.id}`;
        try {
            await axios.put(endpoint, importList, {
                headers: {
                    'X-Api-Key': radarrApiKey || process.env.RADARR_API_KEY,
                    'Content-Type': 'application/json',
                },
            });
        } catch (error) {
            console.error(`Error resaving import list with ID ${importList.id}:`, error.response?.data || error.message);
            throw error;
        }
    }
    
    async getMovies() {
        const { radarrApiUrl, radarrApiKey } = await this.getConfig();
        const endpoint = `${radarrApiUrl || process.env.RADARR_API_URL}/api/v3/movie`;
        try {
            const response = await axios.get(endpoint, {
                headers: {
                    'X-Api-Key': radarrApiKey || process.env.RADARR_API_KEY,
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

module.exports = new RadarrService();