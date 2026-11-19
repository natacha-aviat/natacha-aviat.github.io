const CATS = [
  { id: "accueil", name: "Accueil et Café de Quartier", color: "#eb506a" },
  { id: "art", name: "Activités Artistiques et Culinaires", color: "#fac400" },
  { id: "culture", name: "Activités Culturelles et Touristiques", color: "#2a870b" },
  { id: "famille", name: "Activités Familiales et de Jeux", color: "#9c77f2" },
  { id: "sport", name: "Activités Sportives et Bien-Etre", color: "#5890d1" },
  { id: "langues", name: "Activités Linguistiques", color: "#a1614a" },
  { id: "carriere", name: "Carrière", color: "#ff801f" }
];
const CAT = Object.fromEntries(CATS.map((c) => [c.id, c]));
const JOUR = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const JOUR_S = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const JOUR_BTN = [
  { d: 1, label: "Lun" }, { d: 2, label: "Mar" }, { d: 3, label: "Mer" },
  { d: 4, label: "Jeu" }, { d: 5, label: "Ven" }, { d: 6, label: "Sam" }, { d: 0, label: "Dim" }
];
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const HMIN = 7, HMAX = 22;
const FILTER_KEY = "any-filters-v1";
const KNOWN_KEY = "any-known-ids";
const SEEN_AREAS_KEY = "any-seen-areas";
const SESSION_NEW = "any-session-new";

const EVENTS = (await fetch(new URL("events.json", import.meta.url)).then((r) => r.json())).map(prep);

function prep(e) {
  const s = parts(e.start);
  const en = parts(e.end);
  return Object.assign({}, e, {
    y: s.y, m: s.m, d: s.d, sh: s.hh, sm: s.mm,
    eh: en.hh, em: en.mm, date: s.key,
    startMin: s.hh * 60 + s.mm,
    endMin: en.hh * 60 + en.mm,
    dow: new Date(s.y, s.m - 1, s.d).getDay()
  });
}
function parts(s) {
  const [date, time] = s.split(" ");
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return { y, m, d, hh, mm, key: date };
}
function pad(n) { return String(n).padStart(2, "0"); }
function ymd(dt) { return dt.getFullYear() + "-" + pad(dt.getMonth() + 1) + "-" + pad(dt.getDate()); }
function fromYmd(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function addDays(dt, n) {
  const x = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + n);
  return x;
}
function mondayOf(dt) {
  const day = dt.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(dt, diff);
}
function fmtHour(h) { return h + " h"; }
function fmtClock(h, m) { return pad(h) + ":" + pad(m); }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function plainTitle(title) {
  return title.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F\u200D]/gu, "").replace(/\s+/g, " ").trim();
}
function seriesOf(title) {
  const plain = plainTitle(title);
  const t = plain.toLowerCase();
  if (t.startsWith("ca grimpe")) return ["ca-grimpe", "Ca grimpe"];
  if (t.startsWith("sorties photos")) return ["sorties-photos", "Sorties Photos"];
  if (t.startsWith("after-work") || t.startsWith("after work")) return ["after-work", "After-work"];
  if (t.startsWith("cafe ") || t.startsWith("café")) return ["cafe", "Café"];
  if (t.startsWith("any va")) return ["any-va", "ANY va au musée"];
  const slug = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return [slug || "autre", plain];
}
function assignSeries(events) {
  const counts = new Map();
  events.forEach((e) => {
    const [slug, label] = seriesOf(e.title);
    e.series = e.cat + ":" + slug;
    e.seriesLabel = label;
    counts.set(e.series, (counts.get(e.series) || 0) + 1);
  });
  events.forEach((e) => { e.sub = counts.get(e.series) >= 2 ? e.series : ""; });
  const seen = new Set();
  const subs = [];
  events.forEach((e) => {
    if (!e.sub || seen.has(e.sub)) return;
    seen.add(e.sub);
    subs.push({ id: e.sub, cat: e.cat, label: e.seriesLabel, count: counts.get(e.sub) });
  });
  subs.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "fr"));
  return subs;
}

