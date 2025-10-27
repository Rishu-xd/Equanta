/**
 * UI Rendering Module
 * Handles all UI rendering and DOM manipulation
 */

const UI = (() => {
    // Cache DOM elements
    const elements = {
        heroBanner: null,
        heroTitle: null,
        heroOverview: null,
        heroPlay: null,
        heroInfo: null,
        mainContent: null,
        searchResults: null,
        searchResultsGrid: null,
        header: null
    };
    
    // Hero banner state
    let heroItems = [];
    let currentHeroIndex = 0;
    let heroInterval = null;
    
    /**
     * Initialize UI elements
     */
    function init() {
        elements.heroBanner = document.getElementById('heroBanner');
        elements.heroTitle = document.getElementById('heroTitle');
        elements.heroOverview = document.getElementById('heroOverview');
        elements.heroPlay = document.getElementById('heroPlay');
        elements.heroInfo = document.getElementById('heroInfo');
        elements.mainContent = document.getElementById('mainContent');
        elements.searchResults = document.getElementById('searchResults');
        elements.searchResultsGrid = document.getElementById('searchResultsGrid');
        elements.header = document.getElementById('header');
        
        // Add scroll listener for header background
        window.addEventListener('scroll', handleScroll);
        
        // Add hero button listeners
        elements.heroPlay?.addEventListener('click', handleHeroPlay);
        elements.heroInfo?.addEventListener('click', handleHeroInfo);
    }
    
    /**
     * Handle scroll event for header
     */
    function handleScroll() {
        if (window.scrollY > 50) {
            elements.header?.classList.add('scrolled');
        } else {
            elements.header?.classList.remove('scrolled');
        }
    }
    
    /**
     * Set up hero banner with trending movies
     */
    async function setupHeroBanner() {
        const data = await API.getTrendingMovies();
        if (data && data.results) {
            heroItems = data.results.slice(0, 5);
            updateHeroContent();
            startHeroRotation();
        }
    }
    
    /**
     * Update hero banner content
     */
    function updateHeroContent() {
        if (heroItems.length === 0) return;
        
        const item = heroItems[currentHeroIndex];
        const backdropURL = API.getImageURL(item.backdrop_path, 'backdrop');
        
        if (backdropURL) {
            elements.heroBanner.style.backgroundImage = `url(${backdropURL})`;
        }
        
        elements.heroTitle.textContent = item.title || item.name;
        elements.heroOverview.textContent = item.overview || 'No overview available.';
        
        // Store current item ID for button actions
        elements.heroBanner.dataset.itemId = item.id;
        elements.heroBanner.dataset.itemType = item.media_type || 'movie';
    }
    
    /**
     * Start hero banner auto-rotation
     */
    function startHeroRotation() {
        if (heroInterval) clearInterval(heroInterval);
        
        heroInterval = setInterval(() => {
            currentHeroIndex = (currentHeroIndex + 1) % heroItems.length;
            updateHeroContent();
        }, 8000); // Rotate every 8 seconds
    }
    
    /**
     * Handle hero play button click
     */
    function handleHeroPlay() {
        const itemId = elements.heroBanner.dataset.itemId;
        const itemType = elements.heroBanner.dataset.itemType;
        if (itemId && itemType) {
            Modal.open(itemId, itemType);
        }
    }
    
    /**
     * Handle hero info button click
     */
    function handleHeroInfo() {
        const itemId = elements.heroBanner.dataset.itemId;
        const itemType = elements.heroBanner.dataset.itemType;
        if (itemId && itemType) {
            Modal.open(itemId, itemType);
        }
    }
    
    /**
     * Render content rows
     */
    async function renderContentRows() {
        const container = elements.mainContent.querySelector('.content-container');
        if (!container) return;
        
        // Content categories configuration
        const categories = [
            { title: 'Trending Now', fetchFn: () => API.getTrendingMovies() },
            { title: 'Trending TV Shows', fetchFn: () => API.getTrendingTV() },
            { title: 'Popular Movies', fetchFn: () => API.getPopularMovies() },
            { title: 'Popular TV Shows', fetchFn: () => API.getPopularTV() },
            { title: 'Top Rated Movies', fetchFn: () => API.getTopRatedMovies() },
            { title: 'Action Movies', fetchFn: () => API.getMoviesByGenre(28) },
            { title: 'Comedy Movies', fetchFn: () => API.getMoviesByGenre(35) },
            { title: 'Horror Movies', fetchFn: () => API.getMoviesByGenre(27) }
        ];
        
        // Render each category
        for (const category of categories) {
            const data = await category.fetchFn();
            if (data && data.results && data.results.length > 0) {
                renderRow(container, category.title, data.results);
            }
        }
    }
    
    /**
     * Render a single content row
     */
    function renderRow(container, title, items) {
        const rowHTML = `
            <div class="content-row">
                <h2 class="row-title">${title}</h2>
                <div class="row-slider">
                    <div class="row-cards">
                        ${items.map(item => createCardHTML(item)).join('')}
                    </div>
                </div>
            </div>
        `;
        addRow('Trending in India — Movies', () => API.getTrendingInIndiaMovies(1));
addRow('Trending in India — TV', () => API.getTrendingInIndiaTV(1));
        container.insertAdjacentHTML('beforeend', rowHTML);
        
        // Add click listeners to cards
        const cards = container.querySelectorAll('.movie-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const itemId = card.dataset.id;
                const itemType = card.dataset.type;
                Modal.open(itemId, itemType);
            });
        });
    }
    
    /**
     * Create movie card HTML
     */
    function createCardHTML(item) {
        const posterURL = API.getImageURL(item.poster_path, 'poster');
        const title = item.title || item.name;
        const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
        const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
        const year = item.release_date ? item.release_date.split('-')[0] : 
                     (item.first_air_date ? item.first_air_date.split('-')[0] : '');
        
        return `
            <div class="movie-card" data-id="${item.id}" data-type="${mediaType}">
                ${posterURL ? 
                    `<img src="${posterURL}" alt="${title}" loading="lazy">` :
                    `<div class="no-poster" style="width:100%;height:300px;">No Image</div>`
                }
                <div class="card-info">
                    <div class="card-title">${title}</div>
                    <div class="card-meta">
                        <span>⭐ ${rating}</span>
                        ${year ? `<span>${year}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Show search results
     */
    function showSearchResults(results) {
        elements.searchResults.style.display = 'block';
        elements.mainContent.style.display = 'none';
        
        if (!results || results.length === 0) {
            elements.searchResultsGrid.innerHTML = '<p style="color: #808080; font-size: 1.2rem;">No results found</p>';
            return;
        }
        
        const filteredResults = results.filter(item => 
            (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path
        );
        
        elements.searchResultsGrid.innerHTML = filteredResults.map(item => {
            const posterURL = API.getImageURL(item.poster_path, 'poster');
            const title = item.title || item.name;
            const year = item.release_date ? item.release_date.split('-')[0] : 
                         (item.first_air_date ? item.first_air_date.split('-')[0] : '');
            const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
            
            return `
                <div class="search-card" data-id="${item.id}" data-type="${item.media_type}">
                    ${posterURL ? 
                        `<img src="${posterURL}" alt="${title}" loading="lazy">` :
                        `<div class="no-poster" style="width:100%;height:300px;">No Image</div>`
                    }
                    <div class="search-card-title">${title}</div>
                    <div class="search-card-meta">⭐ ${rating} ${year ? `• ${year}` : ''}</div>
                </div>
            `;
        }).join('');
        
        // Add click listeners
        elements.searchResultsGrid.querySelectorAll('.search-card').forEach(card => {
            card.addEventListener('click', () => {
                const itemId = card.dataset.id;
                const itemType = card.dataset.type;
                Modal.open(itemId, itemType);
            });
        });
    }
    
    /**
     * Hide search results and show main content
     */
    function hideSearchResults() {
        elements.searchResults.style.display = 'none';
        elements.mainContent.style.display = 'block';
    }
    
    /**
     * Show loading spinner
     */
    function showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        spinner?.classList.add('active');
    }
    
    /**
     * Hide loading spinner
     */
    function hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        spinner?.classList.remove('active');
    }
    
    // Public API
    return {
        init,
        setupHeroBanner,
        renderContentRows,
        showSearchResults,
        hideSearchResults,
        showLoading,
        hideLoading
    };
})();