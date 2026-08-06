/* global Legion */
(function () {
  'use strict';

  var L = window.Legion;
  if (!L) {
    console.error('Legion engine missing');
    return;
  }

  var state = L.createNewGame();
  var battle = null;
  var playing = false;
  var frameTimer = null;
  /** 开战前友军快照，战斗回放不得污染准备阶段单位 */
  var prepAllySnapshot = null;

  var els = {
    board: document.getElementById('board'),
    bench: document.getElementById('bench'),
    shop: document.getElementById('shop'),
    log: document.getElementById('log'),
    roundVal: document.getElementById('roundVal'),
    goldVal: document.getElementById('goldVal'),
    hpVal: document.getElementById('hpVal'),
    phaseVal: document.getElementById('phaseVal'),
    selectedInfo: document.getElementById('selectedInfo'),
    boardHint: document.getElementById('boardHint'),
    versionBadge: document.getElementById('versionBadge'),
    overlay: document.getElementById('overlay'),
    overlayTitle: document.getElementById('overlayTitle'),
    overlayText: document.getElementById('overlayText'),
    btnFight: document.getElementById('btnFight'),
    btnSell: document.getElementById('btnSell'),
    btnBench: document.getElementById('btnBench'),
    btnNew: document.getElementById('btnNew'),
    btnRefresh: document.getElementById('btnRefresh'),
    btnOverlay: document.getElementById('btnOverlay'),
  };

  function setState(next) {
    state = next;
    render();
  }

  function unitGlyph(u) {
    return u.level > 1 ? u.kind + u.level : u.kind;
  }

  function makeUnitEl(u, opts) {
    opts = opts || {};
    var el = document.createElement('div');
    el.className = 'unit ' + (u.team === 'ally' ? 'ally' : 'enemy');
    if (u.dead) el.classList.add('dead');
    if (state.selectedUnitId === u.id) el.classList.add('selected');
    el.dataset.id = u.id;
    el.innerHTML =
      '<span class="lv">Lv' +
      u.level +
      '</span>' +
      '<span>' +
      unitGlyph(u) +
      '</span>' +
      '<span class="hpbar"><i style="width:' +
      Math.max(0, Math.min(100, (u.hp / u.maxHp) * 100)) +
      '%"></i></span>';
    if (opts.onClick) {
      el.addEventListener('click', function (ev) {
        ev.stopPropagation();
        opts.onClick(u);
      });
    }
    return el;
  }

  function buildBoard() {
    els.board.innerHTML = '';
    els.board.style.gridTemplateColumns = 'repeat(' + L.COLS + ', minmax(0, 1fr))';
    for (var r = 0; r < L.ROWS; r++) {
      for (var c = 0; c < L.COLS; c++) {
        var cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'cell ' + (r <= L.ENEMY_ROW_MAX ? 'enemy-zone' : 'ally-zone');
        cell.dataset.row = String(r);
        cell.dataset.col = String(c);
        if (state.selectedUnitId && L.isAllyCell(r) && state.phase === 'prep') {
          cell.classList.add('drop-ok');
        }
        cell.addEventListener('click', onCellClick);
        els.board.appendChild(cell);
      }
    }
  }

  function paintUnitsOnBoard(units) {
    var map = {};
    units.forEach(function (u) {
      if (u.row == null || u.col == null) return;
      map[u.row + ',' + u.col] = u;
    });
    Array.prototype.forEach.call(els.board.children, function (cell) {
      var key = cell.dataset.row + ',' + cell.dataset.col;
      var old = cell.querySelector('.unit');
      if (old) old.remove();
      var u = map[key];
      if (!u) return;
      cell.appendChild(
        makeUnitEl(u, {
          onClick: function (unit) {
            if (state.phase !== 'prep') return;
            if (unit.team !== 'ally') return;
            setState(L.selectUnit(state, unit.id === state.selectedUnitId ? null : unit.id));
          },
        }),
      );
    });
  }

  function renderBench() {
    els.bench.innerHTML = '';
    for (var i = 0; i < L.BENCH_SIZE; i++) {
      var slot = document.createElement('div');
      slot.className = 'bench-slot';
      slot.dataset.bench = String(i);
      var u = state.units.filter(function (x) {
        return x.team === 'ally' && x.benchIndex === i;
      })[0];
      if (u) {
        slot.appendChild(
          makeUnitEl(u, {
            onClick: function (unit) {
              if (state.phase !== 'prep') return;
              setState(L.selectUnit(state, unit.id === state.selectedUnitId ? null : unit.id));
            },
          }),
        );
      }
      els.bench.appendChild(slot);
    }
  }

  function renderShop() {
    els.shop.innerHTML = '';
    state.shop.forEach(function (offer, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'shop-item';
      var sold = offer.cost < 0;
      btn.disabled = sold || state.phase !== 'prep' || state.gold < offer.cost;
      btn.innerHTML =
        '<span class="glyph">' +
        (sold ? '—' : offer.kind) +
        '</span><span class="price">' +
        (sold ? '售罄' : offer.cost + '金') +
        '</span>';
      if (!sold) btn.title = offer.kind + ' · 花费 ' + offer.cost + ' 金';
      btn.addEventListener('click', function () {
        if (sold || state.phase !== 'prep') return;
        var next = L.buyOffer(state, idx);
        if (next === state) return;
        setState(next);
      });
      els.shop.appendChild(btn);
    });
  }

  function renderHud() {
    els.roundVal.textContent = '回合 ' + state.round;
    els.goldVal.textContent = '金 ' + state.gold;
    els.hpVal.textContent = '命 ' + state.hp;
    els.phaseVal.textContent =
      state.phase === 'prep' ? '准备' : state.phase === 'battle' ? '战斗中' : '结束';
    els.btnFight.disabled = state.phase !== 'prep' || playing;
    els.btnRefresh.disabled = state.phase !== 'prep' || playing;
    els.btnSell.disabled = state.phase !== 'prep' || !state.selectedUnitId;
    els.btnBench.disabled = state.phase !== 'prep' || !state.selectedUnitId;

    var sel = state.units.filter(function (u) {
      return u.id === state.selectedUnitId;
    })[0];
    if (!sel) {
      els.selectedInfo.textContent = '未选中单位 · 先点备战区或场上友军';
    } else {
      var skills = L.skillNames(sel.kind, sel.level);
      els.selectedInfo.textContent =
        sel.kind +
        ' Lv' +
        sel.level +
        ' · 攻' +
        sel.atk +
        ' 血' +
        sel.hp +
        '/' +
        sel.maxHp +
        ' 距' +
        sel.range +
        (skills.length ? ' · 技能：' + skills.join('、') : ' · 再升一级解锁技能');
    }
  }

  function renderLog(lines) {
    els.log.innerHTML = '';
    (lines || state.battleLog || []).slice(-16).forEach(function (line) {
      var d = document.createElement('div');
      d.textContent = line;
      els.log.appendChild(d);
    });
    els.log.scrollTop = els.log.scrollHeight;
  }

  function render() {
    if (!els.board.childElementCount) buildBoard();
    // 刷新 drop-ok
    Array.prototype.forEach.call(els.board.children, function (cell) {
      var r = Number(cell.dataset.row);
      cell.classList.toggle(
        'drop-ok',
        !!(state.selectedUnitId && L.isAllyCell(r) && state.phase === 'prep'),
      );
    });
    paintUnitsOnBoard(state.units);
    renderBench();
    renderShop();
    renderHud();
    renderLog();
  }

  function onCellClick(ev) {
    if (state.phase !== 'prep' || playing) return;
    var cell = ev.currentTarget;
    var row = Number(cell.dataset.row);
    var col = Number(cell.dataset.col);
    if (!state.selectedUnitId) {
      var u = state.units.filter(function (x) {
        return x.team === 'ally' && x.row === row && x.col === col;
      })[0];
      if (u) setState(L.selectUnit(state, u.id));
      return;
    }
    if (!L.isAllyCell(row)) return;
    setState(L.placeSelected(state, row, col));
  }

  function showOverlay(title, text) {
    els.overlay.hidden = false;
    els.overlayTitle.textContent = title;
    els.overlayText.textContent = text;
  }

  function hideOverlay() {
    els.overlay.hidden = true;
  }

  function playBattle(result) {
    playing = true;
    battle = result;
    var frames = result.frames || [];
    var i = 0;
    els.boardHint.textContent = '战斗自动进行中…';
    renderHud();

    function step() {
      if (i >= frames.length) {
        playing = false;
        var winner = result.winner;
        var title = winner === 'ally' ? '胜利' : winner === 'enemy' ? '败北' : '平局';
        var text =
          winner === 'ally'
            ? '敌军溃败，获得赏金。'
            : winner === 'enemy'
              ? '防线被突破，失去生命。'
              : '双方僵持，小有收获。';
        showOverlay(title, text);
        els.btnOverlay.onclick = function () {
          hideOverlay();
          // 用开战前快照结算，避免回放帧破坏单位数据
          var base = Object.assign({}, state, {
            units: (prepAllySnapshot || []).map(function (u) {
              return Object.assign({}, u);
            }),
            phase: 'battle',
          });
          var next = L.applyBattleResult(base, winner);
          battle = null;
          prepAllySnapshot = null;
          setState(next);
          els.boardHint.textContent =
            next.phase === 'result'
              ? '生命归零，本局结束。可点「新开局」。'
              : '点选备战区棋子，再点友方格上阵。两只相同合成升级。';
          if (next.phase === 'result') {
            showOverlay('全军覆没', '你支撑了 ' + (next.round - 1) + ' 个回合。');
            els.btnOverlay.onclick = function () {
              hideOverlay();
              setState(L.createNewGame());
            };
          }
        };
        return;
      }
      var frame = frames[i++];
      var displayUnits = (frame.units || []).map(function (u) {
        return {
          id: u.id,
          kind: u.kind,
          level: u.level,
          team: u.team,
          row: u.row,
          col: u.col,
          hp: u.hp,
          maxHp: u.maxHp,
          atk: 0,
          range: 0,
          speed: 0,
          skills: [],
          benchIndex: null,
          dead: u.dead,
        };
      });
      // 回放仅改展示层：备战区始终来自快照
      var benchKeep = (prepAllySnapshot || []).filter(function (u) {
        return u.benchIndex != null;
      });
      paintUnitsOnBoard(displayUnits);
      // 临时写入 state 仅用于战报，不覆盖快照
      state = Object.assign({}, state, {
        battleLog: (state.battleLog || []).concat(frame.events || []).slice(-20),
        units: displayUnits.concat(benchKeep),
      });
      renderBench();
      renderLog(state.battleLog);
      frameTimer = setTimeout(step, frame.events && frame.events.length ? 380 : 160);
    }
    step();
  }

  function onFight() {
    if (state.phase !== 'prep' || playing) return;
    prepAllySnapshot = state.units
      .filter(function (u) {
        return u.team === 'ally';
      })
      .map(function (u) {
        return Object.assign({}, u);
      });
    var started = L.startBattle(state);
    if (!started.battle.frames.length) {
      prepAllySnapshot = null;
      els.boardHint.textContent = '请先把至少一个单位部署到友方区域！';
      return;
    }
    setState(started.state);
    playBattle(started.battle);
  }

  function boot() {
    buildBoard();

    els.btnFight.addEventListener('click', onFight);
    els.btnRefresh.addEventListener('click', function () {
      if (state.phase !== 'prep') return;
      setState(L.refreshShop(state));
    });
    els.btnSell.addEventListener('click', function () {
      setState(L.sellSelected(state));
    });
    els.btnBench.addEventListener('click', function () {
      if (!state.selectedUnitId) return;
      setState(L.moveToBench(state, state.selectedUnitId));
    });
    els.btnNew.addEventListener('click', function () {
      if (playing && frameTimer) clearTimeout(frameTimer);
      playing = false;
      prepAllySnapshot = null;
      hideOverlay();
      setState(L.createNewGame());
      els.boardHint.textContent = '点选备战区棋子，再点友方格上阵。两只相同合成升级。';
    });

    fetch('api/meta')
      .then(function (r) {
        return r.json();
      })
      .then(function (meta) {
        if (meta && meta.version) els.versionBadge.textContent = 'v' + meta.version;
      })
      .catch(function () {});

    render();
  }

  boot();
})();
