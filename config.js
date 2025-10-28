// Load configuration
let CONFIG = null;

async function loadConfig() {
    try {
        const response = await fetch('config.json');
        CONFIG = await response.json();
        console.log('Configuration loaded successfully');
        return CONFIG;
    } catch (error) {
        console.error('Error loading configuration:', error);
        alert('Failed to load configuration. Please check config.json file.');
        return null;
    }
}

// Export for use in other modules
window.loadConfig = loadConfig;
window.getConfig = () => CONFIG;