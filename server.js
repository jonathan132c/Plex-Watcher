const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/settings', async (req, res) => {
    const json = {sonarrApiUrl: process.env.SONARR_API_URL, sonarrApiKey: process.env.SONARR_API_KEY, radarrApiUrl: process.env.RADARR_API_URL, radarrApiKey: process.env.RADARR_API_KEY }
    res.json(json);
});

app.post('/settings', async (req, res) => {
    const { sonarrApiUrl, sonarrApiKey, radarrApiUrl, radarrApiKey } = req.body;

    const content = `SONARR_API_URL=${sonarrApiUrl}\nSONARR_API_KEY=${sonarrApiKey}\nRADARR_API_URL=${radarrApiUrl}\nRADARR_API_KEY=${radarrApiKey}`;
    fs.writeFileSync('.env', content);

    process.env.SONARR_API_URL = sonarrApiUrl;
    process.env.SONARR_API_KEY = sonarrApiKey;
    process.env.RADARR_API_URL = radarrApiUrl;
    process.env.RADARR_API_KEY = radarrApiKey;

    res.sendStatus(201);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Start the monitor
require('./monitor');