const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to get all RSS feeds
app.get('/feeds', async (req, res) => {
    const feeds = await db.getFeeds();
    res.json(feeds);
});

// Endpoint to get feed items by feed ID
app.get('/feeds/:id/items', async (req, res) => {
    const { id } = req.params;
    const items = await db.getFeedItems(id);
    res.json(items);
});

// Endpoint to add a new RSS feed
app.post('/feeds', async (req, res) => {
    const { name, url } = req.body;
    await db.addFeed(name, url);
    res.sendStatus(201);
});

// Endpoint to remove an RSS feed
app.delete('/feeds/:id', async (req, res) => {
    const { id } = req.params;
    await db.removeFeed(id);
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Start the monitor
require('./monitor');