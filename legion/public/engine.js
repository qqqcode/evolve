/**
 * legion 客户端引擎（与 legion/src/game/engine.ts 对齐的可玩原型）
 */
(function (global) {
  'use strict';

  var COLS = 8;
  var ROWS = 7;
  var ENEMY_ROW_MAX = 2;
  var ALLY_ROW_MIN = 3;
  var BENCH_SIZE = 8;
  var SHOP_SIZE = 5;
  var MAX_LEVEL = 3;
  var UNIT_BASE_COST = 3;
  var REFRESH_COST = 1;
  var PLAYER_MAX_HP = 10;
  var START_GOLD = 8;
  var KIND_ORDER = ['盾', '刀', '骑', '弓', '术'];

  var KINDS = {
    盾: {
      rangeClass: 'melee',
      base: { maxHp: 28, atk: 4, def: 6, range: 1, speed: 12 },
      skills: [
        { id: 'taunt', name: '嘲讽', desc: '受击反击 30% 攻击' },
        { id: 'fortress', name: '铁壁', desc: '最大生命 +35%' },
      ],
      hue: 200,
    },
    刀: {
      rangeClass: 'melee',
      base: { maxHp: 18, atk: 7, def: 3, range: 1, speed: 9 },
      skills: [
        { id: 'cleave', name: '连斩', desc: '25% 再攻击一次' },
        { id: 'crit', name: '破军', desc: '30% 双倍伤害' },
      ],
      hue: 10,
    },
    骑: {
      rangeClass: 'cavalry',
      base: { maxHp: 20, atk: 6, def: 4, range: 2, speed: 7 },
      skills: [
        { id: 'charge', name: '冲锋', desc: '首次攻击 +50%' },
        { id: 'trample', name: '践踏', desc: '溅射相邻 40%' },
      ],
      hue: 35,
    },
    弓: {
      rangeClass: 'ranged',
      base: { maxHp: 12, atk: 6, def: 2, range: 3, speed: 10 },
      skills: [
        { id: 'double', name: '连射', desc: '30% 追加一箭' },
        { id: 'pierce', name: '穿甲', desc: '附加目标最大生命 5%' },
      ],
      hue: 130,
    },
    术: {
      rangeClass: 'ranged',
      base: { maxHp: 10, atk: 8, def: 1, range: 3, speed: 11 },
      skills: [
        { id: 'splash', name: '溅射', desc: '波及周围 35%' },
        { id: 'freeze', name: '冰结', desc: '25% 冻结一回合' },
      ],
      hue: 220,
    },
  };

  var seq = 1;
  function uid(prefix) {
    seq += 1;
    return prefix + seq + '_' + Math.floor(Math.random() * 1e5);
  }
  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }
  function mulberry32(seed) {
    var t = seed >>> 0;
    return function () {
      t += 0x6d2b79f5;
      var r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, rng) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function statsFor(kind, level) {
    var base = KINDS[kind].base;
    var mult = 1 + (level - 1) * 0.4;
    return {
      maxHp: Math.round(base.maxHp * mult),
      atk: Math.round(base.atk * mult),
      def: Math.round(base.def * mult),
      range: base.range,
      speed: Math.max(4, base.speed - (level - 1)),
    };
  }
  function skillsFor(kind, level) {
    var def = KINDS[kind];
    var out = [];
    if (level >= 2) out.push(def.skills[0].id);
    if (level >= 3) out.push(def.skills[1].id);
    return out;
  }
  function applyPassiveStats(kind, level, stats) {
    var skills = skillsFor(kind, level);
    var maxHp = stats.maxHp;
    if (skills.indexOf('fortress') >= 0) maxHp = Math.round(maxHp * 1.35);
    return Object.assign({}, stats, { maxHp: maxHp });
  }

  function createUnit(kind, level, team, pos) {
    var lv = clamp(level, 1, MAX_LEVEL);
    var st = applyPassiveStats(kind, lv, statsFor(kind, lv));
    var u = {
      id: uid(kind),
      kind: kind,
      level: lv,
      team: team,
      row: null,
      col: null,
      benchIndex: null,
      hp: st.maxHp,
      maxHp: st.maxHp,
      atk: st.atk,
      def: st.def,
      range: st.range,
      speed: st.speed,
      skills: skillsFor(kind, lv),
    };
    if (pos && typeof pos.benchIndex === 'number') u.benchIndex = pos.benchIndex;
    else if (pos && typeof pos.row === 'number') {
      u.row = pos.row;
      u.col = pos.col;
    }
    return u;
  }

  function rollShop(rng, round) {
    var offers = [];
    for (var i = 0; i < SHOP_SIZE; i++) {
      var kind = KIND_ORDER[Math.floor(rng() * KIND_ORDER.length)];
      offers.push({ kind: kind, cost: UNIT_BASE_COST + Math.floor((round - 1) / 3) });
    }
    return offers;
  }

  function createNewGame(seed) {
    seed = seed == null ? Date.now() : seed;
    var rng = mulberry32(seed);
    return {
      round: 1,
      gold: START_GOLD,
      hp: PLAYER_MAX_HP,
      phase: 'prep',
      units: [],
      shop: rollShop(rng, 1),
      selectedUnitId: null,
      lastResult: null,
      battleLog: [],
    };
  }

  function allyUnits(state) {
    return state.units.filter(function (u) {
      return u.team === 'ally';
    });
  }

  function freeBenchIndex(state) {
    var used = {};
    allyUnits(state).forEach(function (u) {
      if (u.benchIndex != null) used[u.benchIndex] = true;
    });
    for (var i = 0; i < BENCH_SIZE; i++) if (!used[i]) return i;
    return null;
  }

  function refreshShop(state, seed) {
    if (state.phase !== 'prep' || state.gold < REFRESH_COST) return state;
    var rng = mulberry32(seed == null ? Date.now() : seed);
    return Object.assign({}, state, {
      gold: state.gold - REFRESH_COST,
      shop: rollShop(rng, state.round),
    });
  }

  function tryAutoMerge(state) {
    var units = state.units.slice();
    var changed = true;
    while (changed) {
      changed = false;
      var groups = {};
      units.forEach(function (u) {
        if (u.team !== 'ally' || u.level >= MAX_LEVEL) return;
        var key = u.kind + ':' + u.level;
        if (!groups[key]) groups[key] = [];
        groups[key].push(u);
      });
      var keys = Object.keys(groups);
      for (var ki = 0; ki < keys.length; ki++) {
        var g = groups[keys[ki]];
        if (g.length < 2) continue;
        g.sort(function (a, b) {
          return (a.benchIndex != null ? 0 : 1) - (b.benchIndex != null ? 0 : 1);
        });
        var a = g[0];
        var b = g[1];
        var keepPos;
        if (a.row != null && a.col != null) keepPos = { row: a.row, col: a.col };
        else if (b.row != null && b.col != null) keepPos = { row: b.row, col: b.col };
        else keepPos = { benchIndex: a.benchIndex != null ? a.benchIndex : b.benchIndex || 0 };
        var merged = createUnit(a.kind, a.level + 1, 'ally', keepPos);
        units = units.filter(function (u) {
          return u.id !== a.id && u.id !== b.id;
        });
        units.push(merged);
        changed = true;
        break;
      }
    }
    return Object.assign({}, state, { units: units });
  }

  function buyOffer(state, shopIndex) {
    if (state.phase !== 'prep') return state;
    var offer = state.shop[shopIndex];
    if (!offer || offer.cost < 0) return state;
    if (state.gold < offer.cost) return state;
    var bench = freeBenchIndex(state);
    if (bench == null) return state;
    var shop = state.shop.map(function (o, i) {
      return i === shopIndex ? { kind: o.kind, cost: -1 } : o;
    });
    var next = Object.assign({}, state, {
      gold: state.gold - offer.cost,
      shop: shop,
      units: state.units.concat([createUnit(offer.kind, 1, 'ally', { benchIndex: bench })]),
    });
    return tryAutoMerge(next);
  }

  function isAllyCell(row) {
    return row >= ALLY_ROW_MIN && row < ROWS;
  }

  function selectUnit(state, unitId) {
    return Object.assign({}, state, { selectedUnitId: unitId });
  }

  function placeSelected(state, row, col) {
    if (state.phase !== 'prep' || !state.selectedUnitId) return state;
    if (!isAllyCell(row) || col < 0 || col >= COLS) return state;
    var unit = state.units.filter(function (u) {
      return u.id === state.selectedUnitId && u.team === 'ally';
    })[0];
    if (!unit) return state;
    var units = state.units.map(function (u) {
      return Object.assign({}, u);
    });
    var me = units.filter(function (u) {
      return u.id === unit.id;
    })[0];
    var occupant = units.filter(function (u) {
      return u.team === 'ally' && u.row === row && u.col === col && u.id !== unit.id;
    })[0];
    if (occupant) {
      var or = me.row,
        oc = me.col,
        ob = me.benchIndex;
      me.row = occupant.row;
      me.col = occupant.col;
      me.benchIndex = null;
      occupant.row = or;
      occupant.col = oc;
      occupant.benchIndex = ob;
    } else {
      me.row = row;
      me.col = col;
      me.benchIndex = null;
    }
    return tryAutoMerge(Object.assign({}, state, { units: units, selectedUnitId: null }));
  }

  function moveToBench(state, unitId) {
    if (state.phase !== 'prep') return state;
    var unit = state.units.filter(function (u) {
      return u.id === unitId && u.team === 'ally';
    })[0];
    if (!unit) return state;
    if (unit.benchIndex != null) return Object.assign({}, state, { selectedUnitId: unitId });
    var bench = freeBenchIndex(state);
    if (bench == null) return state;
    var units = state.units.map(function (u) {
      return u.id === unitId
        ? Object.assign({}, u, { row: null, col: null, benchIndex: bench })
        : u;
    });
    return tryAutoMerge(Object.assign({}, state, { units: units, selectedUnitId: null }));
  }

  function sellSelected(state) {
    if (state.phase !== 'prep' || !state.selectedUnitId) return state;
    var unit = state.units.filter(function (u) {
      return u.id === state.selectedUnitId && u.team === 'ally';
    })[0];
    if (!unit) return state;
    return Object.assign({}, state, {
      gold: state.gold + UNIT_BASE_COST * unit.level,
      units: state.units.filter(function (u) {
        return u.id !== unit.id;
      }),
      selectedUnitId: null,
    });
  }

  function dist(a, b) {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
  }
  function neighbors4(row, col) {
    return [
      { row: row - 1, col: col },
      { row: row + 1, col: col },
      { row: row, col: col - 1 },
      { row: row, col: col + 1 },
    ].filter(function (p) {
      return p.row >= 0 && p.row < ROWS && p.col >= 0 && p.col < COLS;
    });
  }

  function toFrame(units, events) {
    return {
      units: units.map(function (u) {
        return {
          id: u.id,
          kind: u.kind,
          level: u.level,
          team: u.team,
          row: u.row || 0,
          col: u.col || 0,
          hp: Math.max(0, u.hp),
          maxHp: u.maxHp,
          atk: u.atk,
          def: u.def,
          dead: !!u.dead,
        };
      }),
      events: events.slice(),
    };
  }

  function findTarget(self, enemies) {
    var alive = enemies.filter(function (e) {
      return !e.dead && e.row != null;
    });
    if (!alive.length) return null;
    alive.sort(function (a, b) {
      var da = dist({ row: self.row, col: self.col }, { row: a.row, col: a.col });
      var db = dist({ row: self.row, col: self.col }, { row: b.row, col: b.col });
      if (da !== db) return da - db;
      return a.hp - b.hp;
    });
    return alive[0];
  }

  function dealDamage(attacker, target, raw, all, events) {
    var dmg = raw;
    if (attacker.skills.indexOf('pierce') >= 0) dmg = Math.round(dmg + target.maxHp * 0.05);
    if (attacker.skills.indexOf('crit') >= 0 && Math.random() < 0.3) {
      dmg *= 2;
      events.push(attacker.kind + '破军暴击！');
    }
    dmg = Math.max(1, Math.round(dmg * (12 / (12 + Math.max(0, target.def || 0)))));
    target.hp -= dmg;
    events.push(
      attacker.kind + attacker.level + ' → ' + target.kind + target.level + ' 造成 ' + dmg,
    );
    if (target.hp <= 0) {
      target.hp = 0;
      target.dead = true;
      events.push(target.kind + target.level + ' 阵亡');
    } else if (target.skills.indexOf('taunt') >= 0) {
      var reflect = Math.max(1, Math.round(attacker.atk * 0.3));
      attacker.hp -= reflect;
      events.push(target.kind + '嘲讽反击 ' + reflect);
      if (attacker.hp <= 0) {
        attacker.hp = 0;
        attacker.dead = true;
        events.push(attacker.kind + attacker.level + ' 阵亡');
      }
    }
    if (attacker.skills.indexOf('freeze') >= 0 && Math.random() < 0.25 && !target.dead) {
      target.frozen = 1;
      events.push(target.kind + ' 被冰结');
    }
    var splashRatio =
      attacker.skills.indexOf('trample') >= 0
        ? 0.4
        : attacker.skills.indexOf('splash') >= 0
          ? 0.35
          : 0;
    if (splashRatio > 0) {
      neighbors4(target.row, target.col).forEach(function (n) {
        var vic = all.filter(function (u) {
          return (
            !u.dead &&
            u.team !== attacker.team &&
            u.row === n.row &&
            u.col === n.col &&
            u.id !== target.id
          );
        })[0];
        if (!vic) return;
        var sd = Math.max(1, Math.round(dmg * splashRatio));
        vic.hp -= sd;
        events.push('溅射 ' + vic.kind + ' -' + sd);
        if (vic.hp <= 0) {
          vic.hp = 0;
          vic.dead = true;
          events.push(vic.kind + vic.level + ' 阵亡');
        }
      });
    }
  }

  function tryMoveToward(self, target, occupied) {
    var options = neighbors4(self.row, self.col).filter(function (p) {
      return !occupied['' + p.row + ',' + p.col];
    });
    if (!options.length) return false;
    options.sort(function (a, b) {
      return (
        dist(a, { row: target.row, col: target.col }) -
        dist(b, { row: target.row, col: target.col })
      );
    });
    var best = options[0];
    delete occupied['' + self.row + ',' + self.col];
    self.row = best.row;
    self.col = best.col;
    occupied['' + best.row + ',' + best.col] = true;
    return true;
  }

  function attackOnce(attacker, target, all, events) {
    var dmg = attacker.atk;
    if (attacker.skills.indexOf('charge') >= 0 && !attacker.charged) {
      dmg = Math.round(dmg * 1.5);
      attacker.charged = true;
      events.push(attacker.kind + '冲锋！');
    }
    dealDamage(attacker, target, dmg, all, events);
    var extra =
      (attacker.skills.indexOf('cleave') >= 0 && Math.random() < 0.25) ||
      (attacker.skills.indexOf('double') >= 0 && Math.random() < 0.3);
    if (extra && !target.dead && !attacker.dead) {
      events.push(attacker.kind + '追加攻击');
      dealDamage(attacker, target, Math.round(attacker.atk * 0.8), all, events);
    }
  }

  function spawnEnemies(round, rng) {
    var count = clamp(3 + Math.floor(round * 0.7), 3, 10);
    var levelBias = round >= 6 ? 2 : round >= 3 ? 1 : 0;
    var enemies = [];
    var occ = {};
    for (var i = 0; i < count; i++) {
      var kind = KIND_ORDER[Math.floor(rng() * KIND_ORDER.length)];
      var level = 1 + (rng() < 0.25 + round * 0.04 ? levelBias : 0);
      level = clamp(level, 1, MAX_LEVEL);
      for (var t = 0; t < 40; t++) {
        var row = Math.floor(rng() * (ENEMY_ROW_MAX + 1));
        var col = Math.floor(rng() * COLS);
        var key = row + ',' + col;
        if (occ[key]) continue;
        occ[key] = true;
        enemies.push(createUnit(kind, level, 'enemy', { row: row, col: col }));
        break;
      }
    }
    return enemies;
  }

  function simulateBattle(allyBoard, enemies) {
    var units = allyBoard.concat(enemies).map(function (u) {
      return Object.assign({}, u, {
        cd: u.speed,
        charged: false,
        frozen: 0,
        dead: false,
      });
    });
    var frames = [toFrame(units, ['战斗开始'])];
    for (var tick = 0; tick < 120; tick++) {
      var events = [];
      if (
        !units.some(function (u) {
          return u.team === 'ally' && !u.dead;
        }) ||
        !units.some(function (u) {
          return u.team === 'enemy' && !u.dead;
        })
      )
        break;

      var order = shuffle(
        units.filter(function (u) {
          return !u.dead;
        }),
        Math.random,
      ).sort(function (a, b) {
        return a.speed - b.speed || (a.id < b.id ? -1 : 1);
      });

      order.forEach(function (self) {
        if (self.dead) return;
        if (self.frozen > 0) {
          self.frozen -= 1;
          events.push(self.kind + '冰结中');
          return;
        }
        self.cd -= 1;
        if (self.cd > 0) return;
        self.cd = self.speed;
        var foes = units.filter(function (u) {
          return u.team !== self.team && !u.dead;
        });
        var target = findTarget(self, foes);
        if (!target) return;
        var d = dist(
          { row: self.row, col: self.col },
          { row: target.row, col: target.col },
        );
        if (d <= self.range) attackOnce(self, target, units, events);
        else {
          var occ = {};
          units.forEach(function (u) {
            if (!u.dead && u.row != null) occ[u.row + ',' + u.col] = true;
          });
          tryMoveToward(self, target, occ);
        }
      });

      if (events.length) frames.push(toFrame(units, events));
      else if (tick % 4 === 0) frames.push(toFrame(units, []));
    }

    var allyLeft = units.some(function (u) {
      return u.team === 'ally' && !u.dead;
    });
    var enemyLeft = units.some(function (u) {
      return u.team === 'enemy' && !u.dead;
    });
    var winner =
      allyLeft && !enemyLeft ? 'ally' : enemyLeft && !allyLeft ? 'enemy' : 'draw';
    frames.push(
      toFrame(units, [winner === 'ally' ? '胜利！' : winner === 'enemy' ? '败北…' : '平局']),
    );
    return { frames: frames, winner: winner };
  }

  function startBattle(state, seed) {
    if (state.phase !== 'prep') return { state: state, battle: { frames: [], winner: 'draw' } };
    var boardAllies = state.units.filter(function (u) {
      return u.team === 'ally' && u.row != null && u.col != null;
    });
    if (!boardAllies.length)
      return { state: state, battle: { frames: [], winner: 'draw' } };
    var rng = mulberry32(seed == null ? Date.now() : seed);
    var enemies = spawnEnemies(state.round, rng);
    var battle = simulateBattle(boardAllies, enemies);
    var next = Object.assign({}, state, {
      phase: 'battle',
      units: state.units
        .filter(function (u) {
          return u.team === 'ally';
        })
        .concat(enemies),
      selectedUnitId: null,
      battleLog: battle.frames
        .reduce(function (acc, f) {
          return acc.concat(f.events);
        }, [])
        .slice(-12),
    });
    return { state: next, battle: battle };
  }

  function applyBattleResult(state, winner) {
    var hp = state.hp;
    var gold = state.gold;
    var lastResult = 'draw';
    if (winner === 'ally') {
      lastResult = 'win';
      gold += 4 + Math.floor(state.round / 2);
    } else if (winner === 'enemy') {
      lastResult = 'lose';
      hp -= 1 + Math.floor(state.round / 4);
      gold += 2;
    } else gold += 3;
    gold += 3;
    gold += Math.min(5, Math.floor(gold / 10));
    var allies = state.units
      .filter(function (u) {
        return u.team === 'ally';
      })
      .map(function (u) {
        var st = applyPassiveStats(u.kind, u.level, statsFor(u.kind, u.level));
        return Object.assign({}, u, {
          hp: st.maxHp,
          maxHp: st.maxHp,
          atk: st.atk,
          def: st.def,
          range: st.range,
          speed: st.speed,
        });
      });
    var rng = mulberry32(state.round * 999 + gold + hp);
    return Object.assign({}, state, {
      round: state.round + 1,
      gold: gold,
      hp: clamp(hp, 0, PLAYER_MAX_HP),
      phase: hp <= 0 ? 'result' : 'prep',
      units: allies,
      shop: rollShop(rng, state.round + 1),
      selectedUnitId: null,
      lastResult: lastResult,
    });
  }

  function skillNames(kind, level) {
    var def = KINDS[kind];
    var names = [];
    if (level >= 2) names.push(def.skills[0].name);
    if (level >= 3) names.push(def.skills[1].name);
    return names;
  }

  global.Legion = {
    COLS: COLS,
    ROWS: ROWS,
    ENEMY_ROW_MAX: ENEMY_ROW_MAX,
    ALLY_ROW_MIN: ALLY_ROW_MIN,
    BENCH_SIZE: BENCH_SIZE,
    REFRESH_COST: REFRESH_COST,
    KIND_ORDER: KIND_ORDER,
    KINDS: KINDS,
    statsFor: function (kind, level) {
      return applyPassiveStats(kind, level, statsFor(kind, level));
    },
    createNewGame: createNewGame,
    refreshShop: refreshShop,
    buyOffer: buyOffer,
    selectUnit: selectUnit,
    placeSelected: placeSelected,
    moveToBench: moveToBench,
    sellSelected: sellSelected,
    startBattle: startBattle,
    applyBattleResult: applyBattleResult,
    isAllyCell: isAllyCell,
    skillNames: skillNames,
    tryAutoMerge: tryAutoMerge,
  };
})(typeof window !== 'undefined' ? window : globalThis);
