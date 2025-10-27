/**
 * Main Application Entry Point
 * Netflix Clone - Equanta
 */

(function() {
  'use strict';

  const App = {
    userRegion: 'US',
    isInitialized: false,

    async init() {
      if (this.isInitialized) return;
      
      try {
        console.log('🚀 Initializing Equanta...');
        
        // Show loading state
        this.showLoadingState();

        // Detect region
        this.userRegion = await this.detectRegion();
        console.log('📍 Region detected:', this.userRegion);

        // Initialize search functionality
        this.initSearch();

        // Load and render hero
        await this.loadHero();

        // Load all content rows
        await this.loadAllContent();

        // Hide loading state
        this.hideLoadingState();

        this.isInitialized = true;
        console.log('✅ Equanta initialized successfully');

      } catch (error) {
        console.error('❌ Failed to initialize:', error);
        this.showError('Failed to load content. Please refresh the page.');
      }
    },

    showLoadingState() {
      const contentArea = document.getElementById('content-rows') || document.querySelector('.content-rows') || document.querySelector('main');
      if (contentArea) {
        contentArea.innerHTML = '<div class="loading-spinner" style="text-align:center;padding:40px;color:#fff;">Loading content...</div>';
      }
    },

    hideLoadingState() {
      const loader = document.querySelector('.loading-spinner');
      if (loader) loader.remove();
    },

    showError(message) {
      const contentArea = document.getElementById('content-rows') || document.querySelector('.content-rows') || document.querySelector('main');
      if (contentArea) {
        contentArea.innerHTML = `<div style="text-align:center;padding:40px;color:#fff;">${message}</div>`;
      }
    },

    async detectRegion() {
      try {
        const response = await fetch('https://ipapi.co/json/', { timeout: 3000 });
        if (!response.ok) throw new Error('Region API failed');
        const data = await response.json();
        return data.country_code || 'US';
      } catch (error) {
        console.warn('⚠️ Region detection failed, using default (US)');
        return 'US';
      }
    },

    initSearch() {
      if (typeof Search !== 'undefined' && typeof Search.init === 'function') {
        Search.init();
      }
    },

    async loadHero() {
      try {
        if (typeof API === 'undefined' || typeof UI === 'undefined') {
          throw new Error('API or UI module not loaded');
        }

        let heroData;
        
        // Try to get trending movies for hero
        if (typeof API.getTrendingMovies === 'function') {
          heroData = await API.getTrendingMovies(1);
        } else if (typeof API.getPopularMovies === 'function') {
          heroData = await API.getPopularMovies(1);
        }

        if (heroData && heroData.results && heroData.results.length > 0) {
          const heroItems = heroData.results.slice(0, 5);
          if (typeof UI.renderHero === 'function') {
            UI.renderHero(heroItems);
          }
        }
      } catch (error) {
        console.error('❌ Failed to load hero:', error);
      }
    },

    async loadAllContent() {
      const rows = this.buildRowsConfig();

      for (const row of rows) {
        try {
          const data = await row.fetcher();
          
          if (data && data.results && data.results.length > 0) {
            if (typeof UI.renderRow === 'function') {
              UI.renderRow(row.title, data.results, row.type);
            } else {
              console.warn('UI.renderRow not available');
            }
          }
        } catch (error) {
          console.error(`❌ Failed to load ${row.title}:`, error);
        }
      }
    },

    buildRowsConfig() {
      const rows = [];

      if (typeof API === 'undefined') {
        console.error('API module not loaded');
        return rows;
      }

      // India-specific trending
      if (this.userRegion === 'IN') {
        if (typeof API.getTrendingInIndiaMovies === 'function') {
          rows.push({ 
            title: 'Trending in India - Movies', 
            fetcher: () => API.getTrendingInIndiaMovies(1), 
            type: 'movie' 
          });
        }
        if (typeof API.getTrendingInIndiaTV === 'function') {
          rows.push({ 
            title: 'Trending in India - TV', 
            fetcher: () => API.getTrendingInIndiaTV(1), 
            type: 'tv' 
          });
        }
      }

      // Global trending
      if (typeof API.getTrendingMovies === 'function') {
        rows.push({ 
          title: 'Trending Now', 
          fetcher: () => API.getTrendingMovies(1), 
          type: 'movie' 
        });
      }

      if (typeof API.getTrendingTV === 'function') {
        rows.push({ 
          title: 'Trending TV Shows', 
          fetcher: () => API.getTrendingTV(1), 
          type: 'tv' 
        });
      }

      // Popular content
      if (typeof API.getPopularMovies === 'function') {
        rows.push({ 
          title: 'Popular Movies', 
          fetcher: () => API.getPopularMovies(1), 
          type: 'movie' 
        });
      }

      if (typeof API.getPopularTV === 'function') {
        rows.push({ 
          title: 'Popular TV Shows', 
          fetcher: () => API.getPopularTV(1), 
          type: 'tv' 
        });
      }

      // Top rated
      if (typeof API.getTopRatedMovies === 'function') {
        rows.push({ 
          title: 'Top Rated Movies', 
          fetcher: () => API.getTopRatedMovies(1), 
          type: 'movie' 
        });
      }

      // Bollywood
      if (typeof API.getBollywoodMovies === 'function') {
        rows.push({ 
          title: 'Bollywood Movies', 
          fetcher: () => API.getBollywoodMovies(1), 
          type: 'movie' 
        });
      }

      if (typeof API.getBollywoodTV === 'function') {
        rows.push({ 
          title: 'Bollywood TV Shows', 
          fetcher: () => API.getBollywoodTV(1), 
          type: 'tv' 
        });
      }

      // Hollywood
      if (typeof API.getHollywoodBlockbusters === 'function') {
        rows.push({ 
          title: 'Hollywood Blockbusters', 
          fetcher: () => API.getHollywoodBlockbusters(1), 
          type: 'movie' 
        });
      }

      // Anime
      if (typeof API.getAnimeSeries === 'function') {
        rows.push({ 
          title: 'Anime Series', 
          fetcher: () => API.getAnimeSeries(1), 
          type: 'tv' 
        });
      }

      if (typeof API.getAnimeMovies === 'function') {
        rows.push({ 
          title: 'Anime Movies', 
          fetcher: () => API.getAnimeMovies(1), 
          type: 'movie' 
        });
      }

      // Genre-based rows
      if (typeof API.getMoviesByGenre === 'function') {
        rows.push({ 
          title: 'Action Movies', 
          fetcher: () => API.getMoviesByGenre(28, 1), 
          type: 'movie' 
        });
        rows.push({ 
          title: 'Comedy Movies', 
          fetcher: () => API.getMoviesByGenre(35, 1), 
          type: 'movie' 
        });
        rows.push({ 
          title: 'Horror Movies', 
          fetcher: () => API.getMoviesByGenre(27, 1), 
          type: 'movie' 
        });
      }

      return rows;
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => App.init(), 100);
    });
  } else {
    setTimeout(() => App.init(), 100);
  }

  // Expose globally for debugging
  window.App = App;

})();