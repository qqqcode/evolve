const SAVE_KEY = 'evolve-save-v3';
/** 本游戏挂载在 /evolve 下 */
const GAME_BASE = '/evolve';

function apiUrl(path) {
  if (!path) return GAME_BASE;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/api/')) return `${GAME_BASE}${path}`;
  if (path.startsWith('api/')) return `${GAME_BASE}/${path}`;
  return path;
}

const els = {
  deathCount: document.getElementById('deathCount'),
  fitnessVal: document.getElementById('fitnessVal'),
  stageTrack: document.getElementById('stageTrack'),
  stageLabel: document.getElementById('stageLabel'),
  checkpointBadge: document.getElementById('checkpointBadge'),
  batchBadge: document.getElementById('batchBadge'),
  loadingBadge: document.getElementById('loadingBadge'),
  prefetchBadge: document.getElementById('prefetchBadge'),
  nodeTitle: document.getElementById('nodeTitle'),
  nodeText: document.getElementById('nodeText'),
  choices: document.getElementById('choices'),
  deathActions: document.getElementById('deathActions'),
  endingActions: document.getElementById('endingActions'),
  btnRespawn: document.getElementById('btnRespawn'),
  btnRestart: document.getElementById('btnRestart'),
  btnNew: document.getElementById('btnNew'),
  toast: document.getElementById('toast'),
  storyPanel: document.getElementById('storyPanel'),
  aiBadge: document.getElementById('aiBadge'),
  envYear: document.getElementById('envYear'),
  envForm: document.getElementById('envForm'),
  envHabitat: document.getElementById('envHabitat'),
  envClimate: document.getElementById('envClimate'),
  envSuit: document.getElementById('envSuit'),
  envThreats: document.getElementById('envThreats'),
  envOps: document.getElementById('envOps'),
  envLife: document.getElementById('envLife'),
  envTraits: document.getElementById('envTraits'),
  envNotes: document.getElementById('envNotes'),
  appVersion: document.getElementById('appVersion'),
};

let meta = null;
let state = null;
let busy = false;
/** 当前后台预取任务；点击时可 await 以避免重复生成 */
let prefetchPromise = null;
let prefetchToken = 0;

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove('hidden');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    els.toast.classList.add('hidden');
  }, 2400);
}

function persist(save) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

function readLocalSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function api(path, body) {
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || '请求失败');
  }
  return data;
}

function joinList(arr) {
  return Array.isArray(arr) && arr.length ? arr.join(' · ') : '—';
}

function renderEnv() {
  if (!state) return;
  const env = state.save.environment || {};
  els.envYear.textContent = state.yearLabel || '—';
  els.envForm.textContent = state.form || '—';
  els.envHabitat.textContent = env.habitat || '—';
  els.envClimate.textContent = env.climate || '—';
  els.envSuit.textContent = `${env.suitability ?? '—'} / 自身适应 ${state.save.fitness ?? '—'}`;
  els.envThreats.textContent = joinList(env.threats);
  els.envOps.textContent = joinList(env.opportunities);
  els.envLife.textContent = joinList(env.nearbyLife);
  els.envTraits.textContent = joinList(state.save.traits);
  els.envNotes.textContent = env.notes || '';
}

function renderStages() {
  if (!meta || !state) return;

  els.stageTrack.innerHTML = '';
  meta.stages.forEach((stage, index) => {
    const dot = document.createElement('span');
    dot.className = 'stage-dot';
    if (index < state.stageIndex) dot.classList.add('done');
    if (index === state.stageIndex || state.isEnding) {
      if (!state.isEnding || index === meta.stages.length - 1) {
        if (index === state.stageIndex) dot.classList.add('current');
      }
    }
    if (state.isEnding && index === meta.stages.length - 1) {
      dot.classList.add('current');
    }
    dot.title = `${stage.label} ${stage.yearLabel || ''}`;
    els.stageTrack.appendChild(dot);
  });

  els.stageLabel.textContent = `${state.stageLabel} · ${state.yearLabel}`;
}

function setLoading(on, text) {
  els.loadingBadge.classList.toggle('hidden', !on);
  if (on && text) els.loadingBadge.textContent = text;
}

function sameScene(a, b) {
  if (!a || !b) return false;
  return (
    a.eraId === b.eraId &&
    a.mode === b.mode &&
    a.batchNodeId === b.batchNodeId &&
    a.stepsInEra === b.stepsInEra
  );
}

/** 用检查点持久缓存补齐 pending，避免重生后还去打 DeepSeek */
function hydrateCheckpointCache(view) {
  if (!view?.save || view.isDeath || view.isEnding) return view;
  const save = view.save;
  if (save.mode !== 'milestone') return view;
  const batch = save.checkpointBatch;
  const eraId = save.checkpointBatchEraId;
  if (!batch || eraId !== save.eraId || !batch.startId || !batch.nodes?.[batch.startId]) {
    return view;
  }
  const pendingOk =
    save.pendingBatch &&
    save.pendingFor?.kind === 'after_milestone' &&
    save.pendingFor.eraId === save.eraId;
  if (pendingOk && view.prefetchReady) return view;
  return {
    ...view,
    save: {
      ...save,
      pendingBatch: batch,
      pendingFor: { kind: 'after_milestone', eraId, stepsInEra: 0 },
    },
    prefetchNeeded: true,
    prefetchReady: true,
  };
}

