const sonarrService = require('../services/sonarrService');
const mediaUtils = require('../utils/mediaUtils');

exports.syncImportLists = async () => {
    try {
        const [shows, importLists] = await Promise.all([
            sonarrService.getSeries(),
            sonarrService.getImportLists()
        ]);

        const plexImportLists = mediaUtils.filterPlexImportLists(importLists);

        for (const plexImportList of plexImportLists) {
            const plexWatchlist = await mediaUtils.getPlexWatchListFromImportList(plexImportList);
            const plexIds = mediaUtils.plexWatchlistIds(plexWatchlist.items, 'show', 'tvdb://');
            
            if (mediaUtils.isNewContentPresent(plexIds, shows.map(show => String(show.tvdbId)))) {
                plexImportList.enableAutomaticAdd = !plexImportList.enableAutomaticAdd;
                await sonarrService.putImportList(plexImportList);

                // Immediately re-enable `enableAutomaticAdd` if toggled off
                if (!plexImportList.enableAutomaticAdd) {
                    plexImportList.enableAutomaticAdd = true;
                    await sonarrService.putImportList(plexImportList);
                }
                console.log(`[${Date.now()}][SONARR] Syncing ImportList: ${plexImportList}`);
            }
        }
    } catch (error) {
        console.error(`[${Date.now()}][SONARR] Error syncing import lists: ${error.message}`);
    }
};