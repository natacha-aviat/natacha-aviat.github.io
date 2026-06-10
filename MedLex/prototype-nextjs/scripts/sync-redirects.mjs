import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const medlex = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tunnel = join(medlex, "tunnel");

/** Anciennes routes Next (/MedLex/tunnel/...) → pages statiques parcours/ */
const redirects = [
  { from: "index.html", to: "../index.html" },
  { from: "parcours/index.html", to: "../../parcours/email.html" },
  { from: "parcours/email/index.html", to: "../../../parcours/email.html" },
  { from: "parcours/verification-email/index.html", to: "../../../parcours/verification-email.html" },
  { from: "parcours/lien-expire/index.html", to: "../../../parcours/lien-expire.html" },
  { from: "parcours/questionnaire/index.html", to: "../../../parcours/questionnaire.html" },
  { from: "parcours/apercu/index.html", to: "../../../parcours/apercu.html" },
  { from: "parcours/invitation/index.html", to: "../../../parcours/invitation.html" },
  { from: "parcours/paiement/index.html", to: "../../../parcours/paiement.html" },
  { from: "parcours/contrat/index.html", to: "../../../parcours/contrat.html" },
  { from: "parcours/signature/index.html", to: "../../../parcours/signature.html" },
  { from: "parcours/tableau-de-bord/index.html", to: "../../../parcours/tableau-de-bord.html" },
];

function html(target) {
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="refresh" content="0; url=${target}" />
  <link rel="canonical" href="${target}" />
  <title>Redirection · Au Clair</title>
  <script>location.replace("${target}");</script>
</head>
<body>
  <p>Redirection… <a href="${target}">Continuer vers Au Clair</a></p>
</body>
</html>
`;
}

function cleanExceptRedirects(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      cleanExceptRedirects(path);
      if (readdirSync(path).length === 0) rmSync(path, { recursive: true, force: true });
      continue;
    }
    if (name !== "index.html") rmSync(path, { force: true });
  }
}

cleanExceptRedirects(tunnel);

for (const { from, to } of redirects) {
  const file = join(tunnel, from);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html(to), "utf8");
}

console.log(`Redirects écrits dans ${tunnel} (${redirects.length} fichiers)`);
