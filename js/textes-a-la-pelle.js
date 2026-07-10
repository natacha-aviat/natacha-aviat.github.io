const IMAGE_BASE = "https://textes-a-la-pelle.fr";
const DATA_URL = "data/textes-a-la-pelle.json";

const filterButtonsEl = document.getElementById("filter-buttons");
const feeFilterButtonsEl = document.getElementById("fee-filter-buttons");
const audienceFilterButtonsEl = document.getElementById("audience-filter-buttons");
const selectAllTagFiltersBtn = document.getElementById("select-all-tag-filters");
const deselectAllTagFiltersBtn = document.getElementById("deselect-all-tag-filters");
const selectAllFeeFiltersBtn = document.getElementById("select-all-fee-filters");
const deselectAllFeeFiltersBtn = document.getElementById("deselect-all-fee-filters");
const selectAllAudienceFiltersBtn = document.getElementById("select-all-audience-filters");
const deselectAllAudienceFiltersBtn = document.getElementById("deselect-all-audience-filters");
const sortButtons = [...document.querySelectorAll(".sort-btn")];
const statusEl = document.getElementById("status");
const resultsCountEl = document.getElementById("results-count");
const listEl = document.getElementById("announcements");

let announcements = [];
let filterOptions = [];
let feeFilterOptions = [];
let audienceFilterOptions = [];
let dataUpdatedAt = Date.now();
let currentSort = "publication_date";
const selectedFilters = new Set();
const selectedFeeFilters = new Set();
const selectedAudienceFilters = new Set();

function setStatus(message, type = "loading") {
  statusEl.textContent = message;
  statusEl.className = type;
}

function tagLabel(tagValue) {
  const idx = tagValue.indexOf("_");
  return idx >= 0 ? tagValue.slice(idx + 1) : tagValue;
}

function classifyFee(feeText) {
  if (!feeText) {
    return "unknown";
  }

  const rangeMatch = feeText.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (rangeMatch) {
    const min = Number(rangeMatch[1]);
    const max = Number(rangeMatch[2]);
    if (max === 0) {
      return "fee_free";
    }
    if (min === 0) {
      return "fee_variable";
    }
    if (max <= 10) {
      return "fee_1_10";
    }
    if (max <= 20) {
      return "fee_11_20";
    }
    return "fee_21_plus";
  }

  const singleMatch = feeText.match(/(\d+)/);
  if (!singleMatch) {
    return "unknown";
  }

  const amount = Number(singleMatch[1]);
  if (amount === 0) {
    return "fee_free";
  }
  if (amount <= 10) {
    return "fee_1_10";
  }
  if (amount <= 20) {
    return "fee_11_20";
  }
  return "fee_21_plus";
}

function getFeeCategory(item) {
  return item.feeCategory || classifyFee(item.fee);
}

function buildFeeFilterOptionsFromAnnouncements(items) {
  const labels = {
    fee_free: "gratuit (0 €)",
    fee_variable: "variable (0 € – X €)",
    fee_1_10: "1 € à 10 €",
    fee_11_20: "11 € à 20 €",
    fee_21_plus: "21 € et plus",
  };
  const counts = new Map();

  for (const item of items) {
    const category = getFeeCategory(item);
    if (!category || category === "unknown") {
      continue;
    }
    counts.set(category, (counts.get(category) || 0) + 1);
  }

  return Object.keys(labels)
    .filter((value) => counts.has(value))
    .map((value) => ({
      value,
      label: `${labels[value]} (${counts.get(value)})`,
    }));
}