function needsPrefetch(view) {
  if (!view || view.isDeath || view.isEnding) return false;
  // 已有检查点缓存则绝不后台重请求
  if (
    view.save?.mode === 'milestone' &&
    view.save.checkpointBatch &&
    view.save.checkpointBatchEraId === view.save.eraId
  ) {
    return false;
  }
  // 服务端标明需要下一段，且本地尚未缓存
  if (view.prefetchNeeded) return !view.prefetchReady;
  return false;
}

function updatePrefetchBadge() {
  const needed = Boolean(state?.prefetchNeeded);
  const ready = Boolean(state?.prefetchReady);
  const loading = Boolean(prefetchPromise) && needed && !ready;

  els.prefetchBadge.classList.toggle('hidden', !(needed && ready));
  if (needed && ready) {
    els.prefetchBadge.textContent = '后续分支已缓存 · 点选瞬时';
  }

  if (loading) {
    setLoading(
      true,
      state?.isCheckpoint ? '进入检查点：正在预载本纪元全部分支…' : '进入叶节点：正在预载后续分支…',
    );
  } else if (!busy) {
    setLoading(false);
  }
}

/**
 * 进入检查点 / 叶节点时立刻后台预取整棵后续分支树；不阻塞阅读。
 * 边界选项在缓存就绪前禁用，避免「点击后再等」。
 */
function kickPrefetch() {
  if (!state || !needsPrefetch(state)) {
    updatePrefetchBadge();
    return;
  }

  if (prefetchPromise) {
    updatePrefetchBadge();
    return;
  }

  const token = ++prefetchToken;
  const snapshot = state.save;

  const run = (async () => {
    try {
      const view = await api('/api/game/prefetch', { save: snapshot });
      if (token !== prefetchToken) return;
      if (!state || !sameScene(state.save, view.save)) return;
      // 静默合并预缓存（pendingBatch），本地点选树已就绪
      state = {
        ...state,
        save: view.save,
        prefetchReady: view.prefetchReady,
        prefetchNeeded: view.prefetchNeeded,
        batchInfo: view.batchInfo,
      };
      persist(view.save);
      render();
    } catch (err) {
      console.warn('[预取]', err.message || err);
      showToast(err.message || '预载失败，将在点击时重试');
    } finally {
      if (token === prefetchToken) {
        prefetchPromise = null;
        updatePrefetchBadge();
        if (!busy) render();
      }
    }
  })();

  prefetchPromise = run;
  updatePrefetchBadge();
}

async function waitPrefetchIfNeeded() {
  if (!state?.prefetchNeeded || state?.prefetchReady) return;
  if (!prefetchPromise) {
    kickPrefetch();
  }
  if (prefetchPromise) {
    await prefetchPromise;
  }
}

function render() {
  if (!state) return;

  const { save } = state;
  els.deathCount.textContent = `死亡 ${save.deaths}`;
  els.fitnessVal.textContent = `适应 ${save.fitness}`;
  els.nodeTitle.textContent = state.title;
  els.nodeText.textContent = state.text;
  els.aiBadge.textContent = state.aiEnabled ? 'DeepSeek 已启用' : 'AI 未配置·程序化';
  els.aiBadge.classList.toggle('on', Boolean(state.aiEnabled));

  renderStages();
  renderEnv();

  els.checkpointBadge.classList.toggle('hidden', !state.isCheckpoint || state.isDeath);
  if (state.batchInfo && !state.isDeath && !state.isCheckpoint) {
    els.batchBadge.textContent = state.batchInfo;
    els.batchBadge.classList.remove('hidden');
  } else {
    els.batchBadge.classList.add('hidden');
  }
  updatePrefetchBadge();

  els.choices.innerHTML = '';
  els.deathActions.classList.add('hidden');
  els.endingActions.classList.add('hidden');

  if (state.isDeath) {
    els.deathActions.classList.remove('hidden');
    return;
  }

  if (state.isEnding) {
    els.endingActions.classList.remove('hidden');
    return;
  }

  const cachePending = Boolean(state.prefetchNeeded) && !state.prefetchReady;

  (state.choices || []).forEach((choice) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const isLocal = choiceIsLocalJump(choice.id);
    // 走出缓存边界的选项：等进页预载完成；同批跳转始终可点
    const boundaryLocked = !isLocal && cachePending;
    btn.className = `choice-btn${choice.dangerHint ? ' danger' : ''}${boundaryLocked ? ' caching' : ''}`;
    btn.disabled = busy || boundaryLocked;

    const main = document.createElement('span');
    main.className = 'choice-main';
    main.textContent = choice.text;
    btn.appendChild(main);

    if (choice.dangerHint) {
      const warn = document.createElement('span');
      warn.className = 'choice-warn';
      const rate = choice.successRate != null ? `（成功率约 ${Math.round(choice.successRate * 100)}%）` : '';
      warn.textContent = `⚠ 危险：${choice.dangerHint}${rate}`;
      btn.appendChild(warn);
    }

    if (boundaryLocked) {
      const tip = document.createElement('span');
      tip.className = 'choice-cache-tip';
      tip.textContent = '后续分支预载中…就绪后可点选';
      btn.appendChild(tip);
    }

    btn.addEventListener('click', () => onChoose(choice.id));
    els.choices.appendChild(btn);
  });
}

