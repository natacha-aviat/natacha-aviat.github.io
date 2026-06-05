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
