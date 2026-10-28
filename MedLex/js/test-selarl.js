/* Test « Devriez-vous passer en SELARL ? » — formulaire, puis une question à la fois. */
(function () {
  var QUESTIONS = [
    {
      id: "titulaire",
      label: "Êtes-vous titulaire ?",
    },
    {
      id: "horizon",
      label: "Vous reste-t-il 10 ans ou plus à exercer avant la retraite ?",
    },
    {
      id: "ca2025",
      label: "Votre dernier chiffre d’affaires 2025 est-il supérieur à 77.700 € ?",
    },
    {
      id: "ca2024",
      label: "Votre chiffre d’affaires 2024 était-il supérieur à 77.700 € ?",
    },
    {
      id: "bnc",
      label:
        "Dépensez-vous le montant total de votre BNC en dépenses personnelles (loyer personnel, courses, loisirs, sorties, etc.) ?",
    },
    {
      id: "anciennete",
      label: "Êtes-vous installé·e depuis plus de 5 ans ?",
    },
  ];

  var OPTIONS = [
    { value: "oui", label: "Oui" },
    { value: "non", label: "Non" },
    { value: "inconnu", label: "Je ne sais pas" },
  ];

  var formPanel = document.getElementById("lead-form-panel");
  var quizPanel = document.getElementById("lead-quiz-panel");
  var resultPanel = document.getElementById("lead-result-panel");
  var form = document.getElementById("lead-form");
  var formError = document.getElementById("lead-form-error");
  var questionEl = document.getElementById("lead-question");
  var choicesEl = document.getElementById("lead-choices");
  var progressLabel = document.getElementById("lead-progress-label");
  var progressFill = document.getElementById("lead-progress-fill");
  var nextBtn = document.getElementById("lead-next");
  var prevBtn = document.getElementById("lead-prev");
  var resultTitle = document.getElementById("lead-result-title");
  var resultBody = document.getElementById("lead-result-body");
  var resultExtra = document.getElementById("lead-result-extra");
  var editBtn = document.getElementById("lead-edit");

  var step = 0;
  var answers = {};

  function leadStore() {
    return window.LibéLexSelarlLead;
  }

  function show(panel) {
    formPanel.hidden = panel !== "form";
    quizPanel.hidden = panel !== "quiz";
    resultPanel.hidden = panel !== "result";
  }

  function fieldValue(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function setField(id, value) {
    var el = document.getElementById(id);
    if (el && value) el.value = value;
  }

  function digits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function markInvalid(id, invalid) {
    var el = document.getElementById(id);
    if (el) el.classList.toggle("is-invalid", invalid);
  }

  function readForm() {
    return {
      prenom: fieldValue("lead-prenom"),
      nom: fieldValue("lead-nom"),
      email: fieldValue("lead-email"),
      telephone: fieldValue("lead-telephone"),
      profession: fieldValue("lead-profession"),
    };
  }

  function validateForm() {
    var data = readForm();
    var problems = [];
    markInvalid("lead-email", !validEmail(data.email));
    markInvalid("lead-telephone", digits(data.telephone).length < 8);
    markInvalid("lead-profession", !data.profession);
    if (!validEmail(data.email)) problems.push("une adresse e-mail valide");
    if (digits(data.telephone).length < 8) problems.push("un numéro de téléphone");
    if (!data.profession) problems.push("votre profession");
    if (!problems.length) {
      formError.hidden = true;
      formError.textContent = "";
      return data;
    }
    formError.hidden = false;
    formError.textContent = "Pour accéder au test, indiquez " + problems.join(", ") + ".";
    return null;
  }

  function baseLead() {
    var existing = leadStore() ? leadStore().current() : null;
    return existing && typeof existing === "object" ? existing : { answers: {} };
  }

  function persist(screen) {
    var lead = baseLead();
    var data = readForm();
    lead.prenom = data.prenom;
    lead.nom = data.nom;
    lead.email = data.email;
    lead.telephone = data.telephone;
    lead.profession = data.profession;
    lead.answers = answers;
    lead.step = step;
    lead.screen = screen;
    if (leadStore()) leadStore().save(lead);
    return lead;
  }

  function renderQuestion() {
    var question = QUESTIONS[step];
    var selected = answers[question.id] || "";
    questionEl.textContent = question.label;
    progressLabel.textContent = "Question " + (step + 1) + " sur " + QUESTIONS.length;
    progressFill.style.width = Math.round(((step + 1) / QUESTIONS.length) * 100) + "%";
    nextBtn.textContent = step === QUESTIONS.length - 1 ? "Voir ma première réponse" : "Suivant";
    nextBtn.disabled = !selected;
    choicesEl.innerHTML = "";
    OPTIONS.forEach(function (option) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lead-choice" + (selected === option.value ? " is-selected" : "");
      btn.setAttribute("aria-pressed", selected === option.value ? "true" : "false");
      btn.textContent = option.label;
      btn.addEventListener("click", function () {
        answers[question.id] = option.value;
        persist("quiz");
        renderQuestion();
      });
      choicesEl.appendChild(btn);
    });
    show("quiz");
  }

  function indication(lead) {
    var positive = {
      titulaire: "oui",
      horizon: "oui",
      ca2025: "oui",
      ca2024: "oui",
      bnc: "non",
      anciennete: "oui",
    };
    var score = 0;
    var unknown = 0;
    Object.keys(positive).forEach(function (key) {
      var value = answers[key];
      if (value === "inconnu") unknown += 1;
      else if (value === positive[key]) score += 1;
    });

    var title;
    var body;
    if (unknown >= 3) {
      title = "Plusieurs réponses restent ouvertes : le cabinet peut les clarifier avec vous.";
      body =
        "Vous avez indiqué « Je ne sais pas » à plusieurs questions. C’est fréquent, et cela n’empêche pas d’avancer. Le cabinet vous recontacte pour préciser ces points, gratuitement et sans pièces à fournir.";
    } else if (score >= 4) {
      title = "Oui : le passage en SELARL mérite d’être étudié.";
      body =
        "D’après vos réponses, plusieurs critères souvent réunis lors d’une transition utile sont présents : une activité déjà installée, un horizon d’exercice suffisant, ou un chiffre d’affaires au-dessus de 77.700 €. Ce test donne une première indication. Il ne remplace pas l’avis du cabinet, qui peut maintenant vous recontacter pour la confirmer.";
    } else if (score >= 2) {
      title = "Votre situation mérite d’être précisée avec le cabinet.";
      body =
        "Certains éléments plaident pour une étude du passage en SELARL, d’autres restent ouverts. Un échange, sans engagement et sans pièces à fournir, permet de trancher.";
    } else {
      title = "Le passage en SELARL n’apparaît pas comme la priorité immédiate.";
      body =
        "D’après les éléments renseignés, les critères habituellement regardés ne sont pas encore réunis. Le cabinet peut malgré tout vérifier ce point avec vous, sans engagement.";
    }

    var extra = "";
    if (answers.titulaire === "non") {
      extra =
        "Vous avez indiqué ne pas être titulaire. Le passage en SELARL concerne en général la personne qui exploite le cabinet. Le cabinet vérifiera avec vous si cette transition est le bon cadre.";
    }
    if (lead && lead.email) {
      var who = lead.prenom ? lead.prenom + ", nous" : "Nous";
      extra = (extra ? extra + " " : "") + who + " vous recontacterons à " + lead.email + ".";
    }
    return { title: title, body: body, extra: extra };
  }

  function showResult() {
    var lead = persist("result");
    var text = indication(lead);
    resultTitle.textContent = text.title;
    resultBody.textContent = text.body;
    resultExtra.textContent = text.extra;
    resultExtra.hidden = !text.extra;
    show("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restore() {
    var lead = leadStore() ? leadStore().current() : null;
    if (!lead) return;
    setField("lead-prenom", lead.prenom);
    setField("lead-nom", lead.nom);
    setField("lead-email", lead.email);
    setField("lead-telephone", lead.telephone);
    setField("lead-profession", lead.profession);
    answers = lead.answers && typeof lead.answers === "object" ? lead.answers : {};
    step = typeof lead.step === "number" ? lead.step : 0;
    if (step < 0 || step >= QUESTIONS.length) step = 0;
    if (lead.screen === "quiz") renderQuestion();
    else if (lead.screen === "result") showResult();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var data = validateForm();
    if (!data) return;
    step = 0;
    persist("quiz");
    renderQuestion();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  nextBtn.addEventListener("click", function () {
    if (!answers[QUESTIONS[step].id]) return;
    if (step < QUESTIONS.length - 1) {
      step += 1;
      persist("quiz");
      renderQuestion();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    showResult();
  });

  prevBtn.addEventListener("click", function () {
    if (step === 0) {
      persist("form");
      show("form");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    step -= 1;
    persist("quiz");
    renderQuestion();
  });

  editBtn.addEventListener("click", function () {
    step = 0;
    persist("quiz");
    renderQuestion();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  restore();
})();
