/**
 * Client Bandcamp — passe par un proxy local (bandcamp-proxy/server.mjs)
 * car l'API Bandcamp ne renvoie pas d'en-têtes CORS pour les sites tiers.
 */
(function () {
  const API_BASE = (() => {
    if (location.protocol === 'file:' ||
        location.hostname === 'localhost' ||
        location.hostname === '127.0.0.1') {
      return 'http://localhost:8787';
    }
    return '/api/bandcamp';
  })();

  const GEONAMES = {
    'Monde entier': 0,
    'Paris': 2988507,
    'Londres': 2643743,
    'Berlin': 2950159,
    'Amsterdam': 2759794,
    'Lisbonne': 2267057,
    'Manchester': 2643123,
    'Bristol': 2654675,
    'Glasgow': 2648579,
    'New York': 5128581,
    'Detroit': 4990729,
    'Chicago': 4887398,
    'Los Angeles': 5368361,
    'Montréal': 6077243,
    'Tokyo': 1850147,
  };

  const TIME_FACETS = { '30': 1, '60': 2, '90': 3 };

  const SLICE_MAP = {
    'Nouveautés': 'new',
    'Tendances': 'top',
    'Sélection': 'rand',
  };

  async function request(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, options);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Erreur API (${res.status})`);
    }
    return res.json();
  }

  function formatPrice(price) {
    const symbols = { CAD: '$CA', USD: '$US', EUR: '€EU', GBP: '£GB', AUD: '$AU', JPY: '¥JP' };
    if (!price) return '';
    const sym = symbols[price.currency] || price.currency || '';
    const amount = (price.amount / 100).toFixed(2).replace('.', ',');
    return `${amount} ${sym}`;
  }

  function albumImageUrl(result) {
    const img = result.primary_image;
    if (!img?.image_id) return '';
    // Les pochettes (is_art) utilisent le préfixe "a" ; sinon l'id seul.
    const prefix = img.is_art === false ? '' : 'a';
    return `https://f4.bcbits.com/img/${prefix}${img.image_id}_10.jpg`;
  }

  function cleanUrl(url) {
    if (!url) return '#';
    const second = url.indexOf('https://', 8);
    if (second > 0) return url.slice(second);
    return url;
  }

  async function discover({ tags, slice, location, days, size = 40 }) {
    const tagList = [...tags];
    if (!tagList.length) throw new Error('Ajoute au moins un genre.');

    const timeFacetId = TIME_FACETS[days] ?? null;
    const geonameId = GEONAMES[location] ?? 0;

    const payload = {
      category_id: 0,
      cursor: '*',
      geoname_id: geonameId,
      include_result_types: ['a'],
      size,
      slice: SLICE_MAP[slice] || 'new',
      tag_norm_names: tagList,
      time_facet_id: timeFacetId,
    };

    let data = await request('/discover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (data.result_count === 0 && timeFacetId && tagList.length > 1) {
      data = await request('/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, time_facet_id: null }),
      });
      const maxDays = parseInt(days, 10) || 60;
      const cutoff = Date.now() - maxDays * 24 * 60 * 60 * 1000;
      data.results = (data.results || []).filter(item => {
        if (!item.release_date) return true;
        return new Date(item.release_date).getTime() >= cutoff;
      });
      data.result_count = data.results.length;
    }

    return data;
  }

  async function search(query) {
    const params = new URLSearchParams({ q: query, param_with_locations: 'true' });
    return request(`/search?${params}`);
  }

  function filterSearchResults(results, scope) {
    if (scope === 'Albums / Titres') {
      return results.filter(r => r.type === 'a' || r.type === 't');
    }
    if (scope === 'Artistes / Labels') {
      return results.filter(r => r.type === 'b');
    }
    return results;
  }

  window.BandcampAPI = {
    discover,
    search,
    filterSearchResults,
    formatPrice,
    albumImageUrl,
    cleanUrl,
  };
})();
