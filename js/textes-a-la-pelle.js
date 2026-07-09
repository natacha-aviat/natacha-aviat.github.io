const IMAGE_BASE = "https://textes-a-la-pelle.fr";
const DATA_URL = "data/textes-a-la-pelle.json";

const filterSelect = document.getElementById("filter-select");
const sortSelect = document.getElementById("sort-select");
const statusEl = document.getElementById("status");
const resultsCountEl = document.getElementById("results-count");
const listEl = document.getElementById("announcements");

let announcements = [];
let filterOptions = [];

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

function parseRelativeDate(text) {
  const match = text.match(/il y a (\d+) (heure|jour|mois)/);
  if (!match) {
    return 0;
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const dayMs = 24 * 60 * 60 * 1000;

  if (unit === "heure") {
    return Date.now() - amount * 60 * 60 * 1000;
  }
  if (unit === "jour") {
    return Date.now() - amount * dayMs;
  }
  return Date.now() - amount * 30 * dayMs;
}

function parseDeadline(text) {
  const match = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) {
    return Number.MAX_SAFE_INTEGER;
  }
  const [, day, month, year] = match;
  return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
}

function populateFilterSelect(options) {
  filterSelect.innerHTML = "";

  let currentGroup = null;
  let groupEl = null;

  for (const option of options) {
    if (option.group !== currentGroup) {
      currentGroup = option.group;
      groupEl = currentGroup ? document.createElement("optgroup") : null;
      if (groupEl) {
        groupEl.label = currentGroup;
        filterSelect.appendChild(groupEl);
      }
    }

    const optionEl = document.createElement("option");
    optionEl.value = option.value;
    optionEl.textContent = option.label;
    (groupEl || filterSelect).appendChild(optionEl);
  }
}

function getFilteredAnnouncements() {
  const filter = filterSelect.value;
  let items = announcements;

  if (filter) {
    items = items.filter((item) => item.tags.includes(filter));
  }

  const sort = sortSelect.value;
  items = [...items].sort((a, b) => {
    if (sort === "closing_date") {
      return parseDeadline(a.deadline) - parseDeadline(b.deadline);
    }
    return parseRelativeDate(b.added) - parseRelativeDate(a.added);
  });

  return items;
}

function renderAnnouncements() {
  const items = getFilteredAnnouncements();
  resultsCountEl.textContent = `${items.length} annonce${items.length > 1 ? "s" : ""} affichée${items.length > 1 ? "s" : ""}`;

  if (items.length === 0) {
    listEl.innerHTML = '<p class="empty-state">Aucune annonce ne correspond à ce filtre.</p>';
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
      filterSelect.value = tagEl.dataset.filter;
      renderAnnouncements();
    });
  });
}

async function loadData() {
  setStatus("Chargement des annonces…", "loading");

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    filterOptions = data.filterOptions || [];
    announcements = data.announcements || [];

    populateFilterSelect(filterOptions);

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

filterSelect.addEventListener("change", renderAnnouncements);
sortSelect.addEventListener("change", renderAnnouncements);

loadData();
