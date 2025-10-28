// Player Manager
class PlayerManager {
    constructor() {
        this.config = null;
        this.currentServer = 0;
        this.currentId = null;
        this.currentType = null;
    }

    initialize() {
        this.config = window.getConfig();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close player button
        document.getElementById('closePlayer').addEventListener('click', () => {
            this.closePlayer();
        });

        // Server selector
        document.getElementById('serverSelect').addEventListener('change', (e) => {
            this.currentServer = parseInt(e.target.value);
            this.loadServer();
        });

        // Download button (dummy - just shows alert)
        document.getElementById('downloadBtn').addEventListener('click', () => {
            alert('Download feature is for demonstration purposes only. Please use legal streaming services.');
        });

        // Close player on overlay click
        document.getElementById('playerModal').addEventListener('click', (e) => {
            if (e.target.id === 'playerModal') {
                this.closePlayer();
            }
        });
    }

    openPlayer(id, mediaType) {
        this.currentId = id;
        this.currentType = mediaType;
        this.currentServer = 0;

        // Close detail modal if open
        document.getElementById('detailModal').classList.remove('active');

        // Populate server selector
        const serverSelect = document.getElementById('serverSelect');
        serverSelect.innerHTML = '';

        this.config.servers.forEach((server, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = server.name;
            serverSelect.appendChild(option);
        });

        // Show player modal
        document.getElementById('playerModal').classList.add('active');

        // Load first server
        this.loadServer();

        // Update URL
        const urlParams = new URLSearchParams(window.location.hash.substring(1));
        history.pushState(
            { id, mediaType }, 
            '', 
            `#watch/${mediaType}/${id}`
        );
    }

    loadServer() {
        const server = this.config.servers[this.currentServer];
        const videoPlayer = document.getElementById('videoPlayer');

        let embedURL = '';

        if (this.currentType === 'tv') {
            embedURL = server.tv_url + this.currentId;
        } else {
            embedURL = server.movie_url + this.currentId;
        }

        // Handle different server formats
        if (server.format && server.format !== 'tmdb_id') {
            if (server.format.includes('type=movie')) {
                embedURL = server.movie_url + this.currentId;
                if (this.currentType === 'tv') {
                    embedURL = embedURL.replace('type=movie', 'type=tv');
                }
            }
        }

        videoPlayer.src = embedURL;
        console.log('Loading server:', server.name, embedURL);
    }

    closePlayer() {
        document.getElementById('playerModal').classList.remove('active');
        document.getElementById('videoPlayer').src = '';

        // Update URL
        history.pushState({}, '', '#home');
    }
}

// Create global instance
window.playerManager = new PlayerManager();