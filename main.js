/**
 * Main Application Module
 * Initializes and orchestrates the Netflix Clone application
 */

(async function initApp() {
    console.log('🎬 Netflix Clone - Initializing...');
    
    // Show loading spinner
    UI.showLoading();
    
    try {
        // Initialize all modules
        UI.init();
        Modal.init();
        Search.init();
        
        // Set up hero banner with trending movies
        await UI.setupHeroBanner();
        
        // Render content rows
        await UI.renderContentRows();
        
        console.log('✅ Netflix Clone - Ready!');
    } catch (error) {
        console.error('❌ Initialization Error:', error);
        alert('Failed to initialize the application. Please refresh the page.');
    } finally {
        // Hide loading spinner
        UI.hideLoading();
    }
    
    // Add navigation listeners
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Clear search when navigating
            Search.clearSearch();
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    
    // Add smooth scrolling to internal links
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
            e.preventDefault();
        }
    });
    
    // Add similar card click listeners in modal
    document.addEventListener('click', (e) => {
        const similarCard = e.target.closest('.similar-card');
        if (similarCard) {
            const itemId = similarCard.dataset.id;
            const itemType = similarCard.dataset.type;
            if (itemId && itemType) {
                Modal.open(itemId, itemType);
            }
        }
    });
    
    console.log('💡 Note: Replace "YOUR_API_KEY" in api.js with your TMDB API key to enable data loading.');
})();