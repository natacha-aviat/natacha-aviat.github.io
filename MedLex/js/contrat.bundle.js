(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // js/contract/pdf-options.js
  function html2PdfOptions(html2canvasExtra, filename) {
    return {
      margin: [12, 12, 12, 12],
      filename: filename || "contrat-medlex.pdf",
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: Object.assign(
        {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollX: 0,
          scrollY: 0
        },
        html2canvasExtra || {}
      ),
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: {
        mode: ["avoid-all", "css", "legacy"],
        avoid: ".medlex-pdf-visual-line"
      }
    };
  }
  var init_pdf_options = __esm({
    "js/contract/pdf-options.js"() {
    }
  });

  // js/contract/article-guide.js
  function isArticleLine(line) {
    return /^(Article|ARTICLE)\s+/i.test(String(line || "").trim());
  }
  function articleKeyFromSection(section) {
    if (section.isPreamble) return "preamble";
    const m = String(section.heading || "").match(/Article\s+(\d+(?:\.\d+)?)(?:er|re)?\b/i);
    return m ? m[1] : "misc";
  }
  function titleFromHeading(heading) {
    const parts = String(heading || "").split(/\s+[–\-]\s+/);
    if (parts.length > 1) return parts.slice(1).join(" \u2013 ").trim();
    return String(heading || "").trim();
  }
  function tocDisplayTitle(section) {
    if (section.isPreamble) return "PR\xC9AMBULE ET IDENTIFICATION DES PARTIES";
    return titleFromHeading(section.heading).toUpperCase();
  }
  function shortLabelFromKey(key, isPreamble) {
    if (isPreamble) return "Intro";
    if (key === "misc") return "Passage";
    return "Art. " + key.replace("er", "");
  }
  function getArticleMeta(parcours, section) {
    const key = articleKeyFromSection(section);
    const store = parcours === "collaboration" ? COLLAB_ARTICLE_META : parcours === "fin-de-bail" ? FIN_BAIL_ARTICLE_META : parcours === "mise-en-demeure" ? MISE_EN_DEMEURE_ARTICLE_META : parcours === "bail-professionnel" ? BAIL_PRO_ARTICLE_META : REMPL_ARTICLE_META;
    const extra = store[key] || {};
    const title = (parcours === "fin-de-bail" || parcours === "mise-en-demeure") && section.isPreamble ? parcours === "mise-en-demeure" ? "Mise en demeure du bailleur" : "Courrier de fin de bail" : section.isPreamble ? "Pr\xE9ambule et parties" : titleFromHeading(section.heading);
    const editSteps = extra.editSteps ? extra.editSteps.slice() : extra.editStep != null ? [{ step: extra.editStep, label: "Modifier" }] : [];
    return {
      key,
      shortLabel: shortLabelFromKey(key, section.isPreamble),
      title,
      desc: extra.desc || "Ce passage pr\xE9cise tes droits et obligations sur ce point du contrat.",
      editSteps
    };
  }
  function splitSections(bodyText) {
    const lines = String(bodyText || "").split("\n");
    const sections = [];
    const preamble = [];
    let current = null;
    lines.forEach(function(line) {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (isArticleLine(trimmed)) {
        if (current) sections.push(current);
        current = { heading: trimmed, lines: [] };
      } else if (current) {
        current.lines.push(line);
      } else {
        preamble.push(line);
      }
    });
    if (current) sections.push(current);
    if (preamble.length) {
      sections.unshift({
        heading: "Pr\xE9ambule et identification des parties",
        lines: preamble,
        isPreamble: true
      });
    }
    return sections;
  }
  function buildArticleSections(bodyText, parcours) {
    return splitSections(bodyText).map(function(section) {
      const meta = getArticleMeta(parcours, section);
      return {
        shortLabel: meta.shortLabel,
        title: meta.title,
        desc: meta.desc
      };
    });
  }
  var COLLAB_ARTICLE_META, REMPL_ARTICLE_META, FIN_BAIL_ARTICLE_META, MISE_EN_DEMEURE_ARTICLE_META, BAIL_PRO_ARTICLE_META;
  var init_article_guide = __esm({
    "js/contract/article-guide.js"() {
      COLLAB_ARTICLE_META = {
        preamble: {
          desc: "Identification du titulaire et du collaborateur, et rappel du cadre l\xE9gal de la collaboration lib\xE9rale.",
          editSteps: [
            { step: 0, label: "Modifier le titulaire" },
            { step: 1, label: "Modifier le collaborateur" }
          ]
        },
        "1": {
          desc: "Ce passage pose le cadre l\xE9gal de la collaboration lib\xE9rale \u2014 sans lien de subordination.",
          editStep: 0
        },
        "2": {
          desc: "Ce paragraphe encadre le temps consacr\xE9 \xE0 ta patient\xE8le personnelle \u2014 journ\xE9es ou demi-journ\xE9es, clair pour les deux.",
          editStep: 2
        },
        "3": {
          desc: "Ce paragraphe fixe le temps minimum d\xE9di\xE9 \xE0 la collaboration et \xE9vite une requalification en salariat.",
          editStep: 3
        },
        "4": {
          desc: "Ce paragraphe encadre le suivi de chaque patient\xE8le \u2014 un point de rep\xE8re clair en cas d\u2019\xE9volution ou de fin de collaboration."
        },
        "5": {
          desc: "Ce paragraphe pr\xE9cise l\u2019adresse du cabinet et les moyens mis \xE0 disposition (salle de soins, secr\xE9tariat, dossiers\u2026).",
          editSteps: [
            { step: 4, label: "Modifier le lieu" },
            { step: 5, label: "Modifier les moyens" }
          ]
        },
        "6": {
          desc: "Ce paragraphe te prot\xE8ge sur la cl\xE9 de r\xE9partition des forfaits et les d\xE9lais de reversement.",
          editSteps: [
            { step: 6, label: "Modifier les forfaits" },
            { step: 7, label: "Modifier le reversement" }
          ]
        },
        "7": {
          desc: "Ce paragraphe fixe la redevance (pourcentage du CA ou forfait mensuel) et la date limite de versement.",
          editStep: 8
        },
        "8": {
          desc: "Ind\xE9pendance professionnelle, d\xE9ontologie et interdiction du comp\xE9rage entre vous deux."
        },
        "9": {
          desc: "Assurance RCP, charges fiscales et sociales \u2014 chacune reste responsable de ses propres obligations."
        },
        "10": {
          desc: "Planning, cong\xE9s et absences : organis\xE9s d\u2019un commun accord, sans d\xE9cision unilat\xE9rale."
        },
        "11": {
          desc: "Protection en cas de maternit\xE9, paternit\xE9 ou adoption \u2014 pas de rupture abusive du contrat."
        },
        "12": {
          desc: "Organisation du remplacement en cas d\u2019arr\xEAt maladie et protection contre une rupture li\xE9e \xE0 la maladie."
        },
        "13": {
          desc: "Information des patients sur ta pr\xE9sence au cabinet, dans le respect du libre choix."
        },
        "14": {
          desc: "Dur\xE9e du contrat (d\xE9termin\xE9e ou ind\xE9termin\xE9e) et possibilit\xE9 de l\u2019adapter par avenant.",
          editStep: 9
        },
        "15": {
          desc: "Premier mois d\u2019essai : chacune peut mettre fin au contrat avec un court pr\xE9avis.",
          editStep: 9
        },
        "16": {
          desc: "Conditions de fin du contrat, pr\xE9avis et cas de rupture pour faute grave.",
          editStep: 9
        },
        "17": {
          desc: "Droit de priorit\xE9 du collaborateur en cas de succession ou d\u2019association du titulaire."
        },
        "18": {
          desc: "Loyaut\xE9 r\xE9ciproque et interdiction de concurrence d\xE9loyale \xE0 la fin de la collaboration."
        },
        "19": {
          desc: "Clause de non-concurrence ou caract\xE8re personnel du contrat \u2014 selon le paragraphe concern\xE9."
        },
        "20": {
          desc: "En cas de diff\xE9rend, recherche d\u2019une solution amiable avant toute action en justice."
        },
        "21": {
          desc: "Transmission du contrat sign\xE9 \xE0 l\u2019Ordre des infirmiers dans le d\xE9lai l\xE9gal."
        }
      };
      REMPL_ARTICLE_META = {
        preamble: {
          desc: "Identification des parties, motif du remplacement et rappel du cadre du remplacement lib\xE9ral.",
          editStep: 4
        },
        "1": {
          desc: "Objet du remplacement : exercer en lieu et place du remplac\xE9, pour une dur\xE9e limit\xE9e.",
          editStep: 3
        },
        "2": {
          desc: "Ce paragraphe te prot\xE8ge en cas de prolongation impr\xE9vue \u2014 personne ne reste dans le flou.",
          editStep: 1
        },
        "3": {
          desc: "Lieu d\u2019exercice du remplacement et conditions mat\xE9rielles d\u2019accueil.",
          editStep: 6
        },
        "4": {
          desc: "Obligations r\xE9ciproques des parties pendant le remplacement.",
          editStep: 7
        },
        "4.3": {
          desc: "Confirmation de ton ind\xE9pendance professionnelle \u2014 pas de lien de subordination.",
          editStep: 7
        },
        "5": {
          desc: "Ce paragraphe te prot\xE8ge si un litige survient sur qui facture quoi, et comment.",
          editStep: 8
        },
        "6": {
          desc: "Ce paragraphe te prot\xE8ge sur la couverture RCP et les obligations ordinale pendant le remplacement."
        },
        "7": {
          desc: "Le contrat est personnel et ne peut pas \xEAtre c\xE9d\xE9 \xE0 un tiers."
        },
        "8": {
          desc: "Ce paragraphe te prot\xE8ge si l'une de vous doit arr\xEAter le remplacement plus t\xF4t que pr\xE9vu.",
          editStep: 10
        },
        "8.1": { desc: "R\xE9siliation d\u2019un commun accord entre vous.", editStep: 10 },
        "8.2": { desc: "R\xE9siliation en cas de manquement grave \xE0 l\u2019une des parties.", editStep: 10 },
        "8.3": { desc: "Cas de r\xE9siliation de plein droit (d\xE9c\xE8s, sanctions, etc.).", editStep: 10 },
        "8.4": {
          desc: "Cons\xE9quences financi\xE8res si le remplacement s\u2019arr\xEAte avant la date pr\xE9vue.",
          editStep: 8
        },
        "9": { desc: "Renouvellement \xE9ventuel du remplacement.", editStep: 1 },
        "10": { desc: "Fin du remplacement et restitution de la patient\xE8le.", editStep: 1 },
        "11": {
          desc: "Ce paragraphe te prot\xE8ge si le remplacement d\xE9passe 3 mois \u2014 cadre l\xE9gal, pas surprise.",
          editStep: 11
        },
        "12": { desc: "R\xE8glement amiable des diff\xE9rends avant recours au tribunal." },
        "13": { desc: "Transmission du contrat et pi\xE8ces annexes." },
        "14": { desc: "Annexes compl\xE9mentaires \xE9ventuelles au contrat.", editStep: 12 }
      };
      FIN_BAIL_ARTICLE_META = {
        preamble: {
          desc: "Courrier de cong\xE9 du bail professionnel \u2014 identit\xE9 des parties, locaux et pr\xE9avis de six mois.",
          editSteps: [
            { step: 2, label: "Modifier la situation" },
            { step: 3, label: "Modifier le bailleur" },
            { step: 4, label: "Modifier le preneur" },
            { step: 5, label: "Modifier les locaux" },
            { step: 6, label: "Modifier les dates" }
          ]
        }
      };
      MISE_EN_DEMEURE_ARTICLE_META = {
        preamble: {
          desc: "Mise en demeure pr\xE9alable pour faute du bailleur \u2014 faits, mesures demand\xE9es et d\xE9lai.",
          editSteps: [
            { step: 1, label: "Modifier les manquements" },
            { step: 4, label: "Modifier les faits" },
            { step: 6, label: "Modifier les mesures" },
            { step: 7, label: "Modifier les parties" }
          ]
        }
      };
      BAIL_PRO_ARTICLE_META = {
        preamble: {
          desc: "Identification du Bailleur et du Preneur, et rappel du cadre du bail professionnel.",
          editSteps: [
            { step: 0, label: "Modifier le bailleur" },
            { step: 1, label: "Modifier le preneur" }
          ]
        },
        "1": {
          desc: "D\xE9signation des locaux lou\xE9s \u2014 adresse, superficie, pi\xE8ces et nature de l\u2019immeuble.",
          editStep: 2
        },
        "2": {
          desc: "Destination exclusivement professionnelle : cabinet infirmier lib\xE9ral."
        },
        "3": {
          desc: "Dur\xE9e de 6 ans \u2014 dates de prise d\u2019effet et d\u2019expiration.",
          editStep: 3
        },
        "4": {
          desc: "Cong\xE9 du Preneur, non-renouvellement par le Bailleur et r\xE9siliation amiable."
        },
        "5": {
          desc: "Loyer mensuel, TVA \xE9ventuelle et modalit\xE9s de paiement.",
          editStep: 4
        },
        "6": { desc: "R\xE9vision annuelle du loyer selon l\u2019indice ILAT." },
        "7": {
          desc: "Charges, taxes et provision mensuelle.",
          editStep: 5
        },
        "8": {
          desc: "D\xE9p\xF4t de garantie vers\xE9 \xE0 la signature.",
          editStep: 5
        },
        "9": { desc: "\xC9tats des lieux d\u2019entr\xE9e et de sortie." },
        "10": { desc: "Obligations du Bailleur." },
        "11": { desc: "Obligations du Preneur." },
        "12": { desc: "Accessibilit\xE9, am\xE9nagements et conformit\xE9 professionnelle." },
        "13": { desc: "Gestion des d\xE9chets professionnels, notamment DASRI." },
        "14": { desc: "Plaque professionnelle." },
        "15": { desc: "Assurances \xE0 souscrire et maintenir." },
        "16": { desc: "Cession du bail." },
        "17": {
          desc: "Sous-location, remplacement, collaboration et partage de locaux.",
          editStep: 6
        },
        "18": {
          desc: "Droit de pr\xE9f\xE9rence en cas de vente des locaux.",
          editStep: 7
        },
        "19": { desc: "Clause r\xE9solutoire." },
        "20": { desc: "Int\xE9r\xEAts de retard et indemnit\xE9s d\u2019occupation." },
        "21": { desc: "Diagnostics et informations remis au Preneur." },
        "22": { desc: "Confidentialit\xE9 et secret professionnel." },
        "23": { desc: "Restitution des locaux en fin de bail." },
        "24": { desc: "\xC9lection de domicile." }
      };
    }
  });

  // js/contract/avocate-comments.js
  function normalizeText(s) {
    return String(s || "").replace(/\u2019/g, "'").replace(/\u2018/g, "'").replace(/\u00a0/g, " ");
  }
  function getCommentsForArticleSection(section) {
    if (!section || section.isPreamble) return [];
    const keyMatch = String(section.heading || "").match(/Article\s+(\d+(?:\.\d+)?)(?:er|re)?\b/i);
    const key = keyMatch ? keyMatch[1] : null;
    if (!key) return [];
    const fullText = normalizeText(
      (section.heading || "") + "\n" + (section.lines || []).join("\n")
    );
    return AVOCATE_COMMENTS.filter(function(c) {
      if (c.articleKey !== key) return false;
      if (!c.match) return true;
      return c.match.test(fullText) || c.match.test(normalizeText(section.heading || ""));
    });
  }
  function findCommentsMatchingLine(line) {
    const text = normalizeText(line);
    if (!text.trim()) return [];
    return AVOCATE_COMMENTS.filter(function(c) {
      return c.match && c.match.test(text);
    });
  }
  var AVOCATE_COMMENTS;
  var init_avocate_comments = __esm({
    "js/contract/avocate-comments.js"() {
      AVOCATE_COMMENTS = [
        {
          id: "bilan-annuel",
          articleKey: "1",
          match: /bilan relatif à l'exécution du présent contrat/i,
          comment: "L'Ordre des infirmiers souligne l'importance de r\xE9aliser un bilan annuel de la collaboration. Ce temps d'\xE9change permet aux parties de faire le point sur les conditions d'ex\xE9cution du contrat, d'identifier les \xE9ventuels ajustements n\xE9cessaires et de pr\xE9server l'\xE9quilibre de la relation lib\xE9rale.\n\nEn cas d'\xE9volution des modalit\xE9s de collaboration, il convient de formaliser toute modification par un avenant \xE9crit, sign\xE9 par les parties, puis transmis \xE0 l'Ordre des infirmiers."
        },
        {
          id: "patientele-moyens",
          articleKey: "2",
          apercuThemeId: "patientele",
          questionnaireStep: 2,
          match: /réserver au Collaborateur un minimum/i,
          comment: "Ces pr\xE9cisions rev\xEAtent une importance particuli\xE8re. La jurisprudence rappelle en effet qu'il ne suffit pas d'affirmer, de mani\xE8re g\xE9n\xE9rale, l'ind\xE9pendance du collaborateur : le contrat doit \xE9galement pr\xE9voir, de fa\xE7on concr\xE8te, les conditions lui permettant de d\xE9velopper sa patient\xE8le personnelle.\n\nIl est donc recommand\xE9 de d\xE9finir clairement le temps et les moyens mis \xE0 sa disposition \xE0 cette fin. Un engagement r\xE9el, identifiable et suffisamment pr\xE9cis permet de s\xE9curiser la collaboration et de pr\xE9server l'\xE9quilibre de la relation lib\xE9rale."
        },
        {
          id: "planning-subordination",
          articleKey: "3",
          apercuThemeId: "organisation",
          questionnaireStep: 3,
          match: /ne pas gérer unilatéralement le planning, les congés ou les tournées/i,
          comment: "En pratique, lorsque le planning, les cong\xE9s ou les tourn\xE9es sont d\xE9termin\xE9s de mani\xE8re unilat\xE9rale par le titulaire, cette organisation peut \xEAtre regard\xE9e comme un indice d'un lien de subordination. Elle est alors susceptible de fragiliser la qualification lib\xE9rale de la relation et d'entra\xEEner, le cas \xE9ch\xE9ant, une requalification en contrat de travail.\n\nIl est donc recommand\xE9 de pr\xE9voir une organisation concert\xE9e, respectueuse de l'autonomie professionnelle du collaborateur, afin de s\xE9curiser la collaboration et de pr\xE9server son caract\xE8re lib\xE9ral."
        },
        {
          id: "recensement-conjoint",
          articleKey: "4",
          match: /procèdent annuellement et conjointement à un recensement de leur patientèle/i,
          comment: "Cette pr\xE9cision permet de rappeler que le recensement de la patient\xE8le est une d\xE9marche commune, qui repose sur la coop\xE9ration des deux parties.\n\nLa jurisprudence a d\xE9j\xE0 pu souligner que cette obligation ne pesait pas uniquement sur le collaborateur, mais devait \xEAtre mise en \u0153uvre conjointement. En l'absence de preuve d'un manquement imputable \xE0 une seule partie, les demandes de r\xE9solution du contrat peuvent \xEAtre rejet\xE9es.\n\nEn pratique, il est donc recommand\xE9 d'organiser ce recensement de mani\xE8re r\xE9guli\xE8re, transparente et concert\xE9e, afin de s\xE9curiser la collaboration et d'\xE9viter les difficult\xE9s en fin de contrat."
        },
        {
          id: "synthese-facturation",
          articleKey: "6",
          apercuThemeId: "forfaits",
          questionnaireStep: 6,
          match: /synthèse issue du logiciel de facturation est annexée au présent contrat chaque mois/i,
          comment: "Cette annexe est utile pour s\xE9curiser la collaboration et faciliter la transparence entre les parties. Le commentaire de l'Ordre recommande en effet de pr\xE9voir un document permettant d'identifier clairement les modalit\xE9s de facturation, de r\xE9partition et de reversement des forfaits.\n\nLa jurisprudence rappelle \xE9galement l'importance de conserver des \xE9l\xE9ments comptables clairs et exploitables. \xC0 d\xE9faut de justificatifs suffisants, les demandes de redevance ou de r\xE9gularisation compl\xE9mentaire peuvent \xEAtre rejet\xE9es.\n\nEn pratique, il est donc pr\xE9f\xE9rable d'annexer au contrat une synth\xE8se issue du logiciel de facturation et de l'actualiser \xE0 chaque changement d'organisation ou de planning."
        },
        {
          id: "redevance-suspension",
          articleKey: "7",
          apercuThemeId: "redevance",
          questionnaireStep: 8,
          match: /impossibilité d'accéder aux locaux du fait du Titulaire/i,
          comment: "Cette pr\xE9cision permet de s\xE9curiser les relations entre les parties, notamment en fin de contrat.\n\nLa jurisprudence a d\xE9j\xE0 rappel\xE9 qu'un titulaire ne peut pas r\xE9clamer une redevance compl\xE9mentaire lorsque le collaborateur a \xE9t\xE9 priv\xE9 d'acc\xE8s aux locaux pendant la p\xE9riode de pr\xE9avis. Dans un arr\xEAt du 16 mai 2017, la cour d'appel d'Aix-en-Provence a ainsi rejet\xE9 une telle demande.\n\nPar ailleurs, le commentaire de l'Ordre recommande de pr\xE9voir une redevance proportionn\xE9e au temps de pr\xE9sence effectif du collaborateur. La proratisation permet donc d'assurer une r\xE9partition plus juste des charges et de limiter les risques de contestation."
        },
        {
          id: "assurance-locaux",
          articleKey: "9",
          match: /attestation d'assurance couvrant les locaux mis à sa disposition/i,
          comment: "Cette pr\xE9cision permet de clarifier les assurances de chacun. Le Collaborateur doit \xEAtre couvert pour sa responsabilit\xE9 professionnelle, c'est-\xE0-dire pour les actes qu'il r\xE9alise dans le cadre de son activit\xE9. De son c\xF4t\xE9, le Titulaire doit pouvoir justifier que les locaux mis \xE0 disposition sont bien assur\xE9s.\n\nEn pratique, annexer les attestations d'assurance au contrat permet d'\xE9viter les incertitudes en cas de sinistre ou de difficult\xE9 li\xE9e \xE0 l'utilisation des locaux."
        },
        {
          id: "planning-conges",
          articleKey: "10",
          match: /fixation des dates et durées des congés, sont déterminées d'un commun accord/i,
          comment: "Cette clause vise \xE0 pr\xE9server l'\xE9quilibre de la collaboration lib\xE9rale. Le planning, les cong\xE9s et les absences doivent \xEAtre organis\xE9s d'un commun accord, afin de respecter l'ind\xE9pendance de chacun et d'\xE9viter toute situation pouvant \xEAtre interpr\xE9t\xE9e comme un lien de subordination.\n\nEn effet, une fixation unilat\xE9rale des cong\xE9s peut constituer un indice de subordination. La cour d'appel de Pau l'a notamment retenu en 2015.\n\nLa clause permet \xE9galement d'assurer la continuit\xE9 des soins. La cour d'appel de Poitiers, dans un arr\xEAt du 28 f\xE9vrier 2023, a valid\xE9 le principe selon lequel l'organisation des cong\xE9s peut pr\xE9voir que le cabinet ne soit pas simultan\xE9ment d\xE9sert\xE9 par les professionnels."
        },
        {
          id: "arret-maladie",
          articleKey: "12",
          match: /En cas de maladie, le Collaborateur organise, dans la mesure du possible, son remplacement/i,
          comment: "Cette clause permet d'organiser concr\xE8tement la continuit\xE9 des soins pendant l'absence du Collaborateur, en pr\xE9voyant la recherche d'un rempla\xE7ant et, si n\xE9cessaire, l'aide du Titulaire dans cette d\xE9marche.\n\nElle prot\xE8ge \xE9galement le Collaborateur pendant son arr\xEAt maladie."
        },
        {
          id: "duree-determinee",
          articleKey: "14",
          apercuThemeId: "duree",
          questionnaireStep: 9,
          showWhen: function(ctx) {
            return ctx && ctx.dureeType === "determinee";
          },
          match: /présent contrat est conclu à compter du/i,
          comment: "Attention : Sauf situation exceptionnelle d\xFBment justifi\xE9e par les parties, notamment en cas de longue maladie, d'hospitalisation ou de circonstances particuli\xE8res, la dur\xE9e du contrat ne peut \xEAtre inf\xE9rieure \xE0 six mois."
        },
        {
          id: "duree-indeterminee",
          articleKey: "14",
          apercuThemeId: "duree",
          questionnaireStep: 9,
          showWhen: function(ctx) {
            return ctx && ctx.dureeType === "indeterminee";
          },
          match: /présent contrat est conclu pour une durée indéterminée/i,
          comment: "Cette clause permet de clarifier d\xE8s le d\xE9part la dur\xE9e de la collaboration : soit pour une dur\xE9e d\xE9termin\xE9e, soit pour une dur\xE9e ind\xE9termin\xE9e.\n\nLorsque le contrat est conclu pour une dur\xE9e d\xE9termin\xE9e, il est important d'\xE9viter les contrats trop courts. Le commentaire de l'Ordre rappelle en effet qu'une dur\xE9e inf\xE9rieure \xE0 six mois ne correspond pas, sauf situation exceptionnelle, \xE0 l'esprit de la collaboration lib\xE9rale et peut fragiliser le contrat.\n\nPour les contrats \xE0 dur\xE9e ind\xE9termin\xE9e, il est utile de pr\xE9voir un point r\xE9gulier entre les parties. Ce r\xE9examen permet d'adapter le contrat \xE0 l'\xE9volution de la collaboration, notamment en ce qui concerne les conditions d'exercice, la patient\xE8le, les moyens mis \xE0 disposition, la r\xE9mun\xE9ration ou encore la redevance."
        },
        {
          id: "periode-essai",
          articleKey: "15",
          apercuThemeId: "duree",
          match: /PÉRIODE D['\u2019]ESSAI/i,
          comment: "Cette clause permet de clarifier les conditions dans lesquelles il peut \xEAtre mis fin \xE0 la collaboration pendant la p\xE9riode d'essai."
        },
        {
          id: "fin-contrat-preavis",
          articleKey: "16",
          apercuThemeId: "duree",
          match: /FIN DE CONTRAT ET PRÉAVIS/i,
          comment: "Cette clause permet d'encadrer clairement les conditions de fin de la collaboration, afin que chaque partie connaisse les d\xE9marches \xE0 respecter, notamment le d\xE9lai de pr\xE9avis et la forme de la notification.\n\nDe mani\xE8re g\xE9n\xE9rale, le droit de mettre fin au contrat doit \xEAtre exerc\xE9 de bonne foi. La jurisprudence a d\xE9j\xE0 admis qu'une r\xE9siliation pouvait \xEAtre abusive lorsqu'elle \xE9tait utilis\xE9e pour priver le Collaborateur de droits pr\xE9vus au contrat, notamment un droit de priorit\xE9. Dans ce cas, une indemnisation peut \xEAtre accord\xE9e au titre de la perte de chance."
        },
        {
          id: "non-concurrence",
          articleKey: "19",
          match: /ne pas s'installer, directement ou indirectement, à titre libéral, pendant une durée de 12/i,
          comment: "Les rayons de 6 \xE0 10 km ou exclusion d'une commune sont fr\xE9quemment admis. C'est pourquoi nous proposons de retenir 10 km. 20 km peuvent \xEAtre jug\xE9s licites en zone rurale ; un p\xE9rim\xE8tre couvrant de facto toute une ville moyenne peut \xEAtre sanctionn\xE9.\n\nNous vous recommandons 1 an pour maximiser les chances de validit\xE9 de la clause en cas de litige. En effet, si deux ans sont qualifi\xE9s de dur\xE9e habituellement retenue et largement valid\xE9s, ce n'est pas toujours le cas. Trois ans et plus peuvent \xEAtre admis rarement selon le contexte."
        }
      ];
    }
  });

  // js/contract/pdf-debug.js
  function pdfLog(message, detail) {
    if (detail !== void 0) {
      console.log(PREFIX, message, detail);
    } else {
      console.log(PREFIX, message);
    }
  }
  function pdfWarn(message, detail) {
    if (detail !== void 0) {
      console.warn(PREFIX, message, detail);
    } else {
      console.warn(PREFIX, message);
    }
  }
  function pdfError(message, detail) {
    if (detail !== void 0) {
      console.error(PREFIX, message, detail);
    } else {
      console.error(PREFIX, message);
    }
  }
  var PREFIX;
  var init_pdf_debug = __esm({
    "js/contract/pdf-debug.js"() {
      PREFIX = "[MedLex PDF]";
    }
  });

  // js/contract/assets.js
  function medlexAssetUrl(pathFromRoot) {
    if (typeof window !== "undefined" && window.location && window.location.href) {
      try {
        var inParcours = /\/parcours\//.test(window.location.pathname);
        var rel = (inParcours ? "../" : "./") + pathFromRoot;
        return new URL(rel, window.location.href).href;
      } catch {
      }
    }
    return "./" + pathFromRoot;
  }
  var init_assets = __esm({
    "js/contract/assets.js"() {
    }
  });

  // js/contract/pdf-theme.js
  function isFileProtocol() {
    return typeof window !== "undefined" && window.location && window.location.protocol === "file:";
  }
  function getLocalFontUrl(filename) {
    return medlexAssetUrl("fonts/" + filename);
  }
  function getFontUrls(filename) {
    return [
      getLocalFontUrl(filename),
      "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/" + filename
    ];
  }
  function fetchFontAsBase64(url) {
    return new Promise(function(resolve, reject) {
      const timer = window.setTimeout(function() {
        reject(new Error("D\xE9lai d\xE9pass\xE9 pour la police"));
      }, FONT_TIMEOUT_MS);
      pdfLog("Chargement police\u2026", url);
      fetch(url, { cache: "force-cache" }).then(function(res) {
        if (!res.ok) {
          throw new Error("Police introuvable (" + res.status + ") : " + url);
        }
        return res.arrayBuffer();
      }).then(function(buf) {
        window.clearTimeout(timer);
        pdfLog("Police charg\xE9e", { url, octets: buf.byteLength });
        const bytes = new Uint8Array(buf);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        resolve(btoa(binary));
      }).catch(function(err) {
        window.clearTimeout(timer);
        pdfWarn("\xC9chec chargement police", { url, erreur: err.message || err });
        reject(err);
      });
    });
  }
  async function fetchFontWithFallback(filename) {
    const urls = getFontUrls(filename);
    let lastErr = null;
    for (let i = 0; i < urls.length; i++) {
      try {
        return await fetchFontAsBase64(urls[i]);
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error("Police introuvable : " + filename);
  }
  function applyInterFontsIfCached(pdf) {
    if (!interFontsCache) {
      pdfLog("Inter non en cache \u2192 Helvetica");
      return false;
    }
    pdf.addFileToVFS("Inter-Regular.ttf", interFontsCache.regular);
    pdf.addFileToVFS("Inter-Bold.ttf", interFontsCache.bold);
    pdf.addFont("Inter-Regular.ttf", "Inter", "normal");
    pdf.addFont("Inter-Bold.ttf", "Inter", "bold");
    pdfLog("Police Inter appliqu\xE9e au document");
    return true;
  }
  async function registerInterFonts(pdf) {
    if (isFileProtocol()) {
      pdfLog("Protocole file:// \u2014 police Inter ignor\xE9e (Helvetica). Ouvrez le site via http://localhost pour Inter.");
      return false;
    }
    if (interFontsCache) {
      pdfLog("Inter d\xE9j\xE0 en cache");
      return applyInterFontsIfCached(pdf);
    }
    pdfLog("Chargement Inter (local puis CDN)\u2026");
    try {
      const [regular, bold] = await Promise.all([
        fetchFontWithFallback(FONT_SOURCES.regular),
        fetchFontWithFallback(FONT_SOURCES.bold)
      ]);
      interFontsCache = { regular, bold };
      pdfLog("Inter enregistr\xE9e avec succ\xE8s");
      return applyInterFontsIfCached(pdf);
    } catch (e) {
      pdfWarn("Inter indisponible, repli Helvetica", e);
      return false;
    }
  }
  function isArticleHeading(text) {
    return /^(Article|ARTICLE)\s+\d+/i.test(String(text || "").trim());
  }
  function interFontsReady() {
    return interFontsCache !== null;
  }
  var PDF_THEME, PDF_TYPO, FONT_TIMEOUT_MS, FONT_SOURCES, interFontsCache;
  var init_pdf_theme = __esm({
    "js/contract/pdf-theme.js"() {
      init_pdf_debug();
      init_assets();
      PDF_THEME = {
        ink: [22, 49, 77],
        muted: [95, 107, 122],
        teal: [15, 163, 163],
        gray: [232, 237, 241],
        white: [255, 255, 255]
      };
      PDF_TYPO = {
        brand: 11,
        title: 12,
        subtitle: 9,
        body: 10,
        article: 10.5,
        tocHeading: 11,
        tocHeadingLineHeight: 5.5,
        tocTitle: 9.5,
        tocAvocate: 8,
        tocAvocateLineHeight: 4.2,
        bodyLineHeight: 5.8,
        tocTitleLineHeight: 5,
        tocDescLineHeight: 4.6,
        titleLineHeight: 6.5,
        subtitleLineHeight: 4.8,
        articleLineHeight: 6,
        blockGap: 2.8
      };
      FONT_TIMEOUT_MS = 8e3;
      FONT_SOURCES = {
        regular: "inter-latin-400-normal.ttf",
        bold: "inter-latin-700-normal.ttf"
      };
      interFontsCache = null;
    }
  });

  // js/contract/pdf-export.js
  var pdf_export_exports = {};
  __export(pdf_export_exports, {
    downloadContractPdf: () => downloadContractPdf,
    downloadContractPdfNow: () => downloadContractPdfNow,
    ensurePdfEngineReady: () => ensurePdfEngineReady,
    isPdfEngineReady: () => isPdfEngineReady,
    preloadPdfEngine: () => preloadPdfEngine
  });
  function getJsPdfScriptUrl() {
    return medlexAssetUrl("vendor/jspdf.umd.min.js");
  }
  function waitForJsPdf(maxMs) {
    const deadline = Date.now() + (maxMs || 12e3);
    return new Promise(function(resolve, reject) {
      function tick() {
        if (jsPdfAvailable()) {
          pdfLog("jsPDF d\xE9tect\xE9 apr\xE8s attente");
          resolve();
          return;
        }
        if (Date.now() >= deadline) {
          reject(
            new Error(
              "jsPDF introuvable apr\xE8s " + maxMs + " ms \u2014 v\xE9rifiez que jspdf.umd.min.js est bien charg\xE9."
            )
          );
          return;
        }
        window.setTimeout(tick, 50);
      }
      tick();
    });
  }
  function jsPdfAvailable() {
    return Boolean(window.jspdf && window.jspdf.jsPDF);
  }
  function loadJsPdf() {
    if (jsPdfAvailable()) {
      pdfLog("jsPDF d\xE9j\xE0 disponible", { jspdf: typeof window.jspdf });
      return Promise.resolve();
    }
    const scriptUrl = getJsPdfScriptUrl();
    pdfLog("Chargement jsPDF\u2026", scriptUrl);
    const existing = document.querySelector('script[data-medlex-jspdf="1"]') || document.querySelector('script[data-medlex-html2pdf="1"]');
    if (existing) {
      pdfLog("Balise script jsPDF d\xE9j\xE0 pr\xE9sente", { src: existing.src });
      return waitForJsPdf(12e3);
    }
    return new Promise(function(resolve, reject) {
      const s = document.createElement("script");
      s.src = scriptUrl;
      s.async = false;
      s.setAttribute("data-medlex-jspdf", "1");
      s.onload = function() {
        waitForJsPdf(3e3).then(resolve).catch(reject);
      };
      s.onerror = function() {
        pdfError("Script jsPDF introuvable", s.src);
        reject(new Error("Impossible de charger jsPDF : " + s.src));
      };
      document.head.appendChild(s);
    });
  }
  async function preloadPdfEngine() {
    pdfLog("\u2500\u2500 Pr\xE9chargement moteur PDF \u2500\u2500");
    const t0 = performance.now();
    try {
      await loadJsPdf();
      if (!jsPdfAvailable()) {
        throw new Error("jsPDF indisponible apr\xE8s chargement");
      }
      const pdf = new window.jspdf.jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      let hasInter = false;
      try {
        hasInter = await registerInterFonts(pdf);
      } catch (fontErr) {
        pdfWarn("Polices Inter ignor\xE9es, Helvetica sera utilis\xE9e", fontErr);
      }
      engineReady = true;
      pdfLog("Moteur PDF pr\xEAt", {
        dureeMs: Math.round(performance.now() - t0),
        inter: hasInter,
        engineReady
      });
    } catch (e) {
      engineReady = false;
      pdfError("\xC9chec pr\xE9chargement moteur PDF", e);
      throw e;
    }
  }
  function ensurePdfEngineReady() {
    if (engineReady && jsPdfAvailable()) {
      return Promise.resolve();
    }
    return preloadPdfEngine();
  }
  function isPdfEngineReady() {
    const ready = engineReady && jsPdfAvailable();
    pdfLog("isPdfEngineReady()", {
      ready,
      engineReady,
      jsPdf: jsPdfAvailable(),
      inter: interFontsReady()
    });
    return ready;
  }
  function buildRootFromHtml(title, subtitle, bodyHtml) {
    const root = document.createElement("div");
    if (title) {
      const h = document.createElement("p");
      h.className = "ac-contract-doc__title";
      h.textContent = title;
      root.appendChild(h);
    }
    if (subtitle) {
      const sub = document.createElement("p");
      sub.className = "ac-contract-doc__subtitle";
      sub.textContent = subtitle;
      root.appendChild(sub);
    }
    const body = document.createElement("div");
    body.className = "ac-contract-doc__body";
    body.innerHTML = bodyHtml;
    root.appendChild(body);
    return root;
  }
  function collectPdfBlocks(root) {
    const blocks = [];
    const titleEl = root.querySelector(".ac-contract-doc__title, .medlex-pdf-root__title");
    if (titleEl && titleEl.innerText.trim()) {
      blocks.push({ type: "title", text: titleEl.innerText.trim() });
    }
    const subEl = root.querySelector(".ac-contract-doc__subtitle, .medlex-pdf-root__subtitle");
    if (subEl && subEl.innerText.trim()) {
      blocks.push({ type: "subtitle", text: subEl.innerText.trim() });
    }
    const body = root.querySelector(".ac-contract-doc__body, .medlex-pdf-root__body");
    if (body) {
      body.childNodes.forEach(function(node) {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.tagName === "P") {
          blocks.push({ type: "paragraph", el: node });
        } else if (node.tagName === "BR") {
          blocks.push({ type: "spacer" });
        }
      });
    }
    return blocks;
  }
  function getWordsFromParagraph(p) {
    const words = [];
    function walk(node, bold) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        text.split(/\s+/).filter(Boolean).forEach(function(part) {
          words.push({ text: part, bold });
        });
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      if (node.tagName === "STRONG" || node.tagName === "B") {
        node.childNodes.forEach(function(child) {
          walk(child, true);
        });
        return;
      }
      node.childNodes.forEach(function(child) {
        walk(child, bold);
      });
    }
    p.childNodes.forEach(function(child) {
      walk(child, false);
    });
    return words;
  }
  function buildPdfBlob(root, filename, pdfMeta) {
    const JsPDF = window.jspdf && window.jspdf.jsPDF;
    if (!JsPDF) {
      throw new Error("jsPDF indisponible");
    }
    const blocks = collectPdfBlocks(root);
    pdfLog("G\xE9n\xE9ration du blob PDF\u2026", {
      filename,
      blocs: blocks.length,
      paragraphes: blocks.filter(function(b) {
        return b.type === "paragraph";
      }).length
    });
    const opts = html2PdfOptions({}, filename);
    const margins = opts.margin || [18, 18, 18, 18];
    const marginTop = margins[0];
    const marginRight = margins[1];
    const marginBottom = margins[2];
    const marginLeft = margins[3];
    const pdf = new JsPDF(opts.jsPDF);
    const hasInter = applyInterFontsIfCached(pdf);
    const fontFamily = hasInter ? "Inter" : "helvetica";
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const maxWidth = pageWidth - marginLeft - marginRight;
    const ctx = {
      pdf,
      fontFamily,
      marginLeft,
      marginRight,
      marginTop,
      marginBottom,
      pageWidth,
      pageHeight,
      maxWidth,
      bodyFontSize: PDF_TYPO.body,
      bodyLineHeight: PDF_TYPO.bodyLineHeight,
      y: marginTop
    };
    function setFont(style, size) {
      pdf.setFont(fontFamily, style);
      pdf.setFontSize(size);
    }
    function newPageIfNeeded(lineH) {
      if (ctx.y + lineH > pageHeight - marginBottom) {
        pdf.addPage();
        ctx.y = marginTop;
      }
    }
    function drawBrandHeader() {
      const headerY = 12;
      pdf.setFillColor(PDF_THEME.teal[0], PDF_THEME.teal[1], PDF_THEME.teal[2]);
      pdf.circle(marginLeft + 1.4, headerY, 1.1, "F");
      setFont("bold", PDF_TYPO.brand);
      pdf.setTextColor(PDF_THEME.ink[0], PDF_THEME.ink[1], PDF_THEME.ink[2]);
      pdf.text("MedLex", marginLeft + 4.5, headerY + 1.1);
      pdf.setDrawColor(PDF_THEME.gray[0], PDF_THEME.gray[1], PDF_THEME.gray[2]);
      pdf.setLineWidth(0.35);
      pdf.line(marginLeft, headerY + 5, pageWidth - marginRight, headerY + 5);
      ctx.y = headerY + 11;
    }
    function drawSectionSeparator() {
      ctx.y += 1;
      pdf.setDrawColor(PDF_THEME.gray[0], PDF_THEME.gray[1], PDF_THEME.gray[2]);
      pdf.setLineWidth(0.25);
      pdf.line(marginLeft, ctx.y, pageWidth - marginRight, ctx.y);
      ctx.y += 3;
    }
    function drawTocDescWithPage(desc, pageNum) {
      const fontSize = PDF_TYPO.tocDesc;
      const lh = PDF_TYPO.tocDescLineHeight;
      const pageLabel = "p. " + pageNum;
      setFont("normal", fontSize);
      pdf.setTextColor(PDF_THEME.muted[0], PDF_THEME.muted[1], PDF_THEME.muted[2]);
      const pageW = pdf.getTextWidth(pageLabel);
      const dotW = pdf.getTextWidth(".");
      const rightEdge = pageWidth - marginRight;
      const pageX = rightEdge - pageW;
      const leaderReserve = 12 + pageW;
      const wrapW = Math.max(maxWidth * 0.45, maxWidth - leaderReserve);
      const lines = pdf.splitTextToSize(String(desc || ""), wrapW);
      if (!lines.length) lines.push("");
      lines.forEach(function(line, lineIndex) {
        newPageIfNeeded(lh);
        const isLast = lineIndex === lines.length - 1;
        if (!isLast) {
          pdf.text(line, marginLeft, ctx.y);
        } else {
          pdf.text(line, marginLeft, ctx.y);
          let x = marginLeft + pdf.getTextWidth(line) + 2;
          const dotsEnd = pageX - 1;
          while (x + dotW < dotsEnd) {
            pdf.text(".", x, ctx.y);
            x += dotW;
          }
          pdf.text(pageLabel, pageX, ctx.y);
        }
        ctx.y += lh;
      });
    }
    function drawTocAtEnd(entries, sectionPages) {
      pdf.addPage();
      ctx.y = marginTop;
      writeWrapped("Sommaire", {
        fontSize: PDF_TYPO.tocHeading,
        bold: true,
        color: PDF_THEME.ink,
        lineHeight: PDF_TYPO.tocHeadingLineHeight
      });
      ctx.y += 3;
      entries.forEach(function(entry, index) {
        if (entry.isPreamble) return;
        const pageNum = sectionPages[index];
        if (!pageNum) return;
        newPageIfNeeded(PDF_TYPO.tocTitleLineHeight + PDF_TYPO.tocDescLineHeight * 2);
        writeWrapped(entry.shortLabel + " \u2014 " + entry.tocTitle, {
          fontSize: PDF_TYPO.tocTitle,
          bold: true,
          color: PDF_THEME.ink,
          lineHeight: PDF_TYPO.tocTitleLineHeight
        });
        ctx.y += 0.4;
        drawTocDescWithPage(entry.desc, pageNum);
        ctx.y += 1.8;
      });
    }
    function drawSectionGuide(entry) {
      if (entry.avocateNotes && entry.avocateNotes.length) {
        entry.avocateNotes.forEach(function(noteText) {
          drawAvocateComment(noteText);
        });
      }
    }
    function alignBodyBlocksToSections(bodyBlocks2, sections) {
      const groups = sections.map(function(section) {
        return {
          isPreamble: !!section.isPreamble,
          heading: section.heading,
          blocks: []
        };
      });
      if (!groups.length) return [];
      let idx = 0;
      bodyBlocks2.forEach(function(block) {
        if (block.type === "paragraph") {
          const plain = block.el.innerText.trim();
          if (isArticleHeading(plain)) {
            if (groups[idx] && groups[idx].isPreamble) {
              idx = 1;
            } else {
              idx += 1;
            }
            if (idx >= groups.length) {
              idx = groups.length - 1;
            }
            groups[idx].blocks.push({
              type: "paragraph",
              el: block.el,
              isHeading: true
            });
            return;
          }
        }
        if (groups[idx]) {
          groups[idx].blocks.push(block);
        }
      });
      return groups;
    }
    function renderBodyBlocks(bodyBlocks2, options) {
      const skipInlineComments = options && options.skipInlineComments;
      const recordPageForSection = options && options.recordPageForSection;
      const drawnComments = {};
      bodyBlocks2.forEach(function(block) {
        if (block.type === "spacer") {
          ctx.y += PDF_TYPO.blockGap;
        } else if (block.type === "paragraph") {
          const plain = block.el.innerText.trim();
          if (!plain) {
            ctx.y += PDF_TYPO.blockGap;
            return;
          }
          if (isArticleHeading(plain)) {
            if (recordPageForSection) {
              recordPageForSection();
            }
            if (!block.isHeading) {
              ctx.y += 3;
            }
            writeWrapped(plain, {
              fontSize: PDF_TYPO.article,
              bold: true,
              color: PDF_THEME.ink,
              lineHeight: PDF_TYPO.articleLineHeight
            });
            ctx.y += block.isHeading ? 1 : 2;
            if (!skipInlineComments) {
              findCommentsMatchingLine(plain).forEach(function(note) {
                if (drawnComments[note.id]) return;
                drawnComments[note.id] = true;
                drawAvocateComment(note.comment);
              });
            }
            return;
          }
          const hasBold = block.el.querySelector("strong, b");
          if (hasBold) {
            writeRichParagraph(block.el);
          } else {
            writeWrapped(plain, {
              fontSize: PDF_TYPO.body,
              color: PDF_THEME.muted,
              lineHeight: PDF_TYPO.bodyLineHeight
            });
          }
          ctx.y += 1.2;
          if (!skipInlineComments) {
            findCommentsMatchingLine(plain).forEach(function(note) {
              if (drawnComments[note.id]) return;
              drawnComments[note.id] = true;
              drawAvocateComment(note.comment);
            });
          }
        }
      });
    }
    function renderProgressiveContract(tocEntries2, sectionGroups, sectionPages) {
      let nextTocIndex = 1;
      function recordArticlePage() {
        sectionPages[nextTocIndex] = pdf.internal.getNumberOfPages();
        nextTocIndex += 1;
      }
      sectionGroups.forEach(function(group, index) {
        const entry = tocEntries2[index] || {
          shortLabel: group.isPreamble ? "Intro" : "Art.",
          title: group.heading,
          tocTitle: String(group.heading || "").toUpperCase(),
          desc: "",
          isPreamble: group.isPreamble,
          avocateNotes: []
        };
        if (index > 0) {
          newPageIfNeeded(PDF_TYPO.tocTitleLineHeight * 4);
          drawSectionSeparator();
        } else {
          ctx.y += 2;
        }
        drawSectionGuide(entry);
        renderBodyBlocks(group.blocks, {
          skipInlineComments: true,
          recordPageForSection: group.isPreamble ? null : recordArticlePage
        });
      });
    }
    function drawAvocateComment(commentText) {
      if (!commentText) return;
      ctx.y += 1.5;
      const boxTop = ctx.y - 1;
      writeWrapped("Me Violaine \u2014 Commentaire", {
        fontSize: PDF_TYPO.tocAvocate,
        bold: true,
        color: PDF_THEME.teal,
        lineHeight: PDF_TYPO.tocAvocateLineHeight
      });
      String(commentText).split(/\n\n+/).filter(Boolean).forEach(function(para) {
        writeWrapped(para.trim(), {
          fontSize: PDF_TYPO.tocAvocate,
          color: PDF_THEME.muted,
          lineHeight: PDF_TYPO.tocAvocateLineHeight
        });
      });
      ctx.y += 1;
      pdf.setDrawColor(PDF_THEME.teal[0], PDF_THEME.teal[1], PDF_THEME.teal[2]);
      pdf.setLineWidth(0.6);
      pdf.line(marginLeft, boxTop, marginLeft, ctx.y - 0.5);
      ctx.y += 1.5;
    }
    function measureWord(word, bold, fontSize) {
      setFont(bold ? "bold" : "normal", fontSize);
      return pdf.getTextWidth(word);
    }
    function writeWrapped(text, options) {
      const fontSize = options.fontSize || PDF_TYPO.body;
      const style = options.bold ? "bold" : "normal";
      const color = options.color || PDF_THEME.muted;
      const align = options.align || "left";
      const lh = options.lineHeight || PDF_TYPO.bodyLineHeight;
      setFont(style, fontSize);
      pdf.setTextColor(color[0], color[1], color[2]);
      const pageBreak = options.pageBreak || newPageIfNeeded;
      const lines = pdf.splitTextToSize(text, maxWidth);
      for (let i = 0; i < lines.length; i++) {
        pageBreak(lh);
        const x = align === "center" ? pageWidth / 2 : marginLeft;
        pdf.text(lines[i], x, ctx.y, { align });
        ctx.y += lh;
      }
    }
    function writeRichParagraph(p) {
      const words = getWordsFromParagraph(p);
      if (!words.length) return;
      let line = [];
      let lineWidth = 0;
      const spaceW = measureWord(" ", false, ctx.bodyFontSize);
      function flushLine() {
        if (!line.length) return;
        newPageIfNeeded(ctx.bodyLineHeight);
        let x = marginLeft;
        line.forEach(function(w, idx) {
          setFont(w.bold ? "bold" : "normal", ctx.bodyFontSize);
          const c = w.bold ? PDF_THEME.ink : PDF_THEME.muted;
          pdf.setTextColor(c[0], c[1], c[2]);
          const chunk = (idx > 0 ? " " : "") + w.text;
          pdf.text(chunk, x, ctx.y);
          x += pdf.getTextWidth(chunk);
        });
        ctx.y += ctx.bodyLineHeight;
        line = [];
        lineWidth = 0;
      }
      words.forEach(function(w) {
        const wW = measureWord(w.text, w.bold, ctx.bodyFontSize);
        const addW = line.length ? spaceW + wW : wW;
        if (line.length && lineWidth + addW > maxWidth) {
          flushLine();
        }
        line.push(w);
        lineWidth += line.length === 1 ? wW : spaceW + wW;
      });
      flushLine();
    }
    drawBrandHeader();
    const headerBlocks = blocks.filter(function(b) {
      return b.type === "title" || b.type === "subtitle";
    });
    const bodyBlocks = blocks.filter(function(b) {
      return b.type !== "title" && b.type !== "subtitle";
    });
    headerBlocks.forEach(function(block) {
      if (block.type === "title") {
        ctx.y += 2;
        writeWrapped(block.text, {
          fontSize: PDF_TYPO.title,
          bold: true,
          color: PDF_THEME.ink,
          align: "center",
          lineHeight: PDF_TYPO.titleLineHeight
        });
        ctx.y += 1.5;
      } else if (block.type === "subtitle") {
        writeWrapped(block.text, {
          fontSize: PDF_TYPO.subtitle,
          color: PDF_THEME.muted,
          align: "center",
          lineHeight: PDF_TYPO.subtitleLineHeight
        });
        ctx.y += 5;
      }
    });
    const meta = pdfMeta || {};
    let tocEntries = [];
    let useProgressive = false;
    if (meta.bodyText && meta.parcours) {
      try {
        const sections = splitSections(meta.bodyText);
        tocEntries = buildArticleSections(meta.bodyText, meta.parcours).map(function(entry, index) {
          const section = sections[index];
          const notes = section ? getCommentsForArticleSection(section) : [];
          return {
            shortLabel: entry.shortLabel,
            title: entry.title,
            tocTitle: section ? tocDisplayTitle(section) : entry.title.toUpperCase(),
            desc: entry.desc,
            isPreamble: section ? Boolean(section.isPreamble) : false,
            avocateNotes: notes.map(function(n) {
              return n.comment;
            })
          };
        });
        const sectionGroups = alignBodyBlocksToSections(bodyBlocks, sections);
        if (tocEntries.length && sectionGroups.length) {
          useProgressive = true;
          const sectionPages = [];
          pdfLog("PDF progressif", {
            sections: tocEntries.length,
            groupes: sectionGroups.length,
            parcours: meta.parcours
          });
          renderProgressiveContract(tocEntries, sectionGroups, sectionPages);
          pdfLog("Pages sommaire enregistr\xE9es", sectionPages);
          drawTocAtEnd(tocEntries, sectionPages);
        }
      } catch (tocErr) {
        pdfWarn("PDF progressif ignor\xE9", tocErr);
      }
    }
    if (!useProgressive) {
      renderBodyBlocks(bodyBlocks);
    }
    const blob = pdf.output("blob");
    pdfLog("Blob PDF g\xE9n\xE9r\xE9", {
      tailleOctets: blob ? blob.size : 0,
      type: blob ? blob.type : null,
      pages: pdf.internal.getNumberOfPages()
    });
    return blob;
  }
  function triggerBlobDownload(blob, filename) {
    if (!blob || !blob.size) {
      pdfError("Blob vide \u2014 t\xE9l\xE9chargement annul\xE9", { filename });
      throw new Error("Fichier PDF vide");
    }
    pdfLog("D\xE9clenchement t\xE9l\xE9chargement\u2026", {
      filename,
      tailleOctets: blob.size
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    pdfLog("Lien de t\xE9l\xE9chargement cliqu\xE9", { href: url.substring(0, 48) + "\u2026" });
    window.setTimeout(function() {
      URL.revokeObjectURL(url);
      if (a.parentNode) {
        a.parentNode.removeChild(a);
      }
    }, 1e3);
  }
  function resolveRoot(opts) {
    if (opts.sourceElement) {
      return { root: opts.sourceElement, tempHost: null };
    }
    if (opts.bodyHtml) {
      const root = buildRootFromHtml(opts.title || "", opts.subtitle || "", opts.bodyHtml);
      const tempHost = document.createElement("div");
      tempHost.setAttribute("aria-hidden", "true");
      tempHost.style.cssText = "position:fixed;left:-9999px;top:0;visibility:hidden;";
      tempHost.appendChild(root);
      document.body.appendChild(tempHost);
      return { root, tempHost };
    }
    throw new Error("Aucun contenu \xE0 exporter en PDF.");
  }
  function cleanupHost(tempHost) {
    if (tempHost && tempHost.parentNode) {
      tempHost.parentNode.removeChild(tempHost);
    }
  }
  function downloadContractPdfNow(opts) {
    pdfLog("\u2500\u2500 Clic t\xE9l\xE9charger (synchrone) \u2500\u2500");
    pdfLog("\xC9tat moteur", {
      engineReady,
      jsPdf: jsPdfAvailable(),
      inter: interFontsReady()
    });
    if (!jsPdfAvailable()) {
      throw new Error("Le moteur PDF n\u2019est pas pr\xEAt. R\xE9essayez dans quelques secondes.");
    }
    const filename = opts.filename || "contrat-medlex.pdf";
    const resolved = resolveRoot(opts);
    pdfLog("Source contrat", {
      filename,
      elementId: resolved.root.id || "(sans id)",
      classes: resolved.root.className,
      bodyPresent: Boolean(resolved.root.querySelector(".ac-contract-doc__body"))
    });
    const t0 = performance.now();
    try {
      const blob = buildPdfBlob(resolved.root, filename, {
        bodyText: opts.bodyText,
        parcours: opts.parcours
      });
      if (!blob) {
        throw new Error("G\xE9n\xE9ration du PDF vide");
      }
      triggerBlobDownload(blob, filename);
      pdfLog("T\xE9l\xE9chargement termin\xE9", { dureeMs: Math.round(performance.now() - t0) });
    } catch (e) {
      pdfError("Erreur downloadContractPdfNow", e);
      throw e;
    } finally {
      cleanupHost(resolved.tempHost);
    }
  }
  async function downloadContractPdf(opts) {
    if (!engineReady) {
      await preloadPdfEngine();
    }
    downloadContractPdfNow(opts);
  }
  var engineReady;
  var init_pdf_export = __esm({
    "js/contract/pdf-export.js"() {
      init_pdf_options();
      init_article_guide();
      init_avocate_comments();
      init_pdf_theme();
      init_pdf_debug();
      init_assets();
      engineReady = false;
    }
  });

  // js/contrat-page.js
  function loadScript(src) {
    return new Promise(function(resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = function() {
        resolve();
      };
      s.onerror = function() {
        reject(new Error("Script introuvable : " + src));
      };
      document.head.appendChild(s);
    });
  }
  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function currentEntry() {
    if (!window.ParcoursType) return null;
    return window.ParcoursType.entry();
  }
  function showError(message, questionnaireHref) {
    var doc = document.getElementById("contract-doc");
    var guided = document.getElementById("contract-guided");
    var toggle = document.querySelector(".ac-view-toggle");
    if (!doc) return;
    var item = currentEntry();
    var href = questionnaireHref || item && item.questionnaire || "questionnaire.html";
    var title = item && item.documentTitle || "Contrat";
    if (guided) guided.innerHTML = "";
    if (toggle) toggle.classList.add("ac-hidden");
    doc.classList.remove("ac-hidden");
    doc.innerHTML = '<p class="ac-contract-doc__title">' + escapeHtml(title) + '</p><p class="ac-microcopy" style="margin-top:1rem;color:var(--ac-ink)">' + escapeHtml(message) + '</p><p class="ac-microcopy ac-spacer-sm"><a href="' + escapeHtml(href) + '">Revenir au questionnaire</a></p>';
  }
  function renderContract(docEl, item, bodyText, answers, Contract) {
    var bodyHtml = Contract.buildContractRenderedHtml(bodyText, answers);
    var subtitle = item.subtitle ? item.subtitle(answers) : "";
    docEl.innerHTML = '<p class="ac-contract-doc__title">' + escapeHtml(item.documentTitle) + '</p><p class="ac-contract-doc__subtitle">' + escapeHtml(subtitle) + '</p><div class="ac-contract-doc__body">' + bodyHtml + "</div>";
    return { bodyText, bodyHtml };
  }
  function mountGuidedContractView(parcours, bodyText, bodyHtml) {
    if (!window.MedLexContractGuided) return;
    window.MedLexContractGuided.mount({
      bodyText,
      bodyHtml,
      parcours
    });
    window.MedLexContractGuided.initViewToggle();
  }
  function updatePageChrome(item) {
    var docEl = document.getElementById("contract-doc");
    if (docEl && item.ariaPreview) docEl.setAttribute("aria-label", item.ariaPreview);
    var pageTitle = document.querySelector(".ac-title--page");
    if (pageTitle && item.pageHeading) pageTitle.textContent = item.pageHeading;
    var micro = document.querySelector(".ac-main > .ac-microcopy");
    if (micro && item.pageLead) micro.textContent = item.pageLead;
  }
  var pdfExportModule = null;
  var pdfPreloadPromise = null;
  function preloadPdfEngine2() {
    if (pdfPreloadPromise) {
      return pdfPreloadPromise;
    }
    console.log("[MedLex PDF]", "contrat-page : d\xE9marrage pr\xE9chargement\u2026");
    pdfPreloadPromise = Promise.resolve().then(() => (init_pdf_export(), pdf_export_exports)).then(function(mod) {
      console.log("[MedLex PDF]", "contrat-page : module pdf-export import\xE9");
      pdfExportModule = mod;
      return mod.preloadPdfEngine();
    }).then(function() {
      console.log("[MedLex PDF]", "contrat-page : pr\xE9chargement termin\xE9", {
        pret: pdfExportModule && pdfExportModule.isPdfEngineReady()
      });
    }).catch(function(e) {
      pdfPreloadPromise = null;
      console.error("[MedLex PDF]", "contrat-page : \xE9chec pr\xE9chargement", e);
      throw e;
    });
    return pdfPreloadPromise;
  }
  function wirePdfDownload(pdfBtn, docEl, filename, pdfMeta) {
    if (!pdfBtn || !docEl) return;
    var meta = pdfMeta || {};
    var labelReady = "T\xE9l\xE9charger le PDF";
    pdfBtn.disabled = true;
    pdfBtn.textContent = "Pr\xE9paration du PDF\u2026";
    preloadPdfEngine2().then(function() {
      pdfBtn.disabled = false;
      pdfBtn.textContent = labelReady;
    }).catch(function() {
      pdfBtn.disabled = false;
      pdfBtn.textContent = labelReady;
    });
    pdfBtn.addEventListener("click", function() {
      var prev = pdfBtn.textContent;
      pdfBtn.disabled = true;
      pdfBtn.textContent = "T\xE9l\xE9chargement\u2026";
      console.log("[MedLex PDF]", "contrat-page : clic bouton", {
        filename,
        moduleCharge: Boolean(pdfExportModule),
        pret: pdfExportModule ? pdfExportModule.isPdfEngineReady() : false,
        contractDoc: Boolean(docEl && docEl.querySelector(".ac-contract-doc__body"))
      });
      function runDownload() {
        pdfExportModule.downloadContractPdfNow({
          filename,
          sourceElement: docEl,
          bodyText: meta.bodyText,
          parcours: meta.parcours
        });
      }
      function resetBtn() {
        pdfBtn.disabled = false;
        pdfBtn.textContent = prev || labelReady;
      }
      if (pdfExportModule && pdfExportModule.isPdfEngineReady()) {
        try {
          runDownload();
        } catch (e) {
          console.error("[MedLex PDF]", "contrat-page : erreur au clic", e);
          alert(
            e instanceof Error ? "Impossible de g\xE9n\xE9rer le PDF : " + e.message : "Impossible de g\xE9n\xE9rer le PDF."
          );
        } finally {
          resetBtn();
        }
        return;
      }
      (pdfExportModule ? pdfExportModule.ensurePdfEngineReady() : preloadPdfEngine2()).then(function() {
        if (!pdfExportModule) {
          throw new Error("Module PDF non charg\xE9.");
        }
        runDownload();
      }).catch(function(e) {
        console.error("[MedLex PDF]", "contrat-page : erreur au clic", e);
        alert(
          e instanceof Error ? "Impossible de g\xE9n\xE9rer le PDF : " + e.message : "Impossible de g\xE9n\xE9rer le PDF."
        );
      }).finally(resetBtn);
    });
  }
  async function loadContractApi(item) {
    await loadScript(item.embedded);
    var mod = await import(item.module);
    var Contract = item.defaultExport ? mod.default || window[item.contractGlobal] : window[item.contractGlobal] || mod.default;
    if (!Contract) throw new Error("Module contrat introuvable : " + item.id);
    return Contract;
  }
  async function initParcours(item, docEl, pdfBtn) {
    var snapApi = window.ParcoursType && window.ParcoursType.snapshotApi(item.id);
    var noun = item.noun || "contrat";
    function fail(message) {
      showError(message, item.questionnaire);
      if (pdfBtn) pdfBtn.disabled = true;
    }
    var snap = snapApi && snapApi.load();
    if (!snap) {
      fail("Aucune r\xE9ponse au questionnaire n\u2019a \xE9t\xE9 trouv\xE9e. Compl\xE8te le questionnaire pour g\xE9n\xE9rer ton " + noun + ".");
      return;
    }
    if (!snapApi.apply(snap)) {
      fail("Impossible de restaurer les r\xE9ponses du questionnaire.");
      return;
    }
    try {
      var Contract = await loadContractApi(item);
      var answers = item.answersFirst ? Contract.collectAnswers() : null;
      var templateRaw = item.templateUsesAnswers ? await Contract.loadTemplate(answers) : await Contract.loadTemplate();
      if (!answers) answers = Contract.collectAnswers();
      var bodyText = Contract.buildContractText(templateRaw, answers);
      var rendered = renderContract(docEl, item, bodyText, answers, Contract);
      docEl.removeAttribute("aria-busy");
      mountGuidedContractView(item.id, rendered.bodyText, rendered.bodyHtml);
      wirePdfDownload(pdfBtn, docEl, Contract.PDF_FILENAME || item.pdf, {
        bodyText: rendered.bodyText,
        parcours: item.id
      });
    } catch (e) {
      console.error(e);
      fail(e instanceof Error ? "Erreur lors de la g\xE9n\xE9ration : " + e.message : "Erreur lors de la g\xE9n\xE9ration du " + noun + ".");
    }
  }
  async function initContratPage() {
    var docEl = document.getElementById("contract-doc");
    var pdfBtn = document.getElementById("download-pdf");
    if (!docEl) return;
    var item = currentEntry();
    if (!item) return;
    updatePageChrome(item);
    await initParcours(item, docEl, pdfBtn);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initContratPage);
  } else {
    initContratPage();
  }
})();
