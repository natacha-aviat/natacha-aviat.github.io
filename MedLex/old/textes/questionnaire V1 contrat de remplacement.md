__Parcours utilisateur - Contrat de remplacement infirmier libéral__

__Démarrage du parcours - Titre affiché : __Créer mon contrat de remplacement entre infirmiers libéraux

__Texte introductif : __Ce questionnaire permet de générer un contrat de remplacement entre un infirmier libéral remplacé et un infirmier libéral remplaçant. Le contrat est adapté selon la durée du remplacement, le lieu d’exercice, les modalités de facturation, les annexes et les clauses spécifiques applicables.

__1. Le remplacement correspond-il bien exclusivement à une indisponibilité temporaire du Remplacé ?__

Type : oui/non obligatoire
→ Si non : alerte bloquante : Le contrat de remplacement n’est adapté qu’à une indisponibilité temporaire. En cas de besoin durable du cabinet, un autre contrat peut être nécessaire comme le contrat de collaboration en cliquant ici (ça pourrait aller vers le formulaire contrat de collab)

__2.Le contrat est-il conclu pour :__

Type : choix unique

- Un remplacement continu sur une période déterminée
- Un remplacement discontinu selon certains jours ou périodes
- Un remplacement avec planning annexé

→ Logique :

- 2.1. Si « période continue » : afficher dates de début/fin.
- 2.2 Si « discontinu » : afficher ajout de jours/périodes.

__3. Informations sur l’infirmier remplacé__

__3.1. Civilité du Remplacé__
Type : choix unique

- Monsieur
- Madame

__3.2. Nom et prénom du Remplacé__
Type : texte court

__3.3. Numéro ordinal du Remplacé__
Type : texte court

__3.4. Numéro RPPS du Remplacé__
Type : texte court

__3.5. Adresse du cabinet du Remplacé__
Type : adresse complète

__3.6. Le Remplacé exerce-t-il :__

Type : choix unique

- Seul en cabinet individuel
- En cabinet de groupe
- En société d’exercice libéral
- En société civile professionnelle
- Dans le cadre d’un contrat de collaboration
- Autre

→ Logique : Si réponse autre que « seul », insérer la clause :
« Le Remplacé déclare avoir informé l’ensemble des associés… » (figure actuellement en jaune dans le préambule) et demander la question 2.7, sinon on peut passer à 3 :

__3.7. Le Remplacé a-t-il informé ses associés, partenaires ou cocontractants du remplacement ?__

Type : oui/non
→ Si oui : clause conservée.
→ Sinon infos bulles : « Il est fortement recommandé d’informer les associés ou partenaires concernés avant signature pour que le contrat soit valable ».

__4. Motif du remplacement - Quel est le motif de l’indisponibilité temporaire du Remplacé ?__

Type : choix unique \+ champ libre

- Congé
- Maladie
- Formation professionnelle
- Congé maternité / paternité / parental
- Raisons personnelles
- Autre motif temporaire : texte libre

__5. Informations sur l’infirmier remplaçant__

__5.1. Civilité du Remplaçant__
Type : choix unique

- Monsieur
- Madame

__5.2. Nom et prénom du Remplaçant__
Type : texte court

__5.3. Numéro ordinal du Remplaçant__
Type : texte court

__5.4. Numéro RPPS du Remplaçant__
Type : texte court

__5.5. Le Remplaçant est-il :__
Type : choix unique

- Infirmier libéral installé
- Titulaire d’une autorisation ordinale de remplacement en cours de validité

__5.6. Adresse ou lieu d’installation du Remplaçant__
Type : adresse complète

__5.7. Le Remplaçant remplace-t-il actuellement d’autres infirmiers ?__
Type : choix unique

- Non
- Oui, un autre infirmier
- Oui, deux autres infirmiers
- Plus de deux infirmiers

→ Si « deux autres infirmiers ou plus » : alerte bloquante :
Le Remplaçant ne peut pas remplacer plus de deux infirmiers concomitamment. La situation doit être vérifiée avant signature.

__6. Lieu d’exercice pendant le remplacement__

__6.1. Où le Remplaçant exercera-t-il principalement ?__
Type : choix unique

- Dans le cabinet du Remplacé
- Dans son propre cabinet

