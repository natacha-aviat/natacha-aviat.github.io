export const CLAUSE_BENEFITS = [
  {
    id: "duree",
    title: "Durée du remplacement",
    benefit: "Ce paragraphe te protège en cas de prolongation imprévue — personne ne reste dans le flou.",
  },
  {
    id: "facturation",
    title: "Modalités de facturation",
    benefit: "Ce paragraphe te protège si un litige survient sur qui facture quoi, et comment.",
  },
  {
    id: "redevance",
    title: "Redevance au remplacé",
    benefit: "Ce paragraphe te protège sur le montant et le calendrier de reversement, sans ambiguïté.",
  },
  {
    id: "resiliation",
    title: "Résiliation anticipée",
    benefit: "Ce paragraphe te protège si l'une de vous doit arrêter le remplacement plus tôt que prévu.",
  },
  {
    id: "responsabilite",
    title: "Responsabilité professionnelle",
    benefit: "Ce paragraphe te protège sur la couverture RCP et les obligations ordinale pendant le remplacement.",
  },
  {
    id: "non-concurrence",
    title: "Non-concurrence",
    benefit: "Ce paragraphe te protège si le remplacement dépasse 3 mois — cadre légal, pas surprise.",
  },
] as const;

export const CONTRACT_ARTICLES = [
  {
    title: "Article 1 — Durée du remplacement",
    body: "Le présent contrat est conclu pour une période déterminée, du 1er juillet 2026 au 31 décembre 2026 inclusivement. Toute prolongation devra faire l'objet d'un avenant écrit signé par les deux parties, conformément aux règles ordinales applicables.",
  },
  {
    title: "Article 2 — Modalités de facturation",
    body: "Pendant la durée du remplacement, la remplaçante exercera en facturation directe sous son propre numéro CPS. Elle s'engage à établir les feuilles de soins et à assurer le suivi administratif afférent. Le remplacé lui transmettra les éléments nécessaires à la continuité des soins dans un délai de quarante-huit heures.",
  },
  {
    title: "Article 3 — Redevance au remplacé",
    body: "À titre de compensation pour la mise à disposition du cabinet et du fichier patients, la remplaçante versera au remplacé une redevance mensuelle fixée à 15 % du chiffre d'affaires net encaissé, payable au plus tard le 10 de chaque mois pour le mois précédent.",
  },
  {
    title: "Article 4 — Résiliation anticipée",
    body: "Chaque partie pourra mettre fin au contrat moyennant un préavis de quinze jours notifié par lettre recommandée avec accusé de réception, sauf cas de force majeure ou de manquement grave d'une partie à ses obligations.",
  },
  {
    title: "Article 5 — Responsabilité professionnelle",
    body: "La remplaçante déclare être titulaire d'une assurance responsabilité civile professionnelle en cours de validité couvrant son activité de remplacement. Elle s'engage à respecter le Code de déontologie infirmier et les obligations déclaratives auprès de l'Ordre.",
  },
  {
    title: "Article 6 — Non-concurrence",
    body: "En cas de remplacement d'une durée supérieure à trois mois, les parties conviennent d'une clause de non-concurrence limitée au secteur géographique du cabinet remplacé, pour une durée maximale de six mois à compter de la fin du remplacement, dans les conditions prévues par la réglementation en vigueur.",
  },
] as const;

export const LEGAL_LINKS = [
  { title: "Remplacement infirmier : le cadre légal", href: "#" },
  { title: "Facturation en libéral : bonnes pratiques", href: "#" },
  { title: "Ordre des infirmiers — fiches pratiques", href: "#" },
  { title: "Passage en SELARL : par où commencer ?", href: "#" },
] as const;

export const DEMO_CONTRACTS = [
  {
    id: "current",
    title: "Remplacement",
    subtitle: "Dr. Martin",
    status: "signe" as const,
    date: "3 juin 2026",
  },
  {
    id: "pending",
    title: "Collaboration",
    subtitle: "Cabinet Les Lilas",
    status: "en-attente-tiers" as const,
    date: "28 mai 2026",
  },
  {
    id: "payment",
    title: "Remplacement",
    subtitle: "Mme Dupont",
    status: "en-attente-paiement" as const,
    date: "15 mai 2026",
  },
];