const todayDt = new Date();
const todayKey = ymd(todayDt);
const rangeStart = mondayOf(new Date(todayDt.getFullYear(), todayDt.getMonth(), todayDt.getDate()));
const endYear = todayDt.getMonth() > 7 ? todayDt.getFullYear() + 1 : todayDt.getFullYear();
const rangeEnd = new Date(endYear, 7, 31);
const horizonKey = ymd(rangeEnd);

const inHorizon = EVENTS.filter((e) => e.date >= todayKey && e.date <= horizonKey);
const SUBS = assignSeries(inHorizon);

const novelty = computeNovelty(inHorizon.map((e) => e.id));
const FAVICON_URL = new URL("favicon.png", import.meta.url).href;
paintTabBadge(novelty.first ? 0 : novelty.count);

const state = loadFilters();
state.q = "";
state.onlyNew = false;

const els = {
  q: document.getElementById("q"),
  cats: document.getElementById("cats"),
  days: document.getElementById("days"),
  areas: document.getElementById("areas"),
  place: document.getElementById("place"),
  h0: document.getElementById("h0"),
  h1: document.getElementById("h1"),
  hLabel: document.getElementById("hLabel"),
  sliderFill: document.getElementById("sliderFill"),
  onlyNew: document.getElementById("onlyNew"),
  showWait: document.getElementById("showWait"),
  showFull: document.getElementById("showFull"),
  emptyWeeks: document.getElementById("emptyWeeks"),
  body: document.getElementById("body"),
  head: document.getElementById("head"),
  status: document.getElementById("status"),
  note: document.getElementById("note"),
  lede: document.getElementById("lede"),
  dialog: document.getElementById("detail")
};

function loadFilters() {
  const blank = { excludedCats: [], excludedSubs: [], excludedDays: [], excludedAreas: [], h0: 9, h1: 17, place: "", emptyWeeks: false, showWait: true, showFull: false };
  try {
    const s = JSON.parse(localStorage.getItem(FILTER_KEY) || "null");
    if (!s || typeof s !== "object") return blank;
    let h0 = num(s.h0, 9), h1 = num(s.h1, 17);
    if (h0 > h1) { const t = h0; h0 = h1; h1 = t; }
    return {
      excludedCats: arr(s.excludedCats),
      excludedSubs: arr(s.excludedSubs).filter((id) => SUBS.some((sub) => sub.id === id)),
      excludedDays: arr(s.excludedDays).map(Number).filter((n) => n >= 0 && n <= 6),
      excludedAreas: arr(s.excludedAreas),
      h0, h1,
      place: typeof s.place === "string" ? s.place : "",
      emptyWeeks: !!s.emptyWeeks,
      showWait: s.showWait !== false,
      showFull: !!s.showFull
    };
  } catch (e) { return blank; }
}
function num(v, d) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(HMAX, Math.max(HMIN, n)) : d;
}
function arr(v) { return Array.isArray(v) ? v.map(String) : []; }
function saveFilters() {
  localStorage.setItem(FILTER_KEY, JSON.stringify({
    excludedCats: state.excludedCats,
    excludedSubs: state.excludedSubs,
    excludedDays: state.excludedDays,
    excludedAreas: state.excludedAreas,
    h0: state.h0, h1: state.h1,
    place: state.place,
    emptyWeeks: state.emptyWeeks,
    showWait: state.showWait,
    showFull: state.showFull
  }));
}
function computeNovelty(ids) {
  let fresh = [];
  let first = false;
  const cached = sessionStorage.getItem(SESSION_NEW);
  if (cached) {
    fresh = JSON.parse(cached);
    first = sessionStorage.getItem("any-first") === "1";
  } else {
    const raw = localStorage.getItem(KNOWN_KEY);
    if (raw == null) first = true;
    else {
      const known = new Set(JSON.parse(raw));
      fresh = ids.filter((id) => !known.has(id));
    }
    localStorage.setItem(KNOWN_KEY, JSON.stringify(ids));
    sessionStorage.setItem(SESSION_NEW, JSON.stringify(fresh));
    sessionStorage.setItem("any-first", first ? "1" : "0");
  }
  return { ids: new Set(fresh), first, count: fresh.length };
}

