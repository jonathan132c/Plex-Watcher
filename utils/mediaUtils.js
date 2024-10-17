const RSSParser = require('rss-parser');
const parser = new RSSParser();

class MediaUtils {
    filterPlexImportLists(importLists) {
        return importLists.filter(importList =>
            importList.listType === 'plex' && importList.fields.some(field => field.name === 'url')
        );
    }

    async getPlexWatchListFromImportList(importList) {
        if (importList.listType === 'plex') {
            const urlField = importList.fields.find(field => field.name === 'url');
            if (urlField) {
                return await parser.parseURL(urlField.value);
            }
        }
        return null;
    }

    plexWatchlistIds(plexItems, mediaType, prefix) {
        return plexItems
            .filter(item => item.categories.includes(mediaType))
            .map(item => String(item.guid.replace(prefix, '')));
    }

    isNewContentPresent(plexIds, mediaIds) {
        return !mediaIds.some(mediaId => plexIds.includes(mediaId));
    }
}

module.exports = new MediaUtils();