/**
 * Relecture guidée du contrat — une section à la fois, avec texte juridique repliable.
 */
(function () {
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function isArticleLine(line) {
    return /^(Article|ARTICLE)\s+/i.test(String(line || '').trim());
  }

  function splitSections(bodyText) {
    var lines = String(bodyText || '').split('\n');
    var sections = [];
    var preamble = [];
    var current = null;

    lines.forEach(function (line) {
      var trimmed = line.trim();
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
        heading: 'Préambule et identification des parties',
        lines: preamble,
        isPreamble: true,
      });
    }
    return sections;
  }

  function assignTheme(section, themes, used) {
    var i;
    for (i = 0; i < themes.length; i++) {
      if (themes[i].match.test(section.heading)) {
        if (!used[themes[i].id]) {
          used[themes[i].id] = themes[i];
          used[themes[i].id].sections = [];
        }
        used[themes[i].id].sections.push(section);
        return;
      }
    }
    if (!used._autres) {
      used._autres = {
        id: 'autres',
        title: 'Autres clauses',
        desc: 'Ces passages complètent le contrat sur des points plus techniques ou annexes.',
        sections: [],
      };
    }
    used._autres.sections.push(section);
  }

  function groupSections(bodyText, parcours) {
    var themes =
      window.MedLexClauseThemes && parcours === 'collaboration'
        ? window.MedLexClauseThemes.collaboration
        : window.MedLexClauseThemes
          ? window.MedLexClauseThemes.remplacement
          : [];
    var raw = splitSections(bodyText);
    var used = {};
    var i;

    raw.forEach(function (sec) {
      if (sec.isPreamble && themes[0]) {
        if (!used[themes[0].id]) {
          used[themes[0].id] = {
            id: themes[0].id,
            title: themes[0].title,
            desc: themes[0].desc,
            sections: [],
          };
        }
        used[themes[0].id].sections.push(sec);
        return;
      }
      assignTheme(sec, themes, used);
    });

    var ordered = [];
    themes.forEach(function (t) {
      if (used[t.id] && used[t.id].sections.length) ordered.push(used[t.id]);
    });
    if (used._autres && used._autres.sections.length) ordered.push(used._autres);
    return ordered;
  }

  function sectionToHtml(section, renderLineFn) {
    var html = '<p class="ac-guided-section__heading">' + escapeHtml(section.heading) + '</p>';
    section.lines.forEach(function (line) {
      html += renderLineFn(line);
    });
    return html;
  }

  function renderGuidedStep(group, bodyHtmlMap, stepIndex, total) {
    var legalHtml = '';
    group.sections.forEach(function (sec) {
      legalHtml +=
        '<div class="ac-guided-legal__block">' +
        (bodyHtmlMap[sec.heading] || sectionToHtml(sec, function (line) {
          return '<p>' + escapeHtml(line) + '</p>';
        })) +
        '</div>';
    });

    return (
      '<article class="ac-card ac-card--guided">' +
      '<p class="ac-guided-step">Section ' +
      (stepIndex + 1) +
      ' sur ' +
      total +
      '</p>' +
      '<h2 class="ac-card__title">' +
      escapeHtml(group.title) +
      '</h2>' +
      '<p class="ac-card__desc ac-guided-benefit">' +
      escapeHtml(group.desc) +
      '</p>' +
      '<details class="ac-guided-legal">' +
      '<summary class="ac-guided-legal__summary">Voir le texte juridique exact</summary>' +
      '<div class="ac-guided-legal__body ac-contract-doc__body">' +
      legalHtml +
      '</div>' +
      '</details>' +
      '</article>'
    );
  }

  function buildBodyHtmlMap(bodyHtml) {
    var map = {};
    var wrap = document.createElement('div');
    wrap.innerHTML = bodyHtml;
    var paras = wrap.querySelectorAll('p');
    var currentKey = null;
    var buf = [];

    function flush() {
      if (currentKey && buf.length) map[currentKey] = buf.join('');
      buf = [];
    }

    paras.forEach(function (p) {
      var text = p.textContent.trim();
      if (isArticleLine(text)) {
        flush();
        currentKey = text;
        buf.push('<p class="ac-guided-section__heading">' + escapeHtml(text) + '</p>');
      } else if (currentKey) {
        buf.push(p.outerHTML);
      }
    });
    flush();
    return map;
  }

  function renderChips(groups, activeIndex) {
    return groups
      .map(function (g, i) {
        return (
          '<button type="button" class="ac-guided-chip' +
          (i === activeIndex ? ' ac-guided-chip--active' : '') +
          '" data-guided-step="' +
          i +
          '">' +
          escapeHtml(g.title) +
          '</button>'
        );
      })
      .join('');
  }

  function mountGuidedView(opts) {
    var root = document.getElementById('contract-guided');
    if (!root || !opts.bodyText) return;

    var parcours = opts.parcours || 'remplacement';
    var groups = groupSections(opts.bodyText, parcours);
    if (!groups.length) {
      root.innerHTML = '<p class="ac-microcopy">Impossible de découper le contrat en sections.</p>';
      return;
    }

    var bodyHtmlMap = buildBodyHtmlMap(opts.bodyHtml || '');
    var step = 0;

    function paint() {
      root.innerHTML =
        '<div class="ac-guided-nav" role="tablist" aria-label="Sections du contrat">' +
        renderChips(groups, step) +
        '</div>' +
        '<div class="ac-guided-panel" id="contract-guided-panel" aria-live="polite">' +
        renderGuidedStep(groups[step], bodyHtmlMap, step, groups.length) +
        '</div>' +
        '<div class="ac-btn-row ac-guided-actions">' +
        '<button type="button" class="ac-btn ac-btn--secondary" id="guided-prev"' +
        (step === 0 ? ' disabled' : '') +
        '>Précédent</button>' +
        '<button type="button" class="ac-btn ac-btn--secondary" id="guided-next"' +
        (step === groups.length - 1 ? ' disabled' : '') +
        '>' +
        (step === groups.length - 1 ? 'Dernière section' : 'Section suivante') +
        '</button>' +
        '</div>';
    }

    function goTo(index) {
      if (index < 0 || index >= groups.length) return;
      step = index;
      paint();
      bind();
      var panel = document.getElementById('contract-guided-panel');
      if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function bind() {
      root.querySelectorAll('[data-guided-step]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          goTo(Number(btn.getAttribute('data-guided-step')));
        });
      });
      var prev = document.getElementById('guided-prev');
      var next = document.getElementById('guided-next');
      if (prev) prev.addEventListener('click', function () { goTo(step - 1); });
      if (next && step < groups.length - 1) {
        next.addEventListener('click', function () { goTo(step + 1); });
      }
    }

    paint();
    bind();
  }

  function initViewToggle() {
    var guided = document.getElementById('contract-guided');
    var full = document.getElementById('contract-doc');
    var buttons = document.querySelectorAll('[data-contract-view]');
    if (!guided || !full || !buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var view = btn.getAttribute('data-contract-view');
        var isGuided = view === 'guided';
        guided.classList.toggle('ac-hidden', !isGuided);
        full.classList.toggle('ac-hidden', isGuided);
        buttons.forEach(function (b) {
          b.classList.toggle('ac-view-toggle__btn--active', b === btn);
          b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
        });
      });
    });
  }

  window.MedLexContractGuided = {
    mount: mountGuidedView,
    initViewToggle: initViewToggle,
    groupSections: groupSections,
  };
})();
