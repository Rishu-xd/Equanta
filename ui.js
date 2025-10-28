// UI Manager
class UIManager {
    constructor() {
        this.api = window.tmdbAPI;
    }

    showLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<div class="loading-container"><div class="loading"></div></div>';
        }
    }

    createContentCard(item, mediaType) {
        const card = document.createElement('div');
        card.className = 'content-card';
        card.dataset.id = item.id;
        card.dataset.type = mediaType || item.media_type || 'movie';

        const posterPath = item.poster_path || item.backdrop_path;
        const title = item.title || item.name;
        const date = item.release_date || item.first_air_date || '';
        const year = date ? new Date(date).getFullYear() : 'N/A';
        const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

        card.innerHTML = `
            <img src="${this.api.getImageURL(posterPath)}" alt="${title}" loading="lazy">
            <div class="card-overlay">
                <div class="card-title">${title}</div>
                <div class="card-info">
                    <span>${year}</span>
                    <span class="card-rating">⭐ ${rating}</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => this.openDetail(item.id, card.dataset.type));

        return card;
    }

    renderContent(containerId, items, mediaType) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        if (!items || items.length === 0) {
            container.innerHTML = '<p style="color: #b3b3b3; padding: 2rem;">No content available</p>';
            return;
        }

        items.slice(0, 20).forEach(item => {
            const card = this.createContentCard(item, mediaType);
            container.appendChild(card);
        });
    }

    async createHeroBanner(item, mediaType) {
        const heroBanner = document.getElementById('heroBanner');
        if (!heroBanner) return;

        const backdropPath = item.backdrop_path;
        const title = item.title || item.name;
        const overview = item.overview;
        const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

        heroBanner.style.backgroundImage = `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%), 
                                            url('${this.api.getImageURL(backdropPath, 'original')}')`;

        heroBanner.innerHTML = `
            <div class="hero-content">
                <h1>${title}</h1>
                <p>${overview ? overview.substring(0, 200) + '...' : 'No description available'}</p>
                <div class="hero-buttons">
                    <button class="btn btn-primary" onclick="window.playerManager.openPlayer(${item.id}, '${mediaType}')">
                        ▶ Play Now
                    </button>
                    <button class="btn btn-secondary" onclick="window.uiManager.openDetail(${item.id}, '${mediaType}')">
                        ℹ More Info
                    </button>
                </div>
            </div>
        `;
    }

    async openDetail(id, mediaType) {
        const modal = document.getElementById('detailModal');
        const detailContent = document.getElementById('detailContent');

        modal.classList.add('active');
        detailContent.innerHTML = '<div class="loading-container"><div class="loading"></div></div>';

        const details = mediaType === 'tv' 
            ? await this.api.getTVDetails(id)
            : await this.api.getMovieDetails(id);

        if (!details) {
            detailContent.innerHTML = '<p>Failed to load details</p>';
            return;
        }

        const title = details.title || details.name;
        const backdrop = details.backdrop_path;
        const overview = details.overview;
        const rating = details.vote_average ? details.vote_average.toFixed(1) : 'N/A';
        const releaseDate = details.release_date || details.first_air_date || 'N/A';
        const runtime = details.runtime || (details.episode_run_time && details.episode_run_time[0]) || 'N/A';
        const genres = details.genres || [];

        detailContent.innerHTML = `
            <img src="${this.api.getImageURL(backdrop, 'original')}" alt="${title}" class="detail-backdrop">
            <div class="detail-info">
                <div class="detail-header">
                    <h2 class="detail-title">${title}</h2>
                </div>
                <div class="detail-meta">
                    <div class="meta-item">⭐ ${rating}</div>
                    <div class="meta-item">📅 ${releaseDate}</div>
                    <div class="meta-item">⏱ ${runtime} min</div>
                </div>
                <div class="detail-genres">
                    ${genres.map(g => `<span class="genre-tag">${g.name}</span>`).join('')}
                </div>
                <p class="detail-overview">${overview || 'No description available'}</p>
                <button class="btn btn-primary" onclick="window.playerManager.openPlayer(${id}, '${mediaType}')">
                    ▶ Play Now
                </button>
            </div>
        `;

        // Update URL without reload
        const urlTitle = title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        history.pushState(
            { id, mediaType, title }, 
            title, 
            `#${mediaType}/${id}/${urlTitle}`
        );
    }
}

// Create global instance
window.uiManager = new UIManager();