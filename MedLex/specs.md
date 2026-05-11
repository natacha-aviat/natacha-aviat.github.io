# Spécifications MedLex — génération IA du site

Ce document décrit le site **MedLex** tel qu’implémenté dans le dossier `MedLex/` d’un dépôt GitHub Pages (`natacha-aviat.github.io/MedLex/`). Une IA peut s’en servir pour **régénérer ou recréer** la page d’accueil et le flux **questionnaire → contrat de remplacement** (HTML + PDF) en conservant le comportement et l’intention produit.

---

## 1. Contexte produit

- **Marque** : MedLex — accompagnement juridique ciblé **infirmiers libéraux** (installation, SELARL, contrats, formalités).
- **Langue** : français (`lang="fr"`).
- **Public** : professionnels de santé libéraux ; ton professionnel, rassurant, clair.
- **Objectif du périmètre décrit** :
  1. **Page vitrine** (`index.html`) : présenter l’offre, tarifs indicatifs, CTA, navigation vers le questionnaire.
  2. **Questionnaire contrat de remplacement** : collecter les données nécessaires à un **contrat de remplacement** entre infirmiers libéraux, avec **aperçu HTML**, **export PDF**, et optionnellement **persistance Supabase** (profil, dossiers).

---

## 2. Contraintes techniques globales

| Contrainte | Détail |
|------------|--------|
| Hébergement | **GitHub Pages** : fichiers statiques uniquement, pas de backend applicatif sur le repo. |
| Navigateurs | Cible **Chrome / Safari** ; mentionner l’usage en **double-clic / `file://`** et les limites (popups, modules ES). |
| Front | **HTML5**, **CSS** (variables `:root` pour couleurs), **JavaScript** sans framework obligatoire. |
| Modules ES | Le questionnaire charge `js/questionnaire-page.js` en `type="module"` ; le générateur de contrat est chargé **à la demande** via `import('./js/contract/medlex-contract.js')` après `medlex-contract-template-embedded.js`. |
| Secrets | **Jamais** de clé `service_role` ou secrets serveur dans le dépôt. Côté client : uniquement **URL projet** + **clé anon** Supabase (placeholders `<VOTRE_…>` tant que non configuré). |
| PDF | Bibliothèque **html2pdf.js** (bundle local `html2pdf.bundle.min.js`) ; capture de la zone `#medlex-print-root` dans la fenêtre d’aperçu ; options html2canvas incluant `scrollX: 0`, `scrollY: 0` pour éviter pages blanches. |

---

## 3. Arborescence attendue (`MedLex/`)

```
MedLex/
├── index.html                          # Vitrine
├── questionnaire-remplacement.html     # Formulaire + point d’entrée scripts
├── questionnaire-remplacement.css      # Styles questionnaire
├── html2pdf.bundle.min.js              # Dépendance PDF (vendor)
├── medlex-contract-template-embedded.js # Template contrat en string globale window.__MEDLEX_CONTRACT_TEMPLATE__
├── templates/
│   └── contrat-remplacement-template.txt  # Source du template (fetch si HTTP + embarqué absent)
├── js/
│   ├── questionnaire-page.js           # Module : UI formulaire, Supabase, chargement fainéant contrat
│   └── contract/
│       ├── constants.js                # TEMPLATE_URL, STORAGE_KEY_PENDING_RESTORE, PDF_FILENAME, etc.
│       ├── utils.js                    # escapeHtml, $, val, dates, isFileProtocol
│       ├── snapshot.js                 # collectQuestionnaireSnapshot / applyQuestionnaireSnapshot
│       ├── answers.js                  # collectAnswers() depuis les IDs du DOM
│       ├── template-engine.js          # applyConditionals, replacements, buildContractText, loadTemplate
│       ├── render-html.js              # buildContractRenderedHtml (paragraphes + <strong> sur valeurs)
│       ├── preview-document.js         # buildHtmlPreviewDocument (HTML aperçu + script inline html2pdf)
│       └── medlex-contract.js          # window.MedLexContract (openHtmlPreview, downloadPdf, …)
├── images/                             # Assets vitrine (hero, miniatures) — chemins relatifs depuis index.html
├── Contrat de remplacement Infirmiers V1.md   # Référence rédactionnelle (hors runtime)
└── questionnaire V1 contrat de remplacement.md # Référence métier (hors runtime)
```