function classifyAudience(audienceText) {
  if (!audienceText || !audienceText.trim()) {
    return ["audience_unknown"];
  }

  const text = audienceText.trim();
  const categories = [];

  const geographicCategory = classifyGeographic(text);
  if (geographicCategory) {
    categories.push(geographicCategory);
  }

  if (/jamais publié|non publiés|non publié|amateurs non publiés/i.test(text)) {
    categories.push("audience_unpublished");
  }

  if (/professionnel|publié|confirmés|professionnellement|au moins un livre publié|professionnels|auteurs vivants|auteurs\/illustrateurs|auteur et autrice de l'imaginaire|artistes professionnel/i.test(text)) {
    categories.push("audience_published");
  }

  if (/femmes|identifient en tant que/i.test(text)) {
    categories.push("audience_specific");
  }

  const rangeMatch = text.match(/(\d+)\s*[-–]\s*(\d+)\s*ans/i);
  if (rangeMatch) {
    const min = Number(rangeMatch[1]);
    const max = Number(rangeMatch[2]);
    if (max <= 17) {
      categories.push("audience_under_18");
    } else if (min >= 18) {
      categories.push("audience_18_plus");
    } else {
      categories.push("audience_mixed_age");
    }
  }

  const maxMatch = text.match(/(\d+)\s*ans\s*maximum/i);
  if (maxMatch) {
    const max = Number(maxMatch[1]);
    categories.push(max < 18 ? "audience_under_18" : "audience_young_adult");
  }

  const minMatch = text.match(/(\d+)\s*ans\s*minim/i);
  if (minMatch) {
    const min = Number(minMatch[1]);
    categories.push(min >= 18 ? "audience_18_plus" : "audience_minors_and_up");
  }

  return [...new Set(categories)];
}

function classifyGeographic(text) {
  if (/france métropolitaine/i.test(text)) {
    return "geo_france_metropolitaine";
  }
  if (/nouvelle.aquitaine/i.test(text)) {
    return "geo_nouvelle_aquitaine";
  }
  if (/hauts-de-france/i.test(text)) {
    return "geo_hauts_de_france";
  }
  if (/champagne.ardenne/i.test(text)) {
    return "geo_champagne_ardenne";
  }
  if (/morbihan/i.test(text)) {
    return "geo_morbihan";
  }
  if (/belgique|communes frontalières/i.test(text)) {
    return "geo_belgique";
  }
  if (/francophonie.*ile-de-france|toute la francophonie/i.test(text)) {
    return "geo_francophonie";
  }
  if (/territoires africains|d'haïti/i.test(text)) {
    return "geo_afrique_haiti";
  }
  if (/alsace/i.test(text)) {
    return "geo_alsace";
  }
  if (/résidents de france\b|résidents de france,/i.test(text)) {
    return "geo_france";
  }

  return null;
}

function getAudienceCategories(item) {
  if (Array.isArray(item.audienceCategories)) {
    return item.audienceCategories;
  }
  if (item.audienceCategory) {
    return [item.audienceCategory];
  }
  return classifyAudience(item.audience);
}

function buildAudienceFilterOptionsFromAnnouncements(items) {
  const labels = {
    audience_under_18: "Moins de 18 ans",
    audience_minors_and_up: "Mineurs (à partir de X ans)",
    audience_mixed_age: "Jeunes et adultes",
    audience_18_plus: "18 ans et plus",
    audience_young_adult: "Jeunes adultes (âge maximum)",
    audience_published: "Publié / professionnel",
    audience_unpublished: "Non publié",
    audience_specific: "Public spécifique",
    geo_france_metropolitaine: "France métropolitaine",
    geo_france: "France",
    geo_nouvelle_aquitaine: "Nouvelle-Aquitaine",
    geo_hauts_de_france: "Hauts-de-France",
    geo_champagne_ardenne: "Champagne-Ardenne",
    geo_morbihan: "Morbihan",
    geo_belgique: "Belgique et communes frontalières",
    geo_francophonie: "Francophonie (hors Île-de-France)",
    geo_afrique_haiti: "Afrique et Haïti",
    geo_alsace: "Alsace",
    audience_unknown: "Non précisé",
  };
  const order = [
    "audience_under_18",
    "audience_minors_and_up",
    "audience_mixed_age",
    "audience_18_plus",
    "audience_young_adult",
    "audience_published",
    "audience_unpublished",
    "audience_specific",
    "geo_france_metropolitaine",
    "geo_france",
    "geo_nouvelle_aquitaine",
    "geo_hauts_de_france",
    "geo_champagne_ardenne",
    "geo_morbihan",
    "geo_belgique",
    "geo_francophonie",
    "geo_afrique_haiti",
    "geo_alsace",
    "audience_unknown",
  ];
  const counts = new Map();

  for (const item of items) {
    for (const category of getAudienceCategories(item)) {
      counts.set(category, (counts.get(category) || 0) + 1);
    }
  }

  return order
    .filter((value) => counts.has(value))
    .map((value) => ({
      value,
      label: `${labels[value]} (${counts.get(value)})`,
    }));
}

