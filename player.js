/**
 * Player Module
 * Handles movie/TV show playback with multiple embed servers
 */

const Player = (() => {
    // ========================================
    // EMBED SERVERS CONFIGURATION
    // Easy to modify - add or remove servers here
    // ========================================
    const EMBED_SERVERS = [
         {name: "Indiraembed",
            movieUrl:"https://indraembed.netlify.app/movie/{tmdb_id}",
tvUrl:"https://indraembed.netlify.app/tv/{tmdb_id}/{season}/{episode}"},
        {
            name: "VidSrc",
            movieUrl: "https://vidsrc.ru/embed/movie/{tmdb_id}",
            tvUrl: "https://vidsrc.ru/embed/tv/{tmdb_id}/{season}/{episode}"
        },
        {
            name: "VidSrc.icu",
            movieUrl: "https://vidsrc.icu/embed/movie/{tmdb_id}",
            tvUrl: "https://vidsrc.icu/embed/tv/{tmdb_id}/{season}/{episode}"
        },
        {
            name: "VidSrc.pk",
            movieUrl: "https://embed.vidsrc.pk/movie/{tmdb_id}",
            tvUrl: "https://embed.vidsrc.pk/tv/{tmdb_id}/{season}-{episode}"
        },
        {
            name: "2Embed",
            movieUrl: "https://www.2embed.stream/embed/movie/{tmdb_id}",
            tvUrl: "https://www.2embed.stream/embed/tv/{tmdb_id}/{season}/{episode}"
        },
        {
            name: "AutoEmbed",
            movieUrl: "https://player.autoembed.cc/embed/movie/{tmdb_id}",
            tvUrl: "https://player.autoembed.cc/embed/tv/{tmdb_id}/{season}/{episode}"
        },
        {
            name: "SuperEmbed",
            movieUrl: "https://multiembed.mov/?video_id={tmdb_id}&tmdb=1",
            tvUrl: "https://multiembed.mov/?video_id={tmdb_id}&tmdb=1&s={season}&e={episode}"
        },
        {
            name: "Embed-API",
            movieUrl: "https://player.embed-api.stream/?id={tmdb_id}&type=movie",
            tvUrl: "https://player.embed-api.stream/?id={tmdb_id}&s={season}&e={episode}"
        }
    ];

    // Player state
    let currentItemId = null;
    let currentItemType = null;
    let currentServerIndex = 0;
    let currentSeason = 1;
    let currentEpisode = 1;
    let seasonsData = [];

    // Cache DOM elements
    const elements = {
        playerSection: null,
        playerContainer: null,
        playerIframe: null,
        serverDropdown: null,
        episodeSelector: null,
        loadingOverlay: null
    };

    /**
     * Initialize player elements
     */
    function initElements() {
        elements.playerSection = document.getElementById('player-section');
        elements.playerContainer = document.getElementById('player-container');
        elements.playerIframe = document.getElementById('player-iframe');
        elements.serverDropdown = document.getElementById('server-dropdown');
        elements.episodeSelector = document.getElementById('episode-selector');
    }

    /**
     * Initialize player with movie or TV show
     */
    async function init(itemId, itemType) {
        initElements();
        
        currentItemId = itemId;
        currentItemType = itemType;
        currentServerIndex = 0;

        // Show player section
        if (elements.playerSection) {
            elements.playerSection.style.display = 'block';
        }

        // Populate server dropdown
        populateServerDropdown();

        // Setup server change listener
        if (elements.serverDropdown) {
            elements.serverDropdown.addEventListener('change', (e) => {
                currentServerIndex = parseInt(e.target.value);
                if (currentItemType === 'movie') {
                    loadMovie(currentItemId, currentServerIndex);
                } else {
                    loadTVEpisode(currentItemId, currentSeason, currentEpisode, currentServerIndex);
                }
            });
        }

        // Load content based on type
        if (itemType === 'movie') {
            hideEpisodeSelector();
            loadMovie(itemId, currentServerIndex);
        } else if (itemType === 'tv') {
            await fetchAndRenderSeasons(itemId);
            loadTVEpisode(itemId, currentSeason, currentEpisode, currentServerIndex);
        }
    }

    /**
     * Populate server dropdown
     */
    function populateServerDropdown() {
        if (!elements.serverDropdown) return;

        elements.serverDropdown.innerHTML = EMBED_SERVERS.map((server, index) => 
            `<option value="${index}" ${index === currentServerIndex ? 'selected' : ''}>
                ${server.name}
            </option>`
        ).join('');
    }

    /**
     * Load movie in player
     */
    function loadMovie(movieId, serverIndex = 0) {
        const server = EMBED_SERVERS[serverIndex];
        if (!server) return;

        const url = server.movieUrl.replace('{tmdb_id}', movieId);
        loadIframe(url);
    }

    /**
     * Load TV episode in player
     */
    function loadTVEpisode(tvId, season, episode, serverIndex = 0) {
        const server = EMBED_SERVERS[serverIndex];
        if (!server) return;

        let url = server.tvUrl
            .replace('{tmdb_id}', tvId)
            .replace('{season}', season)
            .replace('{episode}', episode);
        
        // Handle VidSrc.pk format (season-episode)
        if (server.name === 'VidSrc.pk') {
            url = server.tvUrl
                .replace('{tmdb_id}', tvId)
                .replace('{season}-{episode}', `${season}-${episode}`);
        }

        loadIframe(url);
    }

    /**
     * Load URL in iframe
     */
    function loadIframe(url) {
        if (!elements.playerIframe) return;

        showLoading();
        
        elements.playerIframe.src = url;
        
        // Hide loading after a delay (iframe doesn't have reliable load event for cross-origin)
        setTimeout(() => {
            hideLoading();
        }, 1500);
    }

    /**
     * Show loading overlay
     */
    function showLoading() {
        if (!elements.playerContainer) return;
        
        let overlay = elements.playerContainer.querySelector('.player-loading');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'player-loading';
            overlay.innerHTML = '<div class="spinner"></div>';
            elements.playerContainer.appendChild(overlay);
        }
        overlay.style.display = 'flex';
    }

    /**
     * Hide loading overlay
     */
    function hideLoading() {
        if (!elements.playerContainer) return;
        
        const overlay = elements.playerContainer.querySelector('.player-loading');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    /**
     * Fetch all seasons and episodes for a TV show
     */
    async function fetchAndRenderSeasons(tvId) {
        // First get TV show details to know how many seasons
        const tvDetails = await API.getTVDetails(tvId);
        if (!tvDetails || !tvDetails.number_of_seasons) return;

        seasonsData = [];
        
        // Fetch each season's data
        for (let i = 1; i <= tvDetails.number_of_seasons; i++) {
            const seasonData = await fetchSeasonDetails(tvId, i);
            if (seasonData) {
                seasonsData.push(seasonData);
            }
        }

        renderEpisodeSelector();
    }

    /**
     * Fetch season details from TMDB
     */
    async function fetchSeasonDetails(tvId, seasonNumber) {
        try {
            const API_KEY = 'YOUR_API_KEY'; // Uses same key from api.js
            const response = await fetch(
                `https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}`
            );
            
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error(`Error fetching season ${seasonNumber}:`, error);
            return null;
        }
    }

    /**
     * Render episode selector UI
     */
    function renderEpisodeSelector() {
        if (!elements.episodeSelector || seasonsData.length === 0) return;

        elements.episodeSelector.style.display = 'block';

        const html = `
            <div class="season-selector">
                <label for="season-dropdown">Season:</label>
                <select id="season-dropdown" class="season-dropdown">
                    ${seasonsData.map((season, index) => 
                        `<option value="${index}">${season.name}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="episodes-container" id="episodes-container">
                ${renderEpisodes(0)}
            </div>
        `;

        elements.episodeSelector.innerHTML = html;

        // Add season change listener
        const seasonDropdown = document.getElementById('season-dropdown');
        seasonDropdown?.addEventListener('change', (e) => {
            const seasonIndex = parseInt(e.target.value);
            updateEpisodesDisplay(seasonIndex);
        });

        // Set initial season
        currentSeason = seasonsData[0]?.season_number || 1;
    }

    /**
     * Render episodes for a season
     */
    function renderEpisodes(seasonIndex) {
        const season = seasonsData[seasonIndex];
        if (!season || !season.episodes) return '<p>No episodes available</p>';

        return `
            <div class="episodes-grid">
                ${season.episodes.map(episode => {
                    const stillPath = episode.still_path ? 
                        API.getImageURL(episode.still_path, 'backdrop') : null;
                    
                    return `
                        <div class="episode-card" 
                             data-season="${season.season_number}" 
                             data-episode="${episode.episode_number}">
                            <div class="episode-thumbnail">
                                ${stillPath ? 
                                    `<img src="${stillPath}" alt="Episode ${episode.episode_number}" loading="lazy">` :
                                    `<div class="no-poster">E${episode.episode_number}</div>`
                                }
                                <div class="episode-play-overlay">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                                        <path d="M8 5v14l11-7z"/>
                                    </svg>
                                </div>
                            </div>
                            <div class="episode-info">
                                <div class="episode-number">Episode ${episode.episode_number}</div>
                                <div class="episode-title">${episode.name || 'Episode ' + episode.episode_number}</div>
                                <div class="episode-meta">
                                    ${episode.air_date ? episode.air_date : ''}
                                    ${episode.runtime ? ` • ${episode.runtime} min` : ''}
                                </div>
                                <div class="episode-overview">
                                    ${episode.overview || 'No description available.'}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    /**
     * Update episodes display when season changes
     */
    function updateEpisodesDisplay(seasonIndex) {
        const container = document.getElementById('episodes-container');
        if (!container) return;

        const season = seasonsData[seasonIndex];
        currentSeason = season?.season_number || 1;
        currentEpisode = 1;

        container.innerHTML = renderEpisodes(seasonIndex);
        attachEpisodeClickListeners();
    }

    /**
     * Attach click listeners to episode cards
     */
    function attachEpisodeClickListeners() {
        const episodeCards = document.querySelectorAll('.episode-card');
        episodeCards.forEach(card => {
            card.addEventListener('click', () => {
                const season = parseInt(card.dataset.season);
                const episode = parseInt(card.dataset.episode);
                
                currentSeason = season;
                currentEpisode = episode;
                
                loadTVEpisode(currentItemId, season, episode, currentServerIndex);
                
                // Scroll player into view
                elements.playerSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    /**
     * Hide episode selector
     */
    function hideEpisodeSelector() {
        if (elements.episodeSelector) {
            elements.episodeSelector.style.display = 'none';
        }
    }

    /**
     * Switch to different server
     */
    function switchServer(serverIndex) {
        if (serverIndex < 0 || serverIndex >= EMBED_SERVERS.length) return;
        
        currentServerIndex = serverIndex;
        
        if (elements.serverDropdown) {
            elements.serverDropdown.value = serverIndex;
        }

        if (currentItemType === 'movie') {
            loadMovie(currentItemId, serverIndex);
        } else {
            loadTVEpisode(currentItemId, currentSeason, currentEpisode, serverIndex);
        }
    }

    /**
     * Destroy player and clean up
     */
    function destroy() {
        if (elements.playerIframe) {
            elements.playerIframe.src = '';
        }
        
        if (elements.playerSection) {
            elements.playerSection.style.display = 'none';
        }

        // Reset state
        currentItemId = null;
        currentItemType = null;
        currentServerIndex = 0;
        currentSeason = 1;
        currentEpisode = 1;
        seasonsData = [];
    }

    // Public API
    return {
        init,
        loadMovie,
        loadTVEpisode,
        switchServer,
        destroy
    };
})();
