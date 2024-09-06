const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Create the RSS feeds table and items table
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS rss_feeds (id INTEGER PRIMARY KEY, name TEXT, url TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS feed_items (id INTEGER PRIMARY KEY, feed_id INTEGER, title TEXT, link TEXT, pubDate TEXT, FOREIGN KEY(feed_id) REFERENCES rss_feeds(id))");
});

// Get all RSS feeds
const getFeeds = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM rss_feeds", (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
};

// Add a new RSS feed
const addFeed = (name, url) => {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO rss_feeds (name, url) VALUES (?, ?)", [name, url], function (err) {
            if (err) reject(err);
            resolve(this.lastID);
        });
    });
};

// Remove an RSS feed
const removeFeed = (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM rss_feeds WHERE id = ?", [id], function (err) {
            if (err) reject(err);
            resolve(this.changes);
        });
    });
};

// Store feed items
const addFeedItems = (feedId, items) => {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare("INSERT INTO feed_items (feed_id, title, link, pubDate) VALUES (?, ?, ?, ?)");
        items.forEach(item => {
            stmt.run(feedId, item.title, item.link, item.pubDate);
        });
        stmt.finalize((err) => {
            if (err) reject(err);
            resolve();
        });
    });
};

// Get feed items by feed ID
const getFeedItems = (feedId) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM feed_items WHERE feed_id = ? ORDER BY pubDate DESC", [feedId], (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
};

module.exports = {
    getFeeds,
    addFeed,
    removeFeed,
    addFeedItems,
    getFeedItems
};