const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// Route to get the settings
router.get('/', settingsController.getSettings);

// Route to update the settings
router.post('/', settingsController.updateSettings);

module.exports = router;