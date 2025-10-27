/**
 * Main Application Entry Point
 * Initializes the Netflix clone and renders homepage
 */

const App = {
  userRegion: 'US',

  async init() {
    try {
      console.log('🚀 Initializing Equanta...');
      
      // Detect user region first
      this.userRegion = await this.detectRegion();
      console.log('📍 User region:', this.userRegion);

      // Initialize search
      if (typeof Search !== 'undefined' && Search.init) {
        Search.init();
      }

      // Render hero banner
      await this.renderHero();

      // Render all content rows immediately
      await this.renderAllRows();

      console.log('✅ Equanta loaded successfully');
    } catch (error) {
      console.error('❌ Initialization failed:', error);
    }
  },

  async detectRegion() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return data.country_code || 'US';
    } catch (error) {
      console.warn('Region detection failed, defaulting to US');
      return 'US';
    }
  },

  async renderHero() {
    try {
      const data = await API.getTrendingMovies(1);
      const movies = data.results.slice(0, 5);
      UI.renderHero(movies);
    } catch (error) {
      console.error('Hero render failed:', error);
    }
  },

  async renderAllRows() {
    const rows = this.getRowsConfig();

    for (const row of rows) {
      try {
        const data = await row.fetcher();
        if (data && data.results && data.results.length > 0) {
          UI.renderRow(row.title, data.results, row.type || 'movie');
        }
      } catch (error) {
        console.error(`Failed to load ${row.title}:`, error);
      }
    }
  },

  getRowsConfig() {
    const rows = [];

    // India-specific trending
    if (this.userRegion === 'IN') {
      rows.push(
        { title: 'Trending in India - Movies', fetcher: () => API.getTrendingInIndiaMovies(1), type: 'movie' },
        { title: 'Trending in India - TV', fetcher: () => API.getTrendingInIndiaTV(1), type: 'tv' }
      );
    } else {
      rows.push(
        { title: 'Trending Now', fetcher: () => API.getTrendingMovies(1), type: 'movie' }
      );
    }

    // Core rows
    rows.push(
      { title: 'Popular Movies', fetcher: () => API.getPopularMovies(1), type: 'movie' },
      { title: 'Popular TV Shows', fetcher: () => API.getPopularTV(1), type: 'tv' },
      { title: 'Top Rated Movies', fetcher: () => API.getTopRatedMovies(1), type: 'movie' },
      { title: 'Bollywood Movies', fetcher: () => API.getBollywoodMovies(1), type: 'movie' },
      { title: 'Bollywood TV Shows', fetcher: () => API.getBollywoodTV(1), type: 'tv' },
      { title: 'Hollywood Blockbusters', fetcher: () => API.getHollywoodBlockbusters(1), type: 'movie' },
      { title: 'Anime Series', fetcher: () => API.getAnimeSeries(1), type: 'tv' },
      { title: 'Anime Movies', fetcher: () => API.getAnimeMovies(1), type: 'movie' },
      { title: 'Action Movies', fetcher: () => API.getMoviesByGenre(28, 1), type: 'movie' },
      { title: 'Comedy Movies', fetcher: () => API.getMoviesByGenre(35, 1), type: 'movie' },
      { title: 'Horror Movies', fetcher: () => API.getMoviesByGenre(27, 1), type: 'movie' }
    );

    return rows;
  }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}