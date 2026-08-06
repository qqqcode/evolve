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
  /** 商店 DOM 是否已构建（避免 tick 时反复销毁按钮导致点击丢失） */
  let shopsBuilt = false;
  /** 上次完整渲染时的阶段，用于判断是否需要重绘阶段轨 */
  let renderedStageIndex = -1;

  const els = {
    energyVal: document.getElementById('energyVal'),
    epsVal: document.getElementById('epsVal'),
    dnaVal: document.getElementById('dnaVal'),
    multVal: document.getElementById('multVal'),
    clickPowerVal: document.getElementById('clickPowerVal'),
    stageRail: document.getElementById('stageRail'),
    stageBlurb: document.getElementById('stageBlurb'),
    cellBtn: document.getElementById('cellBtn'),
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

  /**
   * @param {object} next
   * @param {{ soft?: boolean }} [opts] soft=true 时只刷新数值与可买状态，不重建商店 DOM
   */
  function setState(next, opts) {
    state = next;
    render(opts && opts.soft ? { soft: true } : undefined);
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
    if (renderedStageIndex === state.stageIndex && els.stageRail.childElementCount) {
      els.stageBlurb.textContent =
        stats.stage.name + ' · ' + stats.stage.blurb + '（阶段倍率 ×' + stats.stageMult + '）';
      document.documentElement.style.setProperty('--hue', String(stats.stage.hue));
      return;
    }
    renderedStageIndex = state.stageIndex;
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

  function shopItemHtml(m) {
    const powerLabel =
      m.kind === 'click'
        ? '+' + E.formatNumber(m.power) + ' 点击'
        : '+' + E.formatNumber(m.power) + '/秒';
    return (
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
      '<span class="buy"><p class="cost" data-role="cost"></p><p class="owned" data-role="owned"></p></span>'
    );
  }

  function buildShops() {
    els.clickShop.innerHTML = '';
    els.passiveShop.innerHTML = '';
    E.MUTATIONS.forEach((m) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'shop-item';
      btn.dataset.id = m.id;
      btn.innerHTML = shopItemHtml(m);
      (m.kind === 'click' ? els.clickShop : els.passiveShop).appendChild(btn);
    });
    shopsBuilt = true;
  }

  /** 原地更新价格 / 持有数 / 可买态，不销毁按钮节点 */
  function updateShopItems() {
    if (!shopsBuilt) buildShops();
    const all = [
      ...els.clickShop.querySelectorAll('.shop-item'),
      ...els.passiveShop.querySelectorAll('.shop-item'),
    ];
    all.forEach((btn) => {
      const id = btn.dataset.id;
      const cost = E.mutationCost(state, id);
      const owned = state.owned[id] || 0;
      const costEl = btn.querySelector('[data-role="cost"]');
      const ownedEl = btn.querySelector('[data-role="owned"]');
      if (costEl) costEl.textContent = '⚡ ' + E.formatNumber(cost || 0);
      if (ownedEl) ownedEl.textContent = '×' + owned;
      // 不用原生 disabled（会吞掉 click）；用样式锁 + 购买逻辑自校验
      const locked = cost == null || state.energy < cost;
      btn.classList.toggle('is-locked', locked);
      btn.setAttribute('aria-disabled', locked ? 'true' : 'false');
    });
  }

  function updateEvolvePanel(stats) {
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

  function renderResources(stats) {
    els.energyVal.textContent = E.formatNumber(state.energy);
    els.epsVal.textContent = E.formatNumber(stats.energyPerSec);
    els.dnaVal.textContent = E.formatNumber(state.dna);
    els.multVal.textContent =
      '×' + (stats.stageMult * stats.dnaMult).toFixed(2).replace(/\.?0+$/, '');
    els.clickPowerVal.textContent = E.formatNumber(stats.clickPower);
  }

  /**
   * @param {{ soft?: boolean }} [opts]
   * soft：高频 tick 用——只更新资源数字与按钮禁用态，不重建 DOM
   */
  function render(opts) {
    const soft = Boolean(opts && opts.soft);
    const stats = E.derive(state);
    renderResources(stats);
    if (!soft) {
      renderStageRail(stats);
    } else if (renderedStageIndex !== state.stageIndex) {
      renderStageRail(stats);
    }
    updateShopItems();
    updateEvolvePanel(stats);
  }

  function onBuyMutation(mutationId) {
    const result = E.buyMutation(state, mutationId);
    if (!result.ok) {
      showToast(result.reason || '无法购买');
      setState(result.state, { soft: true });
      return;
    }
    setState(result.state, { soft: true });
  }

  function onClickCell() {
    const before = state.energy;
    const result = E.clickAbsorb(state);
    const gained = result.state.energy - before;
    setState(result.state, { soft: true });
    spawnFloat(gained);
  }

  function switchTab(name) {
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

  /** 事件委托：商店列表节点稳定，不因 tick 重建而丢失点击 */
  function bindShopDelegation(container) {
    container.addEventListener('click', (ev) => {
      const btn = ev.target.closest('.shop-item');
      if (!btn || !container.contains(btn)) return;
      const id = btn.dataset.id;
      if (!id) return;
      onBuyMutation(id);
    });
  }

  function boot() {
    buildStars();
    buildShops();
    bindShopDelegation(els.clickShop);
    bindShopDelegation(els.passiveShop);

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
        setState(result.state, { soft: true });
        return;
      }
      const name = E.STAGES[result.state.stageIndex].name;
      // 阶段变化需要重绘阶段轨
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
      renderedStageIndex = -1;
      setState(E.createNewState());
      showToast('已重置');
    });

    document.querySelectorAll('.tab').forEach((tab) => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // 被动 tick：只 soft 刷新，绝不销毁商店按钮
    setInterval(() => {
      const t = E.tick(state);
      if (t.gained === 0 && t.state.lastTickAt === state.lastTickAt) return;
      state = t.state;
      render({ soft: true });
      scheduleSave();
    }, 100);

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