L’IA doit **conserver ces chemins relatifs** entre fichiers du même dossier pour que GitHub Pages et `file://` continuent de fonctionner.

---

## 4. Page vitrine — `index.html`

### 4.1 Métadonnées

- `title` : « MedLex \| Accompagnement juridique des infirmières libérales » (ou équivalent court avec marque + promesse).
- `meta name="description"` : phrase sur structuration SELARL, immatriculation, contrats, formalités.

### 4.2 Design tokens (CSS inline dans `<style>`)

- Palette indicative : fond `#f3f6fc` / dégradés clairs, texte `#0f1f3d`, muté `#55637f`, primaire `#245fda`, primaire foncé `#1a47a5`, bordure `#d8e2f4`, ombres discrètes.
- Typo : `Inter`, `Segoe UI`, `Roboto`, `Arial`, sans-serif.
- Header **sticky** avec léger flou (`backdrop-filter`).

### 4.3 Structure de contenu (sections à reproduire)

1. **Header** : logo « Med**Lex** » (Lex en couleur primaire), liens ancres (`#creation`, `#contrats`, `#selarl`), lien vers `./questionnaire-remplacement.html` libellé type « Fiches pratiques » ou équivalent, bouton / lien téléphone `tel:+33176390060` « 01 76 39 00 60 ».
2. **Hero** : titre accroche (ex. envergure de l’« entreprise de soin »), sous-texte court, 2 CTA (SELARL, services), image `./images/hero-equipe-soignants.jpg` avec `alt` descriptif.
3. **Bandeau blanc** : 3 cartes « étapes » (formalités, coordination, accompagnement quotidien).
4. **Bandeau clair** : « passage en SELARL en 3 étapes » avec numéros 01–03 et CTA.
5. **Grille offres** (`#creation`, `#contrats`, `#selarl`, etc.) : cartes avec titre, description, **prix** ou fourchette (ex. immatriculation 479 € TTC, contrat remplacement à partir de 119 €, bail 219 €, SELARL 6 000 € HT, LegalUp 29 €/mois), liste à puces ; **lien bouton** vers `questionnaire-remplacement.html` depuis la carte « contrat de remplacement ».
6. **Bloc confiance** : chiffre / témoignage type « Plus de 5000… » + 2 images lazy `./images/nurse-preparing-their-shift.jpg`, `./images/portrait-female-working-nurse.jpg`.
7. **Footer** foncé : newsletter (champs factices OK), coordonnées MedLex SAS, Paris, email `contact@medlex.fr`, liens ancres + lien questionnaire, mentions légales / confidentialité en ancres `#footer`.

### 4.4 Responsive

- Grilles hero et cartes : **2–3 colonnes** desktop, **1 colonne** &lt; ~930px ; footer multi-colonnes → 1 colonne sur mobile.

---

## 5. Questionnaire — `questionnaire-remplacement.html`

### 5.1 En-tête page

- `title` : « MedLex \| Questionnaire contrat de remplacement ».
- Lien feuille de style `./questionnaire-remplacement.css`.
- Header : logo MedLex, lien `./index.html` « Retour au site », lien ancre `#submit` « Générer mon contrat ».

### 5.2 Formulaire

- Un seul `<form id="questionnaire-form">`.
- **Sections numérotées 1–12** avec titres et champs ci-dessous (conserver les **`id`** pour le JS).

