/* Demande de rappel ou de rendez-vous, préremplie avec le test SELARL si besoin. */
(function () {
  var form = document.getElementById("demande-form");
  var panel = document.getElementById("demande-form-panel");
  var done = document.getElementById("demande-done");
  var error = document.getElementById("demande-error");
  if (!form || !panel || !done) return;

  var isRappel = /rappel\.html$/.test(window.location.pathname);
  var lead = window.LibéLexSelarlLead ? window.LibéLexSelarlLead.current() : null;

  function setValue(id, value) {
    var el = document.getElementById(id);
    if (el && value) el.value = value;
  }

  if (lead) {
    setValue("demande-prenom", lead.prenom);
    setValue("demande-nom", lead.nom);
    setValue("demande-email", lead.email);
    setValue("demande-telephone", lead.telephone);
  }

  function digits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var phoneEl = document.getElementById("demande-telephone");
    var emailEl = document.getElementById("demande-email");
    var telephone = phoneEl ? phoneEl.value.trim() : "";
    var email = emailEl ? emailEl.value.trim() : "";
    var problems = [];
    if (phoneEl && phoneEl.required && digits(telephone).length < 8) {
      problems.push("un numéro de téléphone");
    }
    if (emailEl && emailEl.required && !validEmail(email)) {
      problems.push("une adresse e-mail valide");
    }
    if (emailEl && !emailEl.required && email && !validEmail(email)) {
      problems.push("une adresse e-mail valide");
    }
    if (problems.length) {
      error.hidden = false;
      error.textContent = "Indiquez " + problems.join(" et ") + ".";
      return;
    }
    error.hidden = true;
    var entry = {
      type: isRappel ? "rappel" : "rendez-vous",
      prenom: (document.getElementById("demande-prenom") || {}).value || "",
      nom: (document.getElementById("demande-nom") || {}).value || "",
      email: email,
      telephone: telephone,
      message: ((document.getElementById("demande-message") || {}).value || "").trim(),
      leadId: lead && lead.id ? lead.id : null,
      at: new Date().toISOString(),
    };
    var key = "libelex-demandes";
    var all = [];
    try {
      all = JSON.parse(localStorage.getItem(key) || "[]");
    } catch (e) {
      all = [];
    }
    if (!Array.isArray(all)) all = [];
    all.push(entry);
    localStorage.setItem(key, JSON.stringify(all));
    panel.hidden = true;
    done.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
