// Main App
class App {
    constructor(){this.initialized=false;}
    async init(){
        try {
            await window.loadConfig();
            await window.tmdbAPI.initialize();
            window.playerManager.initialize();
            window.uiManager.setupSliderNavigation();
            window.uiManager.setupRealtimeSearch();
            this.setupSearch();
            this.setupNavbar();
            await this.loadAllContent();
            window.router.handleInitialRoute();
            this.initialized=true;
        }catch(error){console.error('App init error:',error);}
    }
    async loadAllContent(){
        const api = window.tmdbAPI, ui = window.uiManager;
        const trendingMovies = await api.getTrending('movie','week');
        if(trendingMovies&&trendingMovies.results){
            ui.renderSlider('trendingMovies',trendingMovies.results,'movie');
            if(trendingMovies.results.length>0){await ui.createHeroBanner(trendingMovies.results[0],'movie');}
        }
        const trendingSeries = await api.getTrending('tv','week');
        if(trendingSeries&&trendingSeries.results){ui.renderSlider('trendingSeries',trendingSeries.results,'tv');}
        const regionalMovies = await api.getRegionalMovies();
        if(regionalMovies&&regionalMovies.results){ui.renderSlider('regionalMovies',regionalMovies.results,'movie');
            const title=document.getElementById('regionalTitle');if(title){title.textContent=`Top Movies in ${api.userCountry}`;}}
        const anime = await api.getAnime();
        if(anime&&anime.results){ui.renderSlider('animeContent',anime.results,'tv');}
        const hollywood = await api.getHollywood();
        if(hollywood&&hollywood.results){ui.renderSlider('hollywoodContent',hollywood.results,'movie');}
        const bollywood = await api.getBollywood();
        if(bollywood&&bollywood.results){ui.renderSlider('bollywoodContent',bollywood.results,'movie');}
        const tollywood = await api.getTollywood();
        if(tollywood&&tollywood.results){ui.renderSlider('tollywoodContent',tollywood.results,'movie');}
    }
    setupSearch(){
        const searchInput=document.getElementById('searchInput'),searchBtn=document.getElementById('searchBtn');
        const performSearch=async()=>{
            const query=searchInput.value.trim();if(!query){alert('Enter a search term');return;}
            window.router.navigateTo('search');window.uiManager.renderSlider('searchResults',[], 'movie');
            const results=await window.tmdbAPI.search(query);if(results&&results.results){window.uiManager.renderSlider('searchResults',results.results);}
        };
        searchBtn.addEventListener('click',performSearch);
        searchInput.addEventListener('keypress',e=>{if(e.key==='Enter'){performSearch();}});}
    setupNavbar(){const navbar=document.querySelector('.navbar');window.addEventListener('scroll',()=>{if(window.scrollY>50){navbar.classList.add('scrolled');}else{navbar.classList.remove('scrolled');}});}
}
document.addEventListener('DOMContentLoaded',()=>{const app=new App();app.init();});