| # | Titre | Éléments clés (ids / noms) |
|---|--------|----------------------------|
| Préambule | J’ai déjà un compte | `auth-email`, `auth-password`, `auth-signin`, `auth-status` |
| 1 | Éligibilité | radios `name="temporaire"` oui/non ; `alerte-temporaire` |
| 2 | Type de remplacement | `type-remplacement` (continue / discontinu / planning) ; `bloc-continue`, `date-debut`, `date-fin` ; `bloc-discontinu`, `periodes-discontinues` |
| 3 | Infirmier remplacé | `r-party-select-wrap`, `r-party-select` ; `r-civilite`, `r-nom`, `r-ordinal`, `r-rpps`, `r-adresse`, `mode-exercice` ; `bloc-associes`, radios `name="associes"`, `alerte-associes` |
| 4 | Motif | `motif`, `motif-autre`, `motif-autre-texte` |
| 5 | Infirmier remplaçant | `rp-party-select-wrap`, `rp-party-select` ; `rp-civilite`, `rp-nom`, `rp-ordinal`, `rp-rpps`, `rp-statut`, `rp-adresse`, `multi-remplacements`, `alerte-multi` |
| 6 | Lieu d’exercice | `lieu`, `label-lieu`, `adresse-lieu` |
| 7 | Organisation | radios `name="accord"`, `alerte-accord` |
| 8 | Facturation | `facturation`, `redevance`, `bloc-taux-redevance`, `taux-redevance`, `mode-reglement`, `tiers-payant`, `taux-tiers-payant` |
| 9 | Résiliation | `preavis-accord`, `preavis-manquement` |
| 10 | Non-concurrence | radios `name="nonconcurrence"` |
| 11 | Annexes | radios `name="annexes"`, `bloc-annexes-texte`, `annexes-texte` |
| 12 | Générer | `preview-html`, `download-pdf`, submit ; `success-msg` ; aide navigateur / `file://` |

### 5.3 Scripts en bas de page

1. `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2` (classique).
2. `<script type="module" src="./js/questionnaire-page.js"></script>`.

---

## 6. Logique métier — questionnaire (`questionnaire-page.js`)

### 6.1 Configuration Supabase

- Constantes `SUPABASE_URL`, `SUPABASE_ANON_KEY` : si placeholder (`<`), `createSupabaseClient()` retourne `null` → formulaire et PDF **restent utilisables** sans backend.

### 6.2 Affichage conditionnel (à brancher sur `change`)

- Type remplacement : afficher dates si `continue`, textarea périodes si `discontinu` / `planning`.
- `mode-exercice` ≠ seul → afficher bloc associés.
- `motif === autre` → afficher `motif-autre-texte`.
- `multi-remplacements === plus` → afficher alerte (et **bloquer** PDF côté contrat).
- `lieu` : mettre à jour le libellé `label-lieu` et synchroniser `adresse-lieu` avec l’adresse du bon profil quand pertinent.
- `facturation === via-remplace` → afficher tiers payant.
- `redevance === Oui` → afficher taux redevance.
- `annexes === oui` → afficher textarea annexes.

### 6.3 Message `postMessage` (reprise depuis l’aperçu)

- Écouter `message` ; si `data.type === 'medlex-restore-form'` et source = `window.medlexLastPreviewWindow` ou même origine, appeler `MedLexContract.applyQuestionnaireSnapshot(payload)`.
- Sinon stocker le JSON sous la clé **`medlex-pending-restore-json`** (`STORAGE_KEY_PENDING_RESTORE` dans le code) dans `sessionStorage` puis `localStorage`.

### 6.4 Au chargement

- Si clé présente dans storage et `MedLexContract` disponible après chargement fainéant : parser JSON, `applyQuestionnaireSnapshot`, supprimer la clé, scroll haut.

### 6.5 Préremplissage connecté (MVP)

- Si session Supabase active : afficher `r-party-select` / `rp-party-select` (moi-même, profils connus, nouvel) ; charger profils depuis `dossiers`, `dossier_parties`, `user_profiles`, `user_lieux_exercice` ; règles d’exclusion mutuelle des choix « moi-même » ; remplir champs via helpers `setInputValue` / `setSelectValue` / `setRadioValue`.

### 6.6 Soumission formulaire (`submit`)

- Empêcher submit natif ; afficher message succès.
- Si pas de client Supabase ou pas de session : message « connexion requise » sur `auth-status`, **sans** bloquer l’aperçu/PDF.
- Si session : créer `dossiers` (`parcours_slug: 'remplacement_infirmiers'`), upsert `user_profiles` pour les parties « self », gérer `user_lieux_exercice` / défaut, upsert `dossier_lieu_exercice`, insérer `dossier_parties` (remplace / remplacant avec `linked_user_id` nullable).

### 6.7 Chargement fainéant du contrat

