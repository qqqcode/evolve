/* global Evolve2 */
(function () {
  'use strict';

  const E = window.Evolve2;
  if (!E) {
    console.error('Evolve2 engine missing');
    return;
  }

  let state = E.createNewState();
  let toastTimer = null;
  let saveTimer = null;
  let activeTab = 'mutations';

  const els = {
    energyVal: document.getElementById('energyVal'),
    epsVal: document.getElementById('epsVal'),
    dnaVal: document.getElementById('dnaVal'),
    multVal: document.getElementById('multVal'),
    clickPowerVal: document.getElementById('clickPowerVal'),
    stageRail: document.getElementById('stageRail'),
    stageBlurb: document.getElementById('stageBlurb'),
    cellBtn: document.getElementById('cellBtn'),
    cellCore: document.getElementById('cellCore'),
    floatLayer: document.getElementById('floatLayer'),
    clickShop: document.getElementById('clickShop'),
    passiveShop: document.getElementById('passiveShop'),
    evolveStatus: document.getElementById('evolveStatus'),
    prestigePreview: document.getElementById('prestigePreview'),
    btnEvolve: document.getElementById('btnEvolve'),
    btnPrestige: document.getElementById('btnPrestige'),
    btnReset: document.getElementById('btnReset'),
    saveHint: document.getElementById('saveHint'),
    toast: document.getElementById('toast'),
    versionBadge: document.getElementById('versionBadge'),
    starfield: document.getElementById('starfield'),
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
      E.saveToStorage(state);
      els.saveHint.textContent = '已保存';
    }, 400);
  }

  function setState(next, opts) {
    state = next;
    render(opts);
    scheduleSave();
  }

  function spawnFloat(amount) {
    const node = document.createElement('span');
    node.className = 'float-num';
    node.textContent = '+' + E.formatNumber(amount) + ' ⚡';
    node.style.setProperty('--dx', (Math.random() * 60 - 30).toFixed(0) + 'px');
    els.floatLayer.appendChild(node);
    setTimeout(() => node.remove(), 900);
  }

  function renderStageRail(stats) {
    els.stageRail.innerHTML = '';
    E.STAGES.forEach((stage, i) => {
      const chip = document.createElement('span');
      chip.className = 'stage-chip';
      if (i < state.stageIndex) chip.classList.add('done');
      if (i === state.stageIndex) chip.classList.add('current');
      chip.textContent = stage.name;
      els.stageRail.appendChild(chip);
    });
    els.stageBlurb.textContent =
      stats.stage.name + ' · ' + stats.stage.blurb + '（阶段倍率 ×' + stats.stageMult + '）';
    document.documentElement.style.setProperty('--hue', String(stats.stage.hue));
  }

  function shopButton(m, energy) {
    const cost = E.mutationCost(state, m.id);
    const owned = state.owned[m.id] || 0;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'shop-item';
    btn.disabled = cost == null || energy < cost;
    btn.dataset.id = m.id;
    const powerLabel =
      m.kind === 'click'
        ? '+' + E.formatNumber(m.power) + ' 点击'
        : '+' + E.formatNumber(m.power) + '/秒';
    btn.innerHTML =
      '<span class="icon" aria-hidden="true">' +
      m.icon +
      '</span>' +
      '<span class="meta"><p class="name">' +
      m.name +
      '</p><p class="desc">' +
      m.description +
      '（' +
      powerLabel +
      '）</p></span>' +
      '<span class="buy"><p class="cost">⚡ ' +
      E.formatNumber(cost || 0) +
      '</p><p class="owned">×' +
      owned +
      '</p></span>';
    btn.addEventListener('click', () => {
      const result = E.buyMutation(state, m.id);
      if (!result.ok) {
        showToast(result.reason || '无法购买');
        setState(result.state);
        return;
      }
      setState(result.state);
    });
    return btn;
  }

  function renderShops(stats) {
    els.clickShop.innerHTML = '';
    els.passiveShop.innerHTML = '';
    E.MUTATIONS.filter((m) => m.kind === 'click').forEach((m) => {
      els.clickShop.appendChild(shopButton(m, state.energy));
    });
    E.MUTATIONS.filter((m) => m.kind === 'passive').forEach((m) => {
      els.passiveShop.appendChild(shopButton(m, state.energy));
    });

    if (stats.nextStage) {
      els.evolveStatus.textContent =
        '下一阶段「' +
        stats.nextStage.name +
        '」需要 ⚡ ' +
        E.formatNumber(stats.nextStage.evolveCost) +
        '。进化后全产出 ×' +
        stats.nextStage.mult +
        '。';
      els.btnEvolve.disabled = !stats.canEvolve;
      els.btnEvolve.textContent = stats.canEvolve
        ? '进化为「' + stats.nextStage.name + '」'
        : '进化（能量不足）';
    } else {
      els.evolveStatus.textContent = '已抵达最高阶段「会思考的生命」。可通过 DNA 转生继续变强。';
      els.btnEvolve.disabled = true;
      els.btnEvolve.textContent = '已达巅峰';
    }

    els.prestigePreview.textContent =
      '预计获得 🧬 ' +
      stats.dnaGain +
      '（当前 DNA 倍率 ×' +
      stats.dnaMult.toFixed(2) +
      '，转生 ' +
      state.prestiges +
      ' 次）';
    els.btnPrestige.disabled = !stats.canPrestige;
  }

  function render() {
    const stats = E.derive(state);
    els.energyVal.textContent = E.formatNumber(state.energy);
    els.epsVal.textContent = E.formatNumber(stats.energyPerSec);
    els.dnaVal.textContent = E.formatNumber(state.dna);
    els.multVal.textContent =
      '×' + (stats.stageMult * stats.dnaMult).toFixed(2).replace(/\.?0+$/, '');
    els.clickPowerVal.textContent = E.formatNumber(stats.clickPower);
    renderStageRail(stats);
    renderShops(stats);
  }

  function onClickCell(ev) {
    const before = state.energy;
    const result = E.clickAbsorb(state);
    const gained = result.state.energy - before;
    setState(result.state);
    spawnFloat(gained);
    // 轻微按压反馈已由 CSS :active 处理
    if (ev && ev.clientX) {
      /* reserved for future particle burst at pointer */
    }
  }

  function switchTab(name) {
    activeTab = name;
    document.querySelectorAll('.tab').forEach((t) => {
      t.classList.toggle('active', t.dataset.tab === name);
    });
    document.getElementById('tabMutations').classList.toggle('active', name === 'mutations');
    document.getElementById('tabEvolve').classList.toggle('active', name === 'evolve');
  }

  function buildStars() {
    const n = 48;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      s.style.animationDelay = (Math.random() * 3).toFixed(2) + 's';
      s.style.opacity = String(0.2 + Math.random() * 0.6);
      frag.appendChild(s);
    }
    els.starfield.appendChild(frag);
  }

  function boot() {
    buildStars();

    const now = Date.now();
    const loaded = E.loadFromStorage(now);
    if (loaded) {
      const t = E.tick(loaded, now);
      state = t.state;
      if (t.gained > 0) {
        const hours = (t.cappedSeconds / 3600).toFixed(1);
        const capped = t.offlineSeconds > t.cappedSeconds;
        showToast(
          '离线收益 ⚡ ' +
            E.formatNumber(t.gained) +
            '（约 ' +
            hours +
            ' 小时' +
            (capped ? '，已封顶' : '') +
            '）',
        );
      }
    } else {
      state = E.createNewState(now);
    }

    els.cellBtn.addEventListener('click', onClickCell);
    els.btnEvolve.addEventListener('click', () => {
      const result = E.evolveStage(state);
      if (!result.ok) {
        showToast(result.reason || '无法进化');
        setState(result.state);
        return;
      }
      const name = E.STAGES[result.state.stageIndex].name;
      setState(result.state);
      showToast('进化成功：' + name);
    });
    els.btnPrestige.addEventListener('click', () => {
      const preview = E.derive(state);
      if (!preview.canPrestige) {
        showToast('尚未满足转生条件');
        return;
      }
      const ok = window.confirm(
        '转生将重置能量、变异与阶段，获得 🧬 ' + preview.dnaGain + '。确定？',
      );
      if (!ok) return;
      const result = E.prestige(state);
      if (!result.ok) {
        showToast(result.reason || '无法转生');
        setState(result.state);
        return;
      }
      setState(result.state);
      showToast('转生完成，DNA ×' + E.derive(result.state).dnaMult.toFixed(2));
      switchTab('mutations');
    });
    els.btnReset.addEventListener('click', () => {
      const ok = window.confirm('清除本地存档并重新开始？此操作不可撤销。');
      if (!ok) return;
      E.clearStorage();
      setState(E.createNewState());
      showToast('已重置');
    });

    document.querySelectorAll('.tab').forEach((tab) => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // 被动 tick：约 10fps 足够平滑
    setInterval(() => {
      const t = E.tick(state);
      if (t.gained > 0 || t.state.lastTickAt !== state.lastTickAt) {
        state = t.state;
        render();
        scheduleSave();
      }
    }, 100);

    // 页面隐藏时立即存档
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        state = E.tick(state).state;
        E.saveToStorage(state);
      }
    });
    window.addEventListener('beforeunload', () => {
      state = E.tick(state).state;
      E.saveToStorage(state);
    });

    fetch('api/meta')
      .then((r) => r.json())
      .then((meta) => {
        if (meta && meta.version) els.versionBadge.textContent = 'v' + meta.version;
      })
      .catch(() => {
        /* ignore */
      });

    render();
    scheduleSave();
  }

  boot();
})();
