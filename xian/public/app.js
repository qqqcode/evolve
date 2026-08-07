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
  let lastCombatSig = '';
  let timeRandomAcc = 0;

  const els = {
    lingqiVal: document.getElementById('lingqiVal'),
    dpsVal: document.getElementById('dpsVal'),
    qiyunVal: document.getElementById('qiyunVal'),
    combatVal: document.getElementById('combatVal'),
    clickPowerVal: document.getElementById('clickPowerVal'),
    realmRail: document.getElementById('realmRail'),
    realmBlurb: document.getElementById('realmBlurb'),
    pathLine: document.getElementById('pathLine'),
    realmHint: document.getElementById('realmHint'),
    freePointsHint: document.getElementById('freePointsHint'),
    attrList: document.getElementById('attrList'),
    combatList: document.getElementById('combatList'),
    equipSlots: document.getElementById('equipSlots'),
    naturalHint: document.getElementById('naturalHint'),
    absorbBtn: document.getElementById('absorbBtn'),
    floatLayer: document.getElementById('floatLayer'),
    clickShop: document.getElementById('clickShop'),
    passiveShop: document.getElementById('passiveShop'),
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
    eventOptions: document.getElementById('eventOptions'),
    endingModal: document.getElementById('endingModal'),
    endingName: document.getElementById('endingName'),
    endingTitle: document.getElementById('endingTitle'),
    endingBody: document.getElementById('endingBody'),
  };

  function showToast(msg) {
    els.toast.hidden = false;
    els.toast.textContent = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      els.toast.hidden = true;
    }, 2800);
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
        '</span><span class="attr-val"></span><button type="button" data-attr="' +
        key +
        '">+1</button>';
      els.attrList.appendChild(row);
    });
    attrsBuilt = true;
  }

  function softUpdateAttrs(stats) {
    if (!attrsBuilt) buildAttrs();
    els.freePointsHint.textContent =
      state.freePoints > 0 ? '（可分配 ' + state.freePoints + '）' : '';
    els.attrList.querySelectorAll('.attr-row').forEach((row) => {
      const key = row.dataset.attrKey;
      const total = stats.totalAttrs[key];
      const base = state.attrs[key] + state.legacyAttrs[key];
      const val = row.querySelector('.attr-val');
      if (val) {
        val.innerHTML =
          total + ' <small style="opacity:.6">(基' + base + ')</small>';
      }
      const btn = row.querySelector('button');
      if (btn) btn.disabled = state.freePoints <= 0 || state.phase !== 'playing';
    });
  }

  function renderEquipBar() {
    if (!els.equipSlots) return;
    const sig =
      X.EQUIP_SLOTS.map((s) => state.equipped[s] || '').join(',') +
      '|' +
      state.naturals.join(',') +
      '|' +
      state.naturalPassive;
    els.equipSlots.innerHTML = '';
    X.EQUIP_SLOTS.forEach((slot) => {
      const id = state.equipped[slot];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'equip-slot' + (id ? ' filled' : '');
      const label = X.EQUIP_SLOT_LABELS[slot];
      if (id) {
        const t = X.getTreasure(id);
        btn.dataset.treasureId = id;
        btn.innerHTML =
          '<span class="slot-mark">' +
          (t ? t.mark : '?') +
          '</span><span class="slot-name">〔' +
          label +
          '〕' +
          (t ? t.name : id) +
          '</span><span class="slot-lore">' +
          (t ? t.lore + ' · 点击卸下' : '') +
          '</span>';
      } else {
        btn.disabled = true;
        btn.innerHTML =
          '<span class="slot-empty">〔' + label + '〕空 · 坊市装备</span>';
      }
      els.equipSlots.appendChild(btn);
    });
    if (els.naturalHint) {
      els.naturalHint.textContent = state.naturals.length
        ? '天才地宝 ' +
          state.naturals.length +
          ' 种 · 永久被动 +' +
          (Math.round(state.naturalPassive * 10) / 10) +
          '/秒（主线章 ' +
          state.mainChapter +
          '）'
        : '尚未获得天才地宝 · 主线进度第 ' + state.mainChapter + ' 章';
    }
    lastEquipSig = sig;
  }

  function renderCombat(force) {
    const list =
      state.phase !== 'playing' || state.endingId ? [] : X.listCombatEnemies(state);
    const sig =
      state.phase +
      ':' +
      state.realmIndex +
      ':' +
      list.map((e) => e.id).join(',');
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
      btn.innerHTML =
        '<strong>' +
        enemy.name +
        '</strong><span>' +
        enemy.blurb +
        ' · ' +
        enemy.lore +
        ' · 赏 ' +
        X.formatNumber(enemy.rewardLingqi) +
        '</span>';
      els.combatList.appendChild(btn);
    });
  }

  function buildShops() {
    els.clickShop.innerHTML = '';
    els.passiveShop.innerHTML = '';
    X.ARTS.forEach((art) => {
      if (!X.artAvailable(state, art) && (state.owned[art.id] || 0) <= 0) {
        if (art.minRealm > state.realmIndex + 1) return;
        if (art.branch && art.branch !== state.branchId) return;
        if (art.faction && art.faction !== state.factionId) return;
      }
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'art-row';
      btn.dataset.artId = art.id;
      btn.innerHTML =
        '<span class="art-mark">' +
        art.mark +
        '</span><span><p class="art-name"></p><p class="art-desc"></p></span><span class="art-meta"></span>';
      btn.querySelector('.art-name').textContent = art.name;
      btn.querySelector('.art-desc').textContent = art.description;
      (art.kind === 'click' ? els.clickShop : els.passiveShop).appendChild(btn);
    });
    shopsBuilt = true;
  }

  function softUpdateShops(stats) {
    if (!shopsBuilt) buildShops();
    document.querySelectorAll('#clickShop .art-row, #passiveShop .art-row').forEach((btn) => {
      const id = btn.dataset.artId;
      const art = X.ARTS.find((a) => a.id === id);
      if (!art) return;
      const available = X.artAvailable(state, art);
      const cost = X.artCost(state, id);
      const owned = state.owned[id] || 0;
      const meta = btn.querySelector('.art-meta');
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
        cost != null && state.lingqi >= cost && state.phase === 'playing' && !stats.pendingEvent;
      btn.classList.toggle('is-locked', !canBuy);
      meta.textContent = '×' + owned + ' · ' + X.formatNumber(cost || 0);
    });
  }

  function buildTreasures() {
    els.ownedTreasures.innerHTML = '';
    els.shopTreasures.innerHTML = '';
    els.vaultList.innerHTML = '';

    state.treasures.forEach((id) => {
      const t = X.getTreasure(id);
      if (!t) return;
      const eq = state.equipped[t.slot] === id;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'art-row treasure-row';
      btn.dataset.treasureId = id;
      btn.dataset.action = 'toggle';
      btn.innerHTML =
        '<span class="art-mark">' +
        t.mark +
        '</span><span><p class="art-name">' +
        t.name +
        '<span class="lore-tag">' +
        (X.EQUIP_SLOT_LABELS[t.slot] || t.slot) +
        ' · ' +
        t.lore +
        '</span></p><p class="art-desc">' +
        t.description +
        '</p></span><span class="art-meta">' +
        (eq ? '装备中' : '点装备') +
        '</span>';
      els.ownedTreasures.appendChild(btn);
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
      btn.innerHTML =
        '<span class="art-mark">' +
        t.mark +
        '</span><span><p class="art-name">' +
        t.name +
        '<span class="lore-tag">' +
        (X.EQUIP_SLOT_LABELS[t.slot] || '') +
        ' · ' +
        t.lore +
        '</span></p><p class="art-desc">' +
        t.description +
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
        ' · 自由点 ' +
        b.freePoints +
        '</span>';
      els.birthOptions.appendChild(btn);
    });
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
      let extra = opt.blurb;
      if (opt.combatEnemyId) extra += '（含对战）';
      if (opt.deathOnLose) extra += '（败则死）';
      btn.innerHTML = '<strong>' + opt.label + '</strong><span>' + extra + '</span>';
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
    els.dpsVal.textContent = X.formatNumber(stats.lingqiPerSec);
    els.qiyunVal.textContent = String(state.qiyun);
    els.combatVal.textContent = X.formatNumber(stats.combatPower);
    els.clickPowerVal.textContent = X.formatNumber(stats.clickPower);
    els.pathLine.textContent = pathLabel();

    renderRealmRail(stats);
    softUpdateAttrs(stats);
    renderEquipBar();

    if (stats.nextStarCost != null) {
      els.btnRaiseStar.textContent = '升层（' + X.formatNumber(stats.nextStarCost) + '）';
      els.btnRaiseStar.classList.toggle(
        'is-locked',
        !stats.canRaiseStar || !!stats.pendingEvent,
      );
    } else {
      els.btnRaiseStar.textContent = '已满九层';
      els.btnRaiseStar.classList.add('is-locked');
    }

    if (stats.breakCost != null) {
      els.btnBreak.textContent = '破境（' + X.formatNumber(stats.breakCost) + '）';
      els.btnBreak.classList.toggle(
        'is-locked',
        !stats.canBreakthrough || !!stats.pendingEvent,
      );
      els.realmHint.textContent = '九层圆满，可破入下一境。破境+2属性点。';
    } else if (state.realmIndex >= X.REALMS.length - 1) {
      els.btnBreak.textContent = '已至大道';
      els.btnBreak.classList.add('is-locked');
      els.realmHint.textContent = state.endingId ? '此世落幕，可轮回继承。' : '大道之上，唯余轮回。';
    } else {
      els.btnBreak.textContent = '破境（需九层）';
      els.btnBreak.classList.add('is-locked');
      els.realmHint.textContent = '先升至九层再破境。';
    }

    softUpdateShops(stats);
    if (!soft || !treasuresBuilt) buildTreasures();
    if (!soft) {
      renderChronicle();
      renderEndings();
      renderCombat(true);
    } else {
      if (els.chronicleList.childElementCount !== Math.min(12, state.chronicle.length)) {
        renderChronicle();
      }
      renderCombat(false);
      // 装备变化时刷新
      const sig =
        X.EQUIP_SLOTS.map((s) => state.equipped[s] || '').join(',') +
        '|' +
        state.treasures.join(',');
      if (sig !== lastEquipSig) {
        treasuresBuilt = false;
        buildTreasures();
      }
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

  els.absorbBtn.addEventListener('click', () => {
    const before = state.lingqi;
    const hadEvent = !!state.randomEventId;
    const res = X.clickAbsorb(state);
    if (!res.ok) {
      if (res.reason) showToast(res.reason);
      setState(res.state, { soft: true });
      return;
    }
    spawnFloat(res.state.lingqi - before);
    if (!hadEvent && res.state.randomEventId) {
      showToast('奇遇：' + (X.RANDOM_EVENTS.find((e) => e.id === res.state.randomEventId) || {}).title);
    }
    setState(res.state, { soft: true });
  });

  els.attrList.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-attr]');
    if (!btn || btn.disabled) return;
    e.preventDefault();
    const key = btn.dataset.attr;
    const res = X.allocatePoint(state, key);
    if (!res.ok) {
      showToast(res.reason || '无法加点');
      return;
    }
    setState(res.state, { soft: true });
  });

  els.equipSlots.addEventListener('click', (e) => {
    const btn = e.target.closest('.equip-slot[data-treasure-id]');
    if (!btn) return;
    const res = X.toggleEquip(state, btn.dataset.treasureId);
    if (!res.ok) {
      showToast(res.reason || '无法卸下');
      return;
    }
    treasuresBuilt = false;
    setState(res.state, { soft: true });
  });

  els.combatList.addEventListener('click', (e) => {
    const btn = e.target.closest('.combat-row[data-enemy-id]');
    if (!btn) return;
    const enemy = X.getEnemy(btn.dataset.enemyId);
    if (!enemy) return;
    if (!window.confirm('与「' + enemy.name + '」对战？败可能只是丢脸，剧情战败或会死。')) return;
    const res = X.startCombat(state, enemy.id);
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
        (res.loot ? ' · 获 ' + res.loot : ''),
    );
    treasuresBuilt = false;
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
    const btn = e.target.closest('.art-row');
    if (!btn || btn.classList.contains('is-locked')) return;
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
  els.clickShop.addEventListener('click', onShopClick);
  els.passiveShop.addEventListener('click', onShopClick);
  els.ownedTreasures.addEventListener('click', onShopClick);
  els.shopTreasures.addEventListener('click', onShopClick);

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
    attrsBuilt = false;
    renderedRealmIndex = -1;
    eventModalOpen = false;
    selectedBring = [];
    lastCombatSig = '';
    lastEquipSig = '';
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
      const map = { arts: 'tabArts', treasures: 'tabTreasures', cycle: 'tabCycle' };
      const pane = document.getElementById(map[tab.dataset.tab]);
      if (pane) pane.classList.add('active');
    });
  });

  state = X.loadFromStorage();
  if (state.phase === 'playing') {
    const boot = X.tick(state);
    state = boot.state;
    if (boot.offlineSeconds > 30 && boot.gained > 0) {
      showToast(
        '离线约 ' +
          Math.floor(boot.cappedSeconds / 60) +
          ' 分钟，+' +
          X.formatNumber(boot.gained) +
          ' 灵气',
      );
    }
  }
  render();
  scheduleSave();

  setInterval(() => {
    if (state.phase !== 'playing') return;
    const t = X.tick(state);
    // 仅有产出时才触发完整 soft 渲染，避免打掉属性按钮点击
    if (t.gained > 0) {
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
