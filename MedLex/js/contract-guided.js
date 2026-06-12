/**
 * Relecture guidée du contrat — un article par section, navigation latérale.
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

  function buildArticleSections(bodyText, parcours) {
    var guide = window.MedLexArticleGuide;
    return splitSections(bodyText).map(function (section, index) {
      var meta = guide ? guide.getArticleMeta(parcours, section) : {};
      return {
        index: index,
        section: section,
        shortLabel: meta.shortLabel || 'Art.',
        title: meta.title || section.heading,
        desc: meta.desc || '',
        editSteps: meta.editSteps || [],
      };
    });
  }

  function sectionToHtml(section, renderLineFn) {
    var html = '';
    if (!section.isPreamble) {
      html += '<p class="ac-guided-section__heading">' + escapeHtml(section.heading) + '</p>';
    }
    section.lines.forEach(function (line) {
      html += renderLineFn(line);
    });
    return html;
  }

  function renderGuidedStep(article, bodyHtmlMap, stepIndex, total, parcours) {
    var sec = article.section;
    var legalHtml =
      bodyHtmlMap[sec.heading] ||
      sectionToHtml(sec, function (line) {
        return '<p>' + escapeHtml(line) + '</p>';
      });

    var guide = window.MedLexArticleGuide;
    var editBtn = '';
    if (guide && article.editSteps && article.editSteps.length) {
      editBtn =
        '<div class="ac-guided-edit-row">' +
        article.editSteps
          .map(function (link) {
            var href = guide.questionnaireHref(parcours, link.step);
            if (!href) return '';
            return (
              '<a class="ac-btn ac-btn--secondary ac-guided-edit" href="' +
              escapeHtml(href) +
              '">' +
              escapeHtml(link.label) +
              '</a>'
            );
          })
          .join('') +
        '</div>';
    }

    var avocateHtml = '';
    if (window.MedLexAvocateComments && window.MedLexAvocateComments.getCommentsForArticleSection) {
      avocateHtml = window.MedLexAvocateComments
        .getCommentsForArticleSection(sec)
        .map(function (note) {
          return window.MedLexAvocateComments.renderCommentHtml(note.comment);
        })
        .join('');
    }

    return (
      '<article class="ac-card ac-card--guided">' +
      '<div class="ac-guided-card__head">' +
      '<p class="ac-guided-step">Article ' +
      (stepIndex + 1) +
      ' sur ' +
      total +
      '</p>' +
      editBtn +
      '</div>' +
      '<h2 class="ac-card__title">' +
      escapeHtml(article.title) +
      '</h2>' +
      '<p class="ac-card__desc ac-guided-benefit">' +
      escapeHtml(article.desc) +
      '</p>' +
      avocateHtml +
      '<div class="ac-guided-legal ac-contract-doc__body">' +
      legalHtml +
      '</div>' +
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
    var preambleBuf = [];

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
      } else {
        preambleBuf.push(p.outerHTML);
      }
    });
    flush();
    if (preambleBuf.length) {
      map['Préambule et identification des parties'] = preambleBuf.join('');
    }
    return map;
  }

  function renderSidebarNav(articles, activeIndex) {
    return articles
      .map(function (a, i) {
        return (
          '<button type="button" class="ac-guided-sideitem' +
          (i === activeIndex ? ' ac-guided-sideitem--active' : '') +
          '" data-guided-step="' +
          i +
          '" aria-current="' +
          (i === activeIndex ? 'step' : 'false') +
          '">' +
          '<span class="ac-guided-sideitem__label">' +
          escapeHtml(a.shortLabel) +
          '</span>' +
          '<span class="ac-guided-sideitem__title">' +
          escapeHtml(a.title) +
          '</span>' +
          '</button>'
        );
      })
      .join('');
  }

  function renderMobileJump(articles, activeIndex) {
    var options = articles
      .map(function (a, i) {
        return (
          '<option value="' +
          i +
          '"' +
          (i === activeIndex ? ' selected' : '') +
          '>' +
          escapeHtml(a.shortLabel + ' — ' + a.title) +
          '</option>'
        );
      })
      .join('');

    return (
      '<label class="ac-guided-jump">' +
      '<span class="ac-guided-jump__label">Aller à l’article</span>' +
      '<select class="ac-input ac-guided-jump__select" id="guided-jump">' +
      options +
      '</select>' +
      '</label>'
    );
  }

  function mountGuidedView(opts) {
    var root = document.getElementById('contract-guided');
    if (!root || !opts.bodyText) return;

    var parcours = opts.parcours || 'remplacement';
    var articles = buildArticleSections(opts.bodyText, parcours);
    if (!articles.length) {
      root.innerHTML = '<p class="ac-microcopy">Impossible de découper le contrat en articles.</p>';
      return;
    }

    var bodyHtmlMap = buildBodyHtmlMap(opts.bodyHtml || '');
    var step = 0;

    function paint() {
      root.innerHTML =
        '<div class="ac-guided-layout">' +
        '<aside class="ac-guided-sidebar" aria-label="Sommaire du contrat">' +
        renderMobileJump(articles, step) +
        '<nav class="ac-guided-sidebar__nav" role="tablist">' +
        renderSidebarNav(articles, step) +
        '</nav>' +
        '</aside>' +
        '<div class="ac-guided-main">' +
        '<div class="ac-guided-panel" id="contract-guided-panel" aria-live="polite">' +
        renderGuidedStep(articles[step], bodyHtmlMap, step, articles.length, parcours) +
        '</div>' +
        '<div class="ac-btn-row ac-guided-actions">' +
        '<button type="button" class="ac-btn ac-btn--secondary" id="guided-prev"' +
        (step === 0 ? ' disabled' : '') +
        '>Précédent</button>' +
        '<button type="button" class="ac-btn ac-btn--secondary" id="guided-next"' +
        (step === articles.length - 1 ? ' disabled' : '') +
        '>' +
        (step === articles.length - 1 ? 'Dernier article' : 'Article suivant') +
        '</button>' +
        '</div>' +
        '</div>' +
        '</div>';
    }

    function goTo(index) {
      if (index < 0 || index >= articles.length) return;
      step = index;
      paint();
      bind();
    }

    function bind() {
      root.querySelectorAll('[data-guided-step]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          goTo(Number(btn.getAttribute('data-guided-step')));
        });
      });
      var jump = document.getElementById('guided-jump');
      if (jump) {
        jump.addEventListener('change', function () {
          goTo(Number(jump.value));
        });
      }
      var prev = document.getElementById('guided-prev');
      var next = document.getElementById('guided-next');
      if (prev) prev.addEventListener('click', function () { goTo(step - 1); });
      if (next && step < articles.length - 1) {
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
    buildArticleSections: buildArticleSections,
    splitSections: splitSections,
  };
})();
