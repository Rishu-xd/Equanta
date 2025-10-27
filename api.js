/**
 * TMDB API Integration Module
 * Handles all API calls to The Movie Database
 */

const API = (() => {
    // TMDB API Configuration
    const API_KEY = '4ec93c7a7f3e73cc8553919a8d8e5c49'; // From Equanta GitHub repo
    const BASE_URL = 'https://api.themoviedb.org/3';
    const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';
    
    // Image size configurations
    const IMAGE_SIZES = {
        poster: 'w500',
        backdrop: 'original',
        profile: 'w185'
    };
    
    /**
     * Generic fetch function with error handling
     */
    async function fetchFromAPI(endpoint) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API Fetch Error:', error);
            return null;
        }
    }
    
    /**
     * Get image URL with proper size
     */
    function getImageURL(path, type = 'poster') {
        if (!path) return null;
        return `${IMAGE_BASE_URL}${IMAGE_SIZES[type]}${path}`;
    }
    
    /**
     * Fetch trending movies for the week
     */
    async function getTrendingMovies() {
        return await fetchFromAPI(`/trending/movie/week?api_key=${API_KEY}`);
    }
    
    /**
     * Fetch trending TV shows for the week
     */
    async function getTrendingTV() {
        return await fetchFromAPI(`/trending/tv/week?api_key=${API_KEY}`);
    }
    
    /**
     * Fetch popular movies
     */
    async function getPopularMovies(page = 1) {
        return await fetchFromAPI(`/movie/popular?api_key=${API_KEY}&page=${page}`);
    }
    
    /**
     * Fetch popular TV shows
     */
    async function getPopularTV(page = 1) {
        return await fetchFromAPI(`/tv/popular?api_key=${API_KEY}&page=${page}`);
    }
    
    /**
     * Fetch top rated movies
     */
    async function getTopRatedMovies(page = 1) {
        return await fetchFromAPI(`/movie/top_rated?api_key=${API_KEY}&page=${page}`);
    }
    
    /**
     * Fetch top rated TV shows
     */
    async function getTopRatedTV(page = 1) {
        return await fetchFromAPI(`/tv/top_rated?api_key=${API_KEY}&page=${page}`);
    }
    
    /**
     * Fetch movies by genre
     */
    async function getMoviesByGenre(genreId, page = 1) {
        return await fetchFromAPI(`/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${page}`);
    }
    
    /**
     * Fetch TV shows by genre
     */
    async function getTVByGenre(genreId, page = 1) {
        return await fetchFromAPI(`/discover/tv?api_key=${API_KEY}&with_genres=${genreId}&page=${page}`);
    }
    
    /**
     * Search for movies and TV shows
     */
    async function searchMulti(query, page = 1) {
        if (!query) return null;
        const encodedQuery = encodeURIComponent(query);
        return await fetchFromAPI(`/search/multi?api_key=${API_KEY}&query=${encodedQuery}&page=${page}`);
    }
    
    /**
     * Get detailed movie information
     */
    async function getMovieDetails(movieId) {
        return await fetchFromAPI(`/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,videos,images,similar`);
    }
    
    /**
     * Get detailed TV show information
     */
    async function getTVDetails(tvId) {
        return await fetchFromAPI(`/tv/${tvId}?api_key=${API_KEY}&append_to_response=credits,videos,images,similar`);
    }
    
    /**
     * Get movie genres list
     */
    async function getMovieGenres() {
        return await fetchFromAPI(`/genre/movie/list?api_key=${API_KEY}`);
    }
    
    /**
     * Get TV genres list
     */
    async function getTVGenres() {
        return await fetchFromAPI(`/genre/tv/list?api_key=${API_KEY}`);
    }
    
    /**
     * Detect user's region using IP geolocation
     */
    async function detectUserRegion() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            if (!response.ok) throw new Error('Region detection failed');
            const data = await response.json();
            return data.country_code || 'US';
        } catch (error) {
            console.error('Region detection error:', error);
            return 'US'; // Default fallback
        }
    }
    
    /**
     * Get trending content in India
     */
    async function getTrendingInIndiaMovies(page = 1) {
        return await fetchFromAPI(`/discover/movie?api_key=${API_KEY}&region=IN&sort_by=popularity.desc&watch_region=IN&with_watch_monetization_types=flatrate&page=${page}`);
    }
    
    async function getTrendingInIndiaTV(page = 1) {
        return await fetchFromAPI(`/discover/tv?api_key=${API_KEY}&region=IN&sort_by=popularity.desc&watch_region=IN&with_watch_monetization_types=flatrate&page=${page}`);
    }
    
    /**
     * Get Bollywood content
     */
    async function getBollywoodMovies(page = 1) {
        return await fetchFromAPI(`/discover/movie?api_key=${API_KEY}&with_original_language=hi&sort_by=popularity.desc&page=${page}`);
    }
    
    async function getBollywoodTV(page = 1) {
        return await fetchFromAPI(`/discover/tv?api_key=${API_KEY}&with_original_language=hi&sort_by=popularity.desc&page=${page}`);
    }
    
    /**
     * Get Hollywood blockbusters
     */
    async function getHollywoodBlockbusters(page = 1) {
        return await fetchFromAPI(`/discover/movie?api_key=${API_KEY}&with_original_language=en&sort_by=revenue.desc&page=${page}`);
    }
    
    /**
     * Get Anime content
     */
    async function getAnimeMovies(page = 1) {
        return await fetchFromAPI(`/discover/movie?api_key=${API_KEY}&with_genres=16&with_original_language=ja&sort_by=popularity.desc&page=${page}`);
    }
    
    async function getAnimeSeries(page = 1) {
        return await fetchFromAPI(`/discover/tv?api_key=${API_KEY}&with_genres=16&with_original_language=ja&sort_by=popularity.desc&page=${page}`);
    }
    
    /**
     * Get TV season details (for episodes)
     */
    async function getTVSeasonDetails(tvId, seasonNumber) {
        return await fetchFromAPI(`/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}`);
    }
    
    // Public API
    return {
        getImageURL,
        getTrendingMovies,
        getTrendingTV,
        getPopularMovies,
        getPopularTV,
        getTopRatedMovies,
        getTopRatedTV,
        getMoviesByGenre,
        getTVByGenre,
        searchMulti,
        getMovieDetails,
        getTVDetails,
        getMovieGenres,
        getTVGenres,
        detectUserRegion,
        getTrendingInIndiaMovies,
        getTrendingInIndiaTV,
        getBollywoodMovies,
        getBollywoodTV,
        getHollywoodBlockbusters,
        getAnimeMovies,
        getAnimeSeries,
        getTVSeasonDetails,
        API_KEY
    };
})();