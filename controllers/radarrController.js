const radarrService = require('../services/radarrService');
const mediaUtils = require('../utils/mediaUtils');

exports.syncImportLists = async () => {
    try {
        const [movies, importLists] = await Promise.all([
            radarrService.getMovies(),
            radarrService.getImportLists()
        ]);

        const plexImportLists = mediaUtils.filterPlexImportLists(importLists);

        for (const plexImportList of plexImportLists) {
            const plexWatchlist = await mediaUtils.getPlexWatchListFromImportList(plexImportList);
            const plexIds = mediaUtils.plexWatchlistIds(plexWatchlist.items, 'movie', 'imdb://');

            if (mediaUtils.isNewContentPresent(plexIds, movies.map(movie => movie.imdbId))) {
                plexImportList.enabled = !plexImportList.enabled;
                await radarrService.putImportList(plexImportList);

                // Immediately re-enable `enableAutomaticAdd` if toggled off
                if (!plexImportList.enabled) {
                    plexImportList.enabled = true;
                    await radarrService.putImportList(plexImportList);
                }
                console.log(`[${Date.now()}][RADARR] Syncing ImportList: ${plexImportList}`);
            }
        }
    } catch (error) {
        console.error(`[${Date.now()}][RADARR] Error syncing import lists: ${error.message}`);
    }
};