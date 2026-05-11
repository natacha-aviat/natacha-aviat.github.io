# MedLex + Supabase

**Dépôt public :** ne committez jamais de clés API, mots de passe ou le dossier `.temp/` généré par `supabase link`. Le `project-ref` se trouve dans le dashboard (URL du projet ou **Settings → General**).

## Modèle données (multi-parcours)

Un **client** (`auth.users`) peut avoir **plusieurs dossiers** (`dossiers`), par exemple plusieurs remplacements ou un dossier « installation » et un « déménagement ».

| Table | Rôle |
|-------|------|
| `parcours` | Catalogue des familles métier (`slug`, titre, activation). Ex. `remplacement_infirmiers`, futur `installation_liberal`. |
| `document_templates` | Gabarits Markdown reliés à un **`parcours_slug`** ; **`template_kind`** = `questionnaire` \| `contrat` \| `annexe` \| `lettre`. Chaque nouveau type de dossier ajoute ses lignes + un parcours. |
| `dossiers` | Dossier utilisateur (`user_id`, **`parcours_slug`**, statut, titre…). même parcours peut apparaître sur plusieurs dossiers pour le même utilisateur. |
| `dossier_reponses` | Une ligne par **`question_key`** ; les clés viennent du questionnaire du parcours concerné. |
| `dossier_documents` | Versions générées (contrat PDF/HTML…) ; **`template_id`** pointe vers le bon gabarit. |
| `dossier_references` | Numéros métier publics (`reference_code`) ; lien optionnel **`dossier_document_id`** si `reference_kind = 'contrat'`. |
| `user_profiles` | Données “à soi” de l’utilisateur (profil infirmier) pour préremplir rapidement. |
| `dossier_parties` | Snapshot des parties du contrat pour un dossier : infirmier remplacé / remplaçant (champs fixes). |
| `dossier_lieu_exercice` | Snapshot du lieu d’exercice pendant le remplacement (champs fixes). |
| `user_lieux_exercice` | Liste des cabinets (lieux d’exercice) de l’utilisateur pour préremplir “à soi”. Le dossier lie parfois au lieu via `dossier_lieu_exercice.user_lieu_exercice_id`. |

Migrations dans l’ordre : `20260508104100_*` → `20260509120000_*` (remplacements) → `20260510120000_*` (refs) → `20260511140000_*` (rename vers dossiers / parcours / kinds) → `20260511165000_*` (champs fixes) → `20260511170000_*` (colonnes user_profiles) → `20260511180000_*` (user_lieux_exercice).

Les tables **`remplacement_*`** n’existent plus après la dernière migration : utilisez **`dossiers`** et **`dossier_*`** côté API.

**Auth + RLS :** dossiers et enfants = accès **`auth.uid() = dossiers.user_id`**. Lecture catalogue : **`parcours`** (parcours actifs) et **`document_templates`** (politique `SELECT` ouverte pour alimenter le front ; affinez ensuite si besoin).

**MVP questionnaire remplacement :** l’interface actuelle préremplit / enregistre d’abord les paragraphes “fixes” via `user_profiles`, `dossier_parties` et `dossier_lieu_exercice`. Le reste des réponses du questionnaire peut évoluer ensuite via `dossier_reponses`.

## 1) Lier le projet Supabase

```bash
supabase login
supabase init
supabase link --project-ref <VOTRE_PROJECT_REF>
```

Remplacez `<VOTRE_PROJECT_REF>` par la valeur affichée dans le dashboard (ex. `abcd…` dans `https://supabase.com/dashboard/project/abcd…`).

## 2) Appliquer les migrations

```bash
supabase db push
```

## 3) Importer les templates Markdown MedLex

Le script lit :

- `MedLex/questionnaire V1 contrat de remplacement.md`
- `MedLex/Contrat de remplacement Infirmiers V1.md`

et fait un upsert dans `document_templates` avec **`parcours_slug = remplacement_infirmiers`** et les bons **`template_kind`**.

Dans le dashboard (Settings → API), les **deux** jetons JWT sont des « API keys » :

- **Publishable** (`anon`) : front ; pour les données personnelles, ce n’est pas suffisant sans Auth + RLS.
- **Secret** (service role) : scripts locaux ou serveur sécurisé ; import templates, admin.

Le script lit la clé secrète via **`SUPABASE_SERVICE_ROLE_KEY`** ou les alias **`SUPABASE_SECRET_KEY`** / **`SUPABASE_SECRET_SERVICE_ROLE_KEY`**.

Variables à définir **dans votre shell** ou via un fichier local non versionné (modèle : `supabase/.env.example`).

```bash
export SUPABASE_URL="https://<VOTRE_PROJECT_REF>.supabase.co"
export SUPABASE_SECRET_KEY="<clé secrète depuis Settings → API, jamais dans Git>"
node supabase/scripts/import-medlex-templates.mjs
```

## 4) Vérifier

```sql
select slug, parcours_slug, template_kind, title, version,
       length(content_markdown) as content_length
from public.document_templates
order by parcours_slug, template_kind, slug;

select * from public.parcours order by sort_order;
```

## Nouveau parcours (nouveau questionnaire + contrats)

1. `insert into parcours (slug, title, sort_order) values (...) ;`  
2. Insérer les lignes **`document_templates`** (`questionnaire` + `contrat`…) avec ce **`parcours_slug`**.  
3. Front : créer un **`dossiers`** avec le même **`parcours_slug`**, puis enregistrer les réponses sous les **`question_key`** du formulaire de ce parcours.

## Sécurité (rappel)

- Ne pas committer la clé **secrète** (`service_role` / Secret API key).
- Ne pas committer `supabase/.temp/`.
- La politique `document_templates_select_catalog` expose tout le Markdown des gabarits en lecture publique : à resserrer (`visible`, `parcours_slug` restreint, rôle…) si vous y mettez du contenu sensible.
- Ne pas coller de jetons dans des tickets ou captures.