async function applyState(view, options = {}) {
  const wasCheckpoint = state?.isCheckpoint;
  // 场景切换时作废旧预取
  if (state && !sameScene(state.save, view.save)) {
    prefetchToken += 1;
    prefetchPromise = null;
  }
  // 重生/进检查点：有持久缓存则先本地 hydrate，避免再走网络预载
  state = hydrateCheckpointCache(view);
  persist(state.save);
  render();

  if (options.toastSave || (state.isCheckpoint && !wasCheckpoint && !state.isDeath)) {
    showToast('固有进化检查点已保存');
  }

  // 进入页面立刻预载；若已 hydrate 出检查点缓存则跳过
  kickPrefetch();
}

async function startNew() {
  if (busy) return;
  busy = true;
  prefetchToken += 1;
  prefetchPromise = null;
  try {
    const view = await api('/api/game/new');
    await applyState(view, { toastSave: true });
  } catch (err) {
    showToast(err.message);
  } finally {
    busy = false;
    render();
  }
}

async function boot() {
  try {
    const metaRes = await fetch(apiUrl('/api/meta'));
    meta = await metaRes.json();
    if (els.appVersion && meta?.version) {
      els.appVersion.textContent = `v${meta.version}`;
    }

    const local = readLocalSave();
    if (local) {
      const view = await api('/api/game/load', { save: local });
      await applyState(view);
    } else {
      await startNew();
    }
  } catch (err) {
    els.nodeTitle.textContent = '无法连接服务器';
    els.nodeText.textContent = err.message || '请确认已启动 Node 服务。';
  }
}

function choiceIsLocalJump(choiceId) {
  if (!state || state.isCheckpoint) return false;
  const choice = (state.choices || []).find((c) => c.id === choiceId);
  if (!choice) return false;
  const nextId = choice.nextNodeId;
  return Boolean(nextId && state.save.batch?.nodes?.[nextId]);
}

/** 是否走出当前本地缓存树（检查点离开 / 本批叶节点） */
function choiceExitsCache(choiceId) {
  if (!state) return true;
  if (choiceIsLocalJump(choiceId)) return false;
  return Boolean(state.prefetchNeeded);
}

function choiceNeedsServerWait(choiceId) {
  if (!state) return true;
  if (!choiceExitsCache(choiceId)) return false;
  // 需要下一段：仅当缓存未就绪才等待（进页应已开始预载）
  return !state.prefetchReady;
}

async function onChoose(choiceId) {
  if (busy || !state) return;

  // 边界选项在缓存未就绪时不应可点；双保险
  if (choiceNeedsServerWait(choiceId) && !state.prefetchReady) {
    showToast('后续分支仍在预载，请稍候');
    kickPrefetch();
    return;
  }

  busy = true;
  const needsWait = choiceNeedsServerWait(choiceId);
  render();

  if (needsWait) {
    setLoading(
      true,
      state.isCheckpoint ? '等待预载本纪元分支树…' : '等待预载后续分支…',
    );
    try {
      await waitPrefetchIfNeeded();
    } catch {
      /* 预取失败则走 choose 即时生成兜底 */
    }
  }

  try {
    const view = await api('/api/game/choose', {
      save: state.save,
      choiceId,
    });
    await applyState(view);
  } catch (err) {
    showToast(err.message);
  } finally {
    busy = false;
    setLoading(false);
    render();
  }
}

async function onRespawn() {
  if (busy || !state) return;
  busy = true;
  prefetchToken += 1;
  prefetchPromise = null;
  try {
    const view = await api('/api/game/respawn', { save: state.save });
    await applyState(view, { toastSave: true });
    const cached = Boolean(state?.prefetchReady && state?.save?.checkpointBatch);
    showToast(cached ? '已从检查点重生 · 分支树缓存已恢复' : '已从检查点重生');
  } catch (err) {
    showToast(err.message);
  } finally {
    busy = false;
    render();
  }
}

els.btnNew.addEventListener('click', () => {
  if (confirm('确定开始新游戏？当前进度将被覆盖。')) {
    startNew();
  }
});
els.btnRespawn.addEventListener('click', onRespawn);
els.btnRestart.addEventListener('click', startNew);

boot();
