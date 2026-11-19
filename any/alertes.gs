/**
 * Alertes de l'agenda ANY.
 * À coller dans Extensions → Apps Script du Google Sheet.
 * Fuseau du projet : America/New_York.
 * Propriétés du script : BREVO_KEY, SENDER_EMAIL, SENDER_NAME.
 */
var EVENTS_URL = "https://natacha-aviat.github.io/any/events.json";
var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
var HEADS = ["email", "status", "token", "minDays", "maxDays", "filters", "lastSent", "knownIds", "created"];

function feuille() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName("Inscrits");
  if (!sh) sh = ss.insertSheet("Inscrits");
  if (sh.getLastRow() === 0) sh.appendRow(HEADS);
  return sh;
}

function lignes() {
  var sh = feuille();
  var values = sh.getDataRange().getValues();
  var out = [];
  for (var i = 1; i < values.length; i++) {
    var row = {};
    for (var c = 0; c < HEADS.length; c++) row[HEADS[c]] = values[i][c];
    row._n = i + 1;
    out.push(row);
  }
  return out;
}

function ecrire(n, champs) {
  var sh = feuille();
  HEADS.forEach(function (key, c) {
    if (Object.prototype.hasOwnProperty.call(champs, key)) sh.getRange(n, c + 1).setValue(champs[key]);
  });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var raw = (e.parameter && e.parameter.payload) || (e.postData && e.postData.contents) || "";
    var data = JSON.parse(raw);
    var email = String(data.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return page("Adresse invalide", "Cette adresse e-mail ne peut pas être utilisée.");
    var minDays = borne(data.minDays, 1, 30, 1);
    var maxDays = borne(data.maxDays, 1, 30, 7);
    if (minDays > maxDays) maxDays = minDays;
    var filters = data.filters && typeof data.filters === "object" ? data.filters : {};
    var now = new Date();
    var found = lignes().filter(function (r) { return String(r.email).toLowerCase() === email; })[0];
    var token = found && found.status === "actif" ? String(found.token) : Utilities.getUuid();
    var champs = {
      email: email,
      status: found && found.status === "actif" ? "actif" : "attente",
      token: token,
      minDays: minDays,
      maxDays: maxDays,
      filters: JSON.stringify(filters),
      created: found ? found.created : now
    };
    if (found) ecrire(found._n, champs);
    else {
      feuille().appendRow([email, champs.status, token, minDays, maxDays, champs.filters, "", "[]", now]);
    }
    if (champs.status === "actif") {
      envoyer(email, "Vos alertes ANY sont à jour",
        "<p>Les filtres et le rythme de vos alertes sont enregistrés.</p>" + pied(token));
      return page("C'est enregistré", "Vos alertes sont à jour. Le prochain message suivra le rythme choisi.");
    }
    var lien = url() + "?confirmer=" + encodeURIComponent(token);
    envoyer(email, "Confirmez vos alertes ANY",
      "<p>Confirmez cette adresse pour recevoir l'agenda filtré.</p><p><a href=\"" + lien + "\">Activer les alertes</a></p>");
    return page("Confirmez votre adresse", "Un message vient de partir. Ouvrez-le pour activer les alertes.");
  } catch (err) {
    return page("Envoi impossible", "La demande n'a pas abouti. Vérifiez la clé Brevo et l'adresse d'expédition. " + texte(err.message));
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var p = e.parameter || {};
  var token = String(p.confirmer || p.stop || "");
  if (!token) return page("Alertes ANY", "Ce lien est incomplet.");
  var found = lignes().filter(function (r) { return String(r.token) === token; })[0];
  if (!found) return page("Lien inconnu", "Cette inscription n'est plus là.");
  if (p.stop) {
    ecrire(found._n, { status: "stop" });
    return page("Alertes arrêtées", "Vous ne recevrez plus les messages de l'agenda.");
  }
  ecrire(found._n, { status: "actif" });
  return page("Alertes activées", "C'est confirmé. Le premier message part au prochain passage, le matin.");
}

function envoyerAlertes() {
  var events = activites();
  var today = ymd(new Date());
  lignes().forEach(function (row) {
    if (row.status !== "actif") return;
    var filters = {};
    var known = [];
    try { filters = JSON.parse(row.filters || "{}"); } catch (err) { filters = {}; }
    try { known = JSON.parse(row.knownIds || "[]"); } catch (err) { known = []; }
    var match = events.filter(function (ev) { return passe(ev, filters); });
    var ids = match.map(function (ev) { return String(ev.id); });
    var knownSet = {};
    (Array.isArray(known) ? known : []).forEach(function (id) { knownSet[String(id)] = true; });
    var first = !row.lastSent;
    var fresh = first ? [] : match.filter(function (ev) { return !knownSet[String(ev.id)]; });
    var elapsed = first ? Number(row.maxDays) : joursEntre(String(row.lastSent), today);
    var duNouveau = fresh.length > 0 && elapsed >= Number(row.minDays);
    var echeance = elapsed >= Number(row.maxDays);
    if (!duNouveau && !echeance) return;
    var sujet = fresh.length ? fresh.length + " nouvelle" + (fresh.length > 1 ? "s" : "") + " activité" + (fresh.length > 1 ? "s" : "") + " ANY" : "Votre agenda ANY";
    envoyer(String(row.email), sujet, message(fresh, match, String(row.token)));
    ecrire(row._n, { lastSent: today, knownIds: JSON.stringify(ids) });
  });
}

function verifierBrevo() {
  var to = PropertiesService.getScriptProperties().getProperty("SENDER_EMAIL");
  envoyer(to, "Essai des alertes ANY", "<p>Brevo est bien relié au script de l'agenda.</p>");
}

function installer() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "envoyerAlertes") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("envoyerAlertes").timeBased().everyDays(1).atHour(8).create();
}