function iconLink() {
  let icon = document.querySelector("link[rel='icon']");
  if (!icon) {
    icon = document.createElement("link");
    icon.rel = "icon";
    icon.type = "image/png";
    document.head.append(icon);
  }
  return icon;
}

let faviconReady = null;
function loadFavicon() {
  if (!faviconReady) {
    faviconReady = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = FAVICON_URL;
    });
  }
  return faviconReady;
}

function paintTabBadge(count) {
  const base = "Agenda ANY — rencontres Accueil New York";
  document.title = count ? "(" + count + ") " + base : base;
  const icon = iconLink();
  if (!count) {
    icon.href = FAVICON_URL;
    if (navigator.clearAppBadge) navigator.clearAppBadge().catch(() => {});
    return;
  }
  if (navigator.setAppBadge) navigator.setAppBadge(count).catch(() => {});
  loadFavicon().then((img) => {
    if (!img) {
      icon.href = FAVICON_URL;
      return;
    }
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 64;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0, 64, 64);
    g.fillStyle = "#8e2c42";
    g.beginPath();
    g.arc(48, 48, 16, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#fffdf8";
    g.textAlign = "center";
    g.textBaseline = "middle";
    const label = count > 9 ? "9+" : String(count);
    g.font = (label.length > 1 ? "700 16px " : "700 22px ") + "sans-serif";
    g.fillText(label, 48, 50);
    icon.href = c.toDataURL("image/png");
  });
}

function fillKind(e) {
  if (!Number.isInteger(e.seats) || e.seats > 0) return "";
  if (e.wait === -1 || (Number.isInteger(e.wait) && e.wait > 0)) return "wait";
  return "full";
}
function fillLabel(kind) {
  if (kind === "wait") return "Liste d'attente";
  if (kind === "full") return "Complet";
  return "";
}

function searchBlob(e) {
  return [e.title, e.who, e.place, e.area, e.desc].join(" ").toLowerCase();
}
function inHourWindow(e) {
  const win0 = state.h0 * 60;
  const win1 = state.h1 * 60 + 59;
  return e.startMin <= win1 && e.endMin >= win0;
}

function passes(e) {
  if (state.excludedCats.includes(e.cat)) return false;
  if (e.sub && state.excludedSubs.includes(e.sub)) return false;
  if (state.excludedDays.includes(e.dow)) return false;
  if (state.excludedAreas.includes(e.area)) return false;
  if (state.place && e.place !== state.place) return false;
  if (state.onlyNew && !novelty.ids.has(e.id)) return false;
  const q = state.q.trim().toLowerCase();
  if (q && !searchBlob(e).includes(q)) return false;
  if (!inHourWindow(e)) return false;
  const kind = fillKind(e);
  if (kind === "wait" && !state.showWait) return false;
  if (kind === "full" && !state.showFull) return false;
  return true;
}

function filterBlockers(e) {
  const out = [];
  if (state.excludedCats.includes(e.cat)) out.push({ key: "cat:" + e.cat, label: "la catégorie " + CAT[e.cat].name });
  else if (e.sub && state.excludedSubs.includes(e.sub)) {
    const sub = SUBS.find((item) => item.id === e.sub);
    out.push({ key: "sub:" + e.sub, label: "« " + (sub ? sub.label : e.seriesLabel) + " »" });
  }
  if (state.excludedDays.includes(e.dow)) out.push({ key: "day:" + e.dow, label: "le " + JOUR[e.dow] });
  if (state.excludedAreas.includes(e.area)) out.push({ key: "area:" + e.area, label: "le quartier " + e.area });
  if (state.place && e.place !== state.place) out.push({ key: "place", label: "le lieu « Tous les lieux »" });
  const q = state.q.trim();
  if (q && !searchBlob(e).includes(q.toLowerCase())) out.push({ key: "q", label: "la recherche « " + q + " »" });
  if (!inHourWindow(e)) {
    out.push({ key: "hour", label: "le créneau horaire (" + fmtClock(e.sh, e.sm) + "–" + fmtClock(e.eh, e.em) + ")" });
  }
  const kind = fillKind(e);
  if (kind === "wait" && !state.showWait) out.push({ key: "wait", label: "« Sur liste d'attente »" });
  if (kind === "full" && !state.showFull) out.push({ key: "full", label: "« Complètes »" });
  return out;
}

