/* main.js — FORCE RENDER HOMEPAGE ROWS ON LOAD (no search required) */
/* Assumes these globals exist: API, UI, Player, Modal, Search */
/* Keeps your existing region detection + India trending logic */

(async function initApp() {
  try {
    // 1) Bootstrap core UI and handlers
    wireGlobalHandlers();

    // 2) Detect region early (non-blocking fallback to US)
    const region = await safeDetectRegion();

    // 3) Render hero first for fast perceived load
    await renderHero(region);

    // 4) Immediately render all homepage rows (no search dependency)
    await renderHomeRows(region);

    // 5) Initialize search (but do not block homepage rendering)
    initSearch();

  } catch (err) {
    console.error('[initApp] failed', err);
    UI.showToast('Failed to load homepage. Please reload.');
  }
})();

/* ————— helpers ————— */

function wireGlobalHandlers() {
  // Example: modal close, esc key, history, etc. Keep your existing bindings here if any.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && typeof Modal?.close === 'function') {
      Modal.close();
    }
  });
}

async function safeDetectRegion() {
  try {
    if (typeof API?.detectUserRegion === 'function') {
      const code = await API.detectUserRegion();
      return code || 'US';
    }
  } catch {}
  return 'US';
}

async function renderHero(region) {
  try {
    // Prefer India trending hero if in IN; otherwise global trending movies
    let heroList;
    if (region === 'IN' && typeof API?.getTrendingInIndiaMovies === 'function') {
      heroList = await API.getTrendingInIndiaMovies(1);
    } else if (typeof API?.getTrendingMovies === 'function') {
      heroList = await API.getTrendingMovies(1); // your existing global trending
    } else if (typeof API?.getPopularMovies === 'function') {
      heroList = await API.getPopularMovies(1);
    }

    const items = heroList?.results || [];
    if (items.length) {
      await UI.renderHero(items); // uses your existing hero rotator
    } else {
      UI.renderHeroFallback();
    }
  } catch (e) {
    console.warn('[renderHero] fallback', e);
    UI.renderHeroFallback();
  }
}

async function renderHomeRows(region) {
  // Build the homepage shelves; if region is IN, include India trending
  const rows = [];

  if (region === 'IN' && typeof API?.getTrendingInIndiaMovies === 'function') {
    rows.push({
      title: 'Trending in India — Movies',
      fetcher: () => API.getTrendingInIndiaMovies(1),
    });
  } else if (typeof API?.getTrendingMovies === 'function') {
    rows.push({
      title: 'Trending Now — Movies',
      fetcher: () => API.getTrendingMovies(1),
    });
  }

  if (region === 'IN' && typeof API?.getTrendingInIndiaTV === 'function') {
    rows.push({
      title: 'Trending in India — TV',
      fetcher: () => API.getTrendingInIndiaTV(1),
    });
  } else if (typeof API?.getTrendingTV === 'function') {
    rows.push({
      title: 'Trending Now — TV',
      fetcher: () => API.getTrendingTV(1),
    });
  }

  // Core global rows (keep your existing order as needed)
  if (typeof API?.getPopularMovies === 'function') {
    rows.push({ title: 'Popular Movies', fetcher: () => API.getPopularMovies(1) });
  }
  if (typeof API?.getPopularTV === 'function') {
    rows.push({ title: 'Popular TV Shows', fetcher: () => API.getPopularTV(1) });
  }
  if (typeof API?.getTopRatedMovies === 'function') {
    rows.push({ title: 'Top Rated Movies', fetcher: () => API.getTopRatedMovies(1) });
  }

  // Thematic shelves (Bollywood, Hollywood, Anime) if available in API.js
  if (typeof API?.getBollywoodMovies === 'function') {
    rows.push({ title: 'Bollywood Movies', fetcher: () => API.getBollywoodMovies(1) });
  }
  if (typeof API?.getBollywoodTV === 'function') {
    rows.push({ title: 'Bollywood TV', fetcher: () => API.getBollywoodTV(1) });
  }
  if (typeof API?.getHollywoodBlockbusters === 'function') {
    rows.push({ title: 'Hollywood Blockbusters', fetcher: () => API.getHollywoodBlockbusters(1) });
  }
  if (typeof API?.getAnimeSeries === 'function') {
    rows.push({ title: 'Anime Series', fetcher: () => API.getAnimeSeries(1) });
  }
  if (typeof API?.getAnimeMovies === 'function') {
    rows.push({ title: 'Anime Movies', fetcher: () => API.getAnimeMovies(1) });
  }

  // Genre rows if you have them
  if (typeof API?.discoverByGenre === 'function') {
    rows.push({ title: 'Action', fetcher: () => API.discoverByGenre(28, 1) });
    rows.push({ title: 'Comedy', fetcher: () => API.discoverByGenre(35, 1) });
    rows.push({ title: 'Horror', fetcher: () => API.discoverByGenre(27, 1) });
  }

  // Render sequentially to avoid hammering API at once; show skeletons per row
  for (const row of rows) {
    try {
      UI.renderRowSkeleton(row.title);
      const data = await row.fetcher();
      const items = data?.results || [];
      await UI.renderRow(row.title, items);
    } catch (e) {
      console.warn(`[renderHomeRows] failed row ${row.title}`, e);
      UI.renderRowError(row.title, 'Failed to load');
    }
  }
}

function initSearch() {
  if (typeof Search?.init === 'function') {
    Search.init(); // debounced search; must not block homepage rows
  }
}