const SAVE_KEY = 'evolve-save-v3';

const els = {
  deathCount: document.getElementById('deathCount'),
  fitnessVal: document.getElementById('fitnessVal'),
  stageTrack: document.getElementById('stageTrack'),
  stageLabel: document.getElementById('stageLabel'),
  checkpointBadge: document.getElementById('checkpointBadge'),
  batchBadge: document.getElementById('batchBadge'),
  loadingBadge: document.getElementById('loadingBadge'),
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
};

let meta = null;
let state = null;
let busy = false;

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
  const res = await fetch(path, {
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

function setLoading(on) {
  els.loadingBadge.classList.toggle('hidden', !on);
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
  setLoading(false);

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

  (state.choices || []).forEach((choice) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `choice-btn${choice.dangerHint ? ' danger' : ''}`;
    btn.disabled = busy;

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

    btn.addEventListener('click', () => onChoose(choice.id));
    els.choices.appendChild(btn);
  });
}

async function applyState(view, options = {}) {
  const wasCheckpoint = state?.isCheckpoint;
  state = view;
  persist(view.save);
  render();

  if (options.toastSave || (view.isCheckpoint && !wasCheckpoint && !view.isDeath)) {
    showToast('固有进化检查点已保存');
  }
}

async function startNew() {
  if (busy) return;
  busy = true;
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
    const metaRes = await fetch('/api/meta');
    meta = await metaRes.json();

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

function choiceNeedsFetch(choiceId) {
  if (!state) return true;
  if (state.isCheckpoint) return true;
  const choice = (state.choices || []).find((c) => c.id === choiceId);
  if (!choice) return true;
  const nextId = choice.nextNodeId;
  if (nextId && state.save.batch?.nodes?.[nextId]) return false;
  // 叶节点：可能要请求下一批或进入下一纪元
  return true;
}

async function onChoose(choiceId) {
  if (busy || !state) return;
  busy = true;
  const needsFetch = choiceNeedsFetch(choiceId);
  render();
  if (needsFetch) {
    setLoading(true);
    els.loadingBadge.textContent = state.isCheckpoint
      ? '正在预推演本纪元分支树…'
      : '分支末端，正在预推演下一段…';
    els.nodeText.textContent =
      (state.text || '') + '\n\n（DeepSeek 预生成多步分支，随后可连续点选）';
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
  try {
    const view = await api('/api/game/respawn', { save: state.save });
    await applyState(view, { toastSave: true });
    showToast('已从检查点重生');
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
