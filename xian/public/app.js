/* global Xian */
(function () {
  'use strict';

  const X = window.Xian;
  if (!X) {
    console.error('Xian engine missing');
    return;
  }

  let state = X.createNewState();
  let toastTimer = null;
  let saveTimer = null;
  let shopsBuilt = false;
  let treasuresBuilt = false;
  let attrsBuilt = false;
  let renderedRealmIndex = -1;
  let lastEndingShown = null;
  let eventModalOpen = false;
  let selectedBring = [];
  let lastEquipSig = '';
  let lastTreasureSig = '';
  let lastCombatSig = '';
  let timeRandomAcc = 0;

  const els = {
    lingqiVal: document.getElementById('lingqiVal'),
    tishuVal: document.getElementById('tishuVal'),
    jingshenVal: document.getElementById('jingshenVal'),
    lingliDps: document.getElementById('lingliDps'),
    tishuDps: document.getElementById('tishuDps'),
    jingshenDps: document.getElementById('jingshenDps'),
    lingliCap: document.getElementById('lingliCap'),
    tishuCap: document.getElementById('tishuCap'),
    jingshenCap: document.getElementById('jingshenCap'),
    lingliTriad: document.getElementById('lingliTriad'),
    tishuTriad: document.getElementById('tishuTriad'),
    jingshenTriad: document.getElementById('jingshenTriad'),
    triadHint: document.getElementById('triadHint'),
    qiyunVal: document.getElementById('qiyunVal'),
    combatVal: document.getElementById('combatVal'),
    clickPowerLingli: document.getElementById('clickPowerLingli'),
    clickPowerTishu: document.getElementById('clickPowerTishu'),
    clickPowerJingshen: document.getElementById('clickPowerJingshen'),
    realmRail: document.getElementById('realmRail'),
    realmBlurb: document.getElementById('realmBlurb'),
    pathLine: document.getElementById('pathLine'),
    realmHint: document.getElementById('realmHint'),
    freePointsHint: document.getElementById('freePointsHint'),
    bodyHint: document.getElementById('bodyHint'),
    attrList: document.getElementById('attrList'),
    combatList: document.getElementById('combatList'),
    equipSlots: document.getElementById('equipSlots'),
    naturalHint: document.getElementById('naturalHint'),
    absorbGrid: document.getElementById('absorbGrid'),
    floatLayer: document.getElementById('floatLayer'),
    shopLingli: document.getElementById('shopLingli'),
    shopTishu: document.getElementById('shopTishu'),
    shopJingshen: document.getElementById('shopJingshen'),
    pillList: document.getElementById('pillList'),
    pillShop: document.getElementById('pillShop'),
    pillOwned: document.getElementById('pillOwned'),
    herbOwned: document.getElementById('herbOwned'),
    herbShop: document.getElementById('herbShop'),
    combatPillSelect: document.getElementById('combatPillSelect'),
    alchemyHint: document.getElementById('alchemyHint'),
    forgeStatus: document.getElementById('forgeStatus'),
    forgeRealmList: document.getElementById('forgeRealmList'),
    ownedTreasures: document.getElementById('ownedTreasures'),
    shopTreasures: document.getElementById('shopTreasures'),
    vaultList: document.getElementById('vaultList'),
    vaultHint: document.getElementById('vaultHint'),
    chronicleList: document.getElementById('chronicleList'),
    reincarnateStatus: document.getElementById('reincarnateStatus'),
    endingList: document.getElementById('endingList'),
    btnRaiseStar: document.getElementById('btnRaiseStar'),
    btnBreak: document.getElementById('btnBreak'),
    btnReincarnate: document.getElementById('btnReincarnate'),
    btnReset: document.getElementById('btnReset'),
    btnEndingOk: document.getElementById('btnEndingOk'),
    saveHint: document.getElementById('saveHint'),
    toast: document.getElementById('toast'),
    versionBadge: document.getElementById('versionBadge'),
    birthModal: document.getElementById('birthModal'),
    birthEyebrow: document.getElementById('birthEyebrow'),
    birthTitle: document.getElementById('birthTitle'),
    birthBody: document.getElementById('birthBody'),
    inheritInfo: document.getElementById('inheritInfo'),
    bringTreasures: document.getElementById('bringTreasures'),
    bringList: document.getElementById('bringList'),
    birthOptions: document.getElementById('birthOptions'),
    eventModal: document.getElementById('eventModal'),
    eventLore: document.getElementById('eventLore'),
    eventTitle: document.getElementById('eventTitle'),
    eventBody: document.getElementById('eventBody'),
    eventPower: document.getElementById('eventPower'),
    eventOptions: document.getElementById('eventOptions'),
    endingModal: document.getElementById('endingModal'),
    endingName: document.getElementById('endingName'),
    endingTitle: document.getElementById('endingTitle'),
    endingBody: document.getElementById('endingBody'),
    mainTimeline: document.getElementById('mainTimeline'),
    milestoneList: document.getElementById('milestoneList'),
    equipTip: document.getElementById('equipTip'),
  };

  let craftBuilt = false;
  let tipHideTimer = null;
  let tipAnchorEl = null;
  let tipPinned = false;
  let tipTreasureId = null;

  function resourceOf(key) {
    if (key === 'lingli') return state.lingqi;
    if (key === 'tishu') return state.tishu;
    return state.jingshen;
  }

  function showToast(msg) {
    els.toast.hidden = false;
    els.toast.textContent = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      els.toast.hidden = true;
    }, 2800);
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function clearTipAnchor() {
    if (tipAnchorEl) tipAnchorEl.classList.remove('is-tip-anchor');
    tipAnchorEl = null;
    tipTreasureId = null;
  }

  function hideEquipTip(force) {
    clearTimeout(tipHideTimer);
    tipHideTimer = null;
    if (!force && tipPinned) return;
    tipPinned = false;
    if (els.equipTip) {
      els.equipTip.hidden = true;
      els.equipTip.innerHTML = '';
      els.equipTip.classList.remove('tip-above', 'tip-below');
    }
    clearTipAnchor();
  }

  function positionEquipTip(anchor) {
    const tip = els.equipTip;
    if (!tip || !anchor) return;
    const gap = 8;
    const margin = 8;
    const rect = anchor.getBoundingClientRect();
    tip.style.left = '0px';
    tip.style.top = '0px';
    tip.hidden = false;
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    let left = rect.left + rect.width / 2 - tw / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - tw - margin));
    let top = rect.bottom + gap;
    let place = 'below';
    if (top + th > window.innerHeight - margin && rect.top - gap - th >= margin) {
      top = rect.top - gap - th;
      place = 'above';
    }
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
    tip.classList.toggle('tip-below', place === 'below');
    tip.classList.toggle('tip-above', place === 'above');
    const arrowX = Math.max(12, Math.min(rect.left + rect.width / 2 - left - 4, tw - 16));
    tip.style.setProperty('--tip-arrow-x', arrowX + 'px');
  }

  function showEquipTip(anchor, html, opts) {
    if (!els.equipTip || !anchor) return;
    clearTimeout(tipHideTimer);
    tipHideTimer = null;
    if (tipAnchorEl && tipAnchorEl !== anchor) tipAnchorEl.classList.remove('is-tip-anchor');
    tipAnchorEl = anchor;
    tipTreasureId = (opts && opts.treasureId) || anchor.dataset.treasureId || null;
    tipPinned = !!(opts && opts.pinned);
    anchor.classList.add('is-tip-anchor');
    els.equipTip.innerHTML = html;
    positionEquipTip(anchor);
  }

  function scheduleHideEquipTip() {
    if (tipPinned) return;
    clearTimeout(tipHideTimer);
    tipHideTimer = setTimeout(() => hideEquipTip(false), 140);
  }

  function treasureTipHtml(id, withActions) {
    const t = X.getTreasure(id);
    if (!t) return '';
    const forge = X.getTreasureForge ? X.getTreasureForge(state, id) : { level: 0, refined: false };
    const effTier = X.treasureEffectiveTier
      ? X.treasureEffectiveTier(state, id)
      : forge.tierOverride || t.tier;
    const tierLabel = (X.TREASURE_TIER_LABELS && X.TREASURE_TIER_LABELS[effTier]) || '';
    const bonus = X.describeTreasureBonus ? X.describeTreasureBonus(state, id) : '';
    const needRefine = effTier !== 'immortal' && t.cons && !forge.refined;
    let consLine = '';
    if (needRefine && t.cons && t.cons.labels) {
      consLine = '<p class="tip-bonus tip-cons">负：' + escapeHtml(t.cons.labels.join('、')) + '</p>';
    } else if (effTier === 'immortal') {
      consLine = '<p class="tip-bonus">仙品 · 无负面</p>';
    } else if (forge.refined) {
      consLine = '<p class="tip-bonus">已洗练 · 无负面</p>';
    }
    const title =
      escapeHtml(t.name) +
      ' · ' +
      escapeHtml(tierLabel) +
      (forge.level ? ' · +' + forge.level : '');
    let actions = '';
    if (withActions) actions = buildTreasureActionsHtml(id);
    return (
      '<p class="tip-title">' +
      title +
      '</p><p class="tip-desc">' +
      escapeHtml(t.description || '') +
      '</p>' +
      (bonus ? '<p class="tip-bonus">' + escapeHtml(bonus) + '</p>' : '') +
      consLine +
      actions +
      (withActions ? '' : '<p class="tip-hint">点击槽位卸下</p>')
    );
  }

  function buildTreasureActionsHtml(id) {
    const t = X.getTreasure(id);
    if (!t) return '';
    const eq = isTreasureEquipped(id);
    const forge = X.getTreasureForge ? X.getTreasureForge(state, id) : { level: 0, refined: false };
    const effTier = X.treasureEffectiveTier
      ? X.treasureEffectiveTier(state, id)
      : forge.tierOverride || t.tier;
    const maxLv = X.MAX_TEMPER_LEVEL || 9;
    const realm = X.currentForgeRealm ? X.currentForgeRealm(state) : null;
    const tierOk = !realm || !X.TIER_RANK || X.TIER_RANK[effTier] <= X.TIER_RANK[realm.maxTier];
    const levelCap = realm ? Math.min(maxLv, realm.maxLevel || maxLv) : maxLv;
    const temperC = X.temperCost ? X.temperCost(t, forge.level) : t.temperBaseCost || 0;
    const sellV = X.sellValue ? X.sellValue(state, id) : t.sellLingli || 0;
    const canTemper =
      forge.level < levelCap && tierOk && state.tishu >= temperC && state.phase === 'playing';
    const needRefine = effTier !== 'immortal' && t.cons && !forge.refined;
    const canRefine =
      needRefine && state.tishu >= (t.refineCost || 0) && state.phase === 'playing';
    const canSell = !eq && state.phase === 'playing';
    const promoteTarget =
      forge.level >= maxLv &&
      ((effTier === 'mortal' && 'spirit') || (effTier === 'spirit' && 'immortal') || null);
    let canPromote = false;
    let promoteCost = 0;
    if (promoteTarget && X.FORGE_REALMS) {
      const idx = X.currentForgeRealmIndex ? X.currentForgeRealmIndex(state) : 0;
      for (let i = 0; i <= idx; i++) {
        const r = X.FORGE_REALMS[i];
        if (r && r.canPromoteFrom === effTier && r.promoteCost) {
          canPromote = state.tishu >= r.promoteCost && state.phase === 'playing';
          promoteCost = r.promoteCost;
        }
      }
    }
    return (
      '<div class="treasure-actions">' +
      '<button type="button" class="mini-btn" data-treasure-id="' +
      id +
      '" data-action="toggle">' +
      (eq ? '卸下' : '装备') +
      '</button>' +
      '<button type="button" class="mini-btn' +
      (canTemper ? '' : ' is-locked') +
      '" data-treasure-id="' +
      id +
      '" data-action="temper"' +
      (canTemper ? '' : ' disabled') +
      '>炼器 ' +
      X.formatNumber(temperC) +
      '体</button>' +
      (needRefine
        ? '<button type="button" class="mini-btn' +
          (canRefine ? '' : ' is-locked') +
          '" data-treasure-id="' +
          id +
          '" data-action="refine"' +
          (canRefine ? '' : ' disabled') +
          '>洗练 ' +
          X.formatNumber(t.refineCost || 0) +
          '体</button>'
        : '') +
      (promoteTarget
        ? '<button type="button" class="mini-btn' +
          (canPromote ? '' : ' is-locked') +
          '" data-treasure-id="' +
          id +
          '" data-action="promote"' +
          (canPromote ? '' : ' disabled') +
          '>升' +
          ((X.TREASURE_TIER_LABELS && X.TREASURE_TIER_LABELS[promoteTarget]) || promoteTarget) +
          ' ' +
          X.formatNumber(promoteCost) +
          '体</button>'
        : '') +
      '<button type="button" class="mini-btn' +
      (canSell ? '' : ' is-locked') +
      '" data-treasure-id="' +
      id +
      '" data-action="sell"' +
      (canSell ? '' : ' disabled') +
      '>出售 ' +
      X.formatNumber(sellV) +
      '</button></div>'
    );
  }

  function scheduleSave() {
    els.saveHint.textContent = '保存中…';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      X.saveToStorage(state);
      els.saveHint.textContent = '已保存';
    }, 400);
  }

  function setState(next, opts) {
    state = next;
    render(opts && opts.soft ? { soft: true } : undefined);
    scheduleSave();
  }

  function spawnFloat(amount) {
    const node = document.createElement('span');
    node.className = 'float-num';
    node.textContent = '+' + X.formatNumber(amount);
    node.style.setProperty('--dx', (Math.random() * 60 - 30).toFixed(0) + 'px');
    els.floatLayer.appendChild(node);
    setTimeout(() => node.remove(), 900);
  }

  function pathLabel() {
    const parts = [];
    if (state.birthId) {
      const b = X.BIRTHS.find((x) => x.id === state.birthId);
      if (b) parts.push(b.name);
    }
    if (state.branchId && X.BRANCH_LABELS[state.branchId]) {
      parts.push(X.BRANCH_LABELS[state.branchId].name);
    }
    if (state.factionId === 'orthodox') parts.push('正道');
    if (state.factionId === 'dark') parts.push('魔道');
    if (state.factionId === 'hermit') parts.push('隐世');
    if (state.destinyId === 'emperor') parts.push('证道');
    if (state.destinyId === 'guardian') parts.push('守界');
    if (state.destinyId === 'void') parts.push('问虚');
    return parts.length ? parts.join(' · ') : '未择出身';
  }

  function renderRealmRail(stats) {
    if (renderedRealmIndex === state.realmIndex && els.realmRail.childElementCount) {
      els.realmBlurb.textContent =
        stats.realm.name +
        state.star +
        '层 · ' +
        stats.realm.blurb +
        '（境×' +
        stats.realmMult +
        '）';
      document.documentElement.style.setProperty('--hue', String(stats.realm.hue));
      return;
    }
    renderedRealmIndex = state.realmIndex;
    els.realmRail.innerHTML = '';
    X.REALMS.forEach((realm, i) => {
      const chip = document.createElement('span');
      chip.className = 'realm-chip';
      if (i < state.realmIndex) chip.classList.add('done');
      if (i === state.realmIndex) chip.classList.add('current');
      chip.textContent = realm.name;
      els.realmRail.appendChild(chip);
    });
    els.realmBlurb.textContent =
      stats.realm.name + state.star + '层 · ' + stats.realm.blurb + '（境×' + stats.realmMult + '）';
    document.documentElement.style.setProperty('--hue', String(stats.realm.hue));
  }

  function buildAttrs() {
    els.attrList.innerHTML = '';
    X.ATTR_KEYS.forEach((key) => {
      const row = document.createElement('div');
      row.className = 'attr-row';
      row.dataset.attrKey = key;
      row.innerHTML =
        '<span class="attr-name">' +
        X.ATTR_LABELS[key] +
        '</span><span class="attr-val"></span>';
      els.attrList.appendChild(row);
    });
    attrsBuilt = true;
  }

  function softUpdateAttrs(stats) {
    if (!attrsBuilt) buildAttrs();
    if (els.freePointsHint) {
      els.freePointsHint.textContent = '随三资源自动增长';
    }
    const ra = stats.resourceAttrs || {};
    els.attrList.querySelectorAll('.attr-row').forEach((row) => {
      const key = row.dataset.attrKey;
      const total = stats.totalAttrs[key];
      const fromRes = ra[key] || 0;
      const val = row.querySelector('.attr-val');
      if (val) {
        val.innerHTML =
          total + ' <small style="opacity:.65">(修' + fromRes + ')</small>';
      }
    });
    if (els.bodyHint) {
      els.bodyHint.textContent =
        '炼器：' +
        (stats.forgeRealmName || stats.bodyStageName || '皮肉境') +
        ' · 丹道精通 ' +
        state.alchemyMastery;
    }
  }

  function shopHost(channel) {
    if (channel === 'tishu') return els.shopTishu;
    if (channel === 'jingshen') return els.shopJingshen;
    return els.shopLingli;
  }

  function buildShops() {
    els.shopLingli.innerHTML = '';
    els.shopTishu.innerHTML = '';
    els.shopJingshen.innerHTML = '';
    X.ARTS.forEach((art) => {
      if (!X.artAvailable(state, art) && (state.owned[art.id] || 0) <= 0) {
        if (art.minRealm > state.realmIndex + 1) return;
        if (art.branch && art.branch !== state.branchId) return;
        if (art.faction && art.faction !== state.factionId) return;
      }
      const ch = X.artChannel(art);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'art-row';
      btn.dataset.artId = art.id;
      const kindTag =
        art.kind === 'click' ? '吐纳' : art.kind === 'cap' ? '扩容' : '运转';
      btn.innerHTML =
        '<span class="art-mark">' +
        art.mark +
        '</span><span><p class="art-name"></p><p class="art-desc"></p></span><span class="art-meta"></span>';
      btn.querySelector('.art-name').textContent = art.name + ' · ' + kindTag;
      btn.querySelector('.art-desc').textContent = art.description;
      shopHost(ch).appendChild(btn);
    });
    shopsBuilt = true;
  }

  function softUpdateShops(stats) {
    if (!shopsBuilt) buildShops();
    document
      .querySelectorAll('#shopLingli .art-row, #shopTishu .art-row, #shopJingshen .art-row')
      .forEach((btn) => {
        const id = btn.dataset.artId;
        const art = X.ARTS.find((a) => a.id === id);
        if (!art) return;
        const available = X.artAvailable(state, art);
        const cost = X.artCost(state, id);
        const owned = state.owned[id] || 0;
        const ch = X.artChannel(art);
        const meta = btn.querySelector('.art-meta');
        const label = (X.RESOURCE_LABELS && X.RESOURCE_LABELS[ch]) || ch;
        if (!available) {
          btn.classList.add('is-locked');
          meta.textContent = art.branch
            ? '需道途'
            : art.faction
              ? '需阵营'
              : '需' + X.REALMS[art.minRealm].name;
          return;
        }
        const canBuy =
          cost != null &&
          resourceOf(ch) >= cost &&
          state.phase === 'playing' &&
          !stats.pendingEvent;
        btn.classList.toggle('is-locked', !canBuy);
        meta.textContent =
          '×' + owned + ' · ' + X.formatNumber(cost || 0) + label;
      });
  }

  function refreshCombatPillSelect() {
    if (!els.combatPillSelect) return;
    const prev = els.combatPillSelect.value;
    els.combatPillSelect.innerHTML = '<option value="">不使用（本场）</option>';
    (X.PILL_RECIPES || []).forEach((p) => {
      const n = (state.pills && state.pills[p.id]) || 0;
      if (n <= 0) return;
      const isBattle = X.isBattlePill ? X.isBattlePill(p) : p.kind === 'battle';
      if (!isBattle) return;
      const mult = (p.effect && p.effect.combatPowerMult) || 1.12;
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent =
        p.name + ' ×' + n + '（本场×' + Number(mult).toFixed(2) + '）';
      els.combatPillSelect.appendChild(opt);
    });
    if (prev && [...els.combatPillSelect.options].some((o) => o.value === prev)) {
      els.combatPillSelect.value = prev;
    }
  }

  function pillKindLabel(p) {
    if (X.PILL_KIND_LABELS && p.kind && X.PILL_KIND_LABELS[p.kind]) {
      return X.PILL_KIND_LABELS[p.kind];
    }
    if (p.kind === 'battle') return '战前';
    if (p.kind === 'perm') return '永久战';
    if (p.kind === 'advance') return '进阶';
    return '丹';
  }

  function buildCraftPanels() {
    if (!els.pillList) return;
    els.pillList.innerHTML = '';
    if (els.pillShop) els.pillShop.innerHTML = '';
    if (els.pillOwned) els.pillOwned.innerHTML = '';
    els.herbOwned.innerHTML = '';
    els.herbShop.innerHTML = '';
    X.PILL_RECIPES.forEach((p) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'art-row';
      btn.dataset.pillId = p.id;
      btn.dataset.action = 'craft';
      const herbNeed = Object.entries(p.herbs)
        .map(([id, n]) => {
          const h = X.getHerb(id);
          return (h ? h.name : id) + '×' + n;
        })
        .join('、');
      const kind = pillKindLabel(p);
      btn.innerHTML =
        '<span class="art-mark">' +
        p.mark +
        '</span><span><p class="art-name">' +
        p.name +
        ' · ' +
        kind +
        '</p><p class="art-desc">' +
        p.description +
        ' · 需 ' +
        herbNeed +
        '</p></span><span class="art-meta">炼丹</span>';
      els.pillList.appendChild(btn);

      if (els.pillShop && p.shopCost > 0) {
        const shopBtn = document.createElement('button');
        shopBtn.type = 'button';
        shopBtn.className = 'art-row';
        shopBtn.dataset.pillId = p.id;
        shopBtn.dataset.action = 'buy';
        const locked = state.realmIndex < p.minRealm || state.lingqi < p.shopCost;
        if (locked) shopBtn.classList.add('is-locked');
        shopBtn.innerHTML =
          '<span class="art-mark">' +
          p.mark +
          '</span><span><p class="art-name">' +
          p.name +
          ' · ' +
          kind +
          '</p><p class="art-desc">' +
          p.description +
          '</p></span><span class="art-meta">' +
          X.formatNumber(p.shopCost) +
          '灵力</span>';
        els.pillShop.appendChild(shopBtn);
      }
    });
    if (els.pillShop && !els.pillShop.childElementCount) {
      els.pillShop.innerHTML = '<p class="realm-hint">暂无可购丹药</p>';
    }
    X.PILL_RECIPES.forEach((p) => {
      const owned = (state.pills && state.pills[p.id]) || 0;
      if (owned <= 0 || !els.pillOwned) return;
      const row = document.createElement('div');
      row.className = 'art-row treasure-row';
      row.dataset.pillId = p.id;
      const sell = X.sellPillValue ? X.sellPillValue(p.id) : 0;
      const kind = pillKindLabel(p);
      let effectHint = kind;
      if (p.effect && p.effect.combatPowerFlat) {
        effectHint += ' · 服+战力' + p.effect.combatPowerFlat;
      }
      if (p.effect && p.effect.combatPowerMult) {
        effectHint += ' · 本场×' + Number(p.effect.combatPowerMult).toFixed(2);
      }
      const canUse = p.kind !== 'battle';
      row.innerHTML =
        '<span class="art-mark">' +
        p.mark +
        '</span><span class="treasure-main"><p class="art-name">' +
        p.name +
        ' ×' +
        owned +
        '</p><p class="art-desc">' +
        effectHint +
        ' · 售 ' +
        X.formatNumber(sell) +
        '</p><div class="treasure-actions">' +
        (canUse
          ? '<button type="button" class="mini-btn" data-pill-id="' +
            p.id +
            '" data-action="use">服下</button>'
          : '<span class="realm-hint">开战弹框使用</span>') +
        '<button type="button" class="mini-btn" data-pill-id="' +
        p.id +
        '" data-action="sell">出售</button>' +
        '</div></span><span class="art-meta">背包</span>';
      els.pillOwned.appendChild(row);
    });
    if (els.pillOwned && !els.pillOwned.childElementCount) {
      els.pillOwned.innerHTML = '<p class="realm-hint">丹药背包空空 · 炼丹或购丹入库</p>';
    }
    X.HERBS.forEach((h) => {
      const owned = (state.herbs && state.herbs[h.id]) || 0;
      if (owned > 0) {
        const row = document.createElement('div');
        row.className = 'art-row treasure-row';
        row.dataset.herbId = h.id;
        const sell = X.sellHerbValue ? X.sellHerbValue(h.id) : Math.floor(h.cost * 0.62);
        row.innerHTML =
          '<span class="art-mark">' +
          h.mark +
          '</span><span class="treasure-main"><p class="art-name">' +
          h.name +
          ' ×' +
          owned +
          '</p><p class="art-desc">' +
          h.description +
          ' · 售 ' +
          X.formatNumber(sell) +
          '</p><div class="treasure-actions">' +
          '<button type="button" class="mini-btn" data-herb-id="' +
          h.id +
          '" data-action="sell">出售</button>' +
          '</div></span><span class="art-meta">背包</span>';
        els.herbOwned.appendChild(row);
      }
      if (h.cost > 0) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'art-row';
        btn.dataset.herbId = h.id;
        btn.dataset.action = 'buy';
        btn.innerHTML =
          '<span class="art-mark">' +
          h.mark +
          '</span><span><p class="art-name">' +
          h.name +
          '</p><p class="art-desc">' +
          h.description +
          '</p></span><span class="art-meta">' +
          X.formatNumber(h.cost) +
          '灵力</span>';
        els.herbShop.appendChild(btn);
      }
    });
    if (!els.herbOwned.childElementCount) {
      els.herbOwned.innerHTML = '<p class="realm-hint">暂无药材 · 可购药或战后拾取</p>';
    }
    refreshCombatPillSelect();
    craftBuilt = true;
  }

  function softUpdateCraft(stats) {
    if (!craftBuilt) buildCraftPanels();
    else refreshCombatPillSelect();
    if (els.alchemyHint) {
      els.alchemyHint.textContent = '精通 ' + state.alchemyMastery;
    }
    const realms = X.FORGE_REALMS || X.BODY_STAGES || [];
    const idx =
      stats && typeof stats.forgeRealmIndex === 'number'
        ? stats.forgeRealmIndex
        : X.currentForgeRealmIndex
          ? X.currentForgeRealmIndex(state)
          : 0;
    const realm = realms[idx] || (X.currentForgeRealm ? X.currentForgeRealm(state) : null);
    if (els.forgeStatus && realm) {
      const nextNeed =
        stats && stats.nextForgeNeed != null
          ? stats.nextForgeNeed
          : idx + 1 < realms.length
            ? realms[idx + 1].needTotalTishu
            : null;
      const tierLabel =
        (X.TREASURE_TIER_LABELS && X.TREASURE_TIER_LABELS[realm.maxTier]) || realm.maxTier;
      els.forgeStatus.textContent =
        '当前「' +
        realm.name +
        '」· 可炼 ' +
        tierLabel +
        ' 至 +' +
        (realm.maxLevel || 9) +
        (realm.canPromoteFrom
          ? ' · 可升' +
            ((X.TREASURE_TIER_LABELS && X.TREASURE_TIER_LABELS[realm.canPromoteFrom]) ||
              realm.canPromoteFrom)
          : '') +
        ' · 累计体术 ' +
        X.formatNumber(state.totalTishu || 0) +
        (nextNeed != null
          ? ' / 下一境 ' + X.formatNumber(nextNeed)
          : ' · 已至器圣') +
        '。' +
        (realm.blurb || '');
    }
    if (els.forgeRealmList) {
      els.forgeRealmList.innerHTML = '';
      realms.forEach((s, i) => {
        const li = document.createElement('li');
        if (i <= idx) li.classList.add('got');
        const tierLabel =
          (X.TREASURE_TIER_LABELS && X.TREASURE_TIER_LABELS[s.maxTier]) || s.maxTier || '';
        li.innerHTML =
          (i <= idx ? '◆ ' : '◇ ') +
          s.name +
          '<span class="ending-title">' +
          '需累计体术 ' +
          X.formatNumber(s.needTotalTishu || 0) +
          ' · 可炼' +
          tierLabel +
          (s.canPromoteFrom ? ' · 可升品' : '') +
          ' · ' +
          (s.blurb || '') +
          '</span>';
        els.forgeRealmList.appendChild(li);
      });
    }
  }

  function isTreasureEquipped(id) {
    if (!state.equipped) return false;
    for (const slot of X.EQUIP_SLOTS) {
      const arr = state.equipped[slot];
      if (Array.isArray(arr) ? arr.includes(id) : arr === id) return true;
    }
    return false;
  }

  function equipmentSignature() {
    const forge = state.treasureForge || {};
    const forgeSig = Object.keys(forge)
      .sort()
      .map((id) => id + ':' + (forge[id].level || 0) + (forge[id].refined ? 'r' : ''))
      .join(',');
    return (
      X.EQUIP_SLOTS.map((s) => {
        const arr = (state.equipped && state.equipped[s]) || [];
        return s + ':' + (Array.isArray(arr) ? arr.join('/') : arr || '');
      }).join('|') +
      '|f:' +
      forgeSig
    );
  }

  function renderEquipBar() {
    if (!els.equipSlots) return;
    if (tipAnchorEl && tipAnchorEl.classList.contains('equip-slot')) hideEquipTip(true);
    const cap = X.slotCapacity ? X.slotCapacity(state.realmIndex) : { combat: 1, cultivate: 1, assist: 1 };
    const sig =
      equipmentSignature() +
      '|' +
      state.naturals.join(',') +
      '|' +
      state.naturalPassive +
      '|' +
      state.realmIndex +
      '|' +
      JSON.stringify(cap);
    if (sig === lastEquipSig && els.equipSlots.childElementCount) return;

    els.equipSlots.innerHTML = '';
    const unlockHint =
      '战斗 ' +
      cap.combat +
      ' · 修炼 ' +
      cap.cultivate +
      ' · 辅助 ' +
      cap.assist;
    const hintEl = document.getElementById('equipHint');
    if (hintEl) hintEl.textContent = unlockHint;

    X.EQUIP_SLOTS.forEach((slot) => {
      const group = document.createElement('div');
      group.className = 'equip-slot-group';
      const title = document.createElement('p');
      title.className = 'equip-slot-group-title';
      title.textContent =
        (X.EQUIP_SLOT_LABELS[slot] || slot) + ' · ' + (cap[slot] || 1) + ' 格';
      group.appendChild(title);

      let arr = (state.equipped && state.equipped[slot]) || [];
      if (!Array.isArray(arr)) arr = [arr];
      const count = Math.max(cap[slot] || 1, arr.length);
      for (let i = 0; i < count; i++) {
        const id = arr[i] || null;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'equip-slot' + (id ? ' filled' : '');
        btn.dataset.slot = slot;
        btn.dataset.slotIndex = String(i);
        const label = (X.EQUIP_SLOT_LABELS[slot] || slot) + (i + 1);
        if (id) {
          const t = X.getTreasure(id);
          btn.dataset.treasureId = id;
          btn.innerHTML =
            '<span class="slot-mark">' +
            (t ? t.mark : '?') +
            '</span><span class="slot-name">' +
            (t ? t.name : id) +
            '</span><span class="slot-lore">' +
            label +
            (t
              ? ' · ' +
                X.TREASURE_TIER_LABELS[
                  X.treasureEffectiveTier ? X.treasureEffectiveTier(state, id) : t.tier
                ]
              : '') +
            (t && t.combatEdges ? ' · 特效' : '') +
            '</span>';
        } else {
          btn.disabled = true;
          btn.innerHTML =
            '<span class="slot-empty">' + label + ' 空</span>';
        }
        group.appendChild(btn);
      }
      els.equipSlots.appendChild(group);
    });
    if (els.naturalHint) {
      els.naturalHint.textContent = state.naturals.length
        ? '天才地宝 ' +
          state.naturals.length +
          ' 种 · 永久被动 +' +
          (Math.round(state.naturalPassive * 10) / 10) +
          '/秒'
        : '尚未获得天才地宝 · 主线第 ' + state.mainChapter + ' 章';
    }
    lastEquipSig = sig;
  }

  function renderCombat(force) {
    const myPower = Math.floor(X.calcCombatPower(state));
    const powerBucket = Math.floor(Math.log10(Math.max(10, myPower)) * 20);
    const list =
      state.phase !== 'playing' || state.endingId ? [] : X.listCombatEnemies(state);
    const sig =
      state.phase +
      ':' +
      state.realmIndex +
      ':' +
      state.star +
      ':' +
      state.combatWins +
      ':' +
      powerBucket +
      ':' +
      list.map((e) => e.id + ':' + e.rewardLingqi).join(',');
    if (!force && sig === lastCombatSig && els.combatList.childElementCount) return;
    lastCombatSig = sig;
    els.combatList.innerHTML = '';
    if (state.phase !== 'playing' || state.endingId) {
      els.combatList.innerHTML = '<p class="realm-hint">轮回或结局中不可对战</p>';
      return;
    }
    if (!list.length) {
      els.combatList.innerHTML = '<p class="realm-hint">附近无敌可战</p>';
      return;
    }
    list.forEach((enemy) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'combat-row';
      btn.dataset.enemyId = enemy.id;
      const ePower = X.enemyPower
        ? X.enemyPower(enemy.attrs, state.realmIndex)
        : Math.floor(myPower * (enemy.powerRatio || 1));
      const ratio = typeof ePower === 'number' ? myPower / Math.max(1, ePower) : 1;
      const diff =
        (X.COMBAT_DIFFICULTY_LABELS && enemy.difficulty
          ? X.COMBAT_DIFFICULTY_LABELS[enemy.difficulty]
          : null) ||
        (ratio >= 1.25 ? '弱敌' : ratio <= 0.75 ? '强敌' : '均势');
      let odds = '均势';
      if (ratio >= 1.25) odds = '占优';
      else if (ratio <= 0.8) odds = '凶险';
      btn.innerHTML =
        '<strong>' +
        enemy.name +
        ' <em class="combat-diff combat-diff-' +
        (enemy.difficulty || 'fair') +
        '">' +
        diff +
        '</em></strong><span>敌战力 ' +
        (typeof ePower === 'number' ? X.formatNumber(ePower) : ePower) +
        ' · 我 ' +
        X.formatNumber(myPower) +
        '（' +
        odds +
        '）</span><span>' +
        enemy.blurb +
        ' · 赏 ' +
        X.formatNumber(enemy.rewardLingqi) +
        '</span>';
      els.combatList.appendChild(btn);
    });
  }

  function buildTreasures() {
    hideEquipTip(true);
    els.ownedTreasures.innerHTML = '';
    els.shopTreasures.innerHTML = '';
    els.vaultList.innerHTML = '';

    state.treasures.forEach((id) => {
      const t = X.getTreasure(id);
      if (!t) return;
      const eq = isTreasureEquipped(id);
      const forge = X.getTreasureForge ? X.getTreasureForge(state, id) : { level: 0, refined: false };
      const effTier = X.treasureEffectiveTier
        ? X.treasureEffectiveTier(state, id)
        : forge.tierOverride || t.tier;
      const tierLabel = (X.TREASURE_TIER_LABELS && X.TREASURE_TIER_LABELS[effTier]) || '';

      const row = document.createElement('div');
      row.className = 'art-row treasure-row owned-treasure';
      row.dataset.treasureId = id;
      row.innerHTML =
        '<span class="art-mark">' +
        t.mark +
        '</span><span class="treasure-main"><p class="art-name">' +
        t.name +
        '<span class="lore-tag tier-' +
        (effTier || 'mortal') +
        '">' +
        tierLabel +
        ' · ' +
        (X.EQUIP_SLOT_LABELS[t.slot] || t.slot) +
        (forge.level ? ' · +' + forge.level : '') +
        '</span></p></span><span class="art-meta">' +
        (eq ? '装备中' : '未装备') +
        '</span>';
      els.ownedTreasures.appendChild(row);
    });
    if (!state.treasures.length) {
      els.ownedTreasures.innerHTML = '<p class="realm-hint">尚无法宝</p>';
    }

    X.TREASURES.filter((t) => t.cost > 0).forEach((t) => {
      if (state.treasures.includes(t.id)) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'art-row treasure-row';
      btn.dataset.treasureId = t.id;
      btn.dataset.action = 'buy';
      const locked = state.realmIndex < t.minRealm || state.lingqi < t.cost || state.phase !== 'playing';
      if (locked) btn.classList.add('is-locked');
      const tierLabel = (X.TREASURE_TIER_LABELS && X.TREASURE_TIER_LABELS[t.tier]) || '';
      const pros = (t.pros || []).slice(0, 3).join('、');
      const cons =
        t.cons && t.cons.labels ? t.cons.labels.slice(0, 2).join('、') : t.tier === 'immortal' ? '无负面' : '';
      btn.title = pros + (cons ? ' / 负：' + cons : '');
      btn.innerHTML =
        '<span class="art-mark">' +
        t.mark +
        '</span><span><p class="art-name">' +
        t.name +
        '<span class="lore-tag tier-' +
        (t.tier || 'mortal') +
        '">' +
        tierLabel +
        ' · ' +
        (X.EQUIP_SLOT_LABELS[t.slot] || '') +
        ' · ' +
        t.lore +
        '</span></p><p class="art-desc">' +
        t.description +
        '</p><p class="treasure-bonus">正：' +
        pros +
        (cons ? '</p><p class="treasure-bonus treasure-cons">负：' + cons : '') +
        '</p></span><span class="art-meta">' +
        X.formatNumber(t.cost) +
        '</span>';
      els.shopTreasures.appendChild(btn);
    });

    const stats = X.derive(state);
    els.vaultHint.textContent =
      '宝库 ' +
      state.vault.length +
      ' 件；本世峰值可携带 ' +
      stats.inheritPreview.treasureSlots +
      ' 件（继承属性 ' +
      Math.floor(stats.inheritPreview.attrRate * 100) +
      '%）';
    state.vault.forEach((id) => {
      const t = X.getTreasure(id);
      if (!t) return;
      const row = document.createElement('div');
      row.className = 'art-row';
      row.innerHTML =
        '<span class="art-mark">' +
        t.mark +
        '</span><span><p class="art-name">' +
        t.name +
        '</p><p class="art-desc">' +
        t.lore +
        ' · 轮回时可携带</p></span><span class="art-meta">库</span>';
      els.vaultList.appendChild(row);
    });
    if (!state.vault.length) {
      els.vaultList.innerHTML = '<p class="realm-hint">宝库空空如也</p>';
    }
    treasuresBuilt = true;
  }

  function refreshTreasureLocks() {
    if (!treasuresBuilt) return;
    const playing = state.phase === 'playing';
    els.ownedTreasures.querySelectorAll('.owned-treasure').forEach((row) => {
      const id = row.dataset.treasureId;
      const t = X.getTreasure(id);
      if (!t) return;
      const eq = isTreasureEquipped(id);
      const meta = row.querySelector('.art-meta');
      if (meta) meta.textContent = eq ? '装备中' : '未装备';
    });
    els.shopTreasures.querySelectorAll('.treasure-row[data-action="buy"]').forEach((btn) => {
      const t = X.getTreasure(btn.dataset.treasureId);
      if (!t) return;
      const locked =
        state.realmIndex < t.minRealm || state.lingqi < t.cost || !playing;
      btn.classList.toggle('is-locked', locked);
    });
    if (tipTreasureId && tipAnchorEl && els.equipTip && !els.equipTip.hidden) {
      const withActions = tipAnchorEl.classList.contains('owned-treasure');
      const html = treasureTipHtml(tipTreasureId, withActions);
      if (html) {
        els.equipTip.innerHTML = html;
        positionEquipTip(tipAnchorEl);
      } else {
        hideEquipTip(true);
      }
    }
  }

  function renderChronicle() {
    els.chronicleList.innerHTML = '';
    state.chronicle
      .slice(-12)
      .reverse()
      .forEach((line) => {
        const li = document.createElement('li');
        li.textContent = line;
        els.chronicleList.appendChild(li);
      });
  }

  function renderMainTimeline() {
    if (!els.mainTimeline) return;
    const chapters = X.MAIN_STORY || [];
    const done = new Set(state.doneEvents || []);
    const current = state.mainChapter || 1;
    els.mainTimeline.innerHTML = '';
    if (!chapters.length) {
      const empty = document.createElement('li');
      empty.className = 'empty-hint';
      empty.textContent = '暂无主线。';
      els.mainTimeline.appendChild(empty);
      return;
    }
    chapters.forEach((ch) => {
      const li = document.createElement('li');
      const chNum = ch.mainChapter || ch.chapter || 0;
      let status = 'locked';
      let statusText = '未启';
      if (done.has(ch.id) || chNum < current) {
        status = 'done';
        statusText = '已完';
      } else if (chNum === current) {
        status = 'current';
        statusText = '进行中';
      }
      li.className = status;
      const title = String(ch.title || '').replace(/^【主线】/, '');
      li.innerHTML =
        '<span class="tl-ch">第' +
        chNum +
        '章</span>' +
        '<span class="tl-title">' +
        title +
        '</span>' +
        '<span class="tl-status">' +
        statusText +
        '</span>';
      els.mainTimeline.appendChild(li);
    });
  }

  function renderMilestones() {
    if (!els.milestoneList) return;
    const list = state.milestones || [];
    els.milestoneList.innerHTML = '';
    if (!list.length) {
      const empty = document.createElement('li');
      empty.className = 'empty-hint';
      empty.textContent = '尚无重要事件。道途抉择、关键突破、稀有奇遇与身死轮回会记入此处。';
      els.milestoneList.appendChild(empty);
      return;
    }
    const kindLabel = {
      main: '主线',
      branch: '道途',
      destiny: '气运',
      combat: '生死',
      loot: '奇遇',
      other: '大事',
    };
    list
      .slice()
      .reverse()
      .forEach((m) => {
        const li = document.createElement('li');
        const kind = m.kind || 'other';
        li.className = 'kind-' + kind;
        const when = m.realmLabel ? m.realmLabel + ' · ' : '';
        li.innerHTML =
          '<span class="ms-title">[' +
          (kindLabel[kind] || '大事') +
          '] ' +
          (m.title || '') +
          '</span>' +
          '<span class="ms-meta">' +
          when +
          (m.detail || '') +
          '</span>';
        els.milestoneList.appendChild(li);
      });
  }

  function renderEndings() {
    els.endingList.innerHTML = '';
    X.ENDINGS.forEach((ending) => {
      if (ending.id === 'fallen_wild' && !state.endingsUnlocked.includes(ending.id)) return;
      const got = state.endingsUnlocked.includes(ending.id);
      const li = document.createElement('li');
      if (got) li.classList.add('got');
      li.innerHTML =
        (got ? '◆ ' : '◇ ') +
        ending.name +
        '<span class="ending-title">' +
        ending.title +
        '</span>';
      els.endingList.appendChild(li);
    });
  }

  function syncBirthModal() {
    if (state.phase !== 'rebirth') {
      els.birthModal.hidden = true;
      return;
    }
    els.birthModal.hidden = false;
    els.eventModal.hidden = true;
    eventModalOpen = false;
    els.birthEyebrow.textContent = state.deathReason ? '身死轮回' : '择生入世';
    els.birthTitle.textContent = '选择出身';
    els.birthBody.textContent = state.deathReason
      ? state.deathReason + '。气运与宝库可带走，属性按峰值境界继承。'
      : '诸天轮回，凡人起步。选一个有趣的开局吧。';

    const peak = X.getRealm(state.peakRealmIndex);
    const rate =
      state.reincarnations === 0 && !state.deathReason ? 0 : peak.inheritAttrRate;
    const slots =
      state.reincarnations === 0 && !state.deathReason ? 0 : peak.inheritTreasureSlots;
    els.inheritInfo.textContent =
      '峰值「' +
      peak.name +
      '」→ 继承属性 ' +
      Math.floor(rate * 100) +
      '%，可携带法宝 ' +
      slots +
      ' 件。永久气运 ' +
      state.qiyun +
      '。';

    if (slots > 0 && state.vault.length) {
      els.bringTreasures.hidden = false;
      els.bringList.innerHTML = '';
      selectedBring = selectedBring.filter((id) => state.vault.includes(id)).slice(0, slots);
      state.vault.forEach((id) => {
        const t = X.getTreasure(id);
        if (!t) return;
        const label = document.createElement('label');
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = id;
        cb.checked = selectedBring.includes(id);
        cb.addEventListener('change', () => {
          if (cb.checked) {
            if (selectedBring.length >= slots) {
              cb.checked = false;
              showToast('最多携带 ' + slots + ' 件');
              return;
            }
            selectedBring.push(id);
          } else {
            selectedBring = selectedBring.filter((x) => x !== id);
          }
        });
        label.appendChild(cb);
        label.appendChild(document.createTextNode(t.name));
        els.bringList.appendChild(label);
      });
    } else {
      els.bringTreasures.hidden = true;
      selectedBring = [];
    }

    els.birthOptions.innerHTML = '';
    X.BIRTHS.forEach((b) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.dataset.birthId = b.id;
      btn.innerHTML =
        '<strong>' +
        b.mark +
        ' ' +
        b.name +
        '</strong><span>' +
        b.blurb +
        ' · 出身禀赋（三才皆空，点按获取）</span>';
      els.birthOptions.appendChild(btn);
    });
  }

  function describeOptionOutcomes(opt) {
    const tags = [];
    const fmt = (n) => (n > 0 ? '+' : '') + X.formatNumber(n);
    if (opt.lingqiDelta) tags.push('灵力 ' + fmt(opt.lingqiDelta));
    if (opt.tishuDelta) tags.push('体术 ' + fmt(opt.tishuDelta));
    if (opt.jingshenDelta) tags.push('精神力 ' + fmt(opt.jingshenDelta));
    if (opt.qiyunDelta) tags.push('气运 ' + fmt(opt.qiyunDelta));
    if (opt.freePointsDelta && opt.freePointsDelta > 0) {
      tags.push('三资源各 +' + opt.freePointsDelta * 100);
    }
    if (opt.attrsDelta) {
      const parts = [];
      X.ATTR_KEYS.forEach((k) => {
        if (opt.attrsDelta[k]) parts.push(X.ATTR_LABELS[k] + fmt(opt.attrsDelta[k]));
      });
      if (parts.length) tags.push(parts.join('、'));
    }
    if (opt.grantTreasureId) {
      const t = X.getTreasure(opt.grantTreasureId);
      tags.push('获法宝「' + (t ? t.name : opt.grantTreasureId) + '」');
    }
    if (opt.grantNaturalId) {
      const n = X.getNatural(opt.grantNaturalId);
      tags.push('获地宝「' + (n ? n.name : opt.grantNaturalId) + '」');
    }
    if (opt.grantHerbId) {
      const h = X.getHerb(opt.grantHerbId);
      tags.push(
        '获药材「' +
          (h ? h.name : opt.grantHerbId) +
          '」×' +
          (opt.grantHerbCount || 1),
      );
    }
    if (opt.set) {
      if (opt.set.branchId && X.BRANCH_LABELS[opt.set.branchId]) {
        tags.push('道途→' + X.BRANCH_LABELS[opt.set.branchId].name);
      }
      if (opt.set.factionId) {
        const f =
          opt.set.factionId === 'orthodox'
            ? '正道'
            : opt.set.factionId === 'dark'
              ? '魔道'
              : '隐世';
        tags.push('阵营→' + f);
      }
      if (opt.set.destinyId) tags.push('气运落定');
    }
    if (opt.combatEnemyId) {
      const enemy = X.getEnemy(opt.combatEnemyId);
      if (enemy) {
        const ep = X.enemyPower(enemy.attrs, state.realmIndex);
        tags.push(
          '对战「' + enemy.name + '」·敌战力 ' + X.formatNumber(ep),
        );
      } else {
        tags.push('含对战');
      }
      if (opt.deathOnLose) tags.push('败则身死');
    }
    if (opt.forceDeath) tags.push('结果：立即身死');
    return tags;
  }

  function syncEventModal(stats) {
    if (state.phase !== 'playing') {
      els.eventModal.hidden = true;
      eventModalOpen = false;
      return;
    }
    const ev = stats.pendingEvent;
    if (!ev) {
      if (eventModalOpen) {
        els.eventModal.hidden = true;
        eventModalOpen = false;
      }
      return;
    }
    // 对战事件：顶部标注我方/敌方战力，便于比较
    if (els.eventPower) {
      const enemyIds = [];
      ev.options.forEach((o) => {
        if (o.combatEnemyId && !enemyIds.includes(o.combatEnemyId)) {
          enemyIds.push(o.combatEnemyId);
        }
      });
      if (enemyIds.length) {
        const my = Math.floor(X.calcCombatPower(state));
        const rows = enemyIds.map((eid) => {
          const enemy = X.getEnemy(eid);
          if (!enemy) return '';
          const ep = X.enemyPower(enemy.attrs, state.realmIndex);
          const ratio = my / Math.max(1, ep);
          const odds = ratio >= 1.25 ? '占优' : ratio <= 0.8 ? '凶险' : '均势';
          return (
            '<span class="ep-row"><b>我方</b> ' +
            X.formatNumber(my) +
            ' <i>vs</i> <b class="ep-enemy">' +
            enemy.name +
            '</b> ' +
            X.formatNumber(ep) +
            ' <em class="ep-odds ep-' +
            (ratio >= 1.25 ? 'win' : ratio <= 0.8 ? 'lose' : 'even') +
            '">' +
            odds +
            '</em></span>'
          );
        });
        els.eventPower.innerHTML = rows.filter(Boolean).join('');
        els.eventPower.hidden = false;
      } else {
        els.eventPower.hidden = true;
        els.eventPower.innerHTML = '';
      }
    }
    if (eventModalOpen && els.eventTitle.textContent === ev.title) return;
    eventModalOpen = true;
    els.eventModal.hidden = false;
    els.eventLore.textContent = ev.lore || '诸天轶事';
    els.eventTitle.textContent = ev.title;
    els.eventBody.textContent = ev.body;
    els.eventOptions.innerHTML = '';
    ev.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.dataset.eventId = ev.id;
      btn.dataset.optionId = opt.id;
      const tags = describeOptionOutcomes(opt);
      const outcomeHtml = tags.length
        ? '<span class="option-outcomes">' +
          tags.map((t) => '<em>' + t + '</em>').join('') +
          '</span>'
        : '';
      btn.innerHTML =
        '<strong>' +
        opt.label +
        '</strong><span>' +
        opt.blurb +
        '</span>' +
        outcomeHtml;
      els.eventOptions.appendChild(btn);
    });
  }

  function syncEndingModal() {
    if (!state.endingId || state.phase === 'rebirth') {
      els.endingModal.hidden = true;
      return;
    }
    if (lastEndingShown === state.endingId && !els.endingModal.hidden) return;
    const ending = X.getEnding(state.endingId);
    if (!ending) return;
    lastEndingShown = state.endingId;
    els.endingModal.hidden = false;
    els.endingName.textContent = ending.name;
    els.endingTitle.textContent = ending.title;
    els.endingBody.textContent = ending.body;
  }

  function render(opts) {
    const soft = opts && opts.soft;
    const stats = X.derive(state);

    els.lingqiVal.textContent = X.formatNumber(state.lingqi);
    if (els.tishuVal) els.tishuVal.textContent = X.formatNumber(state.tishu || 0);
    if (els.jingshenVal) els.jingshenVal.textContent = X.formatNumber(state.jingshen || 0);
    const per = stats.perSec || { lingli: stats.lingqiPerSec, tishu: 0, jingshen: 0 };
    const clicks = stats.clickPowers || {
      lingli: stats.clickPower,
      tishu: 1,
      jingshen: 1,
    };
    if (els.lingliDps) els.lingliDps.textContent = X.formatNumber(per.lingli || 0);
    if (els.tishuDps) els.tishuDps.textContent = X.formatNumber(per.tishu || 0);
    if (els.jingshenDps) els.jingshenDps.textContent = X.formatNumber(per.jingshen || 0);

    const caps = stats.caps || null;
    const paintCap = (el, capEl, cur, cap) => {
      if (!capEl) return;
      capEl.textContent = X.formatNumber(Math.floor(cap || 0));
      const block = el && el.closest ? el.closest('.res') : null;
      if (block) block.classList.toggle('at-cap', !!cap && cur >= cap - 1e-6);
    };
    paintCap(els.lingqiVal, els.lingliCap, state.lingqi, caps ? caps.lingli : 0);
    paintCap(els.tishuVal, els.tishuCap, state.tishu || 0, caps ? caps.tishu : 0);
    paintCap(els.jingshenVal, els.jingshenCap, state.jingshen || 0, caps ? caps.jingshen : 0);

    const mods = stats.triadMods || { lingli: 0, tishu: 0, jingshen: 0 };
    const shares = stats.resourceShares || { lingli: 1 / 3, tishu: 1 / 3, jingshen: 1 / 3 };
    const fmtMod = (m) => {
      const f = 1 + (m || 0);
      const pct = Math.round((m || 0) * 1000) / 10;
      const sign = pct > 0 ? '+' : '';
      return '×' + f.toFixed(2) + '(' + sign + pct + '%)';
    };
    const paintTriad = (el, m) => {
      if (!el) return;
      el.textContent = fmtMod(m);
      el.classList.toggle('triad-up', m > 0.005);
      el.classList.toggle('triad-down', m < -0.005);
    };
    paintTriad(els.lingliTriad, mods.lingli);
    paintTriad(els.tishuTriad, mods.tishu);
    paintTriad(els.jingshenTriad, mods.jingshen);
    if (els.triadHint) {
      const pct = (s) => Math.round(s * 100) + '%';
      const damp = Math.round((stats.triadDamp || 0) * 100);
      els.triadHint.textContent =
        '三才占比 灵' +
        pct(shares.lingli) +
        ' / 体' +
        pct(shares.tishu) +
        ' / 神' +
        pct(shares.jingshen) +
        ' · 法宝调和 ' +
        damp +
        '%（神↑灵+体− · 灵↑体+神− · 体↑神+灵−）';
    }

    els.qiyunVal.textContent = String(state.qiyun);
    els.combatVal.textContent = X.formatNumber(stats.combatPower);
    if (els.clickPowerLingli) els.clickPowerLingli.textContent = X.formatNumber(clicks.lingli || 0);
    if (els.clickPowerTishu) els.clickPowerTishu.textContent = X.formatNumber(clicks.tishu || 0);
    if (els.clickPowerJingshen)
      els.clickPowerJingshen.textContent = X.formatNumber(clicks.jingshen || 0);
    els.pathLine.textContent = pathLabel();

    renderRealmRail(stats);
    softUpdateAttrs(stats);
    renderEquipBar();

    if (stats.nextStarCost != null) {
      const sp = stats.raiseStarPill;
      const pillTxt = sp
        ? ' + ' + sp.pillName + '×' + sp.count + '（有' + sp.owned + '）'
        : '';
      els.btnRaiseStar.textContent =
        '升层（' + X.formatNumber(stats.nextStarCost) + '灵力' + pillTxt + '）';
      els.btnRaiseStar.classList.toggle(
        'is-locked',
        !stats.canRaiseStar || !!stats.pendingEvent,
      );
    } else {
      els.btnRaiseStar.textContent = '已满九层';
      els.btnRaiseStar.classList.add('is-locked');
    }

    if (stats.breakCost != null) {
      const pill = stats.breakthroughPill;
      const pillTxt = pill
        ? ' + ' + pill.pillName + '×' + pill.count + '（有' + pill.owned + '）'
        : '';
      els.btnBreak.textContent =
        '破境（' + X.formatNumber(stats.breakCost) + '灵力' + pillTxt + '）';
      els.btnBreak.classList.toggle(
        'is-locked',
        !stats.canBreakthrough || !!stats.pendingEvent,
      );
      els.realmHint.textContent = pill
        ? '九层圆满。破境需灵力与丹药「' +
          pill.pillName +
          '」×' +
          pill.count +
          '（背包 ' +
          pill.owned +
          '）。'
        : '九层圆满，可破入下一境。破境赠三资源。';
    } else if (state.realmIndex >= X.REALMS.length - 1) {
      els.btnBreak.textContent = '已至大道';
      els.btnBreak.classList.add('is-locked');
      els.realmHint.textContent = state.endingId ? '此世落幕，可轮回继承。' : '大道之上，唯余轮回。';
    } else {
      els.btnBreak.textContent = '破境（需九层）';
      els.btnBreak.classList.add('is-locked');
      const sp = stats.raiseStarPill;
      els.realmHint.textContent = sp
        ? '升层需灵力与「' +
          sp.pillName +
          '」×' +
          sp.count +
          '（有' +
          sp.owned +
          '）。满九层再破境。'
        : '每一层升层都需丹药；可坊市购丹或炼丹。';
    }

    softUpdateShops(stats);
    softUpdateCraft(stats);
    if (!soft || !treasuresBuilt) buildTreasures();
    if (!soft || !craftBuilt) buildCraftPanels();
    renderMainTimeline();
    renderMilestones();
    if (!soft) {
      renderChronicle();
      renderEndings();
      renderCombat(true);
    } else {
      if (els.chronicleList.childElementCount !== Math.min(12, state.chronicle.length)) {
        renderChronicle();
      }
      renderCombat(false);
      // 装备/法宝变化时刷新坊市列表；资源变动只就地刷新按钮锁定态，避免悬停闪烁
      const treasureSig = equipmentSignature() + '|' + state.treasures.join(',');
      if (treasureSig !== lastTreasureSig) {
        lastTreasureSig = treasureSig;
        treasuresBuilt = false;
        buildTreasures();
      }
      refreshTreasureLocks();
    }

    const canRein = stats.canReincarnate || state.phase === 'ended';
    els.btnReincarnate.classList.toggle('is-locked', !canRein || state.phase === 'rebirth');
    els.reincarnateStatus.textContent =
      '死亡或主动轮回后可选出身；按峰值境界继承属性与法宝。已轮回 ' +
      state.reincarnations +
      ' 次 · 胜 ' +
      state.combatWins +
      ' / 负 ' +
      state.combatLosses +
      '。预计气运 +' +
      stats.qiyunGain +
      '。';

    syncBirthModal();
    syncEventModal(stats);
    syncEndingModal();
  }

  function resourceOfFrom(st, key) {
    if (key === 'lingli') return st.lingqi;
    if (key === 'tishu') return st.tishu;
    return st.jingshen;
  }

  function doAbsorbClick(channel) {
    if (state.phase !== 'playing' || state.endingId) return false;
    const before = resourceOf(channel);
    const hadEvent = !!state.randomEventId;
    const res = X.clickAbsorb(state, channel);
    if (!res.ok) {
      if (res.reason) showToast(res.reason);
      setState(res.state, { soft: true });
      return false;
    }
    spawnFloat(resourceOfFrom(res.state, channel) - before);
    if (!hadEvent && res.state.randomEventId) {
      const title =
        (X.MAIN_STORY.find((ev) => ev.id === res.state.randomEventId) ||
          X.RANDOM_EVENTS.find((ev) => ev.id === res.state.randomEventId) ||
          {}).title || '未知';
      showToast('奇遇：' + title);
    }
    setState(res.state, { soft: true });
    return true;
  }

  let holdAbsorbTimer = null;
  let holdAbsorbChannel = null;
  const HOLD_ABSORB_MS = 500;

  function stopHoldAbsorb() {
    if (holdAbsorbTimer != null) {
      clearInterval(holdAbsorbTimer);
      holdAbsorbTimer = null;
    }
    holdAbsorbChannel = null;
    if (els.absorbGrid) {
      els.absorbGrid.querySelectorAll('.absorb-btn.is-holding').forEach((b) => {
        b.classList.remove('is-holding');
      });
    }
  }

  function startHoldAbsorb(btn, channel) {
    stopHoldAbsorb();
    holdAbsorbChannel = channel;
    btn.classList.add('is-holding');
    // 按下立即吐纳一次，之后每 0.5 秒一次
    if (!doAbsorbClick(channel)) {
      stopHoldAbsorb();
      return;
    }
    holdAbsorbTimer = setInterval(() => {
      if (holdAbsorbChannel !== channel) {
        stopHoldAbsorb();
        return;
      }
      if (!doAbsorbClick(channel)) stopHoldAbsorb();
    }, HOLD_ABSORB_MS);
  }

  if (els.absorbGrid) {
    els.absorbGrid.addEventListener('pointerdown', (e) => {
      const btn = e.target.closest('.absorb-btn[data-channel]');
      if (!btn) return;
      if (e.button != null && e.button !== 0) return;
      e.preventDefault();
      try {
        btn.setPointerCapture(e.pointerId);
      } catch (_) {
        /* ignore */
      }
      startHoldAbsorb(btn, btn.dataset.channel);
    });
    els.absorbGrid.addEventListener('pointerup', stopHoldAbsorb);
    els.absorbGrid.addEventListener('pointercancel', stopHoldAbsorb);
    els.absorbGrid.addEventListener('pointerleave', (e) => {
      if (e.target === els.absorbGrid) stopHoldAbsorb();
    });
    els.absorbGrid.addEventListener('lostpointercapture', stopHoldAbsorb);
    // 禁用原生 click，避免松手再触发一次
    els.absorbGrid.addEventListener('click', (e) => {
      if (e.target.closest('.absorb-btn')) e.preventDefault();
    });
    els.absorbGrid.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.absorb-btn')) e.preventDefault();
    });
  }

  window.addEventListener('blur', stopHoldAbsorb);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopHoldAbsorb();
  });
  els.equipSlots.addEventListener('click', (e) => {
    const btn = e.target.closest('.equip-slot[data-treasure-id]');
    if (!btn) return;
    hideEquipTip(true);
    const res = X.toggleEquip(state, btn.dataset.treasureId);
    if (!res.ok) {
      showToast(res.reason || '无法卸下');
      return;
    }
    treasuresBuilt = false;
    setState(res.state, { soft: true });
  });

  els.equipSlots.addEventListener('pointerover', (e) => {
    const btn = e.target.closest('.equip-slot[data-treasure-id]');
    if (!btn || !els.equipSlots.contains(btn)) return;
    const id = btn.dataset.treasureId;
    showEquipTip(btn, treasureTipHtml(id, false), { treasureId: id });
  });
  els.equipSlots.addEventListener('pointerout', (e) => {
    const btn = e.target.closest('.equip-slot[data-treasure-id]');
    if (!btn) return;
    const to = e.relatedTarget;
    if (to && (btn.contains(to) || (els.equipTip && els.equipTip.contains(to)))) return;
    scheduleHideEquipTip();
  });

  els.combatList.addEventListener('click', (e) => {
    const btn = e.target.closest('.combat-row[data-enemy-id]');
    if (!btn) return;
    const encounterId = btn.dataset.enemyId;
    const encounter = X.resolveCombatEncounter
      ? X.resolveCombatEncounter(state, encounterId)
      : X.getEnemy(encounterId);
    if (!encounter) return;
    const diff =
      (X.COMBAT_DIFFICULTY_LABELS && encounter.difficulty
        ? X.COMBAT_DIFFICULTY_LABELS[encounter.difficulty]
        : '') || '';
    const pillId = (els.combatPillSelect && els.combatPillSelect.value) || '';
    const pillName = pillId && X.getPillRecipe ? (X.getPillRecipe(pillId) || {}).name : '';
    const tip =
      '与「' +
      encounter.name +
      '」' +
      (diff ? '（' + diff + '）' : '') +
      '对战？' +
      (pillName ? '将服「' + pillName + '」强化。' : '可先换装或选战前丹药。') +
      '败可能掉段或身死。';
    if (!window.confirm(tip)) return;
    const res = X.startCombat(state, encounterId, Date.now(), pillId ? { pillId: pillId } : undefined);
    if (!res.ok) {
      showToast(res.reason || '无法对战');
      setState(res.state, { soft: true });
      return;
    }
    showToast(
      (res.won ? '胜！' : res.defeatOutcome === 'death' ? '身死…' : res.defeatOutcome === 'demote' ? '败·掉段' : '败…') +
        ' 战力 ' +
        Math.floor(res.playerPower) +
        ' vs ' +
        Math.floor(res.enemyPower) +
        (res.edgeEvents && res.edgeEvents.length ? ' · ' + res.edgeEvents.join('、') : '') +
        (res.loot ? ' · 获 ' + res.loot : ''),
    );
    treasuresBuilt = false;
    craftBuilt = false;
    setState(res.state);
  });

  els.btnRaiseStar.addEventListener('click', () => {
    if (els.btnRaiseStar.classList.contains('is-locked')) return;
    const beforeRnd = state.randomEventId;
    const res = X.raiseStar(state);
    if (!res.ok) {
      showToast(res.reason || '无法升层');
      setState(res.state, { soft: true });
      return;
    }
    showToast(res.message || '升层成功');
    if (!beforeRnd && res.state.randomEventId) {
      showToast('奇遇：升层触发');
    }
    shopsBuilt = false;
    craftBuilt = false;
    setState(res.state);
  });

  els.btnBreak.addEventListener('click', () => {
    if (els.btnBreak.classList.contains('is-locked')) return;
    const beforeRnd = state.randomEventId;
    const res = X.breakthrough(state);
    if (!res.ok) {
      showToast(res.reason || '无法破境');
      setState(res.state, { soft: true });
      return;
    }
    showToast(res.message || '破境成功');
    if (!beforeRnd && res.state.randomEventId) showToast('奇遇：破境触发');
    shopsBuilt = false;
    treasuresBuilt = false;
    renderedRealmIndex = -1;
    setState(res.state);
  });

  function onShopClick(e) {
    const pillMini = e.target.closest('.mini-btn[data-pill-id]');
    if (pillMini) {
      if (pillMini.classList.contains('is-locked') || pillMini.disabled) return;
      const id = pillMini.dataset.pillId;
      const action = pillMini.dataset.action;
      if (action === 'use') {
        const res = X.usePill(state, id);
        if (!res.ok) {
          showToast(res.reason || '无法服用');
          setState(res.state, { soft: true });
          return;
        }
        craftBuilt = false;
        showToast(res.message || '已服下');
        setState(res.state);
        return;
      }
      if (action === 'buy') {
        const res = X.buyPill(state, id);
        if (!res.ok) {
          showToast(res.reason || '无法购买');
          setState(res.state, { soft: true });
          return;
        }
        craftBuilt = false;
        showToast(res.message || '购得丹药');
        setState(res.state, { soft: true });
        return;
      }
      if (action === 'sell') {
        const p = X.getPillRecipe(id);
        const price = X.sellPillValue ? X.sellPillValue(id) : 0;
        if (!window.confirm('出售「' + (p ? p.name : id) + '」得灵力 ' + X.formatNumber(price) + '？')) {
          return;
        }
        const res = X.sellPill(state, id);
        if (!res.ok) {
          showToast(res.reason || '无法出售');
          setState(res.state, { soft: true });
          return;
        }
        craftBuilt = false;
        showToast(res.message || '已出售');
        setState(res.state);
        return;
      }
      return;
    }
    const herbMini = e.target.closest('.mini-btn[data-herb-id]');
    if (herbMini) {
      if (herbMini.classList.contains('is-locked') || herbMini.disabled) return;
      const id = herbMini.dataset.herbId;
      if (herbMini.dataset.action === 'sell') {
        const h = X.getHerb(id);
        const price = X.sellHerbValue ? X.sellHerbValue(id) : 0;
        if (!window.confirm('出售「' + (h ? h.name : id) + '」得灵力 ' + X.formatNumber(price) + '？')) {
          return;
        }
        const res = X.sellHerb(state, id);
        if (!res.ok) {
          showToast(res.reason || '无法出售');
          setState(res.state, { soft: true });
          return;
        }
        craftBuilt = false;
        showToast(res.message || '已出售');
        setState(res.state);
        return;
      }
      return;
    }
    const mini = e.target.closest('.mini-btn[data-treasure-id]');
    if (mini) {
      if (mini.classList.contains('is-locked') || mini.disabled) return;
      const id = mini.dataset.treasureId;
      const action = mini.dataset.action;
      if (action === 'toggle') {
        const res = X.toggleEquip(state, id);
        if (!res.ok) {
          showToast(res.reason || '无法装备');
          return;
        }
        treasuresBuilt = false;
        setState(res.state, { soft: true });
        return;
      }
      if (action === 'temper') {
        const res = X.temperTreasure(state, id);
        if (!res.ok) {
          showToast(res.reason || '无法炼器');
          setState(res.state, { soft: true });
          return;
        }
        treasuresBuilt = false;
        lastEquipSig = '';
        showToast(res.message || '炼器成功');
        setState(res.state);
        return;
      }
      if (action === 'refine') {
        const res = X.refineTreasure(state, id);
        if (!res.ok) {
          showToast(res.reason || '无法洗练');
          setState(res.state, { soft: true });
          return;
        }
        treasuresBuilt = false;
        lastEquipSig = '';
        showToast(res.message || '洗练成功');
        setState(res.state);
        return;
      }
      if (action === 'promote') {
        const res = X.promoteTreasure(state, id);
        if (!res.ok) {
          showToast(res.reason || '无法升品');
          setState(res.state, { soft: true });
          return;
        }
        treasuresBuilt = false;
        lastEquipSig = '';
        showToast(res.message || '升品成功');
        setState(res.state);
        return;
      }
      if (action === 'sell') {
        const t = X.getTreasure(id);
        const price = X.sellValue ? X.sellValue(state, id) : t && t.sellLingli;
        if (!window.confirm('出售「' + (t ? t.name : id) + '」得灵力 ' + X.formatNumber(price) + '？')) {
          return;
        }
        const res = X.sellTreasure(state, id);
        if (!res.ok) {
          showToast(res.reason || '无法出售');
          setState(res.state, { soft: true });
          return;
        }
        treasuresBuilt = false;
        lastEquipSig = '';
        showToast(res.message || '已出售');
        setState(res.state);
        return;
      }
      return;
    }
    const btn = e.target.closest('.art-row');
    if (!btn || btn.classList.contains('is-locked')) return;
    if (btn.classList.contains('owned-treasure')) {
      const id = btn.dataset.treasureId;
      if (tipPinned && tipTreasureId === id) {
        hideEquipTip(true);
        return;
      }
      showEquipTip(btn, treasureTipHtml(id, true), { treasureId: id, pinned: true });
      return;
    }
    if (btn.dataset.pillId && btn.dataset.action === 'craft') {
      const res = X.craftPill(state, btn.dataset.pillId);
      if (!res.ok) {
        showToast(res.reason || '炼丹失败');
        setState(res.state, { soft: true });
        return;
      }
      craftBuilt = false;
      showToast(res.message || '丹成入库');
      setState(res.state);
      return;
    }
    if (btn.dataset.pillId && btn.dataset.action === 'buy') {
      const res = X.buyPill(state, btn.dataset.pillId);
      if (!res.ok) {
        showToast(res.reason || '无法购买');
        setState(res.state, { soft: true });
        return;
      }
      craftBuilt = false;
      showToast(res.message || '购得丹药');
      setState(res.state, { soft: true });
      return;
    }
    if (btn.dataset.herbId && (btn.dataset.action === 'buy' || btn.tagName === 'BUTTON')) {
      const res = X.buyHerb(state, btn.dataset.herbId);
      if (!res.ok) {
        showToast(res.reason || '无法购药');
        setState(res.state, { soft: true });
        return;
      }
      craftBuilt = false;
      showToast(res.message || '购得药材');
      setState(res.state, { soft: true });
      return;
    }
    if (btn.dataset.treasureId) {
      const id = btn.dataset.treasureId;
      if (btn.dataset.action === 'buy') {
        const res = X.buyTreasure(state, id);
        if (!res.ok) {
          showToast(res.reason || '无法购买');
          setState(res.state, { soft: true });
          return;
        }
        treasuresBuilt = false;
        showToast(res.message || '购得法宝');
        setState(res.state);
        return;
      }
      if (btn.dataset.action === 'toggle') {
        const res = X.toggleEquip(state, id);
        if (!res.ok) {
          showToast(res.reason || '无法装备');
          return;
        }
        treasuresBuilt = false;
        setState(res.state, { soft: true });
        return;
      }
      if (btn.dataset.action === 'temper') {
        const res = X.temperTreasure(state, id);
        if (!res.ok) {
          showToast(res.reason || '无法炼器');
          setState(res.state, { soft: true });
          return;
        }
        treasuresBuilt = false;
        lastEquipSig = '';
        showToast(res.message || '炼器成功');
        setState(res.state);
        return;
      }
      if (btn.dataset.action === 'refine') {
        const res = X.refineTreasure(state, id);
        if (!res.ok) {
          showToast(res.reason || '无法洗练');
          setState(res.state, { soft: true });
          return;
        }
        treasuresBuilt = false;
        lastEquipSig = '';
        showToast(res.message || '洗练成功');
        setState(res.state);
        return;
      }
      if (btn.dataset.action === 'promote') {
        const res = X.promoteTreasure(state, id);
        if (!res.ok) {
          showToast(res.reason || '无法升品');
          setState(res.state, { soft: true });
          return;
        }
        treasuresBuilt = false;
        lastEquipSig = '';
        showToast(res.message || '升品成功');
        setState(res.state);
        return;
      }
      if (btn.dataset.action === 'sell') {
        const t = X.getTreasure(id);
        const price = X.sellValue ? X.sellValue(state, id) : t && t.sellLingli;
        if (!window.confirm('出售「' + (t ? t.name : id) + '」得灵力 ' + X.formatNumber(price) + '？')) {
          return;
        }
        const res = X.sellTreasure(state, id);
        if (!res.ok) {
          showToast(res.reason || '无法出售');
          setState(res.state, { soft: true });
          return;
        }
        treasuresBuilt = false;
        lastEquipSig = '';
        showToast(res.message || '已出售');
        setState(res.state);
        return;
      }
      return;
    }
    const id = btn.dataset.artId;
    if (!id) return;
    const res = X.buyArt(state, id);
    if (!res.ok) {
      showToast(res.reason || '无法修习');
      setState(res.state, { soft: true });
      return;
    }
    setState(res.state, { soft: true });
  }
  els.shopLingli.addEventListener('click', onShopClick);
  els.shopTishu.addEventListener('click', onShopClick);
  els.shopJingshen.addEventListener('click', onShopClick);
  if (els.pillList) els.pillList.addEventListener('click', onShopClick);
  if (els.pillShop) els.pillShop.addEventListener('click', onShopClick);
  if (els.pillOwned) els.pillOwned.addEventListener('click', onShopClick);
  if (els.herbOwned) els.herbOwned.addEventListener('click', onShopClick);
  if (els.herbShop) els.herbShop.addEventListener('click', onShopClick);
  els.ownedTreasures.addEventListener('click', onShopClick);
  els.shopTreasures.addEventListener('click', onShopClick);

  els.ownedTreasures.addEventListener('pointerover', (e) => {
    const row = e.target.closest('.owned-treasure[data-treasure-id]');
    if (!row || !els.ownedTreasures.contains(row)) return;
    if (tipPinned && tipTreasureId && tipTreasureId !== row.dataset.treasureId) return;
    const id = row.dataset.treasureId;
    showEquipTip(row, treasureTipHtml(id, true), {
      treasureId: id,
      pinned: tipPinned && tipTreasureId === id,
    });
  });
  els.ownedTreasures.addEventListener('pointerout', (e) => {
    const row = e.target.closest('.owned-treasure[data-treasure-id]');
    if (!row) return;
    const to = e.relatedTarget;
    if (to && (row.contains(to) || (els.equipTip && els.equipTip.contains(to)))) return;
    scheduleHideEquipTip();
  });

  if (els.equipTip) {
    els.equipTip.addEventListener('pointerenter', () => {
      clearTimeout(tipHideTimer);
      tipHideTimer = null;
    });
    els.equipTip.addEventListener('pointerleave', () => {
      scheduleHideEquipTip();
    });
    els.equipTip.addEventListener('click', (e) => {
      if (e.target.closest('.mini-btn[data-treasure-id]')) {
        onShopClick(e);
      }
    });
  }

  document.addEventListener('pointerdown', (e) => {
    if (!els.equipTip || els.equipTip.hidden) return;
    const t = e.target;
    if (els.equipTip.contains(t)) return;
    if (tipAnchorEl && tipAnchorEl.contains(t)) return;
    hideEquipTip(true);
  });

  window.addEventListener('scroll', () => hideEquipTip(true), true);
  window.addEventListener('resize', () => hideEquipTip(true));

  // 炼体已移除

  els.eventOptions.addEventListener('click', (e) => {
    const btn = e.target.closest('.option-btn');
    if (!btn) return;
    const res = X.resolveEvent(state, btn.dataset.eventId, btn.dataset.optionId);
    if (!res.ok) {
      showToast(res.reason || '无法抉择');
      setState(res.state, { soft: true });
      return;
    }
    eventModalOpen = false;
    els.eventModal.hidden = true;
    showToast('抉择：' + (res.message || ''));
    shopsBuilt = false;
    treasuresBuilt = false;
    setState(res.state);
  });

  els.birthOptions.addEventListener('click', (e) => {
    const btn = e.target.closest('.option-btn');
    if (!btn) return;
    const res = X.chooseBirth(state, btn.dataset.birthId, selectedBring);
    if (!res.ok) {
      showToast(res.reason || '无法转生');
      return;
    }
    selectedBring = [];
    shopsBuilt = false;
    treasuresBuilt = false;
    renderedRealmIndex = -1;
    lastEndingShown = null;
    showToast(res.message || '转生成功');
    setState(res.state);
  });

  els.btnReincarnate.addEventListener('click', () => {
    if (els.btnReincarnate.classList.contains('is-locked')) return;
    if (!window.confirm('确认轮回？将进入出身选择，并按峰值境界继承属性/法宝。')) return;
    const res = X.beginReincarnation(state);
    if (!res.ok) {
      showToast(res.reason || '无法轮回');
      return;
    }
    lastEndingShown = null;
    els.endingModal.hidden = true;
    showToast(res.message || '进入轮回');
    setState(res.state);
  });

  els.btnEndingOk.addEventListener('click', () => {
    els.endingModal.hidden = true;
  });

  els.btnReset.addEventListener('click', () => {
    if (!window.confirm('清除全部存档（含气运、宝库、结局）？')) return;
    X.clearStorage();
    lastEndingShown = null;
    shopsBuilt = false;
    treasuresBuilt = false;
    craftBuilt = false;
    attrsBuilt = false;
    renderedRealmIndex = -1;
    eventModalOpen = false;
    selectedBring = [];
    lastCombatSig = '';
    lastEquipSig = '';
    lastTreasureSig = '';
    timeRandomAcc = 0;
    els.eventModal.hidden = true;
    els.endingModal.hidden = true;
    setState(X.createNewState());
    showToast('存档已清除');
  });

  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      const map = {
        arts: 'tabArts',
        alchemy: 'tabAlchemy',
        forge: 'tabForge',
        body: 'tabForge',
        cycle: 'tabCycle',
      };
      const pane = document.getElementById(map[tab.dataset.tab]);
      if (pane) pane.classList.add('active');
    });
  });

  state = X.loadFromStorage();
  if (state.phase === 'playing') {
    const boot = X.tick(state);
    state = boot.state;
    const gainedSum =
      (boot.gained && typeof boot.gained === 'object'
        ? boot.gained.lingli + boot.gained.tishu + boot.gained.jingshen
        : boot.gained) || 0;
    if (boot.offlineSeconds > 30 && gainedSum > 0) {
      showToast(
        '离线约 ' +
          Math.floor(boot.cappedSeconds / 60) +
          ' 分钟，三资源共 +' +
          X.formatNumber(gainedSum),
      );
    }
  }
  render();
  scheduleSave();

  setInterval(() => {
    if (state.phase !== 'playing') return;
    const t = X.tick(state);
    const gainedSum =
      (t.gained && typeof t.gained === 'object'
        ? t.gained.lingli + t.gained.tishu + t.gained.jingshen
        : t.gained) || 0;
    // 仅有产出时才触发完整 soft 渲染
    if (gainedSum > 0) {
      let next = t.state;
      timeRandomAcc += 250;
      if (timeRandomAcc >= 12000) {
        timeRandomAcc = 0;
        const rnd = X.tryRandomEvent(next, 'time');
        if (rnd.ok) {
          next = rnd.state;
          showToast('奇遇：时光流转…');
        }
      }
      setState(next, { soft: true });
    } else {
      state = { ...state, lastTickAt: t.state.lastTickAt };
      timeRandomAcc += 250;
      if (timeRandomAcc >= 12000) {
        timeRandomAcc = 0;
        const rnd = X.tryRandomEvent(state, 'time');
        if (rnd.ok) {
          showToast('奇遇：时光流转…');
          setState(rnd.state, { soft: true });
        }
      }
    }
  }, 250);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) X.saveToStorage(state);
  });
  window.addEventListener('beforeunload', () => X.saveToStorage(state));

  fetch('api/meta')
    .then((r) => r.json())
    .then((meta) => {
      if (meta && meta.version) els.versionBadge.textContent = 'v' + meta.version;
    })
    .catch(() => {});
})();
