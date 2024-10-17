const Settings = require('../models/Settings');

let cachedSettings = null;

class SettingsService {
  // Retrieve settings, with optional in-memory caching
  async getSettings() {
    if (!cachedSettings) {
      const settings = await Settings.findOne({ where: { id: 1 } });
      cachedSettings = settings.dataValues;
    }
    return cachedSettings;
  }

  // Save or update settings
  async saveSettings(newSettings) {
    try {
      // Find the existing settings or create a new entry
      const [settings, created] = await Settings.findOrCreate({
        where: { id: 1 },
        defaults: newSettings,
      });

      // If the settings entry exists, update it
      if (!created) {
        await settings.update(newSettings);
      }

      // Update the cache with the new settings
      cachedSettings = settings.dataValues;

      return settings;
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  // Method to refresh the cache if needed
  async refreshSettings() {
    const settings = await Settings.findOne({ where: { id: 1 } });
    cachedSettings = settings.dataValues;
    return cachedSettings;
  }
}

module.exports = new SettingsService();