function activites() {
  var res = UrlFetchApp.fetch(EVENTS_URL, { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error("Agenda illisible (" + res.getResponseCode() + ")");
  var all = JSON.parse(res.getContentText()).map(prep);
  var today = ymd(new Date());
  var end = finHorizon(new Date());
  var list = all.filter(function (ev) { return ev.date >= today && ev.date <= end; });
  series(list);
  return list;
}

function message(fresh, match, token) {
  var html = "";
  if (fresh.length) {
    html += "<h2>Nouvelles activités</h2><ul>" + fresh.map(ligne).join("") + "</ul>";
  }
  html += "<h2>Activités qui correspondent à vos filtres</h2>";
  html += match.length ? "<ul>" + match.map(ligne).join("") + "</ul>" : "<p>Aucune activité ne correspond en ce moment.</p>";
  return html + pied(token);
}

function ligne(ev) {
  var heure = String(ev.start).slice(11, 16) + "–" + String(ev.end).slice(11, 16);
  return "<li><a href=\"" + texte(ev.url) + "\">" + texte(ev.title) + "</a> — " +
    texte(ev.labelDate) + ", " + heure + " — " + texte(ev.place) + " — " + texte(places(ev)) + "</li>";
}

function pied(token) {
  return "<p><a href=\"" + url() + "?stop=" + encodeURIComponent(token) + "\">Arrêter les alertes</a></p>";
}

function envoyer(to, subject, html) {
  var props = PropertiesService.getScriptProperties();
  var key = props.getProperty("BREVO_KEY");
  var from = props.getProperty("SENDER_EMAIL");
  var name = props.getProperty("SENDER_NAME") || "Agenda de l'ANY";
  if (!key || !from) throw new Error("BREVO_KEY ou SENDER_EMAIL manquant");
  var res = UrlFetchApp.fetch("https://api.brevo.com/v3/smtp/email", {
    method: "post",
    contentType: "application/json",
    headers: { "api-key": key, accept: "application/json" },
    payload: JSON.stringify({
      sender: { email: from, name: name },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html
    }),
    muteHttpExceptions: true
  });
  if (res.getResponseCode() < 200 || res.getResponseCode() >= 300) {
    throw new Error("Brevo " + res.getResponseCode() + " " + res.getContentText());
  }
}

function url() {
  return ScriptApp.getService().getUrl();
}

function page(titre, textePage) {
  var html = "<!DOCTYPE html><meta charset=\"utf-8\"><title>" + texte(titre) +
    "</title><body style=\"font-family:Georgia,serif;padding:32px\"><h1>" + texte(titre) +
    "</h1><p>" + textePage + "</p></body>";
  return HtmlService.createHtmlOutput(html);
}

function prep(e) {
  var start = String(e.start).split(" ");
  var ymdParts = start[0].split("-").map(Number);
  var hm = start[1].split(":").map(Number);
  var endHm = String(e.end).split(" ")[1].split(":").map(Number);
  return {
    id: e.id, title: e.title, start: e.start, end: e.end, url: e.url, cat: e.cat,
    place: e.place, area: e.area, cap: e.cap, seats: e.seats, wait: e.wait,
    date: start[0],
    startMin: hm[0] * 60 + hm[1],
    endMin: endHm[0] * 60 + endHm[1],
    dow: new Date(ymdParts[0], ymdParts[1] - 1, ymdParts[2]).getDay(),
    labelDate: ymdParts[2] + " " + MOIS[ymdParts[1] - 1]
  };
}

function series(events) {
  var counts = {};
  events.forEach(function (e) {
    var slug = serie(e.title)[0];
    e.series = e.cat + ":" + slug;
    counts[e.series] = (counts[e.series] || 0) + 1;
  });
  events.forEach(function (e) { e.sub = counts[e.series] >= 2 ? e.series : ""; });
}

function serie(title) {
  var plain = String(title).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F\u200D]/gu, "").replace(/\s+/g, " ").trim();
  var t = plain.toLowerCase();
  if (t.indexOf("ca grimpe") === 0) return ["ca-grimpe"];
  if (t.indexOf("sorties photos") === 0) return ["sorties-photos"];
  if (t.indexOf("after-work") === 0 || t.indexOf("after work") === 0) return ["after-work"];
  if (t.indexOf("cafe ") === 0 || t.indexOf("café") === 0) return ["cafe"];
  if (t.indexOf("any va") === 0) return ["any-va"];
  var slug = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return [slug || "autre"];
}