- Au clic « Afficher le contrat HTML » ou « Télécharger le projet PDF » :  
  `loadScript('./medlex-contract-template-embedded.js')` puis `import('./js/contract/medlex-contract.js')`.  
- Exposer `window.MedLexContract` avec au minimum : `openHtmlPreview(win)`, `downloadPdf()`, `applyQuestionnaireSnapshot`, `collectQuestionnaireSnapshot`, `collectAnswers`, `buildContractText`, `buildContractRenderedHtml`, `buildHtmlPreviewDocument`, `loadTemplate`.

---

## 7. Pipeline contrat (modules `js/contract/`)

1. **`loadTemplate()`** : si `window.__MEDLEX_CONTRACT_TEMPLATE__` assez long → l’utiliser ; sinon si `file://` sans embarqué → erreur explicite ; sinon `fetch('./templates/contrat-remplacement-template.txt')`.
2. **`collectAnswers()`** : lire tous les champs nécessaires ; normaliser dates (fr-FR), lignes signature, ville extraite de l’adresse, libellés `selectedOptions` pour facturation / statut, etc.
3. **`buildContractText(template, answers)`** :  
   - `applyConditionals` (mode exercice seul, statut remplaçant cabinet installé ou non, lieu cabinet remplacé vs remplaçant, facturation directe vs via remplacé, non-concurrence).  
   - `reshapeArticle2Duration` (bloc article 2 : plage continue vs texte discontinu).  
   - `applyReplacements` (placeholders type `RÉPONSE 3.5`, `QUESTION 8.1`, etc.).  
   - `stripRedevanceIfNone` si pas de redevance.
4. **`buildHtmlPreviewDocument(bodyText, answers, { autoDownloadPdf?, formSnapshot? })`** : document HTML complet avec `#medlex-print-root`, boutons Modifier / Imprimer, script async `html2pdf.bundle.min.js`, script inline qui gère `postMessage` / redirect questionnaire avec snapshot en storage.
5. **`openHtmlPreview(previewWindow)`** : `document.write` dans la fenêtre fournie.
6. **`downloadPdf()`** : ouvrir nouvelle fenêtre, `autoDownloadPdf: true`, même HTML ; après chargement html2pdf, génération auto avec délai + `fonts.ready` + `scrollTo(0,0)`.

---

## 8. Données snapshot (reprise formulaire)

- Version **`1`**.
- `fields` : map `id élément` → `value` (string) ou `checked` (boolean pour checkbox).
- `radios` : map `name` groupe → `value` sélectionné.
- Restauration : réinjecter valeurs, puis `dispatchEvent('change')` sur `select` et radios cochés pour recalculer l’UI.

---

## 9. Critères d’acceptation (recette IA)

- [ ] `index.html` s’ouvre seul, navigation interne et lien vers questionnaire fonctionnent.
- [ ] `questionnaire-remplacement.html` charge CSS + module sans erreur sur HTTP (GitHub Pages).
- [ ] Tous les `id` listés en §5.2 existent pour que `collectAnswers` / snapshot ne cassent pas.
- [ ] Aperçu HTML ouvre une popup, affiche le contrat, bouton « Modifier » renvoie les données au parent ou redirige avec storage.
- [ ] PDF se télécharge avec contenu aligné sur l’aperçu (pas de pages blanches initiales dues au scroll).
- [ ] Blocage explicite si `multi-remplacements === plus` avant PDF.
- [ ] Aucune clé secrète autre que anon dans les sources ; placeholders tant que non configuré.

---

## 10. Notes pour l’IA rédactrice / développeuse

- Reproduire la **hiérarchie sémantique** (`header`, `main`, `section`, `nav`, `footer`) et l’**accessibilité** de base (`label` associés, `alt` images).
- Ne pas inventer de endpoints backend hors Supabase documenté dans `supabase/README-medlex.md` du dépôt.
- Les textes juridiques du contrat proviennent du **template** ; le questionnaire ne doit pas dupliquer le long contrat dans le HTML.
- Si refactor : garder **rétrocompatibilité** de la clé storage `medlex-pending-restore-json` ou migrer partout avec le même littéral.

---

*Document généré pour décrire l’état cible du site MedLex — à mettre à jour si l’arborescence ou les tables Supabase évoluent.*