__Si cabinet du Remplacé__

__6.2. Adresse du cabinet mis à disposition__
Type : adresse
Préremplie avec adresse du Remplacé saisie en réponse 3.5, modifiable.

__Si cabinet du Remplaçant__

__6.2. Adresse du cabinet du Remplaçant__
Type : adresse Préremplie avec adresse du Remplaçant saisie en réponse 5.6, modifiable.

__7. Organisation professionnelle et indépendance__

__7.1. Les jours et périodes de remplacement sont-ils arrêtés d’un commun accord ?__
Type : oui/non
→ Sinon : alerte. Si le Remplacé fixe seul les jours et périodes, il y a un risque de requalification en salariat.

__\+ Infobulles : il est rappelé que les jours et les périodes doivent être fixé d’un commun accord et que le remplaçant reste libre de poursuivre ou développer sa propre patientèle en dehors des périodes de remplacement. __

__8. Modalités de facturation et honoraires__

__8.1. Quel mode de facturation sera utilisé ?__
Type : choix unique

- Facturation directe par le Remplaçant avec ses propres feuilles de soins ou sa propre CPS Info bulle : Cette modalité de facturation directe est privilégiée lorsque les conditions administratives et conventionnelles le permettent, afin de garantir la transparence des flux financiers et l’indépendance du Remplaçant.
- Facturation via les feuilles de soins ou la CPS du Remplacé,

__Si oui : Option 1 : facturation directe par le Remplaçant__

__8-option1-2.a. Une redevance est-elle prévue ?__
Type : choix unique

- Oui
- Non

__8.option 1-2.b Si oui : Taux de redevance reversée au Remplacé __
Type : pourcentage

__8.option 1-3. Mode de règlement de la redevance__

Type : choix unique

- Virement bancaire
- Chèque

__Option 2 : facturation via le Remplacé__

__8.option2 - 2.a Une redevance est-elle prévue ?__
Type : choix unique

- Oui
- Non

__8.option 2- 2.b Si oui : Taux de redevance reversée au Remplacé :__
Type : pourcentage

__8.option 2 -3. Mode de règlement des honoraires au remplacé __

Type : choix unique

- Virement bancaire
- Chèque

__8.option 2 -4. Cas spécifique : En cas de tiers payant, montant du pourcentage de reversement au Remplaçant :__
Type : %

__9. Résiliation anticipée__

__9.1. Préavis en cas de résiliation d’un commun accord__
Type : nombre de jours

__9.2 Préavis en cas de résiliation pour manquement contractuel__
Type : nombre de jours

__10. Informations sur la clause de non-Concurrence__

__Le remplacement durera-t-il plus de trois mois, consécutifs ou non ?__
Type : Oui/Non Ou calcul automatique selon dates/planning \+ validation utilisateur

__Infobulles : __Lorsque le Remplaçant a remplacé le Remplacé pendant une durée supérieure à trois mois, consécutifs ou non, il s’engage, sauf accord écrit du Remplacé notifié au Conseil départemental de l’Ordre des infirmiers, à ne pas s’installer pendant une durée de deux ans dans un lieu où il entrerait en concurrence directe avec le Remplacé, conformément à l’article R.4312-87 du Code de la santé publique__. __

__11. Annexes__

__Souhaitez-vous joindre des annexes ?__

__Oui / Non __

__Infobulles : Annexes recommandées :__

__- Le planning prévisionnel des jours ou périodes de remplacement ;
- L’attestation d’inscription ordinale du Remplaçant ;
-L’attestation d’assurance responsabilité civile professionnelle du Remplaçant ;
- Le cas échéant, l’autorisation ordinale de remplacement ;
- Le descriptif des moyens matériels mis à disposition ;
- Règlement intérieur ou document de fonctionnement du cabinet strictement nécessaire à l’organisation matérielle et à la continuité des soins.__

__12. Générer mon contrat__

__Contrat généré__

__Message affiché :__
Votre contrat de remplacement est généré. Relisez attentivement le document, vérifiez les annexes et transmettez-le au Conseil départemental ou interdépartemental de l’Ordre des infirmiers compétent dans le délai requis.

Boutons :

- Télécharger le projet de contrat en PDF
- Signer le contrat et l’envoyer à mon co-contractant

