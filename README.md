
# Plex-Watcher

Plex-Watcher is a tool designed to synchronize your Plex watch list with Sonarr and Radarr. With a simple web interface, you can configure your Sonarr and Radarr instances, allowing Plex-Watcher to keep your watch lists in sync across platforms automatically.

## Features

- **Plex Watch List Sync:** Automatically sync items on your Plex watch list with Sonarr and Radarr, ensuring your media libraries are always up to date.
- **Web Front-End:** Easy-to-use web interface for setting up and managing Sonarr and Radarr configurations.
- **Customizable Integration:** Input your Sonarr and Radarr URLs and API keys directly through the web interface for a personalized experience.

## Installation

### Local Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/your-username/Plex-Watcher.git
   cd Plex-Watcher
   ```

2. **Install Dependencies:**

   Navigate to the project directory and install the required Node.js packages:

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**

   Create a `.env` file in the root directory with the following content, replacing placeholders with your information:

   ```env
   SONARR_API_URL=sonarr-url-with-port
   SONARR_API_KEY=sonarr-api-key
   RADARR_API_URL=radarr-url-with-port
   RADARR_API_KEY=radarr-api-key
   ```

4. **Run the Application:**

   ```bash
   npm start
   ```

   The application will start running on `http://localhost:3000`.

### Docker Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/your-username/Plex-Watcher.git
   cd Plex-Watcher
   ```

2. **Build the Docker Image:**

   ```bash
   docker build -t plex-watcher .
   ```

3. **Run the Docker Container:**

   ```bash
   docker run -d -p 3000:3000 --env-file .env plex-watcher
   ```

   The application will be accessible at `http://localhost:3000`.

## Usage

1. Open your browser and navigate to `http://localhost:3000`.
2. Enter your Sonarr and Radarr URLs and API keys in the designated fields on the web interface.
3. Save your settings and let Plex-Watcher handle the synchronization automatically.

## Development

If you'd like to contribute or modify the project:

1. Clone the repository and create a new branch for your feature or bug fix.
2. Make your changes, and submit a pull request for review.

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Plex](https://www.plex.tv/)
- [Sonarr](https://sonarr.tv/)
- [Radarr](https://radarr.video/)
