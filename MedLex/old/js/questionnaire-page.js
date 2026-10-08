/**
 * Questionnaire MedLex — formulaire, préremplissage Supabase, chargement paresseux du générateur de contrat.
 * Charger après le DOM (`type="module"` en fin de document).
 */
import { STORAGE_KEY_PENDING_RESTORE } from './contract/constants.js';

  // Configuration Supabase (à renseigner).
  // Utiliser seulement la clé "anon" côté navigateur.
  const SUPABASE_URL = 'https://<VOTRE_PROJECT_REF>.supabase.co';
  const SUPABASE_ANON_KEY = '<VOTRE_SUPABASE_ANON_KEY>';

  function createSupabaseClient() {
    try {
      if (!window.supabase?.createClient) return null;
      if (!SUPABASE_URL || SUPABASE_URL.includes('<')) return null;
      if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('<')) return null;
      const { createClient } = window.supabase;
      return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (_) {
      return null;
    }
  }

  const typeRemplacement = document.getElementById('type-remplacement');
  const blocContinue = document.getElementById('bloc-continue');
  const blocContinue2 = document.getElementById('bloc-continue-2');
  const blocDiscontinu = document.getElementById('bloc-discontinu');
  const modeExercice = document.getElementById('mode-exercice');
  const blocAssocies = document.getElementById('bloc-associes');
  // Choix “qui est l’infirmier” (remplacé / remplaçant) quand l’utilisateur est connecté
  const rPartySelectWrap = document.getElementById('r-party-select-wrap');
  const rPartySelect = document.getElementById('r-party-select');
  const rpPartySelectWrap = document.getElementById('rp-party-select-wrap');
  const rpPartySelect = document.getElementById('rp-party-select');
  const motif = document.getElementById('motif');
  const motifAutre = document.getElementById('motif-autre');
  const multi = document.getElementById('multi-remplacements');
  const alerteMulti = document.getElementById('alerte-multi');
  const lieu = document.getElementById('lieu');
  const labelLieu = document.getElementById('label-lieu');
  const facturation = document.getElementById('facturation');
  const tiersPayant = document.getElementById('tiers-payant');
  const redevance = document.getElementById('redevance');
  const blocTauxRedevance = document.getElementById('bloc-taux-redevance');
  const blocAnnexesTexte = document.getElementById('bloc-annexes-texte');
  const form = document.getElementById('questionnaire-form');

  window.addEventListener('message', function (ev) {
    if (ev.source === window || !ev.data || ev.data.type !== 'medlex-restore-form') return;
    var payload = ev.data.payload;
    if (!payload) return;
    /** Fenêtre ouverte pour l’aperçu / PDF (évite de rejeter ev.origin === "null" avec parent https). */
    var previewRef = window.medlexLastPreviewWindow;
    var fromOurPreview = previewRef && ev.source === previewRef;
    var originMatches =
      !window.location.origin ||
      !ev.origin ||
      ev.origin === window.location.origin ||
      (ev.origin === 'null' && window.location.origin === 'null');
    if (!fromOurPreview && !originMatches) return;
    if (window.MedLexContract && typeof window.MedLexContract.applyQuestionnaireSnapshot === 'function') {
      window.MedLexContract.applyQuestionnaireSnapshot(payload);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    try {
      sessionStorage.setItem(STORAGE_KEY_PENDING_RESTORE, JSON.stringify(payload));
    } catch (e) {
      try {
        localStorage.setItem(STORAGE_KEY_PENDING_RESTORE, JSON.stringify(payload));
      } catch (e2) {
        console.error(e2);
      }
    }
  });

  const authEmail = document.getElementById('auth-email');
  const authPassword = document.getElementById('auth-password');
  const authSignInBtn = document.getElementById('auth-signin');
  const authStatus = document.getElementById('auth-status');

  const supabaseClient = createSupabaseClient();

  function setInputValue(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = value ?? '';
  }

  function setSelectValue(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = value ?? '';
  }

  function setRadioValue(name, value) {
    if (!value) return;
    document.querySelectorAll(`input[name="${name}"]`).forEach((r) => {
      r.checked = r.value === value;
    });
  }

  function applyPartyToForm(party, role) {
    if (!party) return;
    if (role === 'remplace') {
      setSelectValue('r-civilite', party.civilite);
      setInputValue('r-nom', party.nom_prenom);
      setInputValue('r-ordinal', party.ordinal);
      setInputValue('r-rpps', party.rpps);
      setInputValue('r-adresse', party.adresse);

      if (party.mode_exercice) setSelectValue('mode-exercice', party.mode_exercice);
      if (party.associes_info) setRadioValue('associes', party.associes_info);

      if (modeExercice) modeExercice.dispatchEvent(new Event('change'));
      if (document.querySelector('input[name="associes"]:checked')) {
        document.querySelector('input[name="associes"]:checked').dispatchEvent(new Event('change'));
      }
    }

    if (role === 'remplacant') {
      setSelectValue('rp-civilite', party.civilite);
      setInputValue('rp-nom', party.nom_prenom);
      setInputValue('rp-ordinal', party.ordinal);
      setInputValue('rp-rpps', party.rpps);
      setInputValue('rp-adresse', party.adresse);
      if (party.statut) setSelectValue('rp-statut', party.statut);
      if (party.multi_remplacements) setSelectValue('multi-remplacements', party.multi_remplacements);

      const multiSelect = document.getElementById('multi-remplacements');
      if (multiSelect) multiSelect.dispatchEvent(new Event('change'));
    }
  }

  function applyLieuToForm(lieuRow) {
    if (!lieuRow) return;
    setSelectValue('lieu', lieuRow.lieu);
    setInputValue('adresse-lieu', lieuRow.adresse ?? '');
    const lieuEl = document.getElementById('lieu');
    if (lieuEl) lieuEl.dispatchEvent(new Event('change'));
  }

  function syncAdresseLieuFromParties() {
    if (!lieu) return;
    const selectedLieu = lieu.value;
    const adrId = selectedLieu === 'cabinet-remplace' ? 'r-adresse' : 'rp-adresse';
    const adr = document.getElementById(adrId)?.value;
    setInputValue('adresse-lieu', adr || '');
  }

  async function prefillFixedParagraphsFromSupabase() {
    try {
      if (!supabaseClient) return;
      if (!authStatus) return;
      if (!rPartySelect || !rpPartySelect) return;

      const { data } = await supabaseClient.auth.getSession();
      const session = data?.session;
      if (!session?.user) return;

      const userId = session.user.id;
      authStatus.textContent = 'Connecté : choisissez l’infirmier (préremplissage automatique).';

      if (rPartySelectWrap) rPartySelectWrap.classList.remove('hidden');
      if (rpPartySelectWrap) rpPartySelectWrap.classList.remove('hidden');

      // 1) Récupérer les personnes “connues” (celles dont linked_user_id apparaît
      //    dans des dossiers déjà créés via la plateforme).
      const { data: dossierRows } = await supabaseClient
        .from('dossiers')
        .select('id')
        .eq('user_id', userId)
        .eq('parcours_slug', 'remplacement_infirmiers');

      const dossierIds = dossierRows?.map((d) => d.id) || [];
      let knownIds = [];
      if (dossierIds.length > 0) {
        const { data: partRows } = await supabaseClient
          .from('dossier_parties')
          .select('linked_user_id')
          .in('dossier_id', dossierIds);

        const ids = (partRows || [])
          .map((p) => p.linked_user_id)
          .filter((id) => id && id !== userId);
        knownIds = [...new Set(ids)];
      }

      // 2) Charger les profils de ces “personnes connues”
      const { data: knownProfilesRaw } =
        knownIds.length > 0
          ? await supabaseClient
              .from('user_profiles')
              .select('user_id,civilite,nom_prenom,ordinal,rpps,statut,adresse,mode_exercice,associes_info,multi_remplacements')
              .in('user_id', knownIds)
          : { data: [] };

      const knownProfiles = knownProfilesRaw || [];

      const { data: selfProfile } = await supabaseClient
        .from('user_profiles')
        .select('civilite,nom_prenom,ordinal,rpps,statut,adresse,mode_exercice,associes_info,multi_remplacements')
        .eq('user_id', userId)
        .maybeSingle();

      const defaultAdresseLieuRow = await supabaseClient
        .from('user_lieux_exercice')
        .select('adresse')
        .eq('user_id', userId)
        .eq('is_default', true)
        .maybeSingle();

      const defaultAdresseLieu = defaultAdresseLieuRow?.data?.adresse || null;

      const profilesById = { [userId]: selfProfile, ...Object.fromEntries(knownProfiles.map((p) => [p.user_id, p])) };

      const labelOf = (p) => {
        if (!p) return '—';
        const civ = p.civilite ? `${p.civilite} ` : '';
        const nom = p.nom_prenom || '';
        const rpps = p.rpps ? ` (RPPS ${p.rpps})` : '';
        return `${(civ + nom).trim()}${rpps}`.trim();
      };

      // 3) Options : moi-même / connus / nouvel
      let rChoice = 'new';
      let rpChoice = 'new';

      function buildOptions(selectEl, forbiddenValue) {
        if (!selectEl) return;
        selectEl.innerHTML = '';

        selectEl.append(new Option('Nouvel infirmier', 'new'));

        // Si l’autre côté choisit déjà “moi-même”, supprimer l’option “moi-même” ici.
        if (forbiddenValue !== 'self') {
          selectEl.append(new Option('Moi-même', 'self'));
        }

        for (const kp of knownProfiles) {
          if (!kp.user_id) continue;
          if (forbiddenValue && kp.user_id === forbiddenValue) continue;
          selectEl.append(new Option(labelOf(kp), kp.user_id));
        }
      }

      function refreshSelectsAndFields() {
        if (!rPartySelect || !rpPartySelect) return;

        rPartySelect.value = rChoice;
        rpPartySelect.value = rpChoice;

        // “choix disparaît de l’autre”
        const forbiddenForR = rpChoice !== 'new' ? rpChoice : null;
        const forbiddenForRP = rChoice !== 'new' ? rChoice : null;

        buildOptions(rPartySelect, forbiddenForR);
        buildOptions(rpPartySelect, forbiddenForRP);

        // Si la valeur courante a été supprimée par “choice disappears”, fallback sur new.
        if (!Array.from(rPartySelect.options).some((o) => o.value === rChoice)) rChoice = 'new';
        if (!Array.from(rpPartySelect.options).some((o) => o.value === rpChoice)) rpChoice = 'new';

        rPartySelect.value = rChoice;
        rpPartySelect.value = rpChoice;

        applyFieldsFromChoices();
      }

      function clearRemplaceFields() {
        setSelectValue('r-civilite', '');
        setInputValue('r-nom', '');
        setInputValue('r-ordinal', '');
        setInputValue('r-rpps', '');
        setInputValue('r-adresse', '');
        setSelectValue('mode-exercice', 'seul');

        document.querySelectorAll('input[name="associes"]').forEach((r) => {
          r.checked = false;
        });

        if (modeExercice) modeExercice.dispatchEvent(new Event('change'));
      }

      function clearRemplacantFields() {
        setSelectValue('rp-civilite', '');
        setInputValue('rp-nom', '');
        setInputValue('rp-ordinal', '');
        setInputValue('rp-rpps', '');
        setInputValue('rp-adresse', '');
        setSelectValue('rp-statut', '');
        setSelectValue('multi-remplacements', '');
      }

      function applyFieldsFromChoices() {
        // Remplacé
        if (rChoice === 'new') {
          clearRemplaceFields();
        } else {
          const p = rChoice === 'self' ? profilesById[userId] : profilesById[rChoice];
          if (p) {
            applyPartyToForm(
              {
                civilite: p.civilite,
                nom_prenom: p.nom_prenom,
                ordinal: p.ordinal,
                rpps: p.rpps,
                adresse: rChoice === 'self' ? defaultAdresseLieu || p.adresse : p.adresse,
                mode_exercice: p.mode_exercice,
                associes_info: p.associes_info,
              },
              'remplace'
            );
          }
        }

        // Remplaçant
        if (rpChoice === 'new') {
          clearRemplacantFields();
        } else {
          const p = rpChoice === 'self' ? profilesById[userId] : profilesById[rpChoice];
          if (p) {
            applyPartyToForm(
              {
                civilite: p.civilite,
                nom_prenom: p.nom_prenom,
                ordinal: p.ordinal,
                rpps: p.rpps,
                statut: p.statut,
                adresse: rpChoice === 'self' ? defaultAdresseLieu || p.adresse : p.adresse,
                multi_remplacements: p.multi_remplacements,
              },
              'remplacant'
            );
          }
        }

        // Harmonise “adresse du cabinet mis à disposition”
        syncAdresseLieuFromParties();
      }

      // 4) Règles de cohérence
      let isProgrammatic = false;

      rPartySelect.addEventListener('change', () => {
        if (isProgrammatic) return;
        isProgrammatic = true;
        const v = rPartySelect.value;

        if (v === 'self') {
          // Choix disparaît côté remplaçant
          rpChoice = 'new';
        } else {
          // Si l'utilisateur choisit quelqu'un d'autre (ou nouvel), alors il est remplaçant
          rpChoice = 'self';
        }

        rChoice = v;
        refreshSelectsAndFields();
        isProgrammatic = false;
      });

      rpPartySelect.addEventListener('change', () => {
        if (isProgrammatic) return;
        isProgrammatic = true;
        const v = rpPartySelect.value;

        if (v === 'self') {
          rChoice = 'new';
        } else {
          rChoice = 'self';
        }

        rpChoice = v;
        refreshSelectsAndFields();
        isProgrammatic = false;
      });

      // Valeurs initiales : tout vide
      rChoice = 'new';
      rpChoice = 'new';
      refreshSelectsAndFields();
    } catch (e) {
      if (authStatus) authStatus.textContent = '';
    }
  }

  prefillFixedParagraphsFromSupabase();

  if (authSignInBtn) {
    authSignInBtn.addEventListener('click', () => {
      if (authStatus) authStatus.textContent = 'Connexion à implémenter (démo UI).';
    });
  }

  if (typeRemplacement && blocContinue && blocContinue2 && blocDiscontinu) {
    typeRemplacement.addEventListener('change', () => {
      const v = typeRemplacement.value;
      blocContinue.classList.toggle('hidden', v !== 'continue');
      blocContinue2.classList.toggle('hidden', v !== 'continue');
      blocDiscontinu.classList.toggle('hidden', v === 'continue' || v === '');
    });
  } else {
    console.error('MedLex questionnaire: élément du formulaire introuvable.');
  }

  if (modeExercice && blocAssocies) {
    modeExercice.addEventListener('change', () => {
      blocAssocies.classList.toggle('hidden', modeExercice.value === 'seul');
    });
  }

  if (motif && motifAutre) {
    motif.addEventListener('change', () => {
      motifAutre.classList.toggle('hidden', motif.value !== 'autre');
    });
  }

  if (multi && alerteMulti) {
    multi.addEventListener('change', () => {
      alerteMulti.style.display = multi.value === 'plus' ? 'block' : 'none';
    });
  }

  if (lieu && labelLieu) {
    lieu.addEventListener('change', () => {
      labelLieu.textContent =
        lieu.value === 'cabinet-remplacant'
          ? 'Adresse du cabinet du Remplaçant'
          : 'Adresse du cabinet mis à disposition';
      syncAdresseLieuFromParties();
    });
  }

  if (facturation && tiersPayant) {
    facturation.addEventListener('change', () => {
      tiersPayant.classList.toggle('hidden', facturation.value !== 'via-remplace');
    });
  }

  function syncBlocTauxRedevance() {
    if (!blocTauxRedevance || !redevance) return;
    blocTauxRedevance.classList.toggle('hidden', redevance.value !== 'Oui');
  }
  if (redevance && blocTauxRedevance) {
    redevance.addEventListener('change', syncBlocTauxRedevance);
    syncBlocTauxRedevance();
  }

  function syncBlocAnnexesTexte() {
    if (!blocAnnexesTexte) return;
    const sel = document.querySelector('input[name="annexes"]:checked');
    blocAnnexesTexte.classList.toggle('hidden', !sel || sel.value !== 'oui');
  }
  if (blocAnnexesTexte) {
    document.querySelectorAll('input[name="annexes"]').forEach((r) => {
      r.addEventListener('change', syncBlocAnnexesTexte);
    });
    syncBlocAnnexesTexte();
  }

  document.querySelectorAll('input[name="temporaire"]').forEach(r => {
    r.addEventListener('change', () => {
      document.getElementById('alerte-temporaire').style.display = r.value === 'non' && r.checked ? 'block' : 'none';
    });
  });
  document.querySelectorAll('input[name="accord"]').forEach(r => {
    r.addEventListener('change', () => {
      document.getElementById('alerte-accord').style.display = r.value === 'non' && r.checked ? 'block' : 'none';
    });
  });
  document.querySelectorAll('input[name="associes"]').forEach(r => {
    r.addEventListener('change', () => {
      document.getElementById('alerte-associes').style.display = r.value === 'non' && r.checked ? 'block' : 'none';
    });
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      document.getElementById('success-msg').style.display = 'block';
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

      if (!supabaseClient) return;
      const { data } = await supabaseClient.auth.getSession();
      const session = data?.session;
      if (!session?.user) {
        if (authStatus) authStatus.textContent = 'Connexion requise pour enregistrer le dossier.';
        return;
      }

      const userId = session.user.id;
      const dossierParcours = 'remplacement_infirmiers';

      const replacedChoice = rPartySelect?.value || 'new'; // 'new' | 'self' | <userId>
      const replacantChoice = rpPartySelect?.value || 'new'; // 'new' | 'self' | <userId>

      const replacedLinkedUserId =
        replacedChoice === 'self' ? userId : replacedChoice === 'new' ? null : replacedChoice;
      const replacantLinkedUserId =
        replacantChoice === 'self' ? userId : replacantChoice === 'new' ? null : replacantChoice;

      // Upsert profil utilisateur : on met à jour les infos “à soi” uniquement
      // pour la partie où l’utilisateur s’est sélectionné (“self”).
      if (replacedChoice === 'self' || replacantChoice === 'self') {
        const payload = { user_id: userId };

        if (replacedChoice === 'self') {
          payload.civilite = document.getElementById('r-civilite')?.value || null;
          payload.nom_prenom = document.getElementById('r-nom')?.value || null;
          payload.ordinal = document.getElementById('r-ordinal')?.value || null;
          payload.rpps = document.getElementById('r-rpps')?.value || null;
          payload.adresse = document.getElementById('r-adresse')?.value || null;
          payload.mode_exercice = document.getElementById('mode-exercice')?.value || null;
          const assoc = document.querySelector('input[name="associes"]:checked')?.value || null;
          payload.associes_info = assoc;
        }

        if (replacantChoice === 'self') {
          payload.civilite = document.getElementById('rp-civilite')?.value || null;
          payload.nom_prenom = document.getElementById('rp-nom')?.value || null;
          payload.ordinal = document.getElementById('rp-ordinal')?.value || null;
          payload.rpps = document.getElementById('rp-rpps')?.value || null;
          payload.statut = document.getElementById('rp-statut')?.value || null;
          payload.adresse = document.getElementById('rp-adresse')?.value || null;
          payload.multi_remplacements = document.getElementById('multi-remplacements')?.value || null;
        }

        const hasUsefulData = Boolean(payload.rpps || payload.nom_prenom || payload.adresse);
        if (hasUsefulData) {
          await supabaseClient.from('user_profiles').upsert(payload, { onConflict: 'user_id' });
        }
      }

      // Dossier
      const dossierInsert = await supabaseClient
        .from('dossiers')
        .insert({
          user_id: userId,
          parcours_slug: dossierParcours,
          status: 'draft',
          title: 'Remplacement – brouillon',
        })
        .select('id')
        .single();

      const dossierId = dossierInsert?.data?.id;
      if (!dossierId) return;

      // Lieu d’exercice
      const selectedLieu = document.getElementById('lieu')?.value || 'cabinet-remplace';
      const selectedAdresseLieu = document.getElementById('adresse-lieu')?.value || 'Non renseigné';

      // Met en base l’adresse du cabinet de l’utilisateur (table user_lieux_exercice)
      // puis relie dossier_lieu_exercice.user_lieu_exercice_id quand le “lieu” correspond
      // au cabinet de l’utilisateur (et pas à celui de l’autre partie).
      let selectedUserLieuId = null;
      let userCabinetAdresse = null;
      const isCurrentReplaced = replacedChoice === 'self';
      const isCurrentReplacant = replacantChoice === 'self';
      if (isCurrentReplaced) userCabinetAdresse = document.getElementById('r-adresse')?.value || null;
      if (isCurrentReplacant) userCabinetAdresse = document.getElementById('rp-adresse')?.value || null;

      userCabinetAdresse = userCabinetAdresse ? String(userCabinetAdresse).trim() : null;
      if (userCabinetAdresse) {
        const { data: existingLieu } = await supabaseClient
          .from('user_lieux_exercice')
          .select('id')
          .eq('user_id', userId)
          .eq('adresse', userCabinetAdresse)
          .maybeSingle();

        if (existingLieu?.id) {
          selectedUserLieuId = existingLieu.id;
        } else {
          const { data: insertedLieu } = await supabaseClient
            .from('user_lieux_exercice')
            .insert({
              user_id: userId,
              label: 'Cabinet',
              adresse: userCabinetAdresse,
              is_default: false,
            })
            .select('id')
            .single();
          selectedUserLieuId = insertedLieu?.id || null;
        }

        if (selectedUserLieuId) {
          await supabaseClient
            .from('user_lieux_exercice')
            .update({ is_default: false })
            .eq('user_id', userId);
          await supabaseClient
            .from('user_lieux_exercice')
            .update({ is_default: true })
            .eq('id', selectedUserLieuId);
        }
      }

      let userLieuLinkId = null;
      if (selectedUserLieuId) {
        if (selectedLieu === 'cabinet-remplace' && isCurrentReplaced) userLieuLinkId = selectedUserLieuId;
        if (selectedLieu === 'cabinet-remplacant' && isCurrentReplacant) userLieuLinkId = selectedUserLieuId;
      }

      await supabaseClient
        .from('dossier_lieu_exercice')
        .upsert(
          {
            dossier_id: dossierId,
            lieu: selectedLieu,
            adresse: selectedAdresseLieu,
            user_lieu_exercice_id: userLieuLinkId,
          },
          { onConflict: 'dossier_id' }
        );

      // Parties fixes (snapshot)
      const associesValue = document.querySelector('input[name="associes"]:checked')?.value || null;
      const multiRemplacementsValue = document.getElementById('multi-remplacements')?.value || null;

      await supabaseClient.from('dossier_parties').insert([
        {
          dossier_id: dossierId,
          party_role: 'remplace',
          linked_user_id: replacedLinkedUserId,
          civilite: document.getElementById('r-civilite')?.value || null,
          nom_prenom: document.getElementById('r-nom')?.value || null,
          ordinal: document.getElementById('r-ordinal')?.value || null,
          rpps: document.getElementById('r-rpps')?.value || null,
          adresse: document.getElementById('r-adresse')?.value || 'Non renseigné',
          mode_exercice: document.getElementById('mode-exercice')?.value || null,
          associes_info: associesValue,
        },
        {
          dossier_id: dossierId,
          party_role: 'remplacant',
          linked_user_id: replacantLinkedUserId,
          civilite: document.getElementById('rp-civilite')?.value || null,
          nom_prenom: document.getElementById('rp-nom')?.value || null,
          ordinal: document.getElementById('rp-ordinal')?.value || null,
          rpps: document.getElementById('rp-rpps')?.value || null,
          statut: document.getElementById('rp-statut')?.value || null,
          adresse: document.getElementById('rp-adresse')?.value || 'Non renseigné',
          multi_remplacements: multiRemplacementsValue,
        },
      ]);

      if (authStatus) authStatus.textContent = 'Dossier enregistré. Vous pouvez revenir pour re-préremplir.';
    });
  }

  /** PDF : scripts chargés seulement au clic (affichage du formulaire sans serveur, fichier file:// OK) */
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = function () {
        reject(new Error('Script introuvable (placez les fichiers .js dans le même dossier que cette page) : ' + src));
      };
      document.body.appendChild(s);
    });
  }

  var btnPdf = document.getElementById('download-pdf');
  var btnPreviewHtml = document.getElementById('preview-html');
  async function ensureContractScripts(buttonToUpdate) {
    if (!window.MedLexContract) {
      if (buttonToUpdate) buttonToUpdate.disabled = true;
      var label = buttonToUpdate ? buttonToUpdate.textContent : '';
      if (buttonToUpdate) buttonToUpdate.textContent = 'Chargement…';
      try {
        await loadScript('./medlex-contract-template-embedded.js');
        await import('./contract/medlex-contract.js');
      } finally {
        if (buttonToUpdate) {
          buttonToUpdate.disabled = false;
          buttonToUpdate.textContent = label;
        }
      }
    }
  }

  if (btnPreviewHtml) {
    btnPreviewHtml.addEventListener('click', async function () {
      var previewWin = window.open('', '_blank');
      if (!previewWin) {
        alert('Impossible d’ouvrir la fenêtre d’aperçu. Autorisez les popups puis réessayez.');
        return;
      }
      window.medlexLastPreviewWindow = previewWin;
      try {
        await ensureContractScripts(btnPreviewHtml);
        if (window.MedLexContract) {
          await window.MedLexContract.openHtmlPreview(previewWin);
        }
      } catch (e) {
        console.error(e);
        try { previewWin.close(); } catch (_) {}
        alert(e instanceof Error ? e.message : 'Impossible d’afficher l’aperçu HTML.');
      }
    });
  }

  if (btnPdf) {
    btnPdf.addEventListener('click', async function () {
      try {
        await ensureContractScripts(btnPdf);
        if (window.MedLexContract) {
          await window.MedLexContract.downloadPdf();
        }
      } catch (e) {
        console.error(e);
        alert(e instanceof Error ? e.message : 'Impossible de générer le PDF.');
      }
    });
  }

  /** Reprise du formulaire après « Modifier » depuis l’aperçu du contrat. */
  async function medlexRestoreFromPendingStorage() {
    try {
      var raw =
        sessionStorage.getItem(STORAGE_KEY_PENDING_RESTORE) ||
        localStorage.getItem(STORAGE_KEY_PENDING_RESTORE);
      if (!raw) return;
      if (!window.MedLexContract) {
        await loadScript('./medlex-contract-template-embedded.js');
        await import('./contract/medlex-contract.js');
      }
      if (!window.MedLexContract || typeof window.MedLexContract.applyQuestionnaireSnapshot !== 'function') {
        return;
      }
      window.MedLexContract.applyQuestionnaireSnapshot(JSON.parse(raw));
      try {
        sessionStorage.removeItem(STORAGE_KEY_PENDING_RESTORE);
      } catch (_) {}
      try {
        localStorage.removeItem(STORAGE_KEY_PENDING_RESTORE);
      } catch (_) {}
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      try {
        sessionStorage.removeItem(STORAGE_KEY_PENDING_RESTORE);
      } catch (_) {}
      try {
        localStorage.removeItem(STORAGE_KEY_PENDING_RESTORE);
      } catch (_) {}
      console.error(e);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', medlexRestoreFromPendingStorage);
  } else {
    medlexRestoreFromPendingStorage();
  }
