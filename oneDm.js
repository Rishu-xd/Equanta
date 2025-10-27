/**
 * 1DM Download Button Module
 * Shows download button for Android users only
 * Uses Android intent to trigger 1DM app
 */

const OneDM = (() => {
    // 1DM Configuration
    const CONFIG = {
        packageFree: 'idm.internet.download.manager',
        packagePlus: 'idm.internet.download.manager.plus',
        scheme: 'idmdownload',
        fallbackUrl: 'https://play.google.com/store/apps/details?id=idm.internet.download.manager'
    };
    
    let downloadButton = null;
    let currentMediaTitle = '';
    
    /**
     * Check if device is Android
     */
    function isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }
    
    /**
     * Get current media URL from player
     */
    function getCurrentMediaUrl() {
        const iframe = document.getElementById('player-iframe');
        return iframe?.src || null;
    }
    
    /**
     * Build Android intent URI for 1DM
     */
    function build1DMIntent(url, title) {
        const encodedUrl = encodeURIComponent(url);
        const encodedTitle = encodeURIComponent(title);
        
        // Intent format for 1DM
        return `intent:${url}#Intent;` +
               `package=${CONFIG.packageFree};` +
               `scheme=${CONFIG.scheme};` +
               `S.title=${encodedTitle};` +
               `S.browser_fallback_url=${encodeURIComponent(CONFIG.fallbackUrl)};` +
               `end`;
    }
    
    /**
     * Create download button HTML
     */
    function createDownloadButton() {
        const button = document.createElement('div');
        button.className = 'onedm-download-section';
        button.innerHTML = `
            <button class="btn btn-download" id="onedm-download-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
                Download via 1DM
            </button>
            <p class="onedm-note">Tap to download this content using 1DM Browser app</p>
        `;
        return button;
    }
    
    /**
     * Handle download button click
     */
    function handleDownloadClick() {
        const mediaUrl = getCurrentMediaUrl();
        
        if (!mediaUrl) {
            alert('Please start playing the video first!');
            return;
        }
        
        // Build intent and trigger
        const intentUrl = build1DMIntent(mediaUrl, currentMediaTitle);
        
        // Try to open intent
        window.location.href = intentUrl;
        
        // Show instructions
        setTimeout(() => {
            alert('If 1DM didn\'t open automatically:\n\n' +
                  '1. Install 1DM Browser from Play Store\n' +
                  '2. Copy the video URL from the player\n' +
                  '3. Paste it in 1DM to download');
        }, 1000);
    }
    
    /**
     * Show download button (called when modal opens)
     */
    function onModalOpen(details) {
        // Only show for Android devices
        if (!isAndroid()) {
            return;
        }
        
        // Store media title
        currentMediaTitle = details.title || details.name || 'Media';
        
        // Wait for player section to be visible
        setTimeout(() => {
            const playerSection = document.getElementById('player-section');
            const serverSelector = document.querySelector('.server-selector');
            
            if (!playerSection || !serverSelector) {
                return;
            }
            
            // Remove existing button if any
            const existingButton = document.querySelector('.onedm-download-section');
            if (existingButton) {
                existingButton.remove();
            }
            
            // Create and insert button after server selector
            downloadButton = createDownloadButton();
            serverSelector.insertAdjacentElement('afterend', downloadButton);
            
            // Add click listener
            const btn = document.getElementById('onedm-download-btn');
            if (btn) {
                btn.addEventListener('click', handleDownloadClick);
            }
        }, 500);
    }
    
    /**
     * Clean up when modal closes
     */
    function cleanup() {
        if (downloadButton) {
            downloadButton.remove();
            downloadButton = null;
        }
        currentMediaTitle = '';
    }
    
    // Public API
    return {
        onModalOpen,
        cleanup,
        isAndroid
    };
})();