function joinFr(items) {
  if (items.length <= 1) return items[0] || "";
  if (items.length === 2) return items[0] + " et " + items[1];
  return items.slice(0, -1).join(", ") + " et " + items[items.length - 1];
}

function hiddenNewMessage(events) {
  const labels = new Map();
  events.forEach((e) => {
    filterBlockers(e).forEach((b) => {
      if (!labels.has(b.key)) labels.set(b.key, b.label);
      else if (b.key === "hour") labels.set(b.key, "le créneau horaire");
    });
  });
  const filters = joinFr([...labels.values()]);
  if (events.length === 1) {
    return "« " + plainTitle(events[0].title) + " » n’est pas affiché. Débloquez " + filters + ".";
  }
  return events.length + " nouveaux ne sont pas affichés. Débloquez " + filters + ".";
}

function timesLabel(n) {
  return "(" + n + ")";
}

function buildControls() {
  const catInputs = {};
  CATS.forEach((c) => {
    const catCount = inHorizon.filter((e) => e.cat === c.id).length;
    if (!catCount) return;
    const block = document.createElement("div");
    block.className = "cat-block";
    const label = document.createElement("label");
    label.className = "check";
    const input = document.createElement("input");
    input.type = "checkbox";
    const subsOfCat = SUBS.filter((sub) => sub.cat === c.id && sub.count > 0);
    const subInputs = {};
    input.addEventListener("change", () => {
      if (input.checked) {
        state.excludedCats = state.excludedCats.filter((id) => id !== c.id);
        const ids = new Set(subsOfCat.map((sub) => sub.id));
        state.excludedSubs = state.excludedSubs.filter((id) => !ids.has(id));
      } else if (!state.excludedCats.includes(c.id)) {
        state.excludedCats = state.excludedCats.concat(c.id);
      }
      paintCat(c.id);
      saveFilters(); render();
    });
    const span = document.createElement("span");
    const dot = document.createElement("i");
    dot.className = "dot";
    dot.style.background = c.color;
    const count = document.createElement("span");
    count.className = "count";
    count.textContent = timesLabel(catCount);
    span.append(dot, document.createTextNode(c.name), count);
    label.append(input, span);
    block.append(label);
    if (subsOfCat.length) {
      const list = document.createElement("div");
      list.className = "subs";
      subsOfCat.forEach((sub) => {
        const subLabel = document.createElement("label");
        subLabel.className = "check";
        const subInput = document.createElement("input");
        subInput.type = "checkbox";
        subInput.addEventListener("change", () => {
          if (subInput.checked) {
            state.excludedSubs = state.excludedSubs.filter((id) => id !== sub.id);
            state.excludedCats = state.excludedCats.filter((id) => id !== c.id);
          } else if (!state.excludedSubs.includes(sub.id)) {
            state.excludedSubs = state.excludedSubs.concat(sub.id);
            const allOff = subsOfCat.every((item) => state.excludedSubs.includes(item.id));
            const singletons = inHorizon.some((e) => e.cat === c.id && !e.sub);
            if (allOff && !singletons && !state.excludedCats.includes(c.id)) {
              state.excludedCats = state.excludedCats.concat(c.id);
            }
          }
          paintCat(c.id);
          saveFilters(); render();
        });
        const subSpan = document.createElement("span");
        subSpan.append(document.createTextNode(sub.label));
        const count = document.createElement("span");
        count.className = "count";
        count.textContent = timesLabel(sub.count);
        subSpan.append(count);
        subLabel.append(subInput, subSpan);
        list.append(subLabel);
        subInputs[sub.id] = subInput;
      });
      block.append(list);
    }
    catInputs[c.id] = { parent: input, subs: subInputs };
    els.cats.append(block);
  });

  function paintCat(catId) {
    const ui = catInputs[catId];
    const off = state.excludedCats.includes(catId);
    const subIds = Object.keys(ui.subs);
    const excluded = subIds.filter((id) => state.excludedSubs.includes(id));
    const singletons = inHorizon.some((e) => e.cat === catId && !e.sub);
    ui.parent.checked = !off;
    ui.parent.indeterminate = !off && excluded.length > 0 && (excluded.length < subIds.length || singletons);
    subIds.forEach((id) => {
      ui.subs[id].disabled = off;
      ui.subs[id].checked = !off && !state.excludedSubs.includes(id);
    });
  }
  Object.keys(catInputs).forEach((id) => paintCat(id));
  els.cats.paint = () => Object.keys(catInputs).forEach((id) => paintCat(id));

  JOUR_BTN.forEach((j) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "day";
    b.textContent = j.label;
    b.setAttribute("aria-pressed", state.excludedDays.includes(j.d) ? "false" : "true");
    b.addEventListener("click", () => {
      const on = b.getAttribute("aria-pressed") === "true";
      b.setAttribute("aria-pressed", on ? "false" : "true");
      state.excludedDays = on
        ? state.excludedDays.concat(j.d)
        : state.excludedDays.filter((d) => d !== j.d);
      saveFilters(); render();
    });
    els.days.append(b);
  });

  const areas = [...new Set(inHorizon.map((e) => e.area))].sort((a, b) => a.localeCompare(b, "fr"));
  areas.sort((a, b) => (a === "Non précisé") - (b === "Non précisé"));
  areas.forEach((area) => {
    const label = document.createElement("label");
    label.className = "check";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = !state.excludedAreas.includes(area);
    input.addEventListener("change", () => {
      state.excludedAreas = input.checked
        ? state.excludedAreas.filter((a) => a !== area)
        : state.excludedAreas.concat(area);
      saveFilters(); render();
    });
    const span = document.createElement("span");
    span.textContent = area;
    label.append(input, span);
    els.areas.append(label);
  });

  const places = [...new Set(inHorizon.map((e) => e.place))].sort((a, b) => a.localeCompare(b, "fr"));
  const opt0 = document.createElement("option");
  opt0.value = "";
  opt0.textContent = "Tous les lieux";
  els.place.append(opt0);
  places.forEach((p) => {
    const o = document.createElement("option");
    o.value = p;
    o.textContent = p;
    els.place.append(o);
  });
  if ([...els.place.options].some((o) => o.value === state.place)) els.place.value = state.place;
  else state.place = "";

  els.h0.value = state.h0;
  els.h1.value = state.h1;
  els.emptyWeeks.checked = state.emptyWeeks;
  els.showWait.checked = state.showWait;
  els.showFull.checked = state.showFull;
  paintSlider();
}

