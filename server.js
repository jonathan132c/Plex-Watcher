const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

require('dotenv').config();
require('./utils/sync');

const app = express();
const PORT = 3000;

const settingsRoutes = require('./routes/settingsRoutes');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/settings', settingsRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Start the monitor
require('./tasks/scheduler');