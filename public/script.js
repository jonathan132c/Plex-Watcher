document.addEventListener('DOMContentLoaded', () => {
    const radarrForm = document.getElementById('form');
    const radarrApiUrl = document.getElementById('radarr-api-url');
    const radarrApiKey = document.getElementById('radarr-api-key');
    const sonarrApiUrl = document.getElementById('sonarr-api-url');
    const sonarrApiKey = document.getElementById('sonarr-api-key');

    const fetchSettings = async () => {
        const response = await fetch('/api/settings');
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
        
        await fetch('/api/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });
    });
    fetchSettings();
});