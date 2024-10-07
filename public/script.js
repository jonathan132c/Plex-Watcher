document.addEventListener('DOMContentLoaded', () => {
    const radarrForm = document.getElementById('form');
    const radarrApiUrl = document.getElementById('radarr-api-url');
    const radarrApiKey = document.getElementById('radarr-api-key');
    const sonarrApiUrl = document.getElementById('sonarr-api-url');
    const sonarrApiKey = document.getElementById('sonarr-api-key');

    const fetchSettings = async () => {
        const response = await fetch('/settings');
        const settings = await response.json();

        sonarrApiUrl.value = settings.sonarrApiUrl;
        sonarrApiKey.value = settings.sonarrApiKey;
        radarrApiUrl.value = settings.radarrApiUrl;
        radarrApiKey.value = settings.radarrApiKey;

    }
    
    radarrForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const sonarrUrl = sonarrApiUrl.value;
        const sonarrKey = sonarrApiKey.value;

        const radarrUrl = radarrApiUrl.value;
        const radarrKey = radarrApiKey.value;

        const settings = { sonarrApiUrl: sonarrUrl, sonarrApiKey: sonarrKey, radarrApiUrl: radarrUrl, radarrApiKey: radarrKey };
        await fetch('/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });
    });
    fetchSettings();
    // const feedForm = document.getElementById('feed-form');
    // const feedNameInput = document.getElementById('feed-name');
    // const feedUrlInput = document.getElementById('feed-url');
    // const feedList = document.getElementById('feed-list');

    // // Fetch and display all feeds
    // const fetchFeeds = async () => {
    //     const response = await fetch('/feeds');
    //     const feeds = await response.json();
    //     feedList.innerHTML = '';
    //     for (const feed of feeds) {
    //         const li = document.createElement('li');
    //         li.textContent = `${feed.name}: ${feed.url}`;
    //         const deleteButton = document.createElement('button');
    //         deleteButton.textContent = 'Remove';
    //         deleteButton.addEventListener('click', async () => {
    //             await fetch(`/feeds/${feed.id}`, { method: 'DELETE' });
    //             fetchFeeds();
    //         });
    //         li.appendChild(deleteButton);
    //         feedList.appendChild(li);
    //     }
    // };

    // feedForm.addEventListener('submit', async (e) => {
    //     e.preventDefault();
    //     const name = feedNameInput.value;
    //     const url = feedUrlInput.value;
    //     await fetch('/feeds', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({ name, url })
    //     });
    //     feedNameInput.value = '';
    //     feedUrlInput.value = '';
    //     fetchFeeds();
    // });

    // fetchFeeds();
});