const sequelize = require('../config/database');
const Settings = require('../models/Settings');

(async () => {
  try {
    // Sync the models with the database
    await sequelize.sync();
    console.log('Database synchronized successfully.');

    // Ensure a default settings entry exists
    await Settings.findOrCreate({ where: { id: 1 } });
  } catch (error) {
    console.error('Error synchronizing the database:', error);
  }
})();