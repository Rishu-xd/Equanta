class PlayerManager {
    constructor() {
        this.config = null;
        this.currentServer = 0;
        this.currentId = null;
        this.currentType = null;
        this.currentSeason = 1;
        this.currentEpisode = 1;
    }

    initialize() {
        this.config = window.getConfig();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('closePlayer').onclick = () => this.closePlayer();
        document.getElementById('serverSelect').onchange = (e) => {
            this.currentServer = parseInt(e.target.value);
            this.loadServer();
        };
        document.getElementById('downloadBtn').onclick = () => {
            alert('Download feature is for demonstration purposes only.');
        };
        document.getElementById('playerModal').onclick = (e) => {
            if (e.target.id === 'playerModal') this.closePlayer();
        };
        document.getElementById('detailModal').onclick = (e) => {
            if (e.target.id === 'detailModal') {
                document.getElementById('detailModal').classList.remove('active');
            }
        };
        document.getElementById('closeModal').onclick = () => {
            document.getElementById('detailModal').classList.remove('active');
        };
    }

    async openPlayer(id, mediaType) {
        this.currentId = id;
        this.currentType = mediaType;
        this.currentServer = 0;

        document.getElementById('detailModal').classList.remove('active');

        const serverSelect = document.getElementById('serverSelect');
        serverSelect.innerHTML = '';
        this.config.servers.forEach((server, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = server.name;
            serverSelect.appendChild(option);
        });

        if (mediaType === 'tv') {
            document.getElementById('tvControls').style.display = 'flex';
            await this.setupSeasonEpisodeSelector();
        } else {
            document.getElementById('tvControls').style.display = 'none';
        }

        document.getElementById('playerModal').classList.add('active');
        this.loadServer();
    }

    async setupSeasonEpisodeSelector() {
        const seasonSelect = document.getElementById('seasonSelect');
        const episodeSelect = document.getElementById('episodeSelect');

        seasonSelect.innerHTML = '';
        episodeSelect.innerHTML = '';

        const tvDetails = await window.tmdbAPI.getTVDetails(this.currentId);

        if (tvDetails && tvDetails.seasons) {
            const seasons = tvDetails.seasons.filter(s => s.season_number > 0);

            seasons.forEach(season => {
                const option = document.createElement('option');
                option.value = season.season_number;
                option.textContent = season.name;
                seasonSelect.appendChild(option);
            });

            this.currentSeason = seasons[0].season_number;
            await this.setupEpisodeSelector();

            seasonSelect.onchange = async (e) => {
                this.currentSeason = parseInt(e.target.value);
                await this.setupEpisodeSelector();
                this.loadServer();
            };
        }

        episodeSelect.onchange = (e) => {
            this.currentEpisode = parseInt(e.target.value);
            this.loadServer();
        };
    }

    async setupEpisodeSelector() {
        const episodeSelect = document.getElementById('episodeSelect');
        episodeSelect.innerHTML = '';

        const seasonDetails = await window.tmdbAPI.getTVSeasonDetails(this.currentId, this.currentSeason);

        if (seasonDetails && seasonDetails.episodes) {
            seasonDetails.episodes.forEach(ep => {
                const option = document.createElement('option');
                option.value = ep.episode_number;
                option.textContent = `Episode ${ep.episode_number}: ${ep.name}`;
                episodeSelect.appendChild(option);
            });

            this.currentEpisode = seasonDetails.episodes[0].episode_number;
        }
    }

    loadServer() {
        const server = this.config.servers[this.currentServer];
        const videoPlayer = document.getElementById('videoPlayer');

        let embedURL = '';

        if (this.currentType === 'tv') {
            if (server.tv_format) {
                embedURL = server.tv_format
                    .replace('{url}', server.tv_url)
                    .replace('{tmdb_id}', this.currentId)
                    .replace('{season}', this.currentSeason)
                    .replace('{episode}', this.currentEpisode);
            } else {
                embedURL = `${server.tv_url}${this.currentId}/${this.currentSeason}/${this.currentEpisode}`;
            }
        } else {
            embedURL = server.movie_url + this.currentId;
        }

        videoPlayer.src = embedURL;
        console.log('Loading:', embedURL);
    }

    closePlayer() {
        document.getElementById('playerModal').classList.remove('active');
        document.getElementById('videoPlayer').src = '';
    }
}

window.playerManager = new PlayerManager();