function paintSlider() {
  const span = HMAX - HMIN;
  const p0 = ((state.h0 - HMIN) / span) * 100;
  const p1 = ((state.h1 - HMIN) / span) * 100;
  els.sliderFill.style.left = p0 + "%";
  els.sliderFill.style.right = (100 - p1) + "%";
  els.hLabel.textContent = fmtHour(state.h0) + " – " + fmtHour(state.h1);
}
function onHour(which) {
  let a = Number(els.h0.value), b = Number(els.h1.value);
  if (a > b) {
    if (which === 0) { b = a; els.h1.value = b; }
    else { a = b; els.h0.value = a; }
  }
  state.h0 = a; state.h1 = b;
  paintSlider(); saveFilters(); render();
}

function shownColumnIndexes() {
  const on = [1, 2, 3, 4, 5, 6, 0].map((d) => !state.excludedDays.includes(d));
  const first = on.indexOf(true);
  const last = on.lastIndexOf(true);
  if (first < 0) return [];
  const indexes = [];
  for (let i = first; i <= last; i += 1) indexes.push(i);
  return indexes;
}

function render() {
  const byDate = new Map();
  let shown = 0;
  inHorizon.forEach((e) => {
    if (!passes(e)) return;
    shown += 1;
    if (!byDate.has(e.date)) byDate.set(e.date, []);
    byDate.get(e.date).push(e);
  });

  els.body.replaceChildren();
  const columns = shownColumnIndexes();
  const weekLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  els.head.replaceChildren();
  columns.forEach((i) => {
    const th = document.createElement("th");
    th.textContent = weekLabels[i];
    els.head.append(th);
  });
  let cursor = new Date(rangeStart);
  let lastMonth = -1;
  let weeksDrawn = 0;
  const endMonday = mondayOf(rangeEnd);
  while (cursor <= endMonday) {
    const days = Array.from({ length: 7 }, (_, i) => addDays(cursor, i));
    const any = days.some((dt) => (byDate.get(ymd(dt)) || []).length);
    const anchor = addDays(cursor, 3);
    const month = anchor.getMonth();
    if (any || state.emptyWeeks) {
      if (month !== lastMonth) {
        const tr = document.createElement("tr");
        tr.className = "month";
        const td = document.createElement("td");
        td.colSpan = Math.max(columns.length, 1);
        td.textContent = cap(MOIS[month]) + " " + anchor.getFullYear();
        tr.append(td);
        els.body.append(tr);
        lastMonth = month;
      }
      const tr = document.createElement("tr");
      const weekKey = ymd(cursor);
      tr.id = "w-" + weekKey;
      if (todayKey >= weekKey && todayKey <= ymd(addDays(cursor, 6))) tr.className = "now";
      columns.forEach((i) => {
        const dt = days[i];
        const key = ymd(dt);
        const td = document.createElement("td");
        if (key === todayKey) td.className = "today";
        else if (key < todayKey) td.className = "past";
        const head = document.createElement("div");
        head.className = "dayhead";
        const dow = document.createElement("span");
        dow.className = "dow";
        dow.textContent = JOUR_S[dt.getDay()];
        const num = document.createElement("span");
        num.className = "num";
        num.textContent = String(dt.getDate());
        head.append(dow, num);
        if (key === todayKey) {
          const tag = document.createElement("span");
          tag.className = "tag";
          tag.textContent = "aujourd’hui";
          head.append(tag);
        }
        const slots = document.createElement("div");
        slots.className = "slots";
        td.append(head, slots);
        const list = byDate.get(key) || [];
        if (!list.length && key >= todayKey) {
          const empty = document.createElement("span");
          empty.className = "empty-cell";
          empty.textContent = "—";
          slots.append(empty);
        }
        list.forEach((e) => slots.append(card(e)));
        tr.append(td);
      });
      els.body.append(tr);
      weeksDrawn += 1;
    }
    cursor = addDays(cursor, 7);
  }

  const total = inHorizon.filter(inHourWindow).length;
  renderStatus(shown, total, weeksDrawn);
}