function formatUpdatedAt(isoDate) {
  if (!isoDate) {
    return "";
  }
  return new Date(isoDate).toLocaleString("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

function parseRelativeDate(text, referenceDate = dataUpdatedAt) {
  const match = text.match(/il y a (\d+) (heure|jour|mois)/);
  if (!match) {
    return null;
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const dayMs = 24 * 60 * 60 * 1000;
  let offsetMs = 0;

  if (unit === "heure") {
    offsetMs = amount * 60 * 60 * 1000;
  } else if (unit === "jour") {
    offsetMs = amount * dayMs;
  } else {
    offsetMs = amount * 30 * dayMs;
  }

  return referenceDate - offsetMs;
}

function parseDeadline(text) {
  const match = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
}

function getAddedTimestamp(item) {
  if (item.addedAt) {
    const parsed = Date.parse(item.addedAt);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  const relative = parseRelativeDate(item.added);
  if (relative !== null) {
    return relative;
  }

  return 0;
}

function getDeadlineTimestamp(item) {
  if (item.deadlineAt) {
    const parsed = Date.parse(item.deadlineAt);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  const parsed = parseDeadline(item.deadline);
  return parsed ?? Number.MAX_SAFE_INTEGER;
}

function compareAnnouncements(a, b) {
  let diff = 0;

  if (currentSort === "closing_date") {
    diff = getDeadlineTimestamp(a) - getDeadlineTimestamp(b);
  } else {
    diff = getAddedTimestamp(b) - getAddedTimestamp(a);
  }

  if (diff !== 0) {
    return diff;
  }

  return Number(b.id) - Number(a.id);
}

function setSort(sortValue) {
  currentSort = sortValue;
  sortButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.sort === sortValue));
  });
  renderAnnouncements();
}

function getSelectableFilterOptions() {
  return filterOptions.filter((option) => option.value);
}

function getSelectableFeeFilterOptions() {
  return feeFilterOptions.filter((option) => option.value);
}

function getSelectableAudienceFilterOptions() {
  return audienceFilterOptions.filter((option) => option.value);
}

function syncFilterButtonStates() {
  filterButtonsEl.querySelectorAll(".filter-btn").forEach((button) => {
    const isSelected = selectedFilters.has(button.dataset.filter);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function syncFeeFilterButtonStates() {
  feeFilterButtonsEl.querySelectorAll(".fee-filter-btn").forEach((button) => {
    const isSelected = selectedFeeFilters.has(button.dataset.feeFilter);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function syncAudienceFilterButtonStates() {
  audienceFilterButtonsEl.querySelectorAll(".audience-filter-btn").forEach((button) => {
    const isSelected = selectedAudienceFilters.has(button.dataset.audienceFilter);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function syncAllFilterButtonStates() {
  syncFilterButtonStates();
  syncFeeFilterButtonStates();
  syncAudienceFilterButtonStates();
}

function toggleFilter(value) {
  if (selectedFilters.has(value)) {
    selectedFilters.delete(value);
  } else {
    selectedFilters.add(value);
  }
  syncFilterButtonStates();
  renderAnnouncements();
}

function toggleFeeFilter(value) {
  if (selectedFeeFilters.has(value)) {
    selectedFeeFilters.delete(value);
  } else {
    selectedFeeFilters.add(value);
  }
  syncFeeFilterButtonStates();
  renderAnnouncements();
}

function toggleAudienceFilter(value) {
  if (selectedAudienceFilters.has(value)) {
    selectedAudienceFilters.delete(value);
  } else {
    selectedAudienceFilters.add(value);
  }
  syncAudienceFilterButtonStates();
  renderAnnouncements();
}

function selectAllTagFilters() {
  selectedFilters.clear();
  for (const option of getSelectableFilterOptions()) {
    selectedFilters.add(option.value);
  }
  syncFilterButtonStates();
  renderAnnouncements();
}

function deselectAllTagFilters() {
  selectedFilters.clear();
  syncFilterButtonStates();
  renderAnnouncements();
}

function selectAllFeeFilters() {
  selectedFeeFilters.clear();
  for (const option of getSelectableFeeFilterOptions()) {
    selectedFeeFilters.add(option.value);
  }
  syncFeeFilterButtonStates();
  renderAnnouncements();
}

function deselectAllFeeFilters() {
  selectedFeeFilters.clear();
  syncFeeFilterButtonStates();
  renderAnnouncements();
}

function selectAllAudienceFilters() {
  selectedAudienceFilters.clear();
  for (const option of getSelectableAudienceFilterOptions()) {
    selectedAudienceFilters.add(option.value);
  }
  syncAudienceFilterButtonStates();
  renderAnnouncements();
}

function deselectAllAudienceFilters() {
  selectedAudienceFilters.clear();
  syncAudienceFilterButtonStates();
  renderAnnouncements();
}

function populateFilterButtons(options) {
  filterButtonsEl.innerHTML = "";

  const selectableOptions = options.filter((option) => option.value);
  const groups = [];

  for (const option of selectableOptions) {
    const lastGroup = groups[groups.length - 1];
    if (!lastGroup || lastGroup.label !== option.group) {
      groups.push({ label: option.group, options: [option] });
    } else {
      lastGroup.options.push(option);
    }
  }

  for (const group of groups) {
    const groupEl = document.createElement("div");
    groupEl.className = "filter-group";

    if (group.label) {
      const titleEl = document.createElement("p");
      titleEl.className = "filter-group-title";
      titleEl.textContent = group.label;
      groupEl.appendChild(titleEl);
    }

    const buttonsEl = document.createElement("div");
    buttonsEl.className = "filter-group-buttons";

    for (const option of group.options) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-btn";
      button.dataset.filter = option.value;
      button.textContent = option.label;
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => toggleFilter(option.value));
      buttonsEl.appendChild(button);
    }

    groupEl.appendChild(buttonsEl);
    filterButtonsEl.appendChild(groupEl);
  }
}

function populateFeeFilterButtons(options) {
  feeFilterButtonsEl.innerHTML = "";

  for (const option of options) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-btn fee-filter-btn";
    button.dataset.feeFilter = option.value;
    button.textContent = option.label;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => toggleFeeFilter(option.value));
    feeFilterButtonsEl.appendChild(button);
  }
}

function populateAudienceFilterButtons(options) {
  audienceFilterButtonsEl.innerHTML = "";

  for (const option of options) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-btn audience-filter-btn";
    button.dataset.audienceFilter = option.value;
    button.textContent = option.label;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => toggleAudienceFilter(option.value));
    audienceFilterButtonsEl.appendChild(button);
  }
}

function getFilteredAnnouncements() {
  let items = announcements;

  if (selectedFilters.size > 0) {
    items = items.filter((item) => item.tags.some((tag) => selectedFilters.has(tag)));
  }

  if (selectedFeeFilters.size > 0) {
    items = items.filter((item) => selectedFeeFilters.has(getFeeCategory(item)));
  }

  if (selectedAudienceFilters.size > 0) {
    items = items.filter((item) =>
      getAudienceCategories(item).some((category) => selectedAudienceFilters.has(category)),
    );
  }

  return [...items].sort(compareAnnouncements);
}

function renderAnnouncements() {
  const items = getFilteredAnnouncements();
  resultsCountEl.textContent = `${items.length} annonce${items.length > 1 ? "s" : ""} affichée${items.length > 1 ? "s" : ""}`;

  if (items.length === 0) {
    listEl.innerHTML = '<p class="empty-state">Aucune annonce ne correspond aux filtres sélectionnés.</p>';
    return;
  }

  listEl.innerHTML = items.map((item) => {
    const imageUrl = item.image.startsWith("http")
      ? item.image
      : `${IMAGE_BASE}${item.image}`;

    const tagsHtml = item.tags.map((tag) => {
      const label = tagLabel(tag);
      return `<a class="tag" href="#" data-filter="${tag}">${label}</a>`;
    }).join("");

    const details = [
      ["Ajouté", item.added, "added"],
      ["Envois jusqu'au", item.deadline, ""],
      ["Public", item.audience, ""],
      ["Frais d'inscription", item.fee, ""],
      ["Thème", item.theme, ""],
      ["Longueur", item.length, ""],
      ["Gratification", item.reward, ""],
    ].filter(([, value]) => value);

    const detailsHtml = details.map(([label, value, className]) => (
      `<p><span class="label">${label} :</span> <span class="${className}">${value}</span></p>`
    )).join("");

    return `
      <article class="card" data-id="${item.id}">
        <div class="card-inner">
          <div class="card-image">
            <a href="${item.url}" target="_blank" rel="noopener">
              <img src="${imageUrl}" alt="Capture d'écran du site de l'annonce" loading="lazy"
                onerror="this.src='${IMAGE_BASE}/assets/images/silver-placeholder.png'">
            </a>
          </div>
          <div class="card-content">
            <h2 class="publisher">
              <a href="${item.url}" target="_blank" rel="noopener">${item.publisher}</a>
            </h2>
            <h3 class="card-title">${item.title}</h3>
            <div class="tags">${tagsHtml}</div>
            <div class="details">${detailsHtml}</div>
          </div>
        </div>
      </article>
    `;
  }).join("");

  listEl.querySelectorAll(".tag").forEach((tagEl) => {
    tagEl.addEventListener("click", (event) => {
      event.preventDefault();
      const filter = tagEl.dataset.filter;
      if (!selectedFilters.has(filter)) {
        selectedFilters.add(filter);
      } else {
        selectedFilters.delete(filter);
      }
      syncFilterButtonStates();
      renderAnnouncements();
    });
  });
}

async function loadData() {
  setStatus("Chargement des annonces…", "loading");

  try {
    const response = await fetch(`${DATA_URL}?v=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    filterOptions = data.filterOptions || [];
    announcements = data.announcements || [];
    feeFilterOptions = data.feeFilterOptions || buildFeeFilterOptionsFromAnnouncements(announcements);
    audienceFilterOptions = data.audienceFilterOptions || buildAudienceFilterOptionsFromAnnouncements(announcements);
    dataUpdatedAt = Date.parse(data.updatedAt) || Date.now();

    populateFilterButtons(filterOptions);
    populateFeeFilterButtons(feeFilterOptions);
    populateAudienceFilterButtons(audienceFilterOptions);

    const updatedLabel = formatUpdatedAt(data.updatedAt);
    setStatus(
      `${announcements.length} annonces actives — dernière mise à jour : ${updatedLabel}.`,
      "",
    );
    renderAnnouncements();
  } catch (error) {
    console.error(error);
    setStatus(
      "Impossible de charger les données. Le fichier data/textes-a-la-pelle.json est peut-être absent.",
      "error",
    );
    listEl.innerHTML = "";
    resultsCountEl.textContent = "";
  }
}

selectAllTagFiltersBtn.addEventListener("click", selectAllTagFilters);
deselectAllTagFiltersBtn.addEventListener("click", deselectAllTagFilters);
selectAllFeeFiltersBtn.addEventListener("click", selectAllFeeFilters);
deselectAllFeeFiltersBtn.addEventListener("click", deselectAllFeeFilters);
selectAllAudienceFiltersBtn.addEventListener("click", selectAllAudienceFilters);
deselectAllAudienceFiltersBtn.addEventListener("click", deselectAllAudienceFilters);
sortButtons.forEach((button) => {
  button.addEventListener("click", () => setSort(button.dataset.sort));
});

loadData();
