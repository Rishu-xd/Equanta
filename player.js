// Player Manager with season/episode support
class PlayerManager {
    constructor() {
        this.config = null;
        this.currentServer = 0;
        this.currentId = null;
        this.currentType = null;
        this.currentSeason = 1;
        this.currentEpisode = 1;
        this.seasonMap = [];
    }
    initialize() {
        this.config = window.getConfig();
        this.setupEventListeners();
    }
    setupEventListeners() {
        document.getElementById('closePlayer').addEventListener('click', () => {
            this.closePlayer();
        });
        document.getElementById('serverSelect').addEventListener('change', (e) => {
            this.currentServer = parseInt(e.target.value);
            this.loadServer();
        });
        document.getElementById('downloadBtn').addEventListener('click', () => {
            alert('Download feature is for demonstration only.');
        });
        document.getElementById('playerModal').addEventListener('click', (e) => {
            if (e.target.id === 'playerModal') {
                this.closePlayer();
            }
        });
    }
    async openPlayer(id, mediaType) {
        this.currentId = id;
        this.currentType = mediaType;
        this.currentServer = 0;
        document.getElementById('detailModal').classList.remove('active');
        // Populate server selector
        const serverSelect = document.getElementById('serverSelect');
        serverSelect.innerHTML = '';
        this.config.servers.forEach((server, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = server.name;
            serverSelect.appendChild(option);
        });
        // If TV show: show seasons & episodes
        if(mediaType==='tv'){document.getElementById('tvControls').style.display='flex'; await this.setupSeasonEpisodeSelector();}else{document.getElementById('tvControls').style.display='none';}
        document.getElementById('playerModal').classList.add('active');
        this.loadServer();
        history.pushState({id,mediaType},'',`#watch/${mediaType}/${id}`);
    }
    async setupSeasonEpisodeSelector(){
        const seasonSelect = document.getElementById('seasonSelect');
        const episodeSelect = document.getElementById('episodeSelect');
        seasonSelect.innerHTML = '';
        episodeSelect.innerHTML = '';
        const tvDetails = await window.tmdbAPI.getTVDetails(this.currentId);
        if(tvDetails&&tvDetails.seasons){
            this.seasonMap = tvDetails.seasons.filter(s=>s.season_number>0);
            this.seasonMap.forEach(season=>{
                const option= document.createElement('option');
                option.value=season.season_number;
                option.textContent = `${season.name}`;
                seasonSelect.appendChild(option);
            });
            this.currentSeason = this.seasonMap[0].season_number;
            seasonSelect.value = this.currentSeason;
            await this.setupEpisodeSelector();
            seasonSelect.addEventListener('change', async(e)=>{
                this.currentSeason = parseInt(e.target.value);
                await this.setupEpisodeSelector();
                this.loadServer();
            });
        }
        episodeSelect.addEventListener('change',e=>{
            this.currentEpisode = parseInt(e.target.value);
            this.loadServer();
        });
    }
    async setupEpisodeSelector(){
        const episodeSelect = document.getElementById('episodeSelect');
        episodeSelect.innerHTML = '';
        const seasonDetails = await window.tmdbAPI.getTVSeasonDetails(this.currentId,this.currentSeason);
        if(seasonDetails&&seasonDetails.episodes){
            seasonDetails.episodes.forEach(ep=>{
                const opt = document.createElement('option');
                opt.value = ep.episode_number;
                opt.textContent = `Episode ${ep.episode_number}: ${ep.name}`;
                episodeSelect.appendChild(opt);
            });
            this.currentEpisode = seasonDetails.episodes[0].episode_number;
            episodeSelect.value = this.currentEpisode;
        }
    }
    loadServer(){
        const server = this.config.servers[this.currentServer];
        const videoPlayer = document.getElementById('videoPlayer');
        let embedURL = '';
        if(this.currentType==='tv'){
            // format: tv_format (most servers use tmdb_id/season/episode)
            if(server.tv_format){embedURL=server.tv_format.replace('{url}',server.tv_url).replace('{tmdb_id}',this.currentId).replace('{season}',this.currentSeason).replace('{episode}',this.currentEpisode);}else{embedURL=server.tv_url+this.currentId+'/'+this.currentSeason+'/'+this.currentEpisode;}
        }else{
            embedURL=server.movie_url+this.currentId;
        }
        videoPlayer.src=embedURL;
    }
    closePlayer(){
        document.getElementById('playerModal').classList.remove('active');
        document.getElementById('videoPlayer').src = '';
        history.pushState({},'', '#home');
    }
}
window.playerManager = new PlayerManager();