function card(e) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "card";
  btn.style.borderLeftColor = CAT[e.cat].color;
  const cat = CAT[e.cat].name;
  const kind = fillKind(e);
  const seatText = fillLabel(kind);
  btn.setAttribute("aria-label", e.title + ", " + cat + (seatText ? ", " + seatText : ""));
  if (novelty.ids.has(e.id)) {
    const b = document.createElement("span");
    b.className = "badge";
    b.textContent = "Nouveau";
    btn.append(b);
  }
  if (seatText) {
    const seat = document.createElement("span");
    seat.className = "seat " + kind;
    seat.textContent = seatText;
    btn.append(seat);
  }
  const time = document.createElement("time");
  time.textContent = fmtClock(e.sh, e.sm) + "–" + fmtClock(e.eh, e.em);
  time.dateTime = e.start.replace(" ", "T");
  const title = document.createElement("span");
  title.className = "title";
  title.textContent = e.title;
  btn.append(time, title);
  const bits = [];
  if (e.who) bits.push(e.who);
  if (e.place && e.place !== "Non précisé") bits.push(e.place);
  else if (e.area && e.area !== "Non précisé") bits.push(e.area);
  if (bits.length) {
    const meta = document.createElement("span");
    meta.className = "meta";
    meta.textContent = bits.join(" · ");
    btn.append(meta);
  }
  btn.addEventListener("click", () => openDetail(e, btn));
  return btn;
}

