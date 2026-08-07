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
  let renderedRealmIndex = -1;
  let lastEndingShown = null;
  let eventModalOpen = false;

  const els = {
    douqiVal: document.getElementById('douqiVal'),
    dpsVal: document.getElementById('dpsVal'),
    qiyunVal: document.getElementById('qiyunVal'),
    multVal: document.getElementById('multVal'),
    clickPowerVal: document.getElementById('clickPowerVal'),
    realmRail: document.getElementById('realmRail'),
    realmBlurb: document.getElementById('realmBlurb'),
    pathLine: document.getElementById('pathLine'),
    realmHint: document.getElementById('realmHint'),
    absorbBtn: document.getElementById('absorbBtn'),
    floatLayer: document.getElementById('floatLayer'),
    clickShop: document.getElementById('clickShop'),
    passiveShop: document.getElementById('passiveShop'),
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
    eventModal: document.getElementById('eventModal'),
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
    }, 2600);
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
    if (state.branchId && X.BRANCH_LABELS[state.branchId]) {
      parts.push(X.BRANCH_LABELS[state.branchId].name);
    }
    if (state.factionId === 'orthodox') parts.push('正道');
    if (state.factionId === 'dark') parts.push('黑角域');
    if (state.factionId === 'hermit') parts.push('隐世散修');
    if (state.destinyId === 'emperor') parts.push('执意成帝');
    if (state.destinyId === 'guardian') parts.push('镇守大陆');
    if (state.destinyId === 'void') parts.push('问道虚空');
    return parts.length ? parts.join(' · ') : '道途未定 · 阵营未立';
  }

  function renderRealmRail(stats) {
    if (renderedRealmIndex === state.realmIndex && els.realmRail.childElementCount) {
      els.realmBlurb.textContent =
        stats.realm.name +
        state.star +
        '星 · ' +
        stats.realm.blurb +
        '（境×' +
        stats.realmMult +
        ' 星×' +
        stats.starMult.toFixed(2) +
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
      stats.realm.name +
      state.star +
      '星 · ' +
      stats.realm.blurb +
      '（境×' +
      stats.realmMult +
      ' 星×' +
      stats.starMult.toFixed(2) +
      '）';
    document.documentElement.style.setProperty('--hue', String(stats.realm.hue));
  }

  function buildShops() {
    els.clickShop.innerHTML = '';
    els.passiveShop.innerHTML = '';
    X.ARTS.forEach((art) => {
      if (!X.artAvailable(state, art) && (state.owned[art.id] || 0) <= 0) {
        // 尚未解锁且未持有：仍可展示锁定行（境界将至时预告）
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
    const rows = document.querySelectorAll('.art-row');
    rows.forEach((btn) => {
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
      const canBuy = cost != null && state.douqi >= cost && !state.endingId && !stats.pendingEvent;
      btn.classList.toggle('is-locked', !canBuy);
      meta.textContent =
        '×' + owned + ' · ' + X.formatNumber(cost || 0);
    });
  }

  function renderChronicle() {
    els.chronicleList.innerHTML = '';
    const lines = state.chronicle.slice(-10).reverse();
    lines.forEach((line) => {
      const li = document.createElement('li');
      li.textContent = line;
      els.chronicleList.appendChild(li);
    });
  }

  function renderEndings() {
    els.endingList.innerHTML = '';
    X.ENDINGS.filter((e) => e.id !== 'fallen_wild' || state.endingsUnlocked.includes(e.id)).forEach(
      (ending) => {
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
      },
    );
  }

  function syncEventModal(stats) {
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
    els.eventTitle.textContent = ev.title;
    els.eventBody.textContent = ev.body;
    els.eventOptions.innerHTML = '';
    ev.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.dataset.eventId = ev.id;
      btn.dataset.optionId = opt.id;
      btn.innerHTML = '<strong>' + opt.label + '</strong><span>' + opt.blurb + '</span>';
      els.eventOptions.appendChild(btn);
    });
  }

  function syncEndingModal() {
    if (!state.endingId) {
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
    const totalMult = stats.realmMult * stats.starMult * stats.branchMult * stats.qiyunMult;

    els.douqiVal.textContent = X.formatNumber(state.douqi);
    els.dpsVal.textContent = X.formatNumber(stats.douqiPerSec);
    els.qiyunVal.textContent = String(state.qiyun);
    els.multVal.textContent = '×' + totalMult.toFixed(2);
    els.clickPowerVal.textContent = X.formatNumber(stats.clickPower);
    els.pathLine.textContent = pathLabel();

    renderRealmRail(stats);

    if (stats.nextStarCost != null) {
      els.btnRaiseStar.textContent = '升星（' + X.formatNumber(stats.nextStarCost) + '）';
      els.btnRaiseStar.classList.toggle(
        'is-locked',
        !stats.canRaiseStar || !!state.endingId || !!stats.pendingEvent,
      );
    } else {
      els.btnRaiseStar.textContent = '已满九星';
      els.btnRaiseStar.classList.add('is-locked');
    }

    if (stats.breakCost != null) {
      els.btnBreak.textContent = '破境（' + X.formatNumber(stats.breakCost) + '）';
      els.btnBreak.classList.toggle(
        'is-locked',
        !stats.canBreakthrough || !!state.endingId || !!stats.pendingEvent,
      );
      els.realmHint.textContent = '九星圆满，可破入下一境。';
    } else if (state.realmIndex >= X.REALMS.length - 1) {
      els.btnBreak.textContent = '已至斗帝';
      els.btnBreak.classList.add('is-locked');
      els.realmHint.textContent = state.endingId
        ? '此世已落幕，可于右侧轮回。'
        : '帝境之上，唯余传说与轮回。';
    } else {
      els.btnBreak.textContent = '破境（需九星）';
      els.btnBreak.classList.add('is-locked');
      els.realmHint.textContent = '先升至九星，再图破境。';
    }

    softUpdateShops(stats);

    if (!soft) {
      renderChronicle();
      renderEndings();
    } else {
      // 日志长度变化时刷新
      if (els.chronicleList.childElementCount !== Math.min(10, state.chronicle.length)) {
        renderChronicle();
      }
    }

    const canRein = stats.canReincarnate || !!state.endingId;
    els.btnReincarnate.classList.toggle('is-locked', !canRein);
    els.reincarnateStatus.textContent = state.endingId
      ? '结局已触发。轮回可保留气运与已收集结局，重选道途。预计气运 +' +
        Math.max(stats.qiyunGain, 1) +
        '。'
      : '达大斗师以上可轮回。预计气运 +' +
        stats.qiyunGain +
        '（重置境界/功法/分支，保留气运与结局收集）。已轮回 ' +
        state.reincarnations +
        ' 次。';

    syncEventModal(stats);
    syncEndingModal();
  }

  els.absorbBtn.addEventListener('click', () => {
    const before = state.douqi;
    const res = X.clickAbsorb(state);
    if (!res.ok) {
      if (res.reason) showToast(res.reason);
      setState(res.state, { soft: true });
      return;
    }
    spawnFloat(res.state.douqi - before);
    setState(res.state, { soft: true });
  });

  els.btnRaiseStar.addEventListener('click', () => {
    if (els.btnRaiseStar.classList.contains('is-locked')) return;
    const res = X.raiseStar(state);
    if (!res.ok) {
      showToast(res.reason || '无法升星');
      setState(res.state, { soft: true });
      return;
    }
    showToast(res.message || '升星成功');
    shopsBuilt = false;
    setState(res.state);
  });

  els.btnBreak.addEventListener('click', () => {
    if (els.btnBreak.classList.contains('is-locked')) return;
    const res = X.breakthrough(state);
    if (!res.ok) {
      showToast(res.reason || '无法破境');
      setState(res.state, { soft: true });
      return;
    }
    showToast(res.message || '破境成功');
    shopsBuilt = false;
    renderedRealmIndex = -1;
    setState(res.state);
  });

  function onShopClick(e) {
    const btn = e.target.closest('.art-row');
    if (!btn || btn.classList.contains('is-locked')) return;
    const id = btn.dataset.artId;
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
    setState(res.state);
  });

  els.btnReincarnate.addEventListener('click', () => {
    if (els.btnReincarnate.classList.contains('is-locked')) return;
    if (!window.confirm('确认轮回？境界、功法与分支将重置，气运与已收集结局会保留。')) return;
    const res = X.reincarnate(state);
    if (!res.ok) {
      showToast(res.reason || '无法轮回');
      return;
    }
    lastEndingShown = null;
    els.endingModal.hidden = true;
    shopsBuilt = false;
    renderedRealmIndex = -1;
    showToast(res.message || '轮回成功');
    setState(res.state);
  });

  els.btnEndingOk.addEventListener('click', () => {
    els.endingModal.hidden = true;
  });

  els.btnReset.addEventListener('click', () => {
    if (!window.confirm('清除全部存档（含气运与结局收集）？')) return;
    X.clearStorage();
    lastEndingShown = null;
    shopsBuilt = false;
    renderedRealmIndex = -1;
    eventModalOpen = false;
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
      const pane = document.getElementById(tab.dataset.tab === 'arts' ? 'tabArts' : 'tabCycle');
      if (pane) pane.classList.add('active');
    });
  });

  // 启动
  state = X.loadFromStorage();
  const boot = X.tick(state);
  state = boot.state;
  if (boot.offlineSeconds > 30 && boot.gained > 0) {
    showToast('离线修炼约 ' + Math.floor(boot.cappedSeconds / 60) + ' 分钟，获得 ' + X.formatNumber(boot.gained) + ' 斗气');
  }
  render();
  scheduleSave();

  setInterval(() => {
    const t = X.tick(state);
    if (t.gained > 0 || t.state.lastTickAt !== state.lastTickAt) {
      setState(t.state, { soft: true });
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
