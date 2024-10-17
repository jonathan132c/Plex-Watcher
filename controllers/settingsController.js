const settingsService = require('../services/settingsService');

exports.getSettings = async (req, res, next) => {
  try {
    res.json(await settingsService.getSettings());
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    res.json(await settingsService.saveSettings(req.body));
  } catch (error) {
    next(error);
  }
};