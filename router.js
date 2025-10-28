// Router Manager
class Router {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Handle navigation clicks
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.navigateTo(section);
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state) {
                this.handlePopState(e.state);
            }
        });

        // Close modals on click outside
        document.getElementById('detailModal').addEventListener('click', (e) => {
            if (e.target.id === 'detailModal') {
                this.closeModal('detailModal');
            }
        });

        // Close button
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal('detailModal');
        });

        // Logo click - go home
        document.querySelector('.nav-logo').addEventListener('click', () => {
            this.navigateTo('home');
        });
    }

    navigateTo(section) {
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === section) {
                link.classList.add('active');
            }
        });

        // Update active section
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.remove('active');
        });

        const targetSection = document.getElementById(`${section}Section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update URL
        history.pushState({ section }, '', `#${section}`);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        history.pushState({}, '', '#home');
    }

    handlePopState(state) {
        if (state.section) {
            this.navigateTo(state.section);
        }
    }

    // Handle initial URL on page load
    handleInitialRoute() {
        const hash = window.location.hash.substring(1);

        if (!hash || hash === 'home') {
            this.navigateTo('home');
        } else if (hash === 'search') {
            this.navigateTo('search');
        } else if (hash.startsWith('movie/') || hash.startsWith('tv/')) {
            const parts = hash.split('/');
            const mediaType = parts[0];
            const id = parts[1];
            if (id) {
                window.uiManager.openDetail(parseInt(id), mediaType);
            }
        } else if (hash.startsWith('watch/')) {
            const parts = hash.split('/');
            const mediaType = parts[1];
            const id = parts[2];
            if (id) {
                window.playerManager.openPlayer(parseInt(id), mediaType);
            }
        }
    }
}

// Create global instance
window.router = new Router();