const IMAGE_BASE = "https://textes-a-la-pelle.fr";
const DATA_URL = "data/textes-a-la-pelle.json";

const filterButtonsEl = document.getElementById("filter-buttons");
const selectAllBtn = document.getElementById("select-all-filters");
const deselectAllBtn = document.getElementById("deselect-all-filters");
const sortButtons = [...document.querySelectorAll(".sort-btn")];
const statusEl = document.getElementById("status");
const resultsCountEl = document.getElementById("results-count");
const listEl = document.getElementById("announcements");

let announcements = [];
let filterOptions = [];
let dataUpdatedAt = Date.now();
let currentSort = "publication_date";
const selectedFilters = new Set();

function setStatus(message, type = "loading") {
  statusEl.textContent = message;
  statusEl.className = type;
}

function tagLabel(tagValue) {
  const idx = tagValue.indexOf("_");
  return idx >= 0 ? tagValue.slice(idx + 1) : tagValue;
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

function syncFilterButtonStates() {
  filterButtonsEl.querySelectorAll(".filter-btn").forEach((button) => {
    const isSelected = selectedFilters.has(button.dataset.filter);
    button.setAttribute("aria-pressed", String(isSelected));
  });
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

function selectAllFilters() {
  selectedFilters.clear();
  for (const option of getSelectableFilterOptions()) {
    selectedFilters.add(option.value);
  }
  syncFilterButtonStates();
  renderAnnouncements();
}

function deselectAllFilters() {
  selectedFilters.clear();
  syncFilterButtonStates();
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

function getFilteredAnnouncements() {
  let items = announcements;

  if (selectedFilters.size > 0) {
    items = items.filter((item) => item.tags.some((tag) => selectedFilters.has(tag)));
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
    dataUpdatedAt = Date.parse(data.updatedAt) || Date.now();

    populateFilterButtons(filterOptions);

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

selectAllBtn.addEventListener("click", selectAllFilters);
deselectAllBtn.addEventListener("click", deselectAllFilters);
sortButtons.forEach((button) => {
  button.addEventListener("click", () => setSort(button.dataset.sort));
});

loadData();
