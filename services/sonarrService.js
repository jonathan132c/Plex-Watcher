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

    async putSeries(seriesId, updatedSeriesData) {
        const { sonarrApiUrl, sonarrApiKey } = await this.getConfig();
        try {
            const response = await axios.put(`${sonarrApiUrl}/api/v3/series/${seriesId}`, updatedSeriesData, {
                headers: {
                    'X-Api-Key': sonarrApiKey || process.env.SONARR_API_KEY,
                    'Content-Type': 'application/json',
                },
            });
            return response.data; // Returns the updated series data
        } catch (error) {
            console.error('Error updating series in Sonarr:', error);
            throw new Error('Failed to update series in Sonarr');
        }
    }

    async deleteSeries(seriesId) {
        const { sonarrApiUrl, sonarrApiKey } = await this.getConfig();

        try {
            const response = await axios.delete(`${sonarrApiUrl}/api/v3/series/${seriesId}`, {
                headers: {
                    'X-Api-Key': sonarrApiKey || process.env.SONARR_API_KEY,
                    'Content-Type': 'application/json',
                },
            });
            return response.data; // Returns confirmation of deletion
        } catch (error) {
            console.error('Error deleting series from Sonarr:', error);
            throw new Error('Failed to delete series from Sonarr');
        }
    }

    async getTags() {
        const { sonarrApiUrl, sonarrApiKey } = await this.getConfig();
        try {
            const response = await axios.get(`${sonarrApiUrl}/api/v3/tag`, {
                headers: {
                    'X-Api-Key': sonarrApiKey || process.env.SONARR_API_KEY,
                    'Content-Type': 'application/json',
                }
            });
            return response.data; // Returns an array of tags
        } catch (error) {
            console.error('Error fetching tags from Sonarr:', error);
            throw error;
        }
    }

    async putTag(tagId, label) {
        const { sonarrApiUrl, sonarrApiKey } = await this.getConfig();
        const url = tagId ? `${sonarrApiUrl}/api/v3/tag/${tagId}` : `${sonarrApiUrl}/api/v3/tag`;
        try {
            const response = await axios.put(url, { label }, {
                headers: {
                    'X-Api-Key': sonarrApiKey || process.env.SONARR_API_KEY,
                    'Content-Type': 'application/json',
                }
            });
            return response.data; // Returns the updated or newly created tag data
        } catch (error) {
            console.error('Error updating tag in Sonarr:', error);
            throw error;
        }
    }

    async postTag(label) {
        const { sonarrApiUrl, sonarrApiKey } = await this.getConfig();
        const url = `${sonarrApiUrl}/api/v3/tag`;

        try {
            const response = await axios.post(url, { label }, {
                headers: {
                    'X-Api-Key': sonarrApiKey || process.env.SONARR_API_KEY,
                    'Content-Type': 'application/json',
                }
            });
            return response.data; // Returns the newly created tag data
        } catch (error) {
            console.error('Error creating tag in Sonarr:', error);
            throw new Error('Failed to create tag in Sonarr');
        }
    }
}

module.exports = new SonarrService();