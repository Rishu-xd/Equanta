// Main Application
class App {
    constructor() {
        this.initialized = false;
    }

    async init() {
        try {
            console.log('Initializing Equanta...');

            // Load configuration
            await window.loadConfig();

            // Initialize API
            const apiInitialized = await window.tmdbAPI.initialize();
            if (!apiInitialized) {
                throw new Error('Failed to initialize API');
            }

            // Initialize player manager
            window.playerManager.initialize();

            // Setup search functionality
            this.setupSearch();

            // Setup navbar scroll effect
            this.setupNavbar();

            // Load initial content
            await this.loadAllContent();

            // Handle initial route
            window.router.handleInitialRoute();

            this.initialized = true;
            console.log('Equanta initialized successfully!');

        } catch (error) {
            console.error('Initialization error:', error);
            alert('Failed to initialize application. Please check your configuration and try again.');
        }
    }

    async loadAllContent() {
        const api = window.tmdbAPI;
        const ui = window.uiManager;

        try {
            // Load trending movies
            ui.showLoading('trendingMovies');
            const trendingMovies = await api.getTrending('movie', 'week');
            if (trendingMovies && trendingMovies.results) {
                ui.renderContent('trendingMovies', trendingMovies.results, 'movie');

                // Create hero banner from first trending movie
                if (trendingMovies.results.length > 0) {
                    await ui.createHeroBanner(trendingMovies.results[0], 'movie');
                }
            }

            // Load trending TV series
            ui.showLoading('trendingSeries');
            const trendingSeries = await api.getTrending('tv', 'week');
            if (trendingSeries && trendingSeries.results) {
                ui.renderContent('trendingSeries', trendingSeries.results, 'tv');
            }

            // Load regional movies
            ui.showLoading('regionalMovies');
            const regionalMovies = await api.getRegionalMovies();
            if (regionalMovies && regionalMovies.results) {
                ui.renderContent('regionalMovies', regionalMovies.results, 'movie');

                // Update title with country
                const title = document.getElementById('regionalTitle');
                if (title) {
                    const countryName = api.userCountry === 'IN' ? 'India' :
                                       api.userCountry === 'US' ? 'United States' :
                                       api.userCountry === 'GB' ? 'United Kingdom' :
                                       'Your Area';
                    title.textContent = `Top Movies in ${countryName}`;
                }
            }

            // Load anime
            ui.showLoading('animeContent');
            const anime = await api.getAnime();
            if (anime && anime.results) {
                ui.renderContent('animeContent', anime.results, 'tv');
            }

            // Load Hollywood
            ui.showLoading('hollywoodContent');
            const hollywood = await api.getHollywood();
            if (hollywood && hollywood.results) {
                ui.renderContent('hollywoodContent', hollywood.results, 'movie');
            }

            // Load Bollywood
            ui.showLoading('bollywoodContent');
            const bollywood = await api.getBollywood();
            if (bollywood && bollywood.results) {
                ui.renderContent('bollywoodContent', bollywood.results, 'movie');
            }

            // Load Tollywood
            ui.showLoading('tollywoodContent');
            const tollywood = await api.getTollywood();
            if (tollywood && tollywood.results) {
                ui.renderContent('tollywoodContent', tollywood.results, 'movie');
            }

        } catch (error) {
            console.error('Error loading content:', error);
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');

        const performSearch = async () => {
            const query = searchInput.value.trim();

            if (!query) {
                alert('Please enter a search term');
                return;
            }

            // Navigate to search section
            window.router.navigateTo('search');

            // Show loading
            window.uiManager.showLoading('searchResults');

            // Perform search
            const results = await window.tmdbAPI.search(query);

            if (results && results.results) {
                window.uiManager.renderContent('searchResults', results.results);
            } else {
                document.getElementById('searchResults').innerHTML = 
                    '<p style="color: #b3b3b3; padding: 2rem;">No results found</p>';
            }
        };

        searchBtn.addEventListener('click', performSearch);

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    setupNavbar() {
        const navbar = document.querySelector('.navbar');

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});

// Handle service worker for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('Service Worker registered'))
        //     .catch(err => console.log('Service Worker registration failed'));
    });
}