function renderStatus(shown, total, weeksDrawn) {
  els.status.replaceChildren();
  const count = document.createElement("span");
  count.textContent = shown + " " + (shown === 1 ? "activité affichée" : "activités affichées") + " sur " + total;
  els.status.append(count);
  if (!novelty.first) {
    const fresh = inHorizon.filter((e) => novelty.ids.has(e.id));
    const hidden = fresh.filter((e) => !passes(e));
    const visible = fresh.length - hidden.length;
    if (visible) {
      const ban = document.createElement("span");
      ban.className = "banner";
      ban.textContent = visible + (visible > 1 ? " nouveaux depuis votre dernière visite." : " nouveau depuis votre dernière visite.");
      const see = document.createElement("button");
      see.type = "button";
      see.className = "linkish";
      see.textContent = " Voir seulement ceux-là";
      see.addEventListener("click", () => {
        state.onlyNew = true;
        els.onlyNew.checked = true;
        render();
      });
      ban.append(see);
      els.status.append(ban);
    }
    if (hidden.length) {
      const ban = document.createElement("span");
      ban.className = "banner";
      ban.textContent = hiddenNewMessage(hidden);
      els.status.append(ban);
    }
  }
  if (!shown) {
    const p = document.createElement("p");
    p.className = "hint";
    p.textContent = weeksDrawn ? "Aucune activité ne correspond à ces filtres." : "Aucune semaine à afficher.";
    els.status.append(p);
  }
}

let opener = null;
function openDetail(e, btn) {
  opener = btn;
  const cat = CAT[e.cat];
  const catEl = document.getElementById("detailCat");
  catEl.textContent = cat.name;
  catEl.style.color = cat.color;
  document.getElementById("detailTitle").textContent = e.title;
  const when = cap(JOUR[e.dow]) + " " + e.d + " " + MOIS[e.m - 1] + " " + e.y
    + ", " + fmtClock(e.sh, e.sm) + " – " + fmtClock(e.eh, e.em);
  document.getElementById("detailWhen").textContent = when;
  const badge = document.getElementById("detailBadge");
  badge.replaceChildren();
  if (novelty.ids.has(e.id)) {
    const b = document.createElement("span");
    b.className = "badge";
    b.textContent = "Nouveau depuis votre dernière visite";
    badge.append(b);
  }
  const seatText = fillLabel(fillKind(e));
  if (seatText) {
    const seat = document.createElement("span");
    seat.className = "seat " + fillKind(e);
    seat.textContent = seatText;
    badge.append(seat);
  }
  document.getElementById("detailWho").textContent = e.who || "Non indiqué sur la fiche publique";
  document.getElementById("detailPlace").textContent = e.place;
  document.getElementById("detailArea").textContent = e.area;
  const desc = document.getElementById("detailDesc");
  desc.replaceChildren();
  if (e.desc) fillLinks(desc, e.desc);
  else {
    const p = document.createElement("p");
    p.textContent = "La fiche publique ne donne pas de description. Le détail réservé aux membres est sur le site de l’ANY.";
    desc.append(p);
  }
  const link = document.getElementById("detailLink");
  link.href = e.url;
  els.dialog.showModal();
}
function fillLinks(node, text) {
  const re = /https?:\/\/[^\s)]+/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    node.append(document.createTextNode(text.slice(last, m.index)));
    const a = document.createElement("a");
    a.href = m[0];
    a.textContent = m[0];
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    node.append(a);
    last = m.index + m[0].length;
  }
  node.append(document.createTextNode(text.slice(last)));
}

els.q.addEventListener("input", () => { state.q = els.q.value; render(); });
els.place.addEventListener("change", () => { state.place = els.place.value; saveFilters(); render(); });
els.h0.addEventListener("input", () => onHour(0));
els.h1.addEventListener("input", () => onHour(1));
els.h0.addEventListener("pointerdown", () => { els.h0.style.zIndex = 5; els.h1.style.zIndex = 4; });
els.h1.addEventListener("pointerdown", () => { els.h1.style.zIndex = 5; els.h0.style.zIndex = 4; });
els.onlyNew.addEventListener("change", () => { state.onlyNew = els.onlyNew.checked; render(); });
els.emptyWeeks.addEventListener("change", () => { state.emptyWeeks = els.emptyWeeks.checked; saveFilters(); render(); });
els.showWait.addEventListener("change", () => { state.showWait = els.showWait.checked; saveFilters(); render(); });
els.showFull.addEventListener("change", () => { state.showFull = els.showFull.checked; saveFilters(); render(); });
document.getElementById("reset").addEventListener("click", () => {
  state.excludedCats = [];
  state.excludedSubs = [];
  state.excludedDays = [];
  state.excludedAreas = [];
  state.h0 = 9; state.h1 = 17;
  state.place = "";
  state.q = "";
  state.onlyNew = false;
  state.emptyWeeks = false;
  state.showWait = true;
  state.showFull = false;
  els.q.value = "";
  els.place.value = "";
  els.h0.value = 9; els.h1.value = 17;
  els.onlyNew.checked = false;
  els.emptyWeeks.checked = false;
  els.showWait.checked = true;
  els.showFull.checked = false;
  els.cats.querySelectorAll("input").forEach((i) => { i.checked = true; i.indeterminate = false; i.disabled = false; });
  els.areas.querySelectorAll("input").forEach((i) => { i.checked = true; });
  els.days.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", "true"));
  paintSlider(); saveFilters(); render();
});
document.getElementById("detailClose").addEventListener("click", () => els.dialog.close());
els.dialog.addEventListener("click", (ev) => { if (ev.target === els.dialog) els.dialog.close(); });
els.dialog.addEventListener("close", () => { if (opener) opener.focus(); });

const ledeEnd = "31 août " + endYear;
els.lede.append(
  document.createTextNode("Du " + todayDt.getDate() + " " + MOIS[todayDt.getMonth()] + " " + todayDt.getFullYear() + " au " + ledeEnd + "."),
);
const src = document.createElement("a");
src.href = "https://www.accueilnewyork.org/Calendrier-des-rencontres-175";
src.target = "_blank";
src.rel = "noopener noreferrer";
src.textContent = "Calendrier officiel de l’ANY";
const linkLine = document.createElement("span");
linkLine.className = "lede-link";
linkLine.append(src, document.createTextNode("."));
els.lede.append(document.createElement("br"), linkLine);

const last = inHorizon.reduce((a, e) => e.date > a ? e.date : a, "");
els.note.textContent = "Relevé du calendrier public le 18 novembre 2026"
  + (last ? ". Dernier rendez-vous publié : " + fromYmd(last).getDate() + " " + MOIS[fromYmd(last).getMonth()] + " " + fromYmd(last).getFullYear() : "")
  + ". Juillet et août n’ont pas encore de rencontres sur le site de l’ANY. L’adresse exacte et l’animateur ne figurent pas toujours sur la fiche publique : ils sont alors indiqués comme non précisés. Liste d’attente : plus aucune place, mais il reste de la place en liste d’attente. Complet : plus aucune place, y compris en liste d’attente. Relevé des places le 19 novembre 2026. Les badges Nouveau comparent cette liste à celle de votre visite précédente, sur cet appareil.";

function selectNewAreas() {
  const current = [...new Set(inHorizon.map((e) => e.area))];
  let seen = null;
  try {
    const raw = localStorage.getItem(SEEN_AREAS_KEY);
    if (raw != null) seen = JSON.parse(raw);
  } catch (e) { seen = null; }
  if (Array.isArray(seen)) {
    const known = new Set(seen.map(String));
    const fresh = new Set(current.filter((area) => !known.has(area)));
    if (fresh.size) {
      state.excludedAreas = state.excludedAreas.filter((area) => !fresh.has(area));
      saveFilters();
    }
  }
  localStorage.setItem(SEEN_AREAS_KEY, JSON.stringify(current));
}

selectNewAreas();
buildControls();
render();
const nowRow = document.querySelector("tr.now");
if (nowRow) nowRow.scrollIntoView({ block: "center" });
