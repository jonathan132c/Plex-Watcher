document.addEventListener('DOMContentLoaded', () => {
    const feedForm = document.getElementById('feed-form');
    const feedNameInput = document.getElementById('feed-name');
    const feedUrlInput = document.getElementById('feed-url');
    const feedList = document.getElementById('feed-list');

    // Fetch and display all feeds
    const fetchFeeds = async () => {
        const response = await fetch('/feeds');
        const feeds = await response.json();
        feedList.innerHTML = '';
        for (const feed of feeds) {
            const li = document.createElement('li');
            li.textContent = `${feed.name}: ${feed.url}`;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Remove';
            deleteButton.addEventListener('click', async () => {
                await fetch(`/feeds/${feed.id}`, { method: 'DELETE' });
                fetchFeeds();
            });
            li.appendChild(deleteButton);
            feedList.appendChild(li);
        }
    };

    feedForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = feedNameInput.value;
        const url = feedUrlInput.value;
        await fetch('/feeds', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, url })
        });
        feedNameInput.value = '';
        feedUrlInput.value = '';
        fetchFeeds();
    });

    fetchFeeds();
});