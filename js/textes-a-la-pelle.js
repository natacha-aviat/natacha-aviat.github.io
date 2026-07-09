const SOURCE_URL = "https://textes-a-la-pelle.fr/";
const IMAGE_BASE = "https://textes-a-la-pelle.fr";

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

function decodeHtml(value) {
  const el = document.createElement("textarea");
  el.innerHTML = value;
  return el.value.replace(/\u202f/g, "").trim();
}

function tagLabel(tagValue) {
  const idx = tagValue.indexOf("_");
  return idx >= 0 ? tagValue.slice(idx + 1) : tagValue;
}

async function fetchHtml(url) {
  const attempts = [
    url,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  ];

  let lastError = null;
  for (const target of attempts) {
    try {
      const response = await fetch(target);
      if (!response.ok) {
        lastError = new Error(`HTTP ${response.status}`);
        continue;
      }
      const html = await response.text();
      if (html.includes('data-id="')) {
        return html;
      }
      lastError = new Error("Réponse invalide");
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Chargement impossible");
}

function parseFilterOptions(doc) {
  const select = doc.querySelector("#filter-selector");
  if (!select) {
    return [];
  }

  const options = [];
  for (const node of select.childNodes) {
    if (node.nodeName === "OPTION") {
      options.push({
        group: "",
        value: node.getAttribute("value") || "",
        label: decodeHtml(node.textContent),
      });
    } else if (node.nodeName === "OPTGROUP") {
      const group = decodeHtml(node.getAttribute("label") || "");
      for (const option of node.querySelectorAll("option")) {
        options.push({
          group,
          value: option.getAttribute("value") || "",
          label: decodeHtml(option.textContent),
        });
      }
    }
  }
  return options;
}

function parseAnnouncements(doc) {
  return [...doc.querySelectorAll("article[data-id]")].map((article) => {
    const fields = {};
    for (const paragraph of article.querySelectorAll("p.mv0")) {
      const labelEl = paragraph.querySelector("span.o-80");
      if (!labelEl) {
        continue;
      }
      const label = decodeHtml(labelEl.textContent).replace(/:$/, "");
      const clone = paragraph.cloneNode(true);
      clone.querySelector("span.o-80")?.remove();
      fields[label] = decodeHtml(clone.textContent);
    }

    const publisherEl = article.querySelector("h2.publisher");
    const titleEl = article.querySelector("h3");
    const linkEl = article.querySelector('a.dib.navy[href]');
    const imageEl = article.querySelector("img[data-src], img.lazy");

    const tags = [...article.querySelectorAll('a[href*="filter="]')].map((tag) => {
      const href = tag.getAttribute("href") || "";
      const match = href.match(/filter=([^&]+)/);
      return match ? decodeURIComponent(match[1]) : "";
    }).filter(Boolean);

    return {
      id: article.dataset.id,
      publisher: decodeHtml(publisherEl?.textContent || ""),
      title: decodeHtml(titleEl?.textContent || ""),
      url: linkEl?.getAttribute("href") || "",
      image: imageEl?.getAttribute("data-src") || imageEl?.getAttribute("src") || "",
      tags,
      added: fields["Ajouté"] || "",
      deadline: fields["Envois jusqu'au"] || "",
      audience: fields.Public || "",
      fee: fields["Frais d'inscription"] || "",
      theme: fields.Thème || "",
      length: fields.Longueur || "",
      reward: fields.Gratification || "",
    };
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
  setStatus("Chargement des annonces depuis textes-a-la-pelle.fr…", "loading");

  try {
    const html = await fetchHtml(SOURCE_URL);
    const doc = new DOMParser().parseFromString(html, "text/html");

    filterOptions = parseFilterOptions(doc);
    announcements = parseAnnouncements(doc);

    populateFilterSelect(filterOptions);

    const activeCount = announcements.length;
    setStatus(`${activeCount} annonces actives chargées.`, "");
    renderAnnouncements();
  } catch (error) {
    console.error(error);
    setStatus(
      "Impossible de charger les données. Vérifiez votre connexion et réessayez.",
      "error",
    );
    listEl.innerHTML = "";
    resultsCountEl.textContent = "";
  }
}

filterSelect.addEventListener("change", renderAnnouncements);
sortSelect.addEventListener("change", renderAnnouncements);

loadData();