function passe(e, f) {
  var cats = f.excludedCats || [];
  var subs = f.excludedSubs || [];
  var days = (f.excludedDays || []).map(Number);
  var areas = f.excludedAreas || [];
  if (cats.indexOf(e.cat) >= 0) return false;
  if (e.sub && subs.indexOf(e.sub) >= 0) return false;
  if (days.indexOf(e.dow) >= 0) return false;
  if (areas.indexOf(e.area) >= 0) return false;
  if (f.place && e.place !== f.place) return false;
  var win0 = Number(f.h0) * 60;
  var win1 = Number(f.h1) * 60 + 59;
  if (!(e.startMin <= win1 && e.endMin >= win0)) return false;
  var kind = remplissage(e);
  if (kind === "wait" && f.showWait === false) return false;
  if (kind === "full" && !f.showFull) return false;
  return true;
}

function remplissage(e) {
  if (!Number.isInteger(e.seats) || e.seats > 0) return "";
  if (e.wait === -1 || (Number.isInteger(e.wait) && e.wait > 0)) return "wait";
  return "full";
}

function places(e) {
  var kind = remplissage(e);
  if (kind === "wait") return "Liste d'attente";
  if (kind === "full") return "Complet";
  if (!Number.isInteger(e.seats) || !Number.isInteger(e.cap) || e.cap <= 0) return "Places non précisées";
  return e.seats + (e.seats > 1 ? " places restantes sur " : " place restante sur ") + e.cap;
}

function finHorizon(today) {
  var year = today.getMonth() > 7 ? today.getFullYear() + 1 : today.getFullYear();
  return year + "-08-31";
}

function joursEntre(a, b) {
  var da = new Date(Number(a.slice(0, 4)), Number(a.slice(5, 7)) - 1, Number(a.slice(8, 10)));
  var db = new Date(Number(b.slice(0, 4)), Number(b.slice(5, 7)) - 1, Number(b.slice(8, 10)));
  return Math.round((db - da) / 86400000);
}

function ymd(dt) {
  return dt.getFullYear() + "-" + pad(dt.getMonth() + 1) + "-" + pad(dt.getDate());
}
function pad(n) { return (n < 10 ? "0" : "") + n; }
function borne(v, min, max, def) {
  var n = Number(v);
  if (!isFinite(n)) return def;
  return Math.min(max, Math.max(min, Math.round(n)));
}
function texte(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
