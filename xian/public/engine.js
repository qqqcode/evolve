"use strict";
(() => {
  // xian/src/game/craft.ts
  var TIER_RANK = {
    mortal: 0,
    spirit: 1,
    immortal: 2
  };
  var TIER_PROMOTE_TARGET = {
    mortal: "spirit",
    spirit: "immortal"
  };
  var MAX_TEMPER_LEVEL = 9;
  var FORGE_REALMS = [
    {
      id: "forge_skin",
      name: "\u76AE\u8089\u5883",
      blurb: "\u521A\u5F00\u7089\u706B\uFF0C\u4EC5\u80FD\u6DEC\u70BC\u51E1\u54C1\uFF0C\u6700\u9AD8\u70BC\u81F3 +9\u3002",
      needTotalTishu: 0,
      maxTier: "mortal",
      maxLevel: 9,
      attrs: { bone: 1 },
      tishuMult: 1.04,
      combatMult: 1.02
    },
    {
      id: "forge_tendon",
      name: "\u7B4B\u9AA8\u5883",
      blurb: "\u7B4B\u9AA8\u5982\u94B3\uFF0C\u51E1\u54C1\u70BC\u5668\u66F4\u52A0\u5F97\u5FC3\u5E94\u624B\u3002",
      needTotalTishu: 2e3,
      maxTier: "mortal",
      maxLevel: 9,
      attrs: { bone: 1, def: 1 },
      tishuMult: 1.08,
      combatMult: 1.04
    },
    {
      id: "forge_blood",
      name: "\u6C14\u8840\u5883",
      blurb: "\u6C14\u8840\u704C\u5668\uFF0C\u53EF\u70BC\u7075\u54C1\u6CD5\u5B9D\u3002",
      needTotalTishu: 15e3,
      maxTier: "spirit",
      maxLevel: 9,
      attrs: { bone: 2, atk: 1 },
      tishuMult: 1.12,
      combatMult: 1.06
    },
    {
      id: "forge_organ",
      name: "\u810F\u8151\u5883",
      blurb: "\u4E94\u810F\u4E3A\u7089\uFF1A\u6EE1\u5F3A\u51E1\u54C1\u53EF\u5347\u4E3A\u7075\u54C1\u3002",
      needTotalTishu: 8e4,
      maxTier: "spirit",
      maxLevel: 9,
      canPromoteFrom: "mortal",
      promoteCost: 25e3,
      attrs: { bone: 2, def: 2, spirit: 1 },
      tishuMult: 1.18,
      combatMult: 1.1
    },
    {
      id: "forge_saint",
      name: "\u5668\u5723\u5883",
      blurb: "\u5668\u9053\u5C0F\u6210\uFF1A\u53EF\u70BC\u4ED9\u54C1\uFF1B\u6EE1\u5F3A\u7075\u54C1\u53EF\u5347\u4ED9\u54C1\u3002",
      needTotalTishu: 5e5,
      maxTier: "immortal",
      maxLevel: 9,
      canPromoteFrom: "spirit",
      promoteCost: 2e5,
      attrs: { bone: 3, atk: 2, def: 2, spirit: 2 },
      tishuMult: 1.28,
      combatMult: 1.16
    }
  ];
  var HERBS = [
    {
      id: "herb_spirit_grass",
      name: "\u767E\u5E74\u7075\u8349",
      description: "\u6700\u57FA\u7840\u7684\u7075\u836F\uFF0C\u574A\u5E02\u968F\u5904\u53EF\u89C1\u3002",
      cost: 40,
      minRealm: 0,
      mark: "\u8349"
    },
    {
      id: "herb_blood_root",
      name: "\u51DD\u8840\u6839",
      description: "\u6DEC\u4F53\u5E38\u7528\uFF0C\u6C14\u5473\u8165\u751C\u3002",
      cost: 120,
      minRealm: 1,
      mark: "\u6839"
    },
    {
      id: "herb_soul_petal",
      name: "\u795E\u8BC6\u82B1\u74E3",
      description: "\u51DD\u795E\u5F00\u7A8D\u7684\u8F85\u6750\u3002",
      cost: 280,
      minRealm: 2,
      mark: "\u74E3"
    },
    {
      id: "herb_flame_fruit",
      name: "\u8D64\u7130\u679C",
      description: "\u5165\u9F0E\u5373\u71C3\uFF0C\u4E39\u6210\u8272\u6B63\u3002",
      cost: 900,
      minRealm: 3,
      mark: "\u679C"
    },
    {
      id: "herb_void_dew",
      name: "\u865A\u7A7A\u9732",
      description: "\u79D8\u5883\u51DD\u9732\uFF0C\u4E00\u6EF4\u5343\u91D1\u3002",
      cost: 6e3,
      minRealm: 5,
      mark: "\u9732"
    }
  ];
  var PILL_RECIPES = [
    {
      id: "pill_qi",
      name: "\u805A\u6C14\u4E39",
      description: "\u70BC\u5316\u7075\u529B\uFF1B\u70BC\u6C14\u7834\u5883\u5FC5\u5907\u3002\u4EA6\u53EF\u6218\u524D\u5C0F\u8865\u3002",
      minRealm: 0,
      herbs: { herb_spirit_grass: 2 },
      costs: { jingshen: 8, lingli: 20 },
      effect: {
        resources: { lingli: 120 },
        mastery: 1,
        combatPowerMult: 1.08,
        combatTempAttrs: { spirit: 1 }
      },
      mark: "\u6C14"
    },
    {
      id: "pill_bone",
      name: "\u953B\u9AA8\u4E39",
      description: "\u4E39\u529B\u5165\u9AA8\uFF1B\u7B51\u57FA\u7834\u5883\u5FC5\u5907\u3002\u6218\u524D\u53EF\u58EE\u9AA8\u3002",
      minRealm: 1,
      herbs: { herb_blood_root: 2, herb_spirit_grass: 1 },
      costs: { jingshen: 20, tishu: 30 },
      effect: {
        resources: { tishu: 200 },
        mastery: 1,
        combatPowerMult: 1.14,
        combatTempAttrs: { bone: 2, def: 1 }
      },
      mark: "\u9AA8"
    },
    {
      id: "pill_mind",
      name: "\u51DD\u795E\u4E39",
      description: "\u6E05\u5FC3\u51DD\u795E\uFF1B\u7ED3\u4E39\u7834\u5883\u5FC5\u5907\u3002\u6218\u524D\u53EF\u51DD\u795E\u8BC6\u3002",
      minRealm: 2,
      herbs: { herb_soul_petal: 2 },
      costs: { jingshen: 40, lingli: 60 },
      effect: {
        resources: { jingshen: 220 },
        attrs: { spirit: 1 },
        mastery: 2,
        combatPowerMult: 1.18,
        combatTempAttrs: { spirit: 3, luck: 1 }
      },
      mark: "\u795E"
    },
    {
      id: "pill_battle",
      name: "\u7834\u519B\u4E39",
      description: "\u6FC0\u53D1\u6C14\u8840\uFF0C\u8D8A\u754C\u5BF9\u6218\u5229\u5668\uFF1B\u5143\u5A74/\u5316\u795E\u7834\u5883\u6240\u9700\u3002",
      minRealm: 3,
      herbs: { herb_flame_fruit: 1, herb_blood_root: 2 },
      costs: { jingshen: 80, tishu: 50, lingli: 100 },
      effect: {
        attrs: { atk: 1, bone: 1 },
        mastery: 2,
        combatPowerMult: 1.35,
        combatTempAttrs: { atk: 4, bone: 2, spd: 2 }
      },
      mark: "\u519B"
    },
    {
      id: "pill_dao",
      name: "\u95EE\u9053\u4E39",
      description: "\u4E39\u6210\u609F\u9053\uFF1B\u9AD8\u9636\u7834\u5883\u6838\u5FC3\u3002\u8D8A\u754C\u6218\u65F6\u6709\u5947\u6548\u3002",
      minRealm: 5,
      herbs: { herb_void_dew: 1, herb_soul_petal: 2, herb_flame_fruit: 1 },
      costs: { jingshen: 400, lingli: 800, tishu: 200 },
      effect: {
        resources: { lingli: 5e3, tishu: 2e3, jingshen: 3e3 },
        attrs: { spirit: 1, luck: 1 },
        mastery: 4,
        combatPowerMult: 1.55,
        combatTempAttrs: { atk: 5, spirit: 4, bone: 3, luck: 2 }
      },
      mark: "\u9053"
    }
  ];
  var BREAKTHROUGH_PILL_NEED = {
    0: { pillId: "pill_qi", count: 1 },
    1: { pillId: "pill_bone", count: 1 },
    2: { pillId: "pill_mind", count: 1 },
    3: { pillId: "pill_battle", count: 1 },
    4: { pillId: "pill_battle", count: 2 },
    5: { pillId: "pill_dao", count: 1 },
    6: { pillId: "pill_dao", count: 1 },
    7: { pillId: "pill_dao", count: 2 },
    8: { pillId: "pill_dao", count: 2 },
    9: { pillId: "pill_dao", count: 3 },
    10: { pillId: "pill_dao", count: 3 }
  };
  function breakthroughPillNeed(realmIndex) {
    return BREAKTHROUGH_PILL_NEED[realmIndex] || null;
  }
  function sellHerbValue(herbId) {
    const h = getHerb(herbId);
    if (!h || h.cost <= 0) return 0;
    return Math.max(1, Math.floor(h.cost * 0.62));
  }
  function pillCraftCostEstimate(recipe) {
    let herbCost = 0;
    for (const [hid, n] of Object.entries(recipe.herbs)) {
      const h = getHerb(hid);
      herbCost += (h?.cost || 40) * n;
    }
    const res = (recipe.costs.lingli || 0) + (recipe.costs.tishu || 0) * 0.85 + (recipe.costs.jingshen || 0) * 0.9;
    return herbCost + res;
  }
  function sellPillValue(pillId) {
    const recipe = getPillRecipe(pillId);
    if (!recipe) return 0;
    const cost = pillCraftCostEstimate(recipe);
    return Math.max(20, Math.floor(cost * 1.55));
  }
  function getHerb(id) {
    return HERBS.find((h) => h.id === id);
  }
  function getPillRecipe(id) {
    return PILL_RECIPES.find((p) => p.id === id);
  }
  function getForgeRealm(index) {
    const i = Math.max(0, Math.min(FORGE_REALMS.length - 1, index));
    return FORGE_REALMS[i];
  }
  function forgeRealmIndexFromTotal(totalTishu) {
    let idx = 0;
    for (let i = 0; i < FORGE_REALMS.length; i++) {
      if (totalTishu >= FORGE_REALMS[i].needTotalTishu) idx = i;
    }
    return idx;
  }
  function tierAllowed(realmMax, treasureTier) {
    return TIER_RANK[treasureTier] <= TIER_RANK[realmMax];
  }
  function forgeMultipliers(realmIndex) {
    const stage = getForgeRealm(realmIndex);
    return { tishuMult: stage.tishuMult, combatMult: stage.combatMult };
  }
  function forgeAttrsBonus(realmIndex) {
    const sum = {};
    for (let i = 0; i <= realmIndex && i < FORGE_REALMS.length; i++) {
      const a = FORGE_REALMS[i].attrs;
      if (!a) continue;
      for (const [k, v] of Object.entries(a)) {
        const key = k;
        sum[key] = (sum[key] || 0) + (v || 0);
      }
    }
    return sum;
  }
  function emptyHerbs() {
    const o = {};
    for (const h of HERBS) o[h.id] = 0;
    return o;
  }
  function emptyPills() {
    const o = {};
    for (const p of PILL_RECIPES) o[p.id] = 0;
    return o;
  }
  var BODY_STAGES = FORGE_REALMS;

  // xian/src/game/types.ts
  var RESOURCE_KEYS = ["lingli", "tishu", "jingshen"];
  var RESOURCE_LABELS = {
    lingli: "\u7075\u529B",
    tishu: "\u4F53\u672F",
    jingshen: "\u7CBE\u795E\u529B"
  };
  var ATTR_KEYS = ["atk", "def", "spd", "spirit", "bone", "luck"];
  var ATTR_LABELS = {
    atk: "\u653B\u4F10",
    def: "\u62A4\u4F53",
    spd: "\u8EAB\u6CD5",
    spirit: "\u795E\u8BC6",
    bone: "\u6839\u9AA8",
    luck: "\u6C14\u673A"
  };
  var TREASURE_TIER_LABELS = {
    mortal: "\u51E1\u54C1",
    spirit: "\u7075\u54C1",
    immortal: "\u4ED9\u54C1"
  };
  var EQUIP_SLOTS = ["combat", "cultivate", "assist"];
  var EQUIP_SLOT_LABELS = {
    combat: "\u6218\u6597",
    cultivate: "\u4FEE\u70BC",
    assist: "\u8F85\u52A9"
  };
  var COMBAT_DIFFICULTY_LABELS = {
    prey: "\u5F31\u654C",
    fair: "\u5747\u52BF",
    threat: "\u5F3A\u654C",
    deadly: "\u7EDD\u5883",
    overreach: "\u8D8A\u754C"
  };

  // xian/src/game/loot.ts
  function slotCapacity(realmIndex) {
    return {
      combat: 1 + (realmIndex >= 3 ? 1 : 0) + (realmIndex >= 7 ? 1 : 0),
      cultivate: 1 + (realmIndex >= 2 ? 1 : 0) + (realmIndex >= 6 ? 1 : 0),
      assist: 1 + (realmIndex >= 4 ? 1 : 0) + (realmIndex >= 8 ? 1 : 0)
    };
  }
  function emptyEquipped(realmIndex = 0) {
    const cap = slotCapacity(realmIndex);
    const eq = {};
    for (const slot of EQUIP_SLOTS) {
      eq[slot] = Array.from({ length: cap[slot] }, () => null);
    }
    return eq;
  }
  function listEquippedIds(equipped) {
    const ids = [];
    for (const slot of EQUIP_SLOTS) {
      for (const id of equipped[slot] || []) {
        if (id) ids.push(id);
      }
    }
    return ids;
  }
  var TREASURES = [
    // —— 战斗 · 凡品 ——
    {
      id: "bamboo_cloud_sword",
      name: "\u9752\u7AF9\u8702\u4E91\u5251\u6B8B\u950B",
      description: "\u6218\u6597\u69FD\u3002\u51E1\u4EBA\u540C\u6B3E\u98DE\u5251\u6B8B\u950B\uFF0C\u5FA1\u5251\u65F6\u603B\u60F3\u558A\u51FA\u5251\u540D\u3002",
      lore: "\u51E1\u4EBA\u4FEE\u4ED9",
      cost: 2500,
      minRealm: 1,
      tier: "mortal",
      pros: ["\u653B\u4F10+4", "\u8EAB\u6CD5+2", "\u6218\u529B\xD71.08", "\u5148\u624B"],
      cons: {
        attrs: { def: -2, bone: -1 },
        labels: ["\u62A4\u4F53-2", "\u6839\u9AA8-1", "\u5251\u610F\u4F24\u5DF1"]
      },
      slot: "combat",
      attrs: { atk: 4, spd: 2 },
      combatMult: 1.08,
      combatEdges: { firstStrikeChance: 0.18, firstStrikeBonus: 0.12 },
      maxTemper: 5,
      temperBaseCost: 80,
      refineCost: 400,
      sellLingli: 1200,
      mark: "\u7AF9",
      vaultable: true
    },
    {
      id: "face_slap_fan",
      name: "\u6253\u8138\u6247",
      description: "\u6218\u6597\u69FD\u3002\u4E13\u6CBB\u5404\u79CD\u4E0D\u670D\u3002",
      lore: "\u8BF8\u5929\u6897",
      cost: 3e3,
      minRealm: 1,
      tier: "mortal",
      pros: ["\u653B\u4F10+3", "\u6C14\u673A+2", "\u66B4\u51FB/\u5148\u624B"],
      cons: {
        attrs: { spirit: -2 },
        combatMult: 0.97,
        labels: ["\u795E\u8BC6-2", "\u6218\u529B\xD70.97", "\u62DB\u4EBA\u8BB0\u6068"]
      },
      slot: "combat",
      attrs: { atk: 3, luck: 2 },
      combatMult: 1.07,
      combatEdges: { critChance: 0.2, critMult: 1.35, firstStrikeChance: 0.12, firstStrikeBonus: 0.08 },
      maxTemper: 5,
      temperBaseCost: 90,
      refineCost: 450,
      sellLingli: 1400,
      mark: "\u6247",
      vaultable: true
    },
    {
      id: "rusty_spear",
      name: "\u9508\u8680\u730E\u5996\u77DB",
      description: "\u6218\u6597\u69FD\u3002\u5916\u95E8\u5F1F\u5B50\u5165\u95E8\u6807\u914D\uFF0C\u624E\u5F97\u51C6\u4F46\u6C89\u3002",
      lore: "\u51E1\u4EBA",
      cost: 600,
      minRealm: 0,
      tier: "mortal",
      pros: ["\u653B\u4F10+2", "\u6218\u529B\xD71.04"],
      cons: {
        attrs: { spd: -1 },
        labels: ["\u8EAB\u6CD5-1"]
      },
      slot: "combat",
      attrs: { atk: 2 },
      combatMult: 1.04,
      maxTemper: 4,
      temperBaseCost: 40,
      refineCost: 200,
      sellLingli: 280,
      mark: "\u77DB",
      vaultable: false
    },
    {
      id: "blood_dagger",
      name: "\u996E\u8840\u77ED\u5315",
      description: "\u6218\u6597\u69FD\u3002\u89C1\u8840\u5219\u5FEB\uFF0C\u4EA6\u6613\u53CD\u566C\u3002",
      lore: "\u9B54\u9053",
      cost: 4500,
      minRealm: 1,
      tier: "mortal",
      pros: ["\u653B\u4F10+5", "\u8EAB\u6CD5+3", "\u66B4\u51FB", "\u6218\u529B\xD71.09"],
      cons: {
        attrs: { def: -3, luck: -2 },
        triadBias: { jingshen: -0.03 },
        labels: ["\u62A4\u4F53-3", "\u6C14\u673A-2", "\u6291\u7CBE\u795E\u4EA7\u51FA"]
      },
      slot: "combat",
      attrs: { atk: 5, spd: 3 },
      combatMult: 1.09,
      combatEdges: { critChance: 0.18, critMult: 1.4 },
      maxTemper: 5,
      temperBaseCost: 100,
      refineCost: 520,
      sellLingli: 2e3,
      mark: "\u5315",
      vaultable: true
    },
    {
      id: "thunder_ring",
      name: "\u88C2\u7A7A\u96F7\u73AF",
      description: "\u6218\u6597\u69FD\u3002\u4E00\u63B7\u60CA\u96F7\uFF0C\u8033\u9E23\u4E09\u65E5\u3002",
      lore: "\u6597\u7834",
      cost: 12e3,
      minRealm: 2,
      tier: "mortal",
      pros: ["\u653B\u4F10+6", "\u795E\u8BC6+2", "\u5148\u624B", "\u6218\u529B\xD71.1"],
      cons: {
        attrs: { bone: -2, spirit: -1 },
        cultivatePassive: -1,
        labels: ["\u6839\u9AA8-2", "\u795E\u8BC6-1", "\u88AB\u52A8\u4FEE\u70BC-1"]
      },
      slot: "combat",
      attrs: { atk: 6, spirit: 2 },
      combatMult: 1.1,
      combatEdges: { firstStrikeChance: 0.22, firstStrikeBonus: 0.14 },
      maxTemper: 6,
      temperBaseCost: 160,
      refineCost: 800,
      sellLingli: 5500,
      mark: "\u96F7",
      vaultable: true
    },
    // —— 战斗 · 灵品 ——
    {
      id: "flame_tome",
      name: "\u711A\u8BC0\u6B8B\u9875",
      description: "\u6218\u6597\u69FD\u3002\u6597\u7834\u540C\u6B3E\uFF1A\u7EC3\u7740\u7EC3\u7740\u5C31\u60F3\u627E\u5F02\u706B\u3002",
      lore: "\u6597\u7834\u82CD\u7A79",
      cost: 6e3,
      minRealm: 2,
      tier: "spirit",
      pros: ["\u653B\u4F10+6", "\u6839\u9AA8+1", "\u66B4\u51FB", "\u6218\u529B\xD71.1"],
      cons: {
        attrs: { luck: -2, def: -1 },
        triadBias: { tishu: -0.02, lingli: 0.02 },
        labels: ["\u6C14\u673A-2", "\u62A4\u4F53-1", "\u504F\u7075\u6291\u4F53"]
      },
      slot: "combat",
      attrs: { atk: 6, bone: 1 },
      combatMult: 1.1,
      combatEdges: { critChance: 0.16, critMult: 1.45 },
      maxTemper: 7,
      temperBaseCost: 200,
      refineCost: 1200,
      sellLingli: 2800,
      mark: "\u711A",
      vaultable: true
    },
    {
      id: "fire_lotus",
      name: "\u9752\u83B2\u5730\u5FC3\u706B\u79CD",
      description: "\u6218\u6597\u69FD\u3002\u5C0F\u5C0F\u706B\u79CD\uFF0C\u6218\u610F\u6CB8\u817E\u3002",
      lore: "\u6597\u7834\u82CD\u7A79",
      cost: 0,
      minRealm: 3,
      tier: "spirit",
      pros: ["\u653B\u4F10+8", "\u795E\u8BC6+2", "\u9AD8\u66B4\u51FB", "\u6218\u529B\xD71.14"],
      cons: {
        attrs: { bone: -3, def: -2 },
        combatMult: 0.96,
        triadBias: { jingshen: -0.04 },
        labels: ["\u6839\u9AA8-3", "\u62A4\u4F53-2", "\u6218\u529B\xD70.96", "\u6291\u7CBE\u795E"]
      },
      slot: "combat",
      attrs: { atk: 8, spirit: 2 },
      combatMult: 1.14,
      combatEdges: { critChance: 0.22, critMult: 1.55 },
      maxTemper: 8,
      temperBaseCost: 280,
      refineCost: 2e3,
      sellLingli: 8e3,
      mark: "\u83B2",
      vaultable: true
    },
    {
      id: "heaven_slash_blade",
      name: "\u5F00\u5929\u6B8B\u5203",
      description: "\u6218\u6597\u69FD\u3002\u5251\u610F\u672A\u6563\uFF0C\u6740\u6C14\u72B9\u5B58\u3002",
      lore: "\u8BF8\u5929\u5251\u4FEE",
      cost: 8e4,
      minRealm: 5,
      tier: "spirit",
      pros: ["\u653B\u4F10+12", "\u8EAB\u6CD5+4", "\u66B4\u51FB/\u5148\u624B", "\u6218\u529B\xD71.16"],
      cons: {
        attrs: { luck: -4, spirit: -2, def: -3 },
        cultivateClick: -2,
        labels: ["\u6C14\u673A-4", "\u795E\u8BC6-2", "\u62A4\u4F53-3", "\u70B9\u51FB\u4FEE\u70BC-2"]
      },
      slot: "combat",
      attrs: { atk: 12, spd: 4 },
      combatMult: 1.16,
      combatEdges: { critChance: 0.25, critMult: 1.65, firstStrikeChance: 0.2, firstStrikeBonus: 0.15 },
      maxTemper: 8,
      temperBaseCost: 600,
      refineCost: 5e3,
      sellLingli: 35e3,
      mark: "\u5203",
      vaultable: true
    },
    {
      id: "shadow_bow",
      name: "\u8FFD\u5F71\u795E\u5F13",
      description: "\u6218\u6597\u69FD\u3002\u4E00\u7BAD\u8FFD\u9B42\uFF0C\u5374\u6613\u6F0F\u9632\u3002",
      lore: "\u8BF8\u5929",
      cost: 25e3,
      minRealm: 3,
      tier: "spirit",
      pros: ["\u653B\u4F10+7", "\u8EAB\u6CD5+5", "\u5148\u624B/\u95EA\u907F", "\u6218\u529B\xD71.12"],
      cons: {
        attrs: { def: -4, bone: -2 },
        triadBias: { lingli: -0.03 },
        labels: ["\u62A4\u4F53-4", "\u6839\u9AA8-2", "\u6291\u7075\u529B\u4EA7\u51FA"]
      },
      slot: "combat",
      attrs: { atk: 7, spd: 5 },
      combatMult: 1.12,
      combatEdges: { firstStrikeChance: 0.2, firstStrikeBonus: 0.12, dodgeChance: 0.12 },
      maxTemper: 7,
      temperBaseCost: 320,
      refineCost: 2400,
      sellLingli: 11e3,
      mark: "\u5F13",
      vaultable: true
    },
    {
      id: "demon_blade",
      name: "\u9B54\u715E\u5200\u80DA",
      description: "\u6218\u6597\u69FD\u3002\u5200\u9E23\u5982\u54ED\uFF0C\u8D8A\u6740\u8D8A\u5F3A\u3002",
      lore: "\u4ED9\u9006",
      cost: 45e3,
      minRealm: 4,
      tier: "spirit",
      pros: ["\u653B\u4F10+10", "\u6C14\u673A+3", "\u66B4\u51FB", "\u6218\u529B\xD71.15", "\u6218\u529B\u7279\u6548"],
      cons: {
        attrs: { spirit: -5, luck: -3, def: -2 },
        combatMult: 0.94,
        triadBias: { jingshen: -0.05, tishu: 0.02 },
        labels: ["\u795E\u8BC6-5", "\u6C14\u673A-3", "\u62A4\u4F53-2", "\u6218\u529B\xD70.94", "\u6291\u795E\u52A9\u4F53"]
      },
      slot: "combat",
      attrs: { atk: 10, luck: 3 },
      combatMult: 1.15,
      combatEdges: { critChance: 0.28, critMult: 1.7 },
      maxTemper: 8,
      temperBaseCost: 450,
      refineCost: 3600,
      sellLingli: 2e4,
      mark: "\u715E",
      vaultable: true
    },
    // —— 战斗 · 仙品 ——
    {
      id: "immortal_sword_intent",
      name: "\u4E00\u7F15\u5251\u610F",
      description: "\u6218\u6597\u69FD\u3002\u4ED9\u54C1\u3002\u65E0\u7455\u5251\u610F\uFF0C\u65E0\u8D1F\u9762\u3002",
      lore: "\u5927\u9053",
      cost: 0,
      minRealm: 8,
      tier: "immortal",
      pros: ["\u653B\u4F10+18", "\u8EAB\u6CD5+8", "\u795E\u8BC6+4", "\u6781\u9AD8\u66B4\u51FB/\u5148\u624B", "\u6218\u529B\xD71.22"],
      slot: "combat",
      attrs: { atk: 18, spd: 8, spirit: 4 },
      combatMult: 1.22,
      combatEdges: {
        critChance: 0.3,
        critMult: 1.8,
        firstStrikeChance: 0.25,
        firstStrikeBonus: 0.2
      },
      maxTemper: 9,
      temperBaseCost: 2e3,
      refineCost: 0,
      sellLingli: 2e5,
      mark: "\u610F",
      vaultable: true
    },
    // —— 修炼 · 凡品 ——
    {
      id: "small_bottle",
      name: "\u7EFF\u6DB2\u5C0F\u74F6",
      description: "\u4FEE\u70BC\u69FD\u3002\u6EF4\u8349\u6728\u75AF\u957F\uFF1B\u7565\u5FAE\u8C03\u548C\u4E09\u624D\u3002",
      lore: "\u51E1\u4EBA\u4FEE\u4ED9",
      cost: 0,
      minRealm: 0,
      tier: "mortal",
      pros: ["\u6C14\u673A+3", "\u6839\u9AA8+2", "\u795E\u8BC6+1", "\u70B9\u51FB+2", "\u88AB\u52A8+1.5", "\u8C03\u548C"],
      cons: {
        attrs: { atk: -2 },
        triadBias: { tishu: -0.02 },
        labels: ["\u653B\u4F10-2", "\u6291\u4F53\u672F\u4EA7\u51FA", "\u836F\u763E"]
      },
      slot: "cultivate",
      attrs: { luck: 3, bone: 2, spirit: 1 },
      cultivateClick: 2,
      cultivatePassive: 1.5,
      triadDamp: 0.12,
      maxTemper: 6,
      temperBaseCost: 60,
      refineCost: 350,
      sellLingli: 800,
      mark: "\u74F6",
      vaultable: true
    },
    {
      id: "spirit_gather_jade",
      name: "\u805A\u7075\u7389\u7B80",
      description: "\u4FEE\u70BC\u69FD\u3002\u7389\u7B80\u8D34\u8EAB\u805A\u7075\uFF1B\u504F\u52A9\u7075\u529B\u3002",
      lore: "\u51E1\u4EBA\u4FEE\u4ED9",
      cost: 1800,
      minRealm: 0,
      tier: "mortal",
      pros: ["\u795E\u8BC6+2", "\u70B9\u51FB+1", "\u88AB\u52A8+2.5", "\u8C03\u548C", "\u504F\u7075"],
      cons: {
        attrs: { bone: -1 },
        triadBias: { tishu: -0.03 },
        labels: ["\u6839\u9AA8-1", "\u6291\u4F53\u66F4\u751A"]
      },
      slot: "cultivate",
      attrs: { spirit: 2 },
      cultivateClick: 1,
      cultivatePassive: 2.5,
      triadDamp: 0.08,
      triadBias: { lingli: 0.04, tishu: -0.02 },
      maxTemper: 5,
      temperBaseCost: 50,
      refineCost: 280,
      sellLingli: 900,
      mark: "\u7389",
      vaultable: true
    },
    {
      id: "meditation_mat",
      name: "\u7834\u84B2\u56E2",
      description: "\u4FEE\u70BC\u69FD\u3002\u5750\u4E45\u4E86\u817F\u9EBB\uFF0C\u4F46\u5FC3\u9759\u3002",
      lore: "\u8BF8\u5929",
      cost: 350,
      minRealm: 0,
      tier: "mortal",
      pros: ["\u795E\u8BC6+1", "\u88AB\u52A8+1"],
      cons: {
        attrs: { spd: -1 },
        labels: ["\u8EAB\u6CD5-1"]
      },
      slot: "cultivate",
      attrs: { spirit: 1 },
      cultivatePassive: 1,
      maxTemper: 4,
      temperBaseCost: 30,
      refineCost: 150,
      sellLingli: 160,
      mark: "\u56E2",
      vaultable: false
    },
    {
      id: "qi_pill_furnace",
      name: "\u805A\u6C14\u5C0F\u7089",
      description: "\u4FEE\u70BC\u69FD\u3002\u7089\u706B\u65FA\u5219\u7075\u6C14\u6D8C\uFF0C\u4EA6\u8017\u795E\u3002",
      lore: "\u51E1\u4EBA",
      cost: 5500,
      minRealm: 1,
      tier: "mortal",
      pros: ["\u70B9\u51FB+3", "\u88AB\u52A8+3", "\u795E\u8BC6+2"],
      cons: {
        attrs: { luck: -2 },
        triadBias: { jingshen: -0.04 },
        labels: ["\u6C14\u673A-2", "\u6291\u7CBE\u795E\u4EA7\u51FA"]
      },
      slot: "cultivate",
      attrs: { spirit: 2 },
      cultivateClick: 3,
      cultivatePassive: 3,
      maxTemper: 5,
      temperBaseCost: 110,
      refineCost: 600,
      sellLingli: 2400,
      mark: "\u7089",
      vaultable: true
    },
    // —— 修炼 · 灵品 ——
    {
      id: "desolate_bone",
      name: "\u8352\u53E4\u6B8B\u9AA8",
      description: "\u4FEE\u70BC\u69FD\u3002\u6839\u9AA8\u53D1\u5149\uFF1B\u504F\u52A9\u4F53\u672F\u3002",
      lore: "\u906E\u5929",
      cost: 12e3,
      minRealm: 2,
      tier: "spirit",
      pros: ["\u6839\u9AA8+5", "\u62A4\u4F53+2", "\u70B9\u51FB+3", "\u88AB\u52A8+4", "\u8C03\u548C", "\u504F\u4F53"],
      cons: {
        attrs: { spirit: -3, luck: -1 },
        cultivateClick: -1,
        labels: ["\u795E\u8BC6-3", "\u6C14\u673A-1", "\u70B9\u51FB-1", "\u9AA8\u5BD2\u4FB5\u795E"]
      },
      slot: "cultivate",
      attrs: { bone: 5, def: 2 },
      cultivateClick: 3,
      cultivatePassive: 4,
      triadDamp: 0.1,
      triadBias: { tishu: 0.06, jingshen: -0.02 },
      maxTemper: 7,
      temperBaseCost: 220,
      refineCost: 1500,
      sellLingli: 5500,
      mark: "\u8352",
      vaultable: true
    },
    {
      id: "mountain_river",
      name: "\u5C71\u6CB3\u8F66\u6B8B\u8F6E",
      description: "\u4FEE\u70BC\u69FD\u3002\u5C71\u6CB3\u8F6E\u8F6C\uFF0C\u4E09\u624D\u4E92\u6270\u663E\u8457\u51CF\u5F31\u3002",
      lore: "\u4ED9\u9006",
      cost: 2e4,
      minRealm: 3,
      tier: "spirit",
      pros: ["\u795E\u8BC6+4", "\u70B9\u51FB+2", "\u88AB\u52A8+6", "\u5F3A\u8C03\u548C"],
      cons: {
        attrs: { atk: -3, spd: -2 },
        triadBias: { lingli: -0.02 },
        labels: ["\u653B\u4F10-3", "\u8EAB\u6CD5-2", "\u6291\u7075\u529B"]
      },
      slot: "cultivate",
      attrs: { spirit: 4 },
      cultivateClick: 2,
      cultivatePassive: 6,
      triadDamp: 0.28,
      maxTemper: 7,
      temperBaseCost: 300,
      refineCost: 2200,
      sellLingli: 9e3,
      mark: "\u8F66",
      vaultable: true
    },
    {
      id: "nine_turn_manual",
      name: "\u4E5D\u8F6C\u6B8B\u8BC0",
      description: "\u4FEE\u70BC\u69FD\u3002\u8F6C\u5F97\u8D8A\u5FEB\u8D8A\u997F\uFF0C\u4E5F\u8D8A\u5BB9\u6613\u8D70\u706B\u3002",
      lore: "\u906E\u5929",
      cost: 35e3,
      minRealm: 4,
      tier: "spirit",
      pros: ["\u6839\u9AA8+4", "\u795E\u8BC6+3", "\u70B9\u51FB+5", "\u88AB\u52A8+8", "\u8C03\u548C"],
      cons: {
        attrs: { luck: -4, def: -2 },
        combatMult: 0.95,
        triadBias: { jingshen: -0.03, tishu: -0.02 },
        labels: ["\u6C14\u673A-4", "\u62A4\u4F53-2", "\u6218\u529B\xD70.95", "\u53CC\u6291"]
      },
      slot: "cultivate",
      attrs: { bone: 4, spirit: 3 },
      cultivateClick: 5,
      cultivatePassive: 8,
      triadDamp: 0.15,
      maxTemper: 8,
      temperBaseCost: 400,
      refineCost: 3e3,
      sellLingli: 15e3,
      mark: "\u8F6C",
      vaultable: true
    },
    {
      id: "void_lotus_seat",
      name: "\u865A\u7A7A\u83B2\u53F0",
      description: "\u4FEE\u70BC\u69FD\u3002\u5750\u4E0A\u7A7A\u7075\uFF0C\u7AD9\u8D77\u811A\u8F6F\u3002",
      lore: "\u906E\u5929",
      cost: 6e4,
      minRealm: 5,
      tier: "spirit",
      pros: ["\u795E\u8BC6+6", "\u6C14\u673A+3", "\u88AB\u52A8+10", "\u5F3A\u8C03\u548C", "\u504F\u795E"],
      cons: {
        attrs: { bone: -4, atk: -2 },
        cultivateClick: -2,
        labels: ["\u6839\u9AA8-4", "\u653B\u4F10-2", "\u70B9\u51FB-2"]
      },
      slot: "cultivate",
      attrs: { spirit: 6, luck: 3 },
      cultivatePassive: 10,
      triadDamp: 0.22,
      triadBias: { jingshen: 0.05, tishu: -0.03 },
      maxTemper: 8,
      temperBaseCost: 520,
      refineCost: 4e3,
      sellLingli: 26e3,
      mark: "\u53F0",
      vaultable: true
    },
    // —— 修炼 · 仙品 ——
    {
      id: "dao_seed",
      name: "\u9053\u79CD\u4E00\u679A",
      description: "\u4FEE\u70BC\u69FD\u3002\u4ED9\u54C1\u3002\u5927\u9053\u5C06\u6210\uFF0C\u8FD1\u4E4E\u62B9\u5E73\u4E09\u624D\u504F\u79D1\u3002",
      lore: "\u5927\u9053",
      cost: 0,
      minRealm: 10,
      tier: "immortal",
      pros: ["\u795E\u8BC6+8", "\u6839\u9AA8+8", "\u6C14\u673A+5", "\u70B9\u51FB+20", "\u88AB\u52A8+40", "\u6781\u8C03\u548C"],
      slot: "cultivate",
      attrs: { spirit: 8, bone: 8, luck: 5 },
      cultivateClick: 20,
      cultivatePassive: 40,
      triadDamp: 0.55,
      triadBias: { lingli: 0.03, tishu: 0.03, jingshen: 0.03 },
      maxTemper: 9,
      temperBaseCost: 3e3,
      refineCost: 0,
      sellLingli: 5e5,
      mark: "\u79CD",
      vaultable: true
    },
    {
      id: "immortal_breath_bead",
      name: "\u4ED9\u606F\u73E0",
      description: "\u4FEE\u70BC\u69FD\u3002\u4ED9\u54C1\u3002\u4E00\u5438\u4E00\u547C\uFF0C\u4E09\u624D\u81EA\u8861\u3002",
      lore: "\u4ED9\u9006",
      cost: 2e6,
      minRealm: 7,
      tier: "immortal",
      pros: ["\u5168\u5C5E\u6027+", "\u70B9\u51FB+12", "\u88AB\u52A8+25", "\u6781\u8C03\u548C"],
      slot: "cultivate",
      attrs: { atk: 3, def: 3, spd: 3, spirit: 6, bone: 6, luck: 4 },
      cultivateClick: 12,
      cultivatePassive: 25,
      triadDamp: 0.5,
      maxTemper: 9,
      temperBaseCost: 2500,
      refineCost: 0,
      sellLingli: 4e5,
      mark: "\u606F",
      vaultable: true
    },
    // —— 辅助 · 凡品 ——
    {
      id: "storage_pouch",
      name: "\u4E0B\u54C1\u50A8\u7269\u888B",
      description: "\u8F85\u52A9\u69FD\u3002\u80FD\u88C5\u7075\u8349\uFF1B\u5FAE\u5F31\u8C03\u548C\u3002",
      lore: "\u8BF8\u5929\u901A\u7528",
      cost: 400,
      minRealm: 0,
      tier: "mortal",
      pros: ["\u6C14\u673A+2", "\u5FAE\u8C03\u548C"],
      cons: {
        attrs: { atk: -1 },
        labels: ["\u653B\u4F10-1"]
      },
      slot: "assist",
      attrs: { luck: 2 },
      triadDamp: 0.05,
      maxTemper: 3,
      temperBaseCost: 25,
      refineCost: 120,
      sellLingli: 180,
      mark: "\u888B",
      vaultable: false
    },
    {
      id: "spirit_boat",
      name: "\u7834\u65E7\u7075\u821F",
      description: "\u8F85\u52A9\u69FD\u3002\u9003\u547D\u4E00\u6D41\uFF1B\u504F\u8EAB\u6CD5\u3002",
      lore: "\u51E1\u4EBA\u4FEE\u4ED9",
      cost: 8e3,
      minRealm: 2,
      tier: "mortal",
      pros: ["\u8EAB\u6CD5+6", "\u62A4\u4F53+1", "\u95EA\u907F", "\u504F\u4F53"],
      cons: {
        attrs: { spirit: -2 },
        triadBias: { lingli: -0.03 },
        labels: ["\u795E\u8BC6-2", "\u6291\u7075\u529B"]
      },
      slot: "assist",
      attrs: { spd: 6, def: 1 },
      combatEdges: { dodgeChance: 0.22 },
      triadBias: { tishu: 0.04, lingli: -0.02 },
      maxTemper: 5,
      temperBaseCost: 140,
      refineCost: 700,
      sellLingli: 3600,
      mark: "\u821F",
      vaultable: true
    },
    {
      id: "lucky_coin",
      name: "\u534A\u771F\u534A\u5047\u6C14\u8FD0\u94B1",
      description: "\u8F85\u52A9\u69FD\u3002\u6709\u65F6\u771F\u6709\u7528\uFF0C\u6709\u65F6\u7EAF\u5FC3\u7406\u5B89\u6170\u3002",
      lore: "\u8BF8\u5929\u6897",
      cost: 2200,
      minRealm: 0,
      tier: "mortal",
      pros: ["\u6C14\u673A+4", "\u95EA\u907F\u5FAE\u5F31"],
      cons: {
        attrs: { bone: -2 },
        labels: ["\u6839\u9AA8-2", "\u8D4C\u5F92\u6C14\u8D28"]
      },
      slot: "assist",
      attrs: { luck: 4 },
      combatEdges: { dodgeChance: 0.06 },
      maxTemper: 4,
      temperBaseCost: 70,
      refineCost: 360,
      sellLingli: 1e3,
      mark: "\u94B1",
      vaultable: true
    },
    {
      id: "ward_talisman",
      name: "\u62A4\u8EAB\u7B26\u7B93",
      description: "\u8F85\u52A9\u69FD\u3002\u6321\u4E00\u5200\u7684\u4EFD\u3002",
      lore: "\u51E1\u4EBA",
      cost: 1500,
      minRealm: 0,
      tier: "mortal",
      pros: ["\u62A4\u4F53+3", "\u514D\u6B7B\u5FAE\u5F31"],
      cons: {
        attrs: { spd: -1 },
        labels: ["\u8EAB\u6CD5-1"]
      },
      slot: "assist",
      attrs: { def: 3 },
      combatEdges: { plotArmorChance: 0.08 },
      maxTemper: 4,
      temperBaseCost: 55,
      refineCost: 300,
      sellLingli: 700,
      mark: "\u7B26",
      vaultable: false
    },
    // —— 辅助 · 灵品 ——
    {
      id: "soul_lamp",
      name: "\u9B42\u706F\u4E00\u76CF",
      description: "\u8F85\u52A9\u69FD\u3002\u7167\u89C1\u5FC3\u9B54\uFF1B\u504F\u795E\u8BC6\u3002",
      lore: "\u4ED9\u9006",
      cost: 0,
      minRealm: 4,
      tier: "spirit",
      pros: ["\u795E\u8BC6+6", "\u6C14\u673A+2", "\u6218\u529B\xD71.03", "\u95EA\u907F/\u514D\u6B7B", "\u8C03\u548C", "\u504F\u795E"],
      cons: {
        attrs: { bone: -3, atk: -2 },
        triadBias: { tishu: -0.04 },
        labels: ["\u6839\u9AA8-3", "\u653B\u4F10-2", "\u6291\u4F53\u66F4\u751A", "\u706F\u5F71\u566C\u795E"]
      },
      slot: "assist",
      attrs: { spirit: 6, luck: 2 },
      combatMult: 1.03,
      combatEdges: { dodgeChance: 0.1, plotArmorChance: 0.12 },
      triadDamp: 0.1,
      triadBias: { jingshen: 0.05, tishu: -0.03 },
      maxTemper: 7,
      temperBaseCost: 260,
      refineCost: 1800,
      sellLingli: 12e3,
      mark: "\u706F",
      vaultable: true
    },
    {
      id: "plot_armor",
      name: "\u5267\u60C5\u62A4\u7532",
      description: "\u8F85\u52A9\u69FD\u3002\u4F5C\u8005\u4EB2\u5973\u513F\u9650\u5B9A\uFF1B\u5F3A\u529B\u62B9\u5E73\u4E09\u624D\u504F\u79D1\u3002",
      lore: "\u5143\u6897",
      cost: 0,
      minRealm: 0,
      tier: "spirit",
      pros: ["\u62A4\u4F53+5", "\u6C14\u673A+6", "\u6218\u529B\xD71.06", "\u5F3A\u514D\u6B7B", "\u6781\u8C03\u548C"],
      cons: {
        attrs: { atk: -4, spirit: -2 },
        cultivatePassive: -2,
        labels: ["\u653B\u4F10-4", "\u795E\u8BC6-2", "\u88AB\u52A8-2", "\u4E3B\u89D2\u5149\u73AF\u53CD\u566C"]
      },
      slot: "assist",
      attrs: { def: 5, luck: 6 },
      combatMult: 1.06,
      combatEdges: { plotArmorChance: 0.35, dodgeChance: 0.08 },
      triadDamp: 0.35,
      maxTemper: 6,
      temperBaseCost: 180,
      refineCost: 2500,
      sellLingli: 1e4,
      mark: "\u7532",
      vaultable: true
    },
    {
      id: "cauldron_lid",
      name: "\u9752\u94DC\u9F0E\u76D6",
      description: "\u8F85\u52A9\u69FD\u3002\u76D6\u4E0A\u80FD\u7838\u4EBA\uFF1B\u4E39\u9053\u8C03\u548C\u3002",
      lore: "\u906E\u5929",
      cost: 4e4,
      minRealm: 4,
      tier: "spirit",
      pros: ["\u62A4\u4F53+6", "\u795E\u8BC6+3", "\u6C14\u673A+1", "\u514D\u6B7B", "\u8C03\u548C", "\u504F\u795E\u7075"],
      cons: {
        attrs: { spd: -4 },
        combatMult: 0.97,
        labels: ["\u8EAB\u6CD5-4", "\u6218\u529B\xD70.97", "\u7B28\u91CD"]
      },
      slot: "assist",
      attrs: { def: 6, spirit: 3, luck: 1 },
      combatEdges: { plotArmorChance: 0.15 },
      triadDamp: 0.15,
      triadBias: { jingshen: 0.03, lingli: 0.03, tishu: -0.02 },
      maxTemper: 7,
      temperBaseCost: 380,
      refineCost: 2800,
      sellLingli: 18e3,
      mark: "\u9F0E",
      vaultable: true
    },
    {
      id: "heaven_stele",
      name: "\u6B8B\u7834\u5929\u7891",
      description: "\u8F85\u52A9\u69FD\u3002\u7891\u4E0A\u6709\u300C\u9053\u300D\uFF1B\u5F3A\u529B\u8C03\u548C\u4E09\u624D\u3002",
      lore: "\u906E\u5929/\u8BF8\u5929",
      cost: 5e5,
      minRealm: 6,
      tier: "spirit",
      pros: ["\u795E\u8BC6+8", "\u6839\u9AA8+3", "\u6C14\u673A+3", "\u6218\u529B\xD71.05", "\u5148\u624B/\u514D\u6B7B", "\u6781\u8C03\u548C"],
      cons: {
        attrs: { atk: -3, spd: -3, luck: -2 },
        cultivateClick: -3,
        triadBias: { tishu: -0.03 },
        labels: ["\u653B\u4F10-3", "\u8EAB\u6CD5-3", "\u6C14\u673A-2", "\u70B9\u51FB-3", "\u6291\u4F53"]
      },
      slot: "assist",
      attrs: { spirit: 8, bone: 3, luck: 3 },
      combatMult: 1.05,
      combatEdges: { firstStrikeChance: 0.15, firstStrikeBonus: 0.1, plotArmorChance: 0.1 },
      triadDamp: 0.4,
      maxTemper: 8,
      temperBaseCost: 800,
      refineCost: 6e3,
      sellLingli: 18e4,
      mark: "\u7891",
      vaultable: true
    },
    {
      id: "mirror_of_heart",
      name: "\u7167\u5FC3\u53E4\u955C",
      description: "\u8F85\u52A9\u69FD\u3002\u7167\u7834\u5E7B\u8C61\uFF0C\u4E5F\u7167\u89C1\u81EA\u5DF1\u7684\u4E11\u3002",
      lore: "\u4ED9\u9006",
      cost: 28e3,
      minRealm: 3,
      tier: "spirit",
      pros: ["\u795E\u8BC6+5", "\u6C14\u673A+2", "\u95EA\u907F", "\u8C03\u548C"],
      cons: {
        attrs: { luck: -3 },
        triadBias: { lingli: -0.02 },
        labels: ["\u6C14\u673A-3", "\u6291\u7075", "\u5FC3\u9B54\u53CD\u89C6"]
      },
      slot: "assist",
      attrs: { spirit: 5, luck: 2 },
      combatEdges: { dodgeChance: 0.15 },
      triadDamp: 0.18,
      maxTemper: 6,
      temperBaseCost: 240,
      refineCost: 1600,
      sellLingli: 12e3,
      mark: "\u955C",
      vaultable: true
    },
    {
      id: "beast_taming_flute",
      name: "\u9A6D\u517D\u9AA8\u7B1B",
      description: "\u8F85\u52A9\u69FD\u3002\u5524\u517D\u62A4\u4F53\uFF0C\u7B1B\u58F0\u6270\u795E\u3002",
      lore: "\u51E1\u4EBA",
      cost: 15e3,
      minRealm: 2,
      tier: "spirit",
      pros: ["\u62A4\u4F53+4", "\u6839\u9AA8+2", "\u514D\u6B7B", "\u504F\u4F53"],
      cons: {
        attrs: { spirit: -3 },
        cultivatePassive: -1.5,
        labels: ["\u795E\u8BC6-3", "\u88AB\u52A8-1.5"]
      },
      slot: "assist",
      attrs: { def: 4, bone: 2 },
      combatEdges: { plotArmorChance: 0.14 },
      triadBias: { tishu: 0.04, jingshen: -0.02 },
      maxTemper: 6,
      temperBaseCost: 200,
      refineCost: 1300,
      sellLingli: 6500,
      mark: "\u7B1B",
      vaultable: true
    },
    // —— 辅助 · 仙品 ——
    {
      id: "immortal_jade_seal",
      name: "\u4ED9\u7389\u5370",
      description: "\u8F85\u52A9\u69FD\u3002\u4ED9\u54C1\u3002\u5370\u843D\u5219\u5B89\uFF0C\u65E0\u7455\u65E0\u57A2\u3002",
      lore: "\u5927\u9053",
      cost: 0,
      minRealm: 9,
      tier: "immortal",
      pros: ["\u62A4\u4F53+10", "\u795E\u8BC6+6", "\u6C14\u673A+6", "\u6218\u529B\xD71.1", "\u5F3A\u514D\u6B7B/\u95EA\u907F", "\u6781\u8C03\u548C"],
      slot: "assist",
      attrs: { def: 10, spirit: 6, luck: 6 },
      combatMult: 1.1,
      combatEdges: { plotArmorChance: 0.4, dodgeChance: 0.2 },
      triadDamp: 0.45,
      maxTemper: 9,
      temperBaseCost: 2200,
      refineCost: 0,
      sellLingli: 3e5,
      mark: "\u5370",
      vaultable: true
    }
  ];
  var NATURALS = [
    {
      id: "nat_spirit_grass",
      name: "\u767E\u5E74\u7075\u8349",
      description: "\u5165\u53E3\u6E05\u51C9\uFF0C\u7075\u6C14\u7ACB\u6DA8\u3002",
      lore: "\u51E1\u4EBA",
      minRealm: 0,
      lingqiGain: 400,
      passiveBonus: 0.3,
      mark: "\u8349",
      weight: 3
    },
    {
      id: "nat_beast_core",
      name: "\u4E00\u9636\u5996\u4E39",
      description: "\u8165\u9999\u6251\u9F3B\uFF0C\u70BC\u5316\u540E\u5E95\u76D8\u66F4\u539A\u3002",
      lore: "\u51E1\u4EBA",
      minRealm: 1,
      lingqiGain: 1200,
      passiveBonus: 0.8,
      mark: "\u4E39",
      weight: 2
    },
    {
      id: "nat_fire_crystal",
      name: "\u5730\u5FC3\u706B\u6676",
      description: "\u70EB\u624B\uFF0C\u4F46\u541E\u4E0B\u53BB\u4FEE\u70BC\u5982\u5750\u706B\u5C71\u53E3\u3002",
      lore: "\u6597\u7834",
      minRealm: 2,
      lingqiGain: 4e3,
      passiveBonus: 1.5,
      mark: "\u6676",
      weight: 2
    },
    {
      id: "nat_void_flower",
      name: "\u865A\u7A7A\u83B2\u74E3",
      description: "\u6458\u4E00\u7247\uFF0C\u5BFF\u5143\u4F3C\u6709\u6240\u611F\u3002",
      lore: "\u906E\u5929",
      minRealm: 3,
      lingqiGain: 12e3,
      passiveBonus: 3,
      mark: "\u83B2",
      weight: 1
    },
    {
      id: "nat_soul_dew",
      name: "\u795E\u9B42\u7518\u9732",
      description: "\u4E00\u6EF4\u5165\u8BC6\u6D77\uFF0C\u6742\u5FF5\u9000\u6563\u3002",
      lore: "\u4ED9\u9006",
      minRealm: 3,
      lingqiGain: 1e4,
      passiveBonus: 2.5,
      mark: "\u9732",
      weight: 1
    },
    {
      id: "nat_dragon_blood",
      name: "\u9F99\u8840\u6B8B\u6E23",
      description: "\u8165\u70C8\uFF0C\u6839\u9AA8\u9690\u9690\u53D1\u70EB\u3002",
      lore: "\u8BF8\u5929",
      minRealm: 4,
      lingqiGain: 5e4,
      passiveBonus: 5,
      mark: "\u9F99",
      weight: 1
    },
    {
      id: "nat_heaven_marrow",
      name: "\u5929\u9AD3\u4E00\u7F15",
      description: "\u7F55\u89C1\u81F3\u6781\uFF0C\u7075\u529B\u5982\u6F6E\u3002",
      lore: "\u906E\u5929",
      minRealm: 6,
      lingqiGain: 5e5,
      passiveBonus: 12,
      mark: "\u9AD3",
      weight: 1
    },
    {
      id: "nat_dao_fruit",
      name: "\u534A\u9897\u9053\u679C",
      description: "\u54AC\u4E00\u53E3\uFF0C\u50CF\u88AB\u5929\u9053\u77AA\u4E86\u4E00\u773C\u3002",
      lore: "\u5927\u9053",
      minRealm: 8,
      lingqiGain: 8e6,
      passiveBonus: 30,
      mark: "\u679C",
      weight: 1
    }
  ];
  var MAIN_STORY = [
    {
      id: "main_1_sect",
      title: "\u3010\u4E3B\u7EBF\u3011\u5916\u95E8\u8BB0\u540D",
      body: "\u5B97\u95E8\u5916\u95E8\u62DB\u4EBA\u3002\u4F60\u53EF\u4EE5\u7528\u7075\u77F3\u4E70\u4E2A\u8BB0\u540D\uFF0C\u4E5F\u53EF\u4EE5\u53BB\u730E\u5996\u8BC1\u660E\u81EA\u5DF1\u3002\u51E1\u4EBA\u5F00\u5C40\u7ECF\u5178\u4E8C\u9009\u4E00\u3002",
      minRealm: 0,
      lore: "\u51E1\u4EBA\u4FEE\u4ED9\xB7\u4E3B\u7EBF",
      mainChapter: 1,
      repeatable: false,
      options: [
        {
          id: "m1_buy",
          label: "\u7838\u7075\u77F3\u8BB0\u540D",
          blurb: "\u82B1\u7075\u6C14\u5165\u95E8\uFF0C\u5F97\u50A8\u7269\u888B\u4E0E\u4E00\u70B9\u9762\u5B50\u3002",
          lingqiDelta: -150,
          grantTreasureId: "storage_pouch",
          freePointsDelta: 1,
          flags: ["main_sect"]
        },
        {
          id: "m1_hunt",
          label: "\u730E\u5996\u8BC1\u660E",
          blurb: "\u6253\u4E00\u573A\uFF1B\u80DC\u5219\u5165\u95E8\uFF0C\u8D25\u4E0D\u81F4\u6B7B\u3002",
          combatEnemyId: "demon_wolf",
          deathOnLose: false,
          grantTreasureId: "spirit_gather_jade",
          flags: ["main_sect"],
          freePointsDelta: 1
        }
      ]
    },
    {
      id: "main_2_market",
      title: "\u3010\u4E3B\u7EBF\u3011\u574A\u5E02\u98CE\u4E91",
      body: "\u574A\u5E02\u51FA\u73B0\u4E00\u4EFD\u6B8B\u5377\u62CD\u5356\u3002\u6709\u4EBA\u8BF4\u662F\u711A\u8BC0\uFF0C\u6709\u4EBA\u8BF4\u662F\u9A97\u5C40\u3002\u4F60\u7684\u6C14\u8FD0\u5728\u9AB0\u5B50\u4E0A\u8DF3\u821E\u3002",
      minRealm: 1,
      lore: "\u6597\u7834/\u51E1\u4EBA\xB7\u4E3B\u7EBF",
      mainChapter: 2,
      options: [
        {
          id: "m2_bid",
          label: "\u54AC\u7259\u7ADE\u62CD",
          blurb: "\u53EF\u80FD\u62CD\u5230\u711A\u8BC0\u6B8B\u9875\uFF0C\u4E5F\u53EF\u80FD\u88AB\u5272\u97ED\u83DC\u3002",
          lingqiDelta: -3e3,
          grantTreasureId: "flame_tome",
          flags: ["main_market"],
          attrsDelta: { luck: -1, atk: 1 }
        },
        {
          id: "m2_steal_look",
          label: "\u795E\u8BC6\u5077\u7784",
          blurb: "\u8BB0\u4E0B\u4E09\u884C\u53E3\u8BC0\uFF0C\u67D3\u4E0A\u300C\u5C0F\u5077\u300D\u95F2\u8BDD\u3002",
          flags: ["main_market", "thief_name"],
          attrsDelta: { spirit: 2, luck: -1 },
          lingqiDelta: 200
        },
        {
          id: "m2_leave",
          label: "\u51B7\u9759\u79BB\u573A",
          blurb: "\u4E0D\u8D4C\u3002\u5F97\u767E\u5E74\u7075\u8349\u673A\u7F18\u3002",
          flags: ["main_market"],
          freePointsDelta: 1,
          lingqiDelta: 800,
          grantNaturalId: "nat_spirit_grass"
        }
      ]
    },
    {
      id: "main_3_secret",
      title: "\u3010\u4E3B\u7EBF\u3011\u79D8\u5883\u5F00\u542F",
      body: "\u754C\u57DF\u79D8\u5883\u88C2\u7F1D\u5F20\u5F00\u3002\u91CC\u9762\u6709\u5929\u624D\u5730\u5B9D\u7684\u6C14\u5473\uFF0C\u4E5F\u6709\u8001\u602A\u7684\u547C\u5438\u3002",
      minRealm: 2,
      lore: "\u8BF8\u5929\xB7\u4E3B\u7EBF",
      mainChapter: 3,
      options: [
        {
          id: "m3_deep",
          label: "\u76F4\u95EF\u6DF1\u5904",
          blurb: "\u9AD8\u98CE\u9669\uFF1A\u9047\u8001\u602A\uFF1B\u9AD8\u6536\u76CA\uFF1A\u865A\u7A7A\u83B2\u74E3\u3002",
          combatEnemyId: "soul_old",
          deathOnLose: false,
          flags: ["main_secret"],
          attrsDelta: { atk: 2 },
          grantNaturalId: "nat_void_flower"
        },
        {
          id: "m3_edge",
          label: "\u5916\u56F4\u6361\u6F0F",
          blurb: "\u7A33\u59A5\u5F97\u5996\u4E39\u4E0E\u7075\u6C14\u3002",
          flags: ["main_secret"],
          lingqiDelta: 5e3,
          freePointsDelta: 1,
          grantNaturalId: "nat_beast_core"
        },
        {
          id: "m3_map",
          label: "\u5356\u5730\u56FE\u8D5A\u94B1",
          blurb: "\u51E1\u4EBA\u5F0F\u9009\u62E9\uFF1A\u4E0D\u88C5\u82F1\u96C4\uFF0C\u5148\u641E\u94B1\u3002",
          flags: ["main_secret", "sold_map"],
          lingqiDelta: 15e3,
          attrsDelta: { luck: 1 }
        }
      ]
    },
    {
      id: "main_4_tribulation_rumor",
      title: "\u3010\u4E3B\u7EBF\u3011\u5929\u52AB\u9884\u8A00",
      body: "\u6709\u4EBA\u7ACB\u724C\uFF1A\u300C\u4E09\u5E74\u540E\u6B64\u95F4\u6709\u52AB\u3002\u300D\u4F60\u60F3\u8D77\u6597\u7834\u7684\u4E09\u5E74\u4E4B\u671F\uFF0C\u7B11\u4E86\u7B11\uFF0C\u53C8\u7B11\u4E0D\u51FA\u6765\u3002",
      minRealm: 4,
      lore: "\u6597\u7834\u6897\xB7\u4E3B\u7EBF",
      mainChapter: 4,
      options: [
        {
          id: "m4_prepare",
          label: "\u95ED\u5173\u5907\u52AB",
          blurb: "\u5C5E\u6027\u7A33\u589E\uFF0C\u5F97\u5267\u60C5\u62A4\u7532\uFF08\u5FC3\u7406\u5B89\u6170\uFF09\u3002",
          flags: ["main_trib_ready"],
          grantTreasureId: "plot_armor",
          attrsDelta: { def: 3, bone: 2 },
          freePointsDelta: 2
        },
        {
          id: "m4_ignore",
          label: "\u9884\u8A00\u4E0D\u53EF\u4FE1",
          blurb: "\u7EE7\u7EED\u6D6A\u3002\u6C14\u673A+2\uFF0C\u4F46\u65E0\u51C6\u5907\u3002",
          flags: ["main_trib_ignore"],
          attrsDelta: { luck: 2 },
          lingqiDelta: 2e4
        }
      ]
    },
    {
      id: "main_5_dao_ask",
      title: "\u3010\u4E3B\u7EBF\u3011\u95EE\u9053\u6B8B\u7891",
      body: "\u5929\u7891\u534A\u622A\u7ACB\u4E8E\u4E91\u4E0A\u3002\u7891\u6587\u6A21\u7CCA\uFF0C\u5374\u50CF\u5728\u95EE\uFF1A\u4F60\u4E3A\u4F55\u4FEE\u4ED9\uFF1F",
      minRealm: 6,
      lore: "\u906E\u5929/\u5927\u9053\xB7\u4E3B\u7EBF",
      mainChapter: 5,
      options: [
        {
          id: "m5_power",
          label: "\u4E3A\u4E86\u53D8\u5F3A",
          blurb: "\u653B\u4F10\u9053\u5FC3\u3002\u5F97\u6B8B\u7834\u5929\u7891\u3002",
          flags: ["main_dao_power"],
          grantTreasureId: "heaven_stele",
          attrsDelta: { atk: 4, spirit: 2 }
        },
        {
          id: "m5_live",
          label: "\u4E3A\u4E86\u6D3B\u7740",
          blurb: "\u51E1\u4EBA\u771F\u5FC3\u3002\u62A4\u4F53\u4E0E\u6C14\u673A\u4E0A\u5347\u3002",
          flags: ["main_dao_live"],
          attrsDelta: { def: 4, luck: 3 },
          freePointsDelta: 2
        },
        {
          id: "m5_void",
          label: "\u4E3A\u4E86\u770B\u89C1\u66F4\u9AD8\u5904",
          blurb: "\u95EE\u865A\u4E4B\u5FF5\u3002\u795E\u8BC6\u5927\u6DA8\u3002",
          flags: ["main_dao_void"],
          attrsDelta: { spirit: 5, spd: 2 },
          lingqiDelta: 1e5
        }
      ]
    }
  ];
  function getNatural(id) {
    return NATURALS.find((n) => n.id === id);
  }

  // xian/src/game/data.ts
  var MAX_OFFLINE_MS = 8 * 60 * 60 * 1e3;
  var QIYUN_BONUS_PER = 0.08;
  var SAVE_VERSION = 11;
  var STORAGE_KEY = "xian-save-v11";
  var MAX_STAR = 9;
  var MAX_CHRONICLE = 28;
  var MAX_MILESTONES = 40;
  var MAX_EQUIP_PER_SLOT = 3;
  var FREE_POINT_TO_RESOURCE = 100;
  var TRIAD_INTERFERE_CAP = 0.15;
  var RANDOM_COOLDOWN_MS = 18e3;
  var RANDOM_CHANCE = {
    click: 0.07,
    level: 0.28,
    time: 0.12
  };
  function zeroAttrs() {
    return { atk: 0, def: 0, spd: 0, spirit: 0, bone: 0, luck: 0 };
  }
  function zeroResources() {
    return { lingli: 0, tishu: 0, jingshen: 0 };
  }
  function artChannel(art) {
    if (art.channel) return art.channel;
    if (art.branch === "body") return "tishu";
    if (art.branch === "soul" || art.branch === "alchemy") return "jingshen";
    return "lingli";
  }
  function addAttrs(a, b) {
    return {
      atk: a.atk + (b.atk || 0),
      def: a.def + (b.def || 0),
      spd: a.spd + (b.spd || 0),
      spirit: a.spirit + (b.spirit || 0),
      bone: a.bone + (b.bone || 0),
      luck: a.luck + (b.luck || 0)
    };
  }
  function scaleAttrs(a, rate) {
    return {
      atk: Math.max(0, Math.floor(a.atk * rate)),
      def: Math.max(0, Math.floor(a.def * rate)),
      spd: Math.max(0, Math.floor(a.spd * rate)),
      spirit: Math.max(0, Math.floor(a.spirit * rate)),
      bone: Math.max(0, Math.floor(a.bone * rate)),
      luck: Math.max(0, Math.floor(a.luck * rate))
    };
  }
  var REALMS = [
    {
      id: "lianqi",
      name: "\u70BC\u6C14",
      mult: 1,
      starCostBase: 35,
      breakCost: 900,
      blurb: "\u5F15\u6C14\u5165\u4F53\uFF0C\u51E1\u4EBA\u8FC8\u5165\u4ED9\u9014\u7B2C\u4E00\u6B65\u3002\u9694\u58C1\u8001\u738B\u8BF4\u4F60\u547D\u683C\u50CF\u5F00\u4E86\u6302\u3002",
      hue: 42,
      inheritAttrRate: 0.05,
      inheritTreasureSlots: 0
    },
    {
      id: "zhuji",
      name: "\u7B51\u57FA",
      mult: 1.9,
      starCostBase: 280,
      breakCost: 8e3,
      blurb: "\u7B51\u57FA\u6210\u529F\uFF0C\u5BFF\u5143\u5927\u6DA8\u3002\u574A\u5E02\u91CC\u5F00\u59CB\u6709\u4EBA\u558A\u4F60\u300C\u524D\u8F88\u300D\u3002",
      hue: 36,
      inheritAttrRate: 0.12,
      inheritTreasureSlots: 1
    },
    {
      id: "jiedan",
      name: "\u7ED3\u4E39",
      mult: 3.4,
      starCostBase: 1800,
      breakCost: 5e4,
      blurb: "\u91D1\u4E39\u4E00\u9053\uFF0C\u9053\u9014\u5C06\u5206\u3002\u5047\u4E39\u771F\u4E39\u4E4B\u4E89\uFF0C\u6C38\u4E0D\u8FC7\u65F6\u3002",
      hue: 28,
      inheritAttrRate: 0.22,
      inheritTreasureSlots: 1
    },
    {
      id: "yuanying",
      name: "\u5143\u5A74",
      mult: 6,
      starCostBase: 12e3,
      breakCost: 35e4,
      blurb: "\u5143\u5A74\u51FA\u7A8D\uFF0C\u795E\u8BC6\u53EF\u6E38\u767E\u91CC\u3002\u79D8\u5883\u95E8\u7968\u5F00\u59CB\u5BF9\u4F60\u6253\u6298\u3002",
      hue: 18,
      inheritAttrRate: 0.32,
      inheritTreasureSlots: 2
    },
    {
      id: "huashen",
      name: "\u5316\u795E",
      mult: 11,
      starCostBase: 7e4,
      breakCost: 22e5,
      blurb: "\u5316\u795E\u5408\u9053\uFF0C\u5929\u5730\u6CD5\u5219\u4F9D\u7A00\u53EF\u611F\u3002\u6709\u4EBA\u558A\u4F60\u300C\u8001\u602A\u300D\u3002",
      hue: 8,
      inheritAttrRate: 0.42,
      inheritTreasureSlots: 2
    },
    {
      id: "lianxu",
      name: "\u70BC\u865A",
      mult: 20,
      starCostBase: 4e5,
      breakCost: 14e6,
      blurb: "\u70BC\u865A\u5408\u9053\uFF0C\u7A7A\u95F4\u4E4B\u529B\u5728\u63E1\u3002\u4F20\u9001\u9635\u7EF4\u4FEE\u5DE5\u5F00\u59CB\u6015\u4F60\u3002",
      hue: 350,
      inheritAttrRate: 0.52,
      inheritTreasureSlots: 2
    },
    {
      id: "heti",
      name: "\u5408\u4F53",
      mult: 36,
      starCostBase: 22e5,
      breakCost: 8e7,
      blurb: "\u5408\u4F53\u671F\uFF0C\u8089\u8EAB\u4E0E\u5143\u795E\u4EA4\u878D\u3002\u5B97\u95E8\u957F\u8001\u89C1\u4F60\u90FD\u8981\u70B9\u5934\u3002",
      hue: 320,
      inheritAttrRate: 0.62,
      inheritTreasureSlots: 3
    },
    {
      id: "dacheng",
      name: "\u5927\u4E58",
      mult: 65,
      starCostBase: 12e6,
      breakCost: 5e8,
      blurb: "\u5927\u4E58\u5883\uFF0C\u4E00\u65B9\u96C4\u4E3B\u3002\u6B63\u9B54\u4E24\u9053\u90FD\u60F3\u628A\u4F60\u62C9\u8FDB\u7FA4\u804A\u3002",
      hue: 280,
      inheritAttrRate: 0.72,
      inheritTreasureSlots: 3
    },
    {
      id: "dujie",
      name: "\u6E21\u52AB",
      mult: 120,
      starCostBase: 7e7,
      breakCost: 3e9,
      blurb: "\u5929\u52AB\u5982\u7EA6\u800C\u81F3\u3002\u8FD9\u6B21\u662F\u96F7\u52AB\u3001\u5FC3\u9B54\uFF0C\u8FD8\u662F\u300C\u7CFB\u7EDF\u5F39\u7A97\u300D\uFF1F",
      hue: 200,
      inheritAttrRate: 0.8,
      inheritTreasureSlots: 3
    },
    {
      id: "zhenxian",
      name: "\u771F\u4ED9",
      mult: 220,
      starCostBase: 4e8,
      breakCost: 2e10,
      blurb: "\u98DE\u5347\u771F\u4ED9\uFF0C\u7075\u754C\u6237\u53E3\u672C\u76D6\u7AE0\u3002\u51E1\u4EBA\u754C\u4F20\u8BF4\u91CC\u6709\u4F60\u4E00\u7B14\u3002",
      hue: 160,
      inheritAttrRate: 0.88,
      inheritTreasureSlots: 3
    },
    {
      id: "jinxian",
      name: "\u91D1\u4ED9",
      mult: 400,
      starCostBase: 25e8,
      breakCost: 12e10,
      blurb: "\u91D1\u4ED9\u4E0D\u706D\uFF0C\u6CD5\u5219\u6210\u6CB3\u3002\u8BF8\u5929\u5267\u60C5\u5F00\u59CB\u56F4\u7740\u4F60\u8F6C\u3002",
      hue: 45,
      inheritAttrRate: 0.94,
      inheritTreasureSlots: 3
    },
    {
      id: "dadao",
      name: "\u5927\u9053",
      mult: 700,
      starCostBase: 2e10,
      breakCost: 0,
      blurb: "\u9053\u6210\uFF0C\u8BF8\u5929\u4FA7\u76EE\u3002\u8F6E\u56DE\u4E0E\u5426\uFF0C\u7686\u5728\u4E00\u5FF5\u3002",
      hue: 30,
      inheritAttrRate: 1,
      inheritTreasureSlots: 3
    }
  ];
  var BIRTHS = [
    {
      id: "orphan",
      name: "\u5BD2\u95E8\u6563\u4FEE",
      blurb: "\u7834\u5E99\u51FA\u8EAB\uFF0C\u53E3\u888B\u6BD4\u8138\u5E72\u51C0\u3002\u597D\u5728\u6CA1\u4EBA\u7BA1\u4F60\uFF0C\u60F3\u4F5C\u6B7B\u5C31\u4F5C\u6B7B\u3002",
      attrs: { bone: 1, luck: 2, spd: 1 },
      freePoints: 4,
      startLingqi: 0,
      flags: ["birth_orphan"],
      mark: "\u5BD2"
    },
    {
      id: "clan",
      name: "\u4FEE\u4ED9\u4E16\u5BB6",
      blurb: "\u65CF\u8C31\u539A\u5F97\u80FD\u62CD\u6B7B\u5996\u517D\u3002\u5F00\u5C40\u9001\u7075\u77F3\uFF0C\u4E5F\u9001\u300C\u65CF\u89C4\u300Ddebuff\u3002",
      attrs: { spirit: 2, bone: 2, atk: 1 },
      freePoints: 3,
      startLingqi: 80,
      flags: ["birth_clan"],
      mark: "\u4E16"
    },
    {
      id: "sect_outer",
      name: "\u5B97\u95E8\u5916\u95E8",
      blurb: "\u626B\u7075\u8349\u3001\u5582\u7075\u517D\u3001\u88AB\u5185\u95E8\u5F1F\u5B50\u4F7F\u5524\u3002\u4F60\u53D1\u8A93\u6709\u671D\u4E00\u65E5\u2026\u2026\u5148\u628A\u5730\u626B\u5B8C\u3002",
      attrs: { def: 2, bone: 1, spirit: 1 },
      freePoints: 3,
      startLingqi: 40,
      flags: ["birth_sect"],
      mark: "\u5916"
    },
    {
      id: "demon_remnant",
      name: "\u9B54\u9053\u4F59\u8109",
      blurb: "\u7956\u4E0A\u5E72\u8FC7\u5927\u4E8B\uFF0C\u73B0\u5728\u5168\u5BB6\u5728\u9003\u3002\u9ED1\u5E02\u4FE1\u8A89\u5F88\u597D\u3002",
      attrs: { atk: 3, spd: 1, luck: -1 },
      freePoints: 3,
      startLingqi: 60,
      flags: ["birth_demon"],
      mark: "\u9B54"
    },
    {
      id: "herb_boy",
      name: "\u836F\u56ED\u6742\u5F79",
      blurb: "\u8BC6\u836F\u8FA8\u8349\u662F\u5403\u996D\u7684\u672C\u4E8B\u3002\u4E39\u5E08\u8DEF\u8FC7\u65F6\uFF0C\u4F60\u603B\u4F1A\u591A\u770B\u4E00\u773C\u7089\u706B\u3002",
      attrs: { spirit: 3, luck: 1 },
      freePoints: 3,
      startLingqi: 30,
      flags: ["birth_herb"],
      mark: "\u836F"
    },
    {
      id: "hunter",
      name: "\u730E\u5996\u6751\u843D",
      blurb: "\u6751\u91CC\u4EBA\u4EBA\u4F1A\u4E0B\u5957\u3002\u4F60\u7AE5\u5E74\u73A9\u5177\u662F\u5996\u517D\u7259\u9F7F\u3002",
      attrs: { atk: 2, def: 1, spd: 2 },
      freePoints: 3,
      startLingqi: 20,
      flags: ["birth_hunter"],
      mark: "\u730E"
    },
    {
      id: "trash_young",
      name: "\u5E9F\u67F4\u5C11\u7237",
      blurb: "\u4E09\u5E74\u4E4B\u671F\u5DF2\u5230\uFF1F\u8FD8\u6CA1\u5230\u3002\u5168\u57CE\u90FD\u5728\u7B49\u4F60\u6253\u8138\u5267\u60C5\uFF0C\u4F60\u5148\u6478\u9C7C\u3002",
      attrs: { luck: 3, bone: -1, spirit: 1 },
      freePoints: 5,
      startLingqi: 10,
      flags: ["birth_trash", "trope_trash"],
      mark: "\u5E9F"
    },
    {
      id: "transmigrator",
      name: "\u83AB\u540D\u7A7F\u8D8A\u8005",
      blurb: "\u4F60\u8BB0\u5F97\u6597\u6C14\u3001\u906E\u5929\u3001\u4ED9\u9006\u7684\u5267\u900F\uFF0C\u5374\u8BB0\u4E0D\u4F4F\u65E9\u996D\u5403\u4E86\u5565\u3002\u7CFB\u7EDF\uFF1F\u6CA1\u6709\u3002",
      attrs: { spirit: 2, luck: 2, spd: 1 },
      freePoints: 4,
      startLingqi: 0,
      flags: ["birth_chuan", "trope_meta"],
      mark: "\u7A7F"
    }
  ];
  var BRANCH_LABELS = {
    flame: { name: "\u711A\u708E\u5F02\u706B", blurb: "\u6597\u7834\u540C\u6B3E\uFF1A\u706B\u8D8A\u5927\uFF0C\u9762\u5B50\u8D8A\u5927\u3002", mult: 1.12 },
    alchemy: { name: "\u4E39\u9053\u6C42\u7D22", blurb: "\u51E1\u4EBA\u540C\u6B3E\uFF1A\u4E39\u6210\uFF0C\u4EBA\u672A\u8001\u3002", mult: 1.1 },
    body: { name: "\u8352\u53E4\u4F53\u4FEE", blurb: "\u906E\u5929\u540C\u6B3E\uFF1A\u8089\u8EAB\u5373\u9053\uFF0C\u62F3\u53EF\u5D29\u6E0A\u3002", mult: 1.15 },
    soul: { name: "\u795E\u9B42\u4ED9\u9006", blurb: "\u4ED9\u9006\u540C\u6B3E\uFF1A\u4E00\u5FF5\u6210\u9B54\uFF0C\u4E00\u5FF5\u6210\u4F5B\u3002", mult: 1.14 },
    beast: { name: "\u9A6D\u517D\u7075\u5951", blurb: "\u51E1\u4EBA\u540C\u6B3E\uFF1A\u5BA0\u7269\u624D\u662F\u6218\u529B\u672C\u4F53\u3002", mult: 1.11 },
    sword: { name: "\u95EE\u5FC3\u4E00\u5251", blurb: "\u8BF8\u5929\u540C\u6B3E\uFF1A\u5251\u5728\u4EBA\u5728\uFF0C\u6897\u4E5F\u5728\u3002", mult: 1.13 }
  };
  var ARTS = [
    {
      id: "tuna_basic",
      name: "\u57FA\u7840\u5410\u7EB3",
      description: "\u6BCF\u6B21\u5410\u7EB3\u5438\u5165\u66F4\u591A\u7075\u529B\u3002",
      kind: "click",
      baseCost: 15,
      costMult: 1.13,
      power: 0.6,
      minRealm: 0,
      attrs: { bone: 0.1 },
      mark: "\u7EB3"
    },
    {
      id: "meridian_open",
      name: "\u6D17\u7ECF\u4F10\u8109",
      description: "\u758F\u901A\u7ECF\u8109\uFF0C\u7075\u529B\u5BB9\u5668\u4E0A\u9650\u5C0F\u5E45\u63D0\u5347\u3002\u524D\u671F\u9700\u53CD\u590D\u4FEE\u4E60\u3002",
      kind: "cap",
      baseCost: 16,
      costMult: 1.14,
      power: 72,
      minRealm: 0,
      attrs: { bone: 0.15 },
      mark: "\u8109"
    },
    {
      id: "qi_vortex",
      name: "\u6C14\u65CB\u541E\u5410",
      description: "\u6C14\u6D77\u6210\u6DA1\uFF0C\u4E00\u5438\u5343\u7F15\u3002",
      kind: "click",
      baseCost: 1200,
      costMult: 1.16,
      power: 9,
      minRealm: 1,
      attrs: { spirit: 0.2 },
      mark: "\u6DA1"
    },
    {
      id: "dragon_breath",
      name: "\u9F99\u606F\u5410\u7EB3",
      description: "\u4EFF\u9F99\u65CF\u547C\u5438\uFF0C\u70B9\u51FB\u66B4\u6DA8\u3002",
      kind: "click",
      baseCost: 15e3,
      costMult: 1.17,
      power: 38,
      minRealm: 3,
      attrs: { atk: 0.3 },
      mark: "\u9F99"
    },
    {
      id: "heaven_draw",
      name: "\u62BD\u5929\u593A\u6C14",
      description: "\u5F3A\u62BD\u5929\u5730\u7075\u6C14\uFF0C\u51F6\u9669\u5374\u5FEB\u3002",
      kind: "click",
      baseCost: 2e5,
      costMult: 1.18,
      power: 150,
      minRealm: 5,
      attrs: { atk: 0.4, luck: -0.1 },
      mark: "\u593A"
    },
    {
      id: "dao_inhale",
      name: "\u95EE\u9053\u4E00\u5438",
      description: "\u5927\u9053\u547C\u5438\uFF0C\u70B9\u51FB\u5982\u6F6E\u3002",
      kind: "click",
      baseCost: 4e6,
      costMult: 1.2,
      power: 650,
      minRealm: 8,
      attrs: { spirit: 0.5 },
      mark: "\u9053"
    },
    {
      id: "sit_meditation",
      name: "\u9759\u5BA4\u6253\u5750",
      description: "\u6BCF\u79D2\u7F13\u6162\u79EF\u6512\u7075\u529B\u3002",
      kind: "passive",
      baseCost: 50,
      costMult: 1.12,
      power: 0.4,
      minRealm: 0,
      attrs: { spirit: 0.1 },
      mark: "\u5750"
    },
    {
      id: "spirit_gather",
      name: "\u805A\u7075\u9635\u7EB9",
      description: "\u6D1E\u5E9C\u805A\u7075\uFF0C\u88AB\u52A8\u63D0\u5347\u3002",
      kind: "passive",
      baseCost: 400,
      costMult: 1.14,
      power: 2,
      minRealm: 1,
      mark: "\u9635"
    },
    {
      id: "cave_mansion",
      name: "\u6D1E\u5E9C\u7075\u8109",
      description: "\u5360\u636E\u7075\u8109\uFF0C\u65E5\u591C\u6ECB\u517B\u3002",
      kind: "passive",
      baseCost: 5e3,
      costMult: 1.15,
      power: 11,
      minRealm: 2,
      mark: "\u5E9C"
    },
    {
      id: "sect_salary",
      name: "\u5B97\u95E8\u4FF8\u7984",
      description: "\u6302\u540D\u9886\u4FF8\uFF0C\u6708\u4F8B\u5316\u7075\u6C14\u3002",
      kind: "passive",
      baseCost: 4e4,
      costMult: 1.16,
      power: 48,
      minRealm: 3,
      mark: "\u4FF8"
    },
    {
      id: "domain_tax",
      name: "\u9886\u5730\u6C14\u7A0E",
      description: "\u4EE5\u52BF\u538B\u4EBA\uFF0C\u7075\u6C14\u4E0A\u4F9B\u3002",
      kind: "passive",
      baseCost: 3e5,
      costMult: 1.17,
      power: 190,
      minRealm: 5,
      mark: "\u7A0E"
    },
    {
      id: "void_well",
      name: "\u865A\u7A7A\u7075\u4E95",
      description: "\u8FDE\u901A\u865A\u7A7A\uFF0C\u6E90\u6E90\u4E0D\u65AD\u3002",
      kind: "passive",
      baseCost: 5e6,
      costMult: 1.18,
      power: 850,
      minRealm: 7,
      mark: "\u4E95"
    },
    {
      id: "heaven_vein",
      name: "\u5929\u8109\u5171\u9E23",
      description: "\u4E0E\u754C\u57DF\u5929\u8109\u5171\u9E23\u3002",
      kind: "passive",
      baseCost: 8e7,
      costMult: 1.2,
      power: 3800,
      minRealm: 9,
      mark: "\u5929"
    },
    {
      id: "qi_sea_vast",
      name: "\u6C14\u6D77\u65E0\u91CF",
      description: "\u6C14\u6D77\u65E0\u6DAF\uFF0C\u7075\u529B\u5BB9\u5668\u4E0A\u9650\u660E\u663E\u63D0\u5347\u3002",
      kind: "cap",
      baseCost: 12e3,
      costMult: 1.17,
      power: 5500,
      minRealm: 4,
      attrs: { spirit: 0.3 },
      mark: "\u6D77"
    },
    {
      id: "void_dantian",
      name: "\u865A\u7A7A\u4E39\u7530",
      description: "\u4E39\u7530\u5316\u865A\uFF0C\u7075\u529B\u5BB9\u5668\u4E0A\u9650\u5927\u6DA8\u3002",
      kind: "cap",
      baseCost: 6e5,
      costMult: 1.18,
      power: 18e4,
      minRealm: 7,
      mark: "\u7530"
    },
    // —— 体术通道 ——
    {
      id: "fist_temper",
      name: "\u94C1\u7802\u78E8\u62F3",
      description: "\u4EE5\u62F3\u9524\u4F53\uFF0C\u70B9\u51FB\u589E\u957F\u4F53\u672F\u3002",
      kind: "click",
      channel: "tishu",
      baseCost: 18,
      costMult: 1.13,
      power: 0.55,
      minRealm: 0,
      attrs: { bone: 0.15 },
      mark: "\u62F3"
    },
    {
      id: "sinew_loose",
      name: "\u8212\u7B4B\u6D3B\u7EDC",
      description: "\u7B4B\u7EDC\u8212\u5C55\uFF0C\u4F53\u672F\u5BB9\u5668\u4E0A\u9650\u5C0F\u5E45\u63D0\u5347\u3002\u524D\u671F\u9700\u53CD\u590D\u4FEE\u4E60\u3002",
      kind: "cap",
      channel: "tishu",
      baseCost: 16,
      costMult: 1.14,
      power: 60,
      minRealm: 0,
      attrs: { bone: 0.15 },
      mark: "\u7EDC"
    },
    {
      id: "bone_forge",
      name: "\u953B\u9AA8\u5343\u9524",
      description: "\u953B\u9AA8\u5982\u9F0E\uFF0C\u4F53\u672F\u5BB9\u5668\u4E0A\u9650\u63D0\u5347\u3002",
      kind: "cap",
      channel: "tishu",
      baseCost: 380,
      costMult: 1.17,
      power: 220,
      minRealm: 1,
      attrs: { atk: 0.2, bone: 0.2 },
      mark: "\u953B"
    },
    {
      id: "blood_surge",
      name: "\u6C14\u8840\u6F6E\u751F",
      description: "\u5468\u8EAB\u6C14\u8840\u81EA\u884C\u9F13\u8361\u3002",
      kind: "passive",
      channel: "tishu",
      baseCost: 60,
      costMult: 1.12,
      power: 0.35,
      minRealm: 0,
      attrs: { def: 0.1 },
      mark: "\u8840"
    },
    {
      id: "marrow_wash",
      name: "\u6D17\u9AD3\u6613\u7B4B",
      description: "\u6D17\u9AD3\u6362\u8840\uFF0C\u4F53\u672F\u5BB9\u5668\u4E0A\u9650\u63D0\u5347\u3002",
      kind: "cap",
      channel: "tishu",
      baseCost: 2200,
      costMult: 1.17,
      power: 750,
      minRealm: 2,
      attrs: { bone: 0.3 },
      mark: "\u9AD3"
    },
    {
      id: "saint_vessel",
      name: "\u5723\u8EAF\u9F0E\u7089",
      description: "\u8EAF\u82E5\u9F0E\u7089\uFF0C\u4F53\u672F\u5BB9\u5668\u4E0A\u9650\u660E\u663E\u63D0\u5347\u3002",
      kind: "cap",
      channel: "tishu",
      baseCost: 28e3,
      costMult: 1.17,
      power: 8e3,
      minRealm: 4,
      attrs: { bone: 0.5 },
      mark: "\u7089"
    },
    // —— 精神力通道 ——
    {
      id: "mind_focus",
      name: "\u51DD\u795E\u4E00\u5FF5",
      description: "\u6536\u675F\u795E\u8BC6\uFF0C\u70B9\u51FB\u589E\u957F\u7CBE\u795E\u529B\u3002",
      kind: "click",
      channel: "jingshen",
      baseCost: 18,
      costMult: 1.13,
      power: 0.55,
      minRealm: 0,
      attrs: { spirit: 0.15 },
      mark: "\u5FF5"
    },
    {
      id: "mind_widen",
      name: "\u51DD\u795E\u6269\u8BC6",
      description: "\u62D3\u5F00\u795E\u8BC6\uFF0C\u7CBE\u795E\u529B\u5BB9\u5668\u4E0A\u9650\u5C0F\u5E45\u63D0\u5347\u3002\u524D\u671F\u9700\u53CD\u590D\u4FEE\u4E60\u3002",
      kind: "cap",
      channel: "jingshen",
      baseCost: 16,
      costMult: 1.14,
      power: 60,
      minRealm: 0,
      attrs: { spirit: 0.15 },
      mark: "\u8BC6"
    },
    {
      id: "soul_sea",
      name: "\u8BC6\u6D77\u5F00\u7586",
      description: "\u62D3\u5E7F\u8BC6\u6D77\uFF0C\u7CBE\u795E\u529B\u5BB9\u5668\u4E0A\u9650\u63D0\u5347\u3002",
      kind: "cap",
      channel: "jingshen",
      baseCost: 380,
      costMult: 1.17,
      power: 220,
      minRealm: 1,
      attrs: { spirit: 0.3 },
      mark: "\u6D77"
    },
    {
      id: "spirit_hum",
      name: "\u795E\u9B42\u8F7B\u9E23",
      description: "\u795E\u9B42\u81EA\u8F6C\uFF0C\u7CBE\u795E\u529B\u7F13\u751F\u3002",
      kind: "passive",
      channel: "jingshen",
      baseCost: 60,
      costMult: 1.12,
      power: 0.35,
      minRealm: 0,
      attrs: { luck: 0.1 },
      mark: "\u9E23"
    },
    {
      id: "void_gaze",
      name: "\u865A\u7A7A\u89C2\u60F3",
      description: "\u89C2\u60F3\u865A\u7A7A\uFF0C\u7CBE\u795E\u529B\u957F\u6D41\u3002",
      kind: "passive",
      channel: "jingshen",
      baseCost: 4500,
      costMult: 1.15,
      power: 10,
      minRealm: 2,
      attrs: { spirit: 0.3 },
      mark: "\u89C2"
    },
    {
      id: "spirit_court",
      name: "\u795E\u5EAD\u7389\u5B87",
      description: "\u795E\u5EAD\u5E7F\u53A6\uFF0C\u7CBE\u795E\u529B\u5BB9\u5668\u4E0A\u9650\u660E\u663E\u63D0\u5347\u3002",
      kind: "cap",
      channel: "jingshen",
      baseCost: 28e3,
      costMult: 1.17,
      power: 8e3,
      minRealm: 4,
      attrs: { spirit: 0.5 },
      mark: "\u5EAD"
    },
    // 分支功法
    {
      id: "flame_seed",
      name: "\u706B\u79CD\u6E29\u517B",
      description: "\u638C\u5FC3\u706B\u79CD\u52A9\u63A8\u5410\u7EB3\u3002",
      kind: "click",
      baseCost: 4e3,
      costMult: 1.16,
      power: 20,
      minRealm: 2,
      branch: "flame",
      attrs: { atk: 0.4 },
      mark: "\u706B"
    },
    {
      id: "strange_fire",
      name: "\u5F02\u706B\u6B8B\u79CD",
      description: "\u5F02\u706B\u6DEC\u4F53\uFF0C\u88AB\u52A8\u707C\u70E7\u6742\u8D28\u3002",
      kind: "passive",
      baseCost: 25e4,
      costMult: 1.17,
      power: 130,
      minRealm: 4,
      branch: "flame",
      attrs: { atk: 0.6, bone: 0.3 },
      mark: "\u5F02"
    },
    {
      id: "emperor_flame",
      name: "\u5E1D\u708E\u865A\u5F71",
      description: "\u5E1D\u7EA7\u5F02\u706B\u865A\u5F71\uFF0C\u88AB\u52A8\u711A\u5929\u3002",
      kind: "passive",
      baseCost: 9e7,
      costMult: 1.21,
      power: 4500,
      minRealm: 9,
      branch: "flame",
      attrs: { atk: 1.2 },
      mark: "\u708E"
    },
    {
      id: "herb_pick",
      name: "\u8BC6\u836F\u8FA8\u8349",
      description: "\u91C7\u836F\u5165\u9F0E\uFF0C\u70B9\u51FB\u70BC\u5316\u3002",
      kind: "click",
      baseCost: 3500,
      costMult: 1.15,
      power: 18,
      minRealm: 2,
      branch: "alchemy",
      attrs: { spirit: 0.4 },
      mark: "\u836F"
    },
    {
      id: "soul_flame_refine",
      name: "\u9B42\u706B\u70BC\u4E39",
      description: "\u7075\u9B42\u4E4B\u706B\u63A7\u4E39\u3002",
      kind: "passive",
      baseCost: 24e4,
      costMult: 1.17,
      power: 135,
      minRealm: 4,
      branch: "alchemy",
      attrs: { spirit: 0.7 },
      mark: "\u4E39"
    },
    {
      id: "pill_tower",
      name: "\u4E39\u5854\u6B8B\u5377",
      description: "\u4E39\u9053\u53E4\u7C4D\u52A0\u6301\u3002",
      kind: "passive",
      baseCost: 8e7,
      costMult: 1.2,
      power: 4200,
      minRealm: 9,
      branch: "alchemy",
      attrs: { spirit: 1.2, luck: 0.3 },
      mark: "\u5854"
    },
    {
      id: "bone_temper",
      name: "\u953B\u9AA8\u6DEC\u7B4B",
      description: "\u4EE5\u529B\u7834\u5DE7\u3002",
      kind: "click",
      baseCost: 3800,
      costMult: 1.16,
      power: 22,
      minRealm: 2,
      branch: "body",
      attrs: { bone: 0.5, def: 0.3 },
      mark: "\u9AA8"
    },
    {
      id: "diamond_body",
      name: "\u9738\u4F53\u96CF\u5F62",
      description: "\u8089\u8EAB\u786C\u6297\u6CD5\u672F\u3002",
      kind: "passive",
      baseCost: 28e4,
      costMult: 1.17,
      power: 150,
      minRealm: 4,
      branch: "body",
      attrs: { def: 0.8, bone: 0.5 },
      mark: "\u9738"
    },
    {
      id: "immortal_flesh",
      name: "\u4E0D\u706D\u8089\u8EAB",
      description: "\u8089\u8EAB\u8FD1\u5723\u3002",
      kind: "passive",
      baseCost: 1e8,
      costMult: 1.21,
      power: 4800,
      minRealm: 9,
      branch: "body",
      attrs: { def: 1.5, bone: 1 },
      mark: "\u706D"
    },
    {
      id: "soul_sense",
      name: "\u795E\u9B42\u611F\u77E5",
      description: "\u795E\u8BC6\u641C\u522E\u6E38\u79BB\u7075\u6C14\u3002",
      kind: "click",
      baseCost: 3600,
      costMult: 1.16,
      power: 19,
      minRealm: 2,
      branch: "soul",
      attrs: { spirit: 0.5 },
      mark: "\u8BC6"
    },
    {
      id: "soul_palace",
      name: "\u795E\u9B42\u6BBF\u53F0",
      description: "\u7B51\u795E\u9B42\u6BBF\u3002",
      kind: "passive",
      baseCost: 26e4,
      costMult: 1.17,
      power: 140,
      minRealm: 4,
      branch: "soul",
      attrs: { spirit: 0.9 },
      mark: "\u6BBF"
    },
    {
      id: "heaven_soul",
      name: "\u9006\u4ED9\u6B8B\u5FF5",
      description: "\u6CBE\u67D3\u4ED9\u9006\u4E4B\u610F\u3002",
      kind: "passive",
      baseCost: 9e7,
      costMult: 1.21,
      power: 4600,
      minRealm: 9,
      branch: "soul",
      attrs: { spirit: 1.4, atk: 0.4 },
      mark: "\u9006"
    },
    {
      id: "beast_whisper",
      name: "\u517D\u8BED\u4F4E\u8BED",
      description: "\u4E0E\u7075\u517D\u6C9F\u901A\u3002",
      kind: "click",
      baseCost: 3400,
      costMult: 1.15,
      power: 17,
      minRealm: 2,
      branch: "beast",
      attrs: { luck: 0.3, spd: 0.2 },
      mark: "\u8BED"
    },
    {
      id: "winged_mount",
      name: "\u7075\u517D\u5171\u4FEE",
      description: "\u5951\u7EA6\u5171\u4EAB\u8840\u8109\u3002",
      kind: "passive",
      baseCost: 25e4,
      costMult: 1.17,
      power: 128,
      minRealm: 4,
      branch: "beast",
      attrs: { spd: 0.6, atk: 0.3 },
      mark: "\u5951"
    },
    {
      id: "beast_king_crown",
      name: "\u4E07\u517D\u671D\u62DC",
      description: "\u517D\u6F6E\u542C\u4EE4\u3002",
      kind: "passive",
      baseCost: 8e7,
      costMult: 1.2,
      power: 4300,
      minRealm: 9,
      branch: "beast",
      attrs: { atk: 0.8, luck: 0.6 },
      mark: "\u517D"
    },
    {
      id: "sword_basic",
      name: "\u57FA\u7840\u5251\u5F0F",
      description: "\u4EE5\u5251\u610F\u5F15\u6C14\u3002",
      kind: "click",
      baseCost: 3500,
      costMult: 1.16,
      power: 18,
      minRealm: 2,
      branch: "sword",
      attrs: { atk: 0.4, spd: 0.2 },
      mark: "\u5F0F"
    },
    {
      id: "flying_sword",
      name: "\u5FA1\u5251\u5343\u91CC",
      description: "\u98DE\u5251\u5DE1\u7A7A\u641C\u7075\u3002",
      kind: "passive",
      baseCost: 25e4,
      costMult: 1.17,
      power: 132,
      minRealm: 4,
      branch: "sword",
      attrs: { spd: 0.7, atk: 0.4 },
      mark: "\u5FA1"
    },
    {
      id: "heaven_slash",
      name: "\u5F00\u5929\u4E00\u5251",
      description: "\u5251\u610F\u95EE\u5929\u3002",
      kind: "passive",
      baseCost: 9e7,
      costMult: 1.21,
      power: 4700,
      minRealm: 9,
      branch: "sword",
      attrs: { atk: 1.3, spd: 0.5 },
      mark: "\u5F00"
    },
    {
      id: "orthodox_edict",
      name: "\u6B63\u9053\u6555\u4EE4",
      description: "\u6B63\u9053\u8D44\u6E90\u503E\u659C\u3002",
      kind: "passive",
      baseCost: 1e6,
      costMult: 1.16,
      power: 240,
      minRealm: 6,
      faction: "orthodox",
      attrs: { def: 0.5, luck: 0.3 },
      mark: "\u6B63"
    },
    {
      id: "dark_plunder",
      name: "\u9B54\u529F\u63A0\u593A",
      description: "\u4EE5\u63A0\u593A\u6362\u8D44\u6E90\u3002",
      kind: "click",
      baseCost: 9e5,
      costMult: 1.17,
      power: 280,
      minRealm: 6,
      faction: "dark",
      attrs: { atk: 0.7 },
      mark: "\u9B54"
    },
    {
      id: "hermit_quiet",
      name: "\u9690\u4E16\u6E05\u4FEE",
      description: "\u4E0D\u95EE\u4E16\u4E8B\uFF0C\u6548\u7387\u5947\u9AD8\u3002",
      kind: "passive",
      baseCost: 9e5,
      costMult: 1.16,
      power: 260,
      minRealm: 6,
      faction: "hermit",
      attrs: { spirit: 0.6, luck: 0.4 },
      mark: "\u9690"
    }
  ];
  var ENEMIES = [
    {
      id: "rogue_qi",
      name: "\u9ED1\u8863\u52AB\u4FEE",
      blurb: "\u8DEF\u53E3\u62E6\u4EBA\uFF1A\u300C\u628A\u50A8\u7269\u888B\u7559\u4E0B\u3002\u300D\u7ECF\u5178\u5F00\u5C40\u3002",
      minRealm: 0,
      maxRealm: 2,
      attrs: { atk: 4, def: 3, spd: 4, spirit: 2, bone: 3, luck: 1 },
      rewardLingqi: 120,
      rewardPoints: 1,
      dropTreasureId: "storage_pouch",
      dropChance: 0.25,
      lore: "\u51E1\u4EBA"
    },
    {
      id: "clan_bully",
      name: "\u540C\u65CF\u8DCB\u6248\u5B50\u5F1F",
      blurb: "\u300C\u4F60\u4E5F\u914D\u7EC3\u529F\uFF1F\u300D\u2014\u2014\u6253\u8138\u8FDB\u5EA6\u6761\u5DF2\u52A0\u8F7D\u3002",
      minRealm: 0,
      maxRealm: 3,
      attrs: { atk: 6, def: 4, spd: 3, spirit: 3, bone: 4, luck: 2 },
      rewardLingqi: 280,
      rewardPoints: 1,
      dropTreasureId: "face_slap_fan",
      dropChance: 0.2,
      lore: "\u6597\u7834/\u8BF8\u5929"
    },
    {
      id: "demon_wolf",
      name: "\u8840\u7EB9\u5996\u72FC",
      blurb: "\u5996\u4E39\u9999\u55B7\u55B7\uFF0C\u7259\u9F7F\u95EA\u95EA\u3002",
      minRealm: 1,
      maxRealm: 4,
      attrs: { atk: 10, def: 7, spd: 12, spirit: 4, bone: 8, luck: 2 },
      rewardLingqi: 900,
      rewardPoints: 1,
      lore: "\u51E1\u4EBA"
    },
    {
      id: "alchemy_thief",
      name: "\u593A\u4E39\u8D3C",
      blurb: "\u4E13\u5077\u51FA\u7089\u91D1\u4E39\uFF0C\u804C\u4E1A\u7D20\u517B\u62C9\u6EE1\u3002",
      minRealm: 2,
      maxRealm: 5,
      attrs: { atk: 14, def: 8, spd: 16, spirit: 12, bone: 6, luck: 5 },
      rewardLingqi: 3500,
      rewardPoints: 2,
      dropTreasureId: "herb_pick",
      dropChance: 0,
      lore: "\u51E1\u4EBA"
    },
    {
      id: "fire_cultist",
      name: "\u708E\u86C7\u8C37\u5F1F\u5B50",
      blurb: "\u6D51\u8EAB\u706B\u5C5E\u6027\uFF0C\u8BF4\u8BDD\u90FD\u5E26\u706B\u661F\u5B50\u3002",
      minRealm: 2,
      maxRealm: 6,
      attrs: { atk: 18, def: 10, spd: 11, spirit: 9, bone: 10, luck: 4 },
      rewardLingqi: 6e3,
      rewardPoints: 2,
      dropTreasureId: "flame_tome",
      dropChance: 0.15,
      lore: "\u6597\u7834"
    },
    {
      id: "holy_son",
      name: "\u67D0\u5723\u5730\u5723\u5B50",
      blurb: "\u6392\u9762\u62C9\u6EE1\uFF0C\u6218\u529B\u4E0D\u4E00\u5B9A\u3002",
      minRealm: 4,
      maxRealm: 8,
      attrs: { atk: 35, def: 28, spd: 30, spirit: 32, bone: 30, luck: 20 },
      rewardLingqi: 8e4,
      rewardPoints: 3,
      dropTreasureId: "desolate_bone",
      dropChance: 0.12,
      lore: "\u906E\u5929"
    },
    {
      id: "soul_old",
      name: "\u795E\u9B42\u8001\u602A",
      blurb: "\u4E13\u593A\u820D\uFF0C\u5F00\u53E3\u5C31\u662F\u300C\u597D\u82D7\u5B50\u300D\u3002",
      minRealm: 3,
      maxRealm: 7,
      attrs: { atk: 22, def: 15, spd: 18, spirit: 40, bone: 12, luck: 8 },
      rewardLingqi: 25e3,
      rewardPoints: 2,
      dropTreasureId: "soul_lamp",
      dropChance: 0.18,
      lore: "\u4ED9\u9006/\u51E1\u4EBA"
    },
    {
      id: "tribulation_echo",
      name: "\u5FC3\u9B54\u5E7B\u5F71",
      blurb: "\u957F\u5F97\u50CF\u4F60\uFF0C\u8BF4\u8BDD\u6BD4\u4F60\u8FD8\u6BD2\u3002",
      minRealm: 7,
      maxRealm: 11,
      attrs: { atk: 80, def: 70, spd: 75, spirit: 90, bone: 70, luck: 40 },
      rewardLingqi: 5e6,
      rewardPoints: 4,
      dropTreasureId: "plot_armor",
      dropChance: 0.1,
      lore: "\u8BF8\u5929"
    },
    {
      id: "heaven_envoy",
      name: "\u5929\u9053\u5DE1\u4F7F",
      blurb: "\u6765\u67E5\u4F60\u662F\u5426\u5F00\u6302\u3002\u4F60\u5FC3\u865A\u5730\u6478\u4E86\u6478\u7EFF\u6DB2\u5C0F\u74F6\u3002",
      minRealm: 8,
      maxRealm: 11,
      attrs: { atk: 120, def: 110, spd: 100, spirit: 130, bone: 100, luck: 60 },
      rewardLingqi: 3e7,
      rewardPoints: 5,
      dropTreasureId: "heaven_stele",
      dropChance: 0.08,
      lore: "\u5143\u6897"
    }
  ];
  ENEMIES.forEach((e) => {
    if (e.id === "alchemy_thief") {
      e.dropTreasureId = void 0;
      e.dropChance = void 0;
    }
  });
  var STORY_EVENTS = [
    {
      id: "choose_branch",
      title: "\u5927\u9053\u5206\u5C94",
      body: "\u7ED3\u4E39\u5728\u5373\uFF0C\u8BF8\u5929\u6C14\u673A\u5728\u773C\u524D\u4EA4\u7EC7\uFF1A\u5F02\u706B\u3001\u4E39\u9999\u3001\u8352\u9AA8\u3001\u795E\u9B42\u3001\u517D\u8BED\u3001\u5251\u610F\u2026\u2026\u9009\u4E00\u6761\uFF0C\u8D70\u4E00\u4E16\u3002",
      minRealm: 2,
      minStar: 3,
      lore: "\u878D\u5408",
      options: [
        { id: "pick_flame", label: "\u711A\u708E", blurb: BRANCH_LABELS.flame.blurb, set: { branchId: "flame" }, flags: ["path_flame"] },
        { id: "pick_alchemy", label: "\u4E39\u9053", blurb: BRANCH_LABELS.alchemy.blurb, set: { branchId: "alchemy" }, flags: ["path_alchemy"] },
        { id: "pick_body", label: "\u4F53\u4FEE", blurb: BRANCH_LABELS.body.blurb, set: { branchId: "body" }, flags: ["path_body"] },
        { id: "pick_soul", label: "\u795E\u9B42", blurb: BRANCH_LABELS.soul.blurb, set: { branchId: "soul" }, flags: ["path_soul"] },
        { id: "pick_beast", label: "\u9A6D\u517D", blurb: BRANCH_LABELS.beast.blurb, set: { branchId: "beast" }, flags: ["path_beast"] },
        { id: "pick_sword", label: "\u5251\u5FC3", blurb: BRANCH_LABELS.sword.blurb, set: { branchId: "sword" }, flags: ["path_sword"] }
      ]
    },
    {
      id: "bottle_dream",
      title: "\u795E\u79D8\u5C0F\u74F6",
      body: "\u68A6\u91CC\u6709\u4EBA\u628A\u4E00\u53EA\u4E0D\u8D77\u773C\u7684\u5C0F\u74F6\u585E\u8FDB\u4F60\u6000\u91CC\uFF1A\u300C\u517B\u8349\u7528\u3002\u300D\u4F60\u9192\u6765\uFF0C\u6795\u5934\u4E0B\u771F\u6709\u4E00\u74F6\u7EFF\u6DB2\u3002",
      minRealm: 0,
      minStar: 2,
      lore: "\u51E1\u4EBA\u4FEE\u4ED9",
      options: [
        {
          id: "take_bottle",
          label: "\u6536\u4E0B\uFF08\u5FC3\u865A\uFF09",
          blurb: "\u83B7\u5F97\u300C\u7EFF\u6DB2\u5C0F\u74F6\u300D\u3002\u9694\u58C1\u8BF4\u4F60\u6C14\u8FD0\u9006\u5929\u3002",
          flags: ["has_bottle"],
          grantTreasureId: "small_bottle",
          qiyunDelta: 1
        },
        {
          id: "refuse_bottle",
          label: "\u6015\u662F\u5751\uFF0C\u57CB\u4E86",
          blurb: "\u5B89\u5168\u7B2C\u4E00\u3002\u9519\u8FC7\u4E3B\u89D2\u6807\u914D\uFF0C\u4F46\u5FC3\u5B89\u3002",
          flags: ["refused_bottle"],
          freePointsDelta: 1
        }
      ]
    },
    {
      id: "three_year_appoint",
      title: "\u4E09\u5E74\u4E4B\u671F",
      body: "\u6709\u4EBA\u5F53\u4F17\u7ACB\u4E0B\u8D4C\u7EA6\uFF1A\u4E09\u5E74\u540E\u518D\u6218\u3002\u5168\u57CE\u90FD\u5728\u56F4\u89C2\uFF0C\u5F39\u5E55\u5DF2\u7ECF\u98D8\u8FC7\u300C\u6253\u8138\u9884\u5B9A\u300D\u3002",
      minRealm: 1,
      requireFlags: ["trope_trash"],
      lore: "\u6597\u7834\u6897",
      options: [
        {
          id: "accept_appoint",
          label: "\u63A5\u4E0B\u8D4C\u7EA6",
          blurb: "\u83B7\u5F97\u300C\u6253\u8138\u6247\u300D\u7EBF\u7D22\u4E0E\u5C5E\u6027\u6FC0\u52B1\u3002",
          flags: ["three_year"],
          freePointsDelta: 2,
          attrsDelta: { atk: 2, luck: 1 },
          grantTreasureId: "face_slap_fan"
        },
        {
          id: "ignore_appoint",
          label: "\u5F53\u542C\u4E0D\u89C1",
          blurb: "\u4F4E\u8C03\u53D1\u80B2\uFF0C\u62D2\u7EDD\u5267\u672C\u3002",
          flags: ["skip_appoint"],
          lingqiDelta: 500
        }
      ]
    },
    {
      id: "flame_trial",
      title: "\u706B\u5C71\u8BD5\u70BC",
      body: "\u5730\u5E95\u5F02\u706B\u6B8B\u606F\u6251\u9762\u3002\u6597\u7834\u7C89\u4E1D\u7684\u624B\u5728\u6296\uFF1A\u8FD9\u662F\u8981\u53D1\u4E86\uFF1F",
      minRealm: 3,
      requireBranch: "flame",
      lore: "\u6597\u7834\u82CD\u7A79",
      options: [
        {
          id: "flame_swallow",
          label: "\u5F3A\u884C\u541E\u7EB3",
          blurb: "\u9669\u4E2D\u6C42\u80DC\uFF0C\u83B7\u5F02\u706B\u4EB2\u548C\u4E0E\u706B\u79CD\u3002",
          flags: ["strange_fire_affinity"],
          grantTreasureId: "fire_lotus",
          lingqiDelta: -2e4,
          qiyunDelta: 1,
          attrsDelta: { atk: 3, bone: 1 },
          combatEnemyId: "fire_cultist",
          deathOnLose: true,
          deathReason: "\u5F02\u706B\u53CD\u566C\uFF0C\u5F62\u795E\u4FF1\u706D"
        },
        {
          id: "flame_nurture",
          label: "\u7A33\u59A5\u6E29\u517B",
          blurb: "\u6839\u57FA\u66F4\u7A33\u3002",
          flags: ["fire_lotus_seed"],
          lingqiDelta: 1e4,
          attrsDelta: { bone: 2 }
        }
      ]
    },
    {
      id: "alchemy_auction",
      title: "\u574A\u5E02\u4E39\u62CD",
      body: "\u9ED1\u5E02\u51FA\u73B0\u6B8B\u7F3A\u4E39\u65B9\u3002\u51E1\u4EBA\u5F0F\u9009\u62E9\uFF1A\u7838\u7075\u77F3\uFF0C\u8FD8\u662F\u52A8\u6B6A\u8111\u7B4B\uFF1F",
      minRealm: 3,
      requireBranch: "alchemy",
      lore: "\u51E1\u4EBA\u4FEE\u4ED9",
      options: [
        {
          id: "alchemy_bid",
          label: "\u503E\u56CA\u7ADE\u62CD",
          blurb: "\u6362\u5F97\u4E39\u7F18\uFF0C\u4E39\u5854\u65E5\u540E\u6216\u8BA4\u4F60\u3002",
          flags: ["pill_formula", "dantower_favor"],
          lingqiDelta: -5e4,
          attrsDelta: { spirit: 2 }
        },
        {
          id: "alchemy_steal",
          label: "\u795E\u8BC6\u5077\u8BB0",
          blurb: "\u8BB0\u4E0B\u534A\u5377\uFF0C\u67D3\u4E0A\u76D7\u65B9\u4E4B\u540D\u3002",
          flags: ["pill_formula", "thief_name"],
          lingqiDelta: -5e3,
          attrsDelta: { spirit: 1, luck: -1 }
        }
      ]
    },
    {
      id: "body_arena",
      title: "\u89D2\u6597\u573A",
      body: "\u6709\u4EBA\u4EE5\u91CD\u91D1\u8BF7\u4F60\u786C\u78B0\u3002\u906E\u5929\u4F53\u4FEE\u8868\u793A\uFF1A\u6B63\u597D\u70ED\u8EAB\u3002",
      minRealm: 3,
      requireBranch: "body",
      lore: "\u906E\u5929",
      options: [
        {
          id: "body_fight",
          label: "\u4E0B\u573A\u786C\u78B0",
          blurb: "\u6253\u51FA\u540D\u53F7\uFF0C\u4E5F\u53EF\u80FD\u88AB\u62AC\u51FA\u53BB\u3002",
          flags: ["undying_title"],
          combatEnemyId: "demon_wolf",
          deathOnLose: false,
          freePointsDelta: 1,
          attrsDelta: { bone: 2, def: 2 },
          grantTreasureId: "desolate_bone"
        },
        {
          id: "body_refuse",
          label: "\u62D2\u800C\u4E0D\u6218",
          blurb: "\u6F5C\u5FC3\u953B\u4F53\u3002",
          flags: ["quiet_temper"],
          lingqiDelta: 2e4
        }
      ]
    },
    {
      id: "soul_whisper",
      title: "\u9AA8\u9AB8\u4F4E\u8BED",
      body: "\u8352\u91CE\u9AA8\u5806\u6709\u6B8B\u9B42\u6C42\u4F60\u5E26\u8D70\uFF1A\u300C\u5E26\u6211\uFF0C\u6559\u4F60\u9006\u5929\u4E4B\u672F\u3002\u300D\u4ED9\u9006\u8B66\u544A\u706F\u95EA\u70C1\u3002",
      minRealm: 3,
      requireBranch: "soul",
      lore: "\u4ED9\u9006",
      options: [
        {
          id: "soul_accept",
          label: "\u6536\u7EB3\u6B8B\u9B42",
          blurb: "\u5F97\u9B42\u706F\uFF0C\u4EA6\u6CBE\u6028\u6BD2\u3002",
          flags: ["heaven_soul_clue", "resentment"],
          grantTreasureId: "soul_lamp",
          qiyunDelta: 1,
          attrsDelta: { spirit: 3 }
        },
        {
          id: "soul_seal",
          label: "\u9547\u538B\u8D85\u5EA6",
          blurb: "\u5FC3\u5883\u6E05\u660E\u3002",
          flags: ["pure_soul"],
          lingqiDelta: 15e3,
          attrsDelta: { luck: 2 }
        }
      ]
    },
    {
      id: "beast_egg",
      title: "\u53E4\u517D\u86CB",
      body: "\u5C71\u8C37\u91CC\u4E00\u679A\u517D\u86CB\u5728\u53D1\u5149\u3002\u517B\u5B83\u8FD8\u662F\u5356\u5B83\uFF1F\u8FD9\u662F\u4E2A\u95EE\u9898\u3002",
      minRealm: 3,
      requireBranch: "beast",
      lore: "\u51E1\u4EBA",
      options: [
        {
          id: "beast_hatch",
          label: "\u4EE5\u8840\u5B75\u5316",
          blurb: "\u7ED3\u751F\u6B7B\u5951\u3002",
          flags: ["ancient_companion"],
          lingqiDelta: -15e3,
          qiyunDelta: 1,
          attrsDelta: { luck: 2, spd: 2 }
        },
        {
          id: "beast_sell",
          label: "\u5356\u4E88\u5546\u4F1A",
          blurb: "\u8D22\u5BCC\u81EA\u7531\u4E00\u5C0F\u6B65\u3002",
          flags: ["sold_destiny"],
          lingqiDelta: 8e4
        }
      ]
    },
    {
      id: "sword_grave",
      title: "\u5251\u51A2\u4E00\u591C",
      body: "\u4E07\u5251\u55E1\u9E23\uFF0C\u53E4\u5251\u60AC\u4E8E\u7709\u5FC3\u3002\u4F60\u8111\u5185\u81EA\u52A8\u54CD\u8D77 BGM\u3002",
      minRealm: 3,
      requireBranch: "sword",
      lore: "\u8BF8\u5929\u5251\u4FEE",
      options: [
        {
          id: "sword_bond",
          label: "\u4EE5\u5FC3\u8BA4\u5251",
          blurb: "\u5251\u610F\u5165\u4F53\u3002",
          flags: ["heart_sword"],
          grantTreasureId: "bamboo_cloud_sword",
          lingqiDelta: -1e4,
          attrsDelta: { atk: 2, spd: 2 }
        },
        {
          id: "sword_leave",
          label: "\u4E00\u62DC\u79BB\u53BB",
          blurb: "\u4E0D\u8D2A\u4E0D\u6267\u3002",
          flags: ["sword_empty"],
          lingqiDelta: 2e4,
          freePointsDelta: 1
        }
      ]
    },
    {
      id: "possession_crisis",
      title: "\u593A\u820D\u5371\u673A",
      body: "\u4E00\u4F4D\u300C\u548C\u853C\u524D\u8F88\u300D\u76EF\u7740\u4F60\u7684\u8EAB\u4F53\uFF1A\u300C generational talent\u554A\u3002\u300D\u4F60\u8D77\u4E86\u4E00\u8EAB\u9E21\u76AE\u7599\u7629\u3002",
      minRealm: 4,
      lore: "\u51E1\u4EBA/\u4ED9\u9006",
      options: [
        {
          id: "pos_fight",
          label: "\u795E\u9B42\u5BF9\u8F70",
          blurb: "\u62FC\u795E\u8BC6\uFF01\u8F93\u4E86\u53EF\u80FD\u76F4\u63A5\u53BB\u4E16\u3002",
          combatEnemyId: "soul_old",
          deathOnLose: true,
          deathReason: "\u88AB\u8001\u602A\u593A\u820D\uFF0C\u6B64\u4E16\u843D\u5E55",
          flags: ["resisted_possession"],
          attrsDelta: { spirit: 3 },
          freePointsDelta: 1
        },
        {
          id: "pos_fake",
          label: "\u88C5\u6B7B\u88C5\u50BB",
          blurb: "\u7528\u5267\u60C5\u62A4\u7532\u7CCA\u5F04\u8FC7\u53BB\uFF08\u6216\u8BB8\uFF09\u3002",
          flags: ["played_dead"],
          grantTreasureId: "plot_armor",
          lingqiDelta: -5e3
        },
        {
          id: "pos_sell",
          label: "\u4E3B\u52A8\u4EA4\u6613\u6B8B\u9B42",
          blurb: "\u5371\u9669\u4EA4\u6613\uFF0C\u6362\u5C71\u6CB3\u8F66\u6B8B\u8F6E\u3002",
          flags: ["deal_with_old"],
          grantTreasureId: "mountain_river",
          attrsDelta: { luck: -2, spirit: 2 }
        }
      ]
    },
    {
      id: "choose_faction",
      title: "\u9635\u8425\u62DB\u63FD",
      body: "\u5927\u4E58\u5728\u671B\uFF0C\u4E09\u65B9\u4F7F\u8005\u540C\u65E5\u81F3\u5E9C\uFF1A\u6B63\u9053\u76DF\u3001\u9B54\u5B97\u4F59\u515A\u3001\u9690\u4E16\u6563\u4FEE\u3002\u7FA4\u6D88\u606F\u5DF2\u8BFB\u4E0D\u56DE\u4F1A\u88AB\u8E22\u3002",
      minRealm: 6,
      minStar: 1,
      lore: "\u878D\u5408",
      options: [
        {
          id: "fac_orthodox",
          label: "\u52A0\u5165\u6B63\u9053",
          blurb: "\u8D44\u6E90\u4E0E\u67B7\u9501\u3002",
          set: { factionId: "orthodox" },
          flags: ["faction_orthodox"],
          lingqiDelta: 5e5,
          attrsDelta: { def: 2, luck: 1 }
        },
        {
          id: "fac_dark",
          label: "\u6295\u5411\u9B54\u9053",
          blurb: "\u81EA\u7531\u4E0E\u8840\u8165\u3002",
          set: { factionId: "dark" },
          flags: ["faction_dark"],
          lingqiDelta: 8e5,
          qiyunDelta: -1,
          attrsDelta: { atk: 3 }
        },
        {
          id: "fac_hermit",
          label: "\u9690\u4E16\u6563\u4FEE",
          blurb: "\u65E0\u4EBA\u6405\u6270\uFF0C\u4EA6\u65E0\u4EBA\u63F4\u624B\u3002",
          set: { factionId: "hermit" },
          flags: ["faction_hermit"],
          qiyunDelta: 2,
          attrsDelta: { spirit: 2, luck: 2 }
        }
      ]
    },
    {
      id: "dark_massacre",
      title: "\u8840\u591C\u4EFB\u52A1",
      body: "\u9B54\u5B97\u547D\u4F60\u5C60\u57CE\u62D2\u8D21\u8005\u3002\u4EFB\u52A1\u680F\u95EA\u7EA2\uFF1A\u9053\u5FB7\u503C\u8B66\u544A\u3002",
      minRealm: 7,
      requireFaction: "dark",
      lore: "\u9B54\u9053",
      options: [
        {
          id: "dark_kill",
          label: "\u8840\u6D17\u5168\u57CE",
          blurb: "\u9B54\u540D\u8FDC\u626C\u3002",
          flags: ["demon_lord_seed", "blood_hands"],
          lingqiDelta: 2e6,
          attrsDelta: { atk: 4, luck: -2 }
        },
        {
          id: "dark_fake",
          label: "\u5047\u62A5\u519B\u60C5",
          blurb: "\u6697\u4E2D\u653E\u4EBA\u3002",
          flags: ["double_face"],
          lingqiDelta: -4e5,
          qiyunDelta: 1
        }
      ]
    },
    {
      id: "orthodox_trial",
      title: "\u6B63\u9053\u5927\u6BD4",
      body: "\u8054\u76DF\u5927\u6BD4\uFF0C\u9080\u4F60\u538B\u9635\u3002\u955C\u5934\u5DF2\u7ECF\u5BF9\u51C6\u4F60\u7684\u8138\u3002",
      minRealm: 7,
      requireFaction: "orthodox",
      lore: "\u6B63\u9053",
      options: [
        {
          id: "ortho_win",
          label: "\u5168\u529B\u593A\u9B41",
          blurb: "\u76DF\u4E3B\u4E4B\u4F4D\u76F8\u9732\u3002\u5148\u6253\u4E00\u573A\u3002",
          flags: ["alliance_leader"],
          combatEnemyId: "holy_son",
          deathOnLose: false,
          lingqiDelta: 1e6,
          qiyunDelta: 1,
          freePointsDelta: 2
        },
        {
          id: "ortho_hide",
          label: "\u70B9\u5230\u4E3A\u6B62",
          blurb: "\u5C11\u6811\u654C\u3002",
          flags: ["steady_name"],
          lingqiDelta: 4e5
        }
      ]
    },
    {
      id: "choose_destiny",
      title: "\u6C14\u8FD0\u6289\u62E9",
      body: "\u6E21\u52AB\u524D\u5915\uFF0C\u5929\u9053\u964D\u4E0B\u4E09\u9053\u6C14\u673A\uFF1A\u8BC1\u9053\u3001\u5B88\u754C\u3001\u95EE\u865A\u7A7A\u3002",
      minRealm: 8,
      minStar: 4,
      lore: "\u878D\u5408",
      options: [
        {
          id: "des_emperor",
          label: "\u6267\u610F\u8BC1\u9053",
          blurb: "\u8D4C\u90A3\u4E00\u7EBF\u5927\u9053\u3002",
          set: { destinyId: "emperor" },
          flags: ["destiny_emperor"],
          qiyunDelta: -2,
          attrsDelta: { atk: 3, spirit: 3 }
        },
        {
          id: "des_guardian",
          label: "\u9547\u5B88\u754C\u57DF",
          blurb: "\u62A4\u4E00\u65B9\u751F\u7075\u3002",
          set: { destinyId: "guardian" },
          flags: ["destiny_guardian"],
          qiyunDelta: 3,
          attrsDelta: { def: 3, luck: 2 }
        },
        {
          id: "des_void",
          label: "\u95EE\u9053\u865A\u7A7A",
          blurb: "\u629B\u4E0B\u754C\u57DF\uFF0C\u8FFD\u9010\u672A\u77E5\u3002",
          set: { destinyId: "void" },
          flags: ["destiny_void"],
          lingqiDelta: 5e7,
          attrsDelta: { spd: 3, spirit: 2 }
        }
      ]
    },
    {
      id: "heaven_tribulation",
      title: "\u5929\u52AB\u5C06\u81F3",
      body: "\u4E5D\u8272\u96F7\u4E91\u538B\u9876\u3002\u6E21\u52AB\u9009\u9879\u5DF2\u5237\u65B0\u2014\u2014\u8BF7\u52FF\u4F7F\u7528\u5916\u6302\u3002",
      minRealm: 8,
      minStar: 7,
      lore: "\u51E1\u4EBA/\u8BF8\u5929",
      options: [
        {
          id: "trib_hard",
          label: "\u8089\u8EAB\u786C\u6297",
          blurb: "\u8F93\u4E86\u5C31\u6B7B\u3002",
          flags: ["survived_tribulation"],
          combatEnemyId: "tribulation_echo",
          deathOnLose: true,
          deathReason: "\u5929\u52AB\u5288\u6210\u7126\u70AD\uFF0C\u6B64\u4E16\u8F6E\u56DE",
          lingqiDelta: -1e8,
          qiyunDelta: 2,
          attrsDelta: { bone: 5, def: 3 }
        },
        {
          id: "trib_array",
          label: "\u501F\u805A\u7075\u9635",
          blurb: "\u7A33\u59A5\u6E21\u52AB\u3002",
          flags: ["array_tribulation"],
          lingqiDelta: -3e7,
          attrsDelta: { spirit: 2 }
        },
        {
          id: "trib_sacrifice",
          label: "\u79FB\u82B1\u63A5\u6728",
          blurb: "\u707E\u79FB\u4ED6\u4EBA\uFF0C\u6B20\u56E0\u679C\u3002",
          flags: ["karmic_debt", "blood_hands"],
          lingqiDelta: 5e7,
          qiyunDelta: -3
        }
      ]
    },
    {
      id: "meta_system",
      title: "\u7591\u4F3C\u7CFB\u7EDF\u5F39\u7A97",
      body: "\u773C\u524D\u95EA\u8FC7\u4E00\u884C\u5B57\uFF1A\u300C\u7B7E\u5230\u9886\u5956\uFF1F\u300D\u4F60\u4F5C\u4E3A\u7A7F\u8D8A\u8005\u6FC0\u52A8\u4E86 0.5 \u79D2\uFF0C\u53D1\u73B0\u662F\u9A97\u5B50\u9635\u6CD5\u3002",
      minRealm: 1,
      requireFlags: ["trope_meta"],
      lore: "\u5143\u6897",
      options: [
        {
          id: "meta_punch",
          label: "\u4E00\u62F3\u7838\u70C2",
          blurb: "\u6E05\u9192\u3002\u83B7\u81EA\u7531\u5C5E\u6027\u70B9\u3002",
          flags: ["no_system"],
          freePointsDelta: 2,
          combatEnemyId: "rogue_qi"
        },
        {
          id: "meta_click",
          label: "\u624B\u8D31\u70B9\u4E00\u4E0B",
          blurb: "\u88AB\u5438\u8D70\u7075\u6C14\uFF0C\u4F46\u609F\u5230\u4E00\u70B9\u300C\u5267\u60C5\u62A4\u7532\u300D\u4E4B\u6CD5\u3002",
          flags: ["almost_scammed"],
          lingqiDelta: -200,
          grantTreasureId: "plot_armor"
        }
      ]
    },
    {
      id: "final_gate",
      title: "\u5927\u9053\u4E4B\u95E8",
      body: "\u91D1\u4ED9\u5DC5\u5CF0\uFF0C\u4E00\u9053\u95E8\u865A\u5F71\u73B0\u4E8E\u4E91\u7AEF\u3002\u8DE8\u5165\u4E0E\u5426\uFF0C\u51B3\u5B9A\u6B64\u4E16\u6536\u675F\u3002",
      minRealm: 10,
      minStar: 8,
      lore: "\u5927\u9053",
      options: [
        {
          id: "gate_enter",
          label: "\u8E0F\u5165\u9053\u95E8",
          blurb: "\u8D4C\u90A3\u6210\u9053\u4E00\u7EBF\u3002\u6216\u89E6\u53D1\u5BF9\u6218\u3002",
          flags: ["entered_dao_gate"],
          grantTreasureId: "dao_seed",
          combatEnemyId: "heaven_envoy",
          deathOnLose: true,
          deathReason: "\u9053\u95E8\u53CD\u566C\uFF0C\u5F62\u795E\u4FF1\u706D",
          lingqiDelta: -5e10
        },
        {
          id: "gate_wait",
          label: "\u6682\u4E14\u89C2\u671B",
          blurb: "\u518D\u79EF\u6C14\u8FD0\u3002",
          flags: ["patient_wait"],
          qiyunDelta: 2,
          freePointsDelta: 2
        }
      ]
    },
    {
      id: "roadside_robbery",
      title: "\u7ECF\u5178\u62E6\u8DEF",
      body: "\u300C\u6B64\u5C71\u662F\u6211\u5F00\u2026\u2026\u300D\u4F60\u542C\u8FC7\u4E00\u5343\u904D\u3002\u8981\u6253\u5417\uFF1F",
      minRealm: 0,
      minStar: 4,
      lore: "\u51E1\u4EBA",
      options: [
        {
          id: "rob_fight",
          label: "\u62FC\u4E86",
          blurb: "\u5BF9\u6218\u9ED1\u8863\u52AB\u4FEE\u3002\u8D25\u4E86\u4E22\u8138\u4E22\u7075\u6C14\uFF0C\u6682\u4E0D\u81F4\u6B7B\u3002",
          combatEnemyId: "rogue_qi",
          deathOnLose: false,
          freePointsDelta: 1,
          lingqiDelta: -20
        },
        {
          id: "rob_pay",
          label: "\u7834\u8D22\u514D\u707E",
          blurb: "\u7ED9\u7075\u6C14\u8D70\u4EBA\u3002",
          lingqiDelta: -80,
          flags: ["paid_road"]
        },
        {
          id: "rob_run",
          label: "\u62D4\u817F\u5C31\u8DD1",
          blurb: "\u8EAB\u6CD5\u68C0\u5B9A\u2026\u2026\u7B97\u4F60\u8DD1\u6389\u3002",
          attrsDelta: { spd: 1 },
          flags: ["ran_away"]
        }
      ]
    }
  ];
  var RANDOM_EVENTS = [
    {
      id: "rnd_herb",
      title: "\u8DEF\u8FB9\u7075\u8349",
      body: "\u4E00\u682A\u53D1\u7740\u5FAE\u5149\u7684\u8349\u5728\u77F3\u7F1D\u91CC\u6643\u3002\u91C7\uFF1F\u8FD8\u662F\u6000\u7591\u662F\u8BF1\u9975\uFF1F",
      minRealm: 0,
      lore: "\u51E1\u4EBA",
      repeatable: true,
      weight: 2,
      options: [
        {
          id: "herb_pick",
          label: "\u91C7\u4E86",
          blurb: "\u7075\u6C14\u5C0F\u6DA8\uFF0C\u6839\u9AA8\u5FAE\u5FAE\u53D1\u70EB\u3002",
          lingqiDelta: 80,
          attrsDelta: { bone: 1 }
        },
        {
          id: "herb_pass",
          label: "\u53EF\u7591\uFF0C\u8DEF\u8FC7",
          blurb: "\u5B89\u5168\u7B2C\u4E00\u3002\u6C14\u673A +1\u3002",
          attrsDelta: { luck: 1 }
        }
      ]
    },
    {
      id: "rnd_auction_rumor",
      title: "\u574A\u5E02\u4F20\u95FB",
      body: "\u6709\u4EBA\u4F4E\u58F0\u8BF4\uFF1A\u4ECA\u665A\u9ED1\u5E02\u6709\u300C\u6253\u8138\u6247\u300D\u4EFF\u54C1\u3002\u4F60\u8033\u6735\u52A8\u4E86\u52A8\u3002",
      minRealm: 1,
      lore: "\u8BF8\u5929\u6897",
      repeatable: true,
      weight: 1,
      options: [
        {
          id: "rumor_go",
          label: "\u53BB\u77A7\u77A7",
          blurb: "\u82B1\u70B9\u7075\u6C14\uFF0C\u8BF4\u4E0D\u5B9A\u6709\u6536\u83B7\u3002",
          lingqiDelta: -200,
          freePointsDelta: 1
        },
        {
          id: "rumor_ignore",
          label: "\u4F20\u95FB\u800C\u5DF2",
          blurb: "\u7EE7\u7EED\u5410\u7EB3\u3002",
          lingqiDelta: 40
        }
      ]
    },
    {
      id: "rnd_duel_invite",
      title: "\u5207\u78CB\u6218\u5E16",
      body: "\u4E00\u540D\u540C\u5883\u4FEE\u58EB\u6254\u6765\u6218\u5E16\uFF1A\u300C\u6BD4\u5212\u6BD4\u5212\uFF1F\u300D\u56F4\u89C2\u7FA4\u4F17\u5DF2\u5C31\u4F4D\u3002",
      minRealm: 0,
      lore: "\u6597\u7834/\u51E1\u4EBA",
      repeatable: true,
      weight: 2,
      options: [
        {
          id: "duel_yes",
          label: "\u63A5\u6218",
          blurb: "\u62FC\u5C5E\u6027\uFF01\u8D25\u4E0D\u81F4\u6B7B\u3002",
          combatEnemyId: "clan_bully",
          deathOnLose: false,
          freePointsDelta: 1
        },
        {
          id: "duel_no",
          label: "\u95ED\u5173\u8C22\u5BA2",
          blurb: "\u4F4E\u8C03\u53D1\u80B2\u3002",
          attrsDelta: { spirit: 1 }
        }
      ]
    },
    {
      id: "rnd_cave",
      title: "\u65E0\u540D\u6D1E\u5E9C",
      body: "\u5C71\u58C1\u88C2\u5F00\u4E00\u9053\u7F1D\uFF0C\u91CC\u9762\u9690\u7EA6\u6709\u50A8\u7269\u888B\u7684\u5473\u9053\u3002",
      minRealm: 1,
      lore: "\u51E1\u4EBA",
      repeatable: true,
      weight: 1,
      options: [
        {
          id: "cave_enter",
          label: "\u63A2\u8FDB\u53BB",
          blurb: "\u53EF\u80FD\u9047\u52AB\u4FEE\uFF0C\u4E5F\u53EF\u80FD\u53D1\u8D22\u3002",
          combatEnemyId: "rogue_qi",
          deathOnLose: false,
          lingqiDelta: 300,
          grantTreasureId: "storage_pouch"
        },
        {
          id: "cave_leave",
          label: "\u6D1E\u91CC\u6709\u5751",
          blurb: "\u4F60\u9009\u62E9\u76F8\u4FE1\u76F4\u89C9\u3002",
          attrsDelta: { luck: 1 }
        }
      ]
    },
    {
      id: "rnd_dream",
      title: "\u68A6\u4E2D\u6B8B\u54CD",
      body: "\u68A6\u91CC\u6709\u4EBA\u558A\u300C\u4E09\u5E74\u4E4B\u671F\u5DF2\u5230\u300D\uFF0C\u4F60\u5413\u9192\u4E86\u3002\u7A97\u5916\u5176\u5B9E\u624D\u4E09\u5929\u3002",
      minRealm: 0,
      lore: "\u6597\u7834\u6897",
      repeatable: true,
      weight: 1,
      options: [
        {
          id: "dream_train",
          label: "\u5012\u662F\u523A\u6FC0\uFF0C\u52A0\u7EC3",
          blurb: "\u653B\u4F10\u5FAE\u589E\u3002",
          attrsDelta: { atk: 1 },
          lingqiDelta: -30
        },
        {
          id: "dream_sleep",
          label: "\u7FFB\u4E2A\u8EAB\u7EE7\u7EED\u7761",
          blurb: "\u795E\u8BC6\u56DE\u7B3C\u3002",
          attrsDelta: { spirit: 1 }
        }
      ]
    },
    {
      id: "rnd_wolf",
      title: "\u6797\u4E2D\u5996\u568E",
      body: "\u8840\u7EB9\u5996\u72FC\u7684\u6C14\u606F\u9760\u8FD1\u3002\u6253\u8FD8\u662F\u7ED5\uFF1F",
      minRealm: 1,
      lore: "\u51E1\u4EBA",
      repeatable: true,
      weight: 1,
      options: [
        {
          id: "wolf_fight",
          label: "\u730E\u4E4B",
          blurb: "\u5BF9\u6218\u5996\u72FC\u3002",
          combatEnemyId: "demon_wolf",
          deathOnLose: false,
          freePointsDelta: 1
        },
        {
          id: "wolf_sneak",
          label: "\u5C4F\u606F\u7ED5\u884C",
          blurb: "\u8EAB\u6CD5\u7ECF\u9A8C +1\u3002",
          attrsDelta: { spd: 1 }
        }
      ]
    },
    {
      id: "rnd_merchant",
      title: "\u6E38\u65B9\u5546\u4EBA",
      body: "\u300C\u5C0F\u53CB\uFF0C\u770B\u4E00\u770B\uFF0C\u77A7\u4E00\u77A7\uFF0C\u4FDD\u771F\u7684\u8352\u53E4\u2026\u2026\u4EFF\u5236\u54C1\u3002\u300D",
      minRealm: 2,
      lore: "\u906E\u5929\u6897",
      repeatable: true,
      weight: 1,
      options: [
        {
          id: "merch_buy",
          label: "\u4E70\u4E2A\u5FC3\u7406\u5B89\u6170",
          blurb: "\u7834\u8D22\uFF0C\u6C14\u673A\u5FAE\u5999\u4E0A\u5347\u3002",
          lingqiDelta: -1500,
          attrsDelta: { luck: 2 }
        },
        {
          id: "merch_haggle",
          label: "\u795E\u8BC6\u626B\u8D27",
          blurb: "\u8BC6\u7834\u5047\u8D27\uFF0C\u5546\u4EBA\u7070\u6E9C\u6E9C\u79BB\u5F00\u3002\u4F60\u8D5A\u4E86\u70B9\u9762\u5B50\u548C\u7075\u6C14\u3002",
          lingqiDelta: 200,
          attrsDelta: { spirit: 1 }
        }
      ]
    },
    {
      id: "rnd_soul_wind",
      title: "\u9634\u98CE\u4E00\u9635",
      body: "\u795E\u9B42\u6CE2\u52A8\u626B\u8FC7\u8BC6\u6D77\u3002\u50CF\u6709\u4EBA\u5728\u627E\u300C\u597D\u82D7\u5B50\u300D\u3002",
      minRealm: 3,
      lore: "\u4ED9\u9006",
      repeatable: true,
      weight: 1,
      options: [
        {
          id: "soul_resist",
          label: "\u7A33\u4F4F\u795E\u9B42",
          blurb: "\u795E\u8BC6\u5BF9\u6297\u6210\u529F\u3002",
          attrsDelta: { spirit: 2 },
          combatEnemyId: "soul_old",
          deathOnLose: false
        },
        {
          id: "soul_hide",
          label: "\u9F9F\u606F\u85CF\u533F",
          blurb: "\u6682\u907F\u950B\u8292\u3002",
          attrsDelta: { def: 1, luck: 1 }
        }
      ]
    },
    {
      id: "rnd_pill_smell",
      title: "\u4E39\u9999\u6251\u9F3B",
      body: "\u5C71\u8C37\u91CC\u98D8\u6765\u4E39\u9999\u3002\u662F\u673A\u7F18\uFF0C\u8FD8\u662F\u300C\u8BF7\u541B\u5165\u74EE\u300D\uFF1F\u51E1\u4EBA\u8BFB\u8005\u8868\u793A\u5F88\u719F\u3002",
      minRealm: 1,
      lore: "\u51E1\u4EBA",
      repeatable: true,
      weight: 2,
      options: [
        {
          id: "pill_enter",
          label: "\u5FAA\u9999\u800C\u5165",
          blurb: "\u7075\u6C14\u5927\u6DA8\uFF0C\u4E5F\u53EF\u80FD\u88AB\u4E39\u6BD2\u545B\u5230\u3002",
          lingqiDelta: 600,
          attrsDelta: { bone: 1, luck: -1 }
        },
        {
          id: "pill_watch",
          label: "\u8FDC\u8FDC\u89C2\u671B",
          blurb: "\u8BB0\u4E0B\u65B9\u4F4D\uFF0C\u795E\u8BC6+1\u3002",
          attrsDelta: { spirit: 1 }
        }
      ]
    },
    {
      id: "rnd_ancient_tomb",
      title: "\u65E0\u540D\u53E4\u5893",
      body: "\u5893\u7816\u4E0A\u5199\u7740\u300C\u751F\u4EBA\u52FF\u8FD1\u300D\u3002\u4F60\u9644\u8FD1\u7684\u7A7F\u8D8A\u8005\u5DF2\u7ECF\u5F00\u59CB\u641C\u522E\u4E86\u3002",
      minRealm: 2,
      lore: "\u906E\u5929\u6897",
      repeatable: true,
      weight: 1,
      options: [
        {
          id: "tomb_dig",
          label: "\u6316\uFF01",
          blurb: "\u6709\u5229\u6709\u5F0A\uFF1A\u7075\u6C14\u4E0E\u5C5E\u6027\u4E71\u8DF3\u3002",
          lingqiDelta: 2e3,
          attrsDelta: { atk: 1, def: -1, luck: 1 },
          freePointsDelta: 1
        },
        {
          id: "tomb_bow",
          label: "\u4E00\u62DC\u79BB\u53BB",
          blurb: "\u5FC3\u5883\u6E05\u660E\u3002",
          attrsDelta: { spirit: 2, luck: 1 }
        }
      ]
    },
    {
      id: "rnd_fake_master",
      title: "\u6536\u5F92\u9A97\u5B50",
      body: "\u4E00\u4F4D\u300C\u9690\u4E16\u9AD8\u4EBA\u300D\u8981\u6536\u4F60\u4E3A\u5F92\uFF0C\u5148\u4EA4\u4E09\u5343\u7075\u77F3\u62DC\u5E08\u8D39\u3002",
      minRealm: 0,
      lore: "\u8BF8\u5929\u6897",
      repeatable: true,
      weight: 2,
      options: [
        {
          id: "fake_pay",
          label: "\u4EA4\u4E86",
          blurb: "\u88AB\u5751\u3002\u4F46\u300C\u5403\u4E00\u5811\u300D\u6362\u6C14\u673A\uFF1F\u6CA1\u6709\uFF0C\u5C31\u662F\u88AB\u5751\u3002",
          lingqiDelta: -300,
          attrsDelta: { luck: -1 }
        },
        {
          id: "fake_expose",
          label: "\u5F53\u573A\u62C6\u7A7F",
          blurb: "\u9A97\u5B50\u9003\u8DD1\uFF0C\u56F4\u89C2\u7FA4\u4F17\u9F13\u638C\u3002\u81EA\u7531\u70B9+1\u3002",
          freePointsDelta: 1,
          attrsDelta: { spirit: 1 }
        }
      ]
    },
    {
      id: "rnd_dual_cult",
      title: "\u53EF\u7591\u53CC\u4FEE\u9080\u7EA6",
      body: "\u6709\u4EBA\u4F20\u97F3\uFF1A\u300C\u53CC\u4FEE\u53EF\u901F\u6210\u3002\u300D\u4F60\u7684\u7CFB\u7EDF\u2026\u2026\u54E6\u4F60\u6CA1\u6709\u7CFB\u7EDF\uFF0C\u53EA\u6709\u5E38\u8BC6\u3002",
      minRealm: 2,
      lore: "\u8BF8\u5929\u6897",
      repeatable: true,
      weight: 1,
      options: [
        {
          id: "dual_no",
          label: "\u62D2\u7EDD\uFF08\u4FDD\u547D\uFF09",
          blurb: "\u6B63\u786E\u9009\u9879\u3002\u795E\u8BC6+1\u3002",
          attrsDelta: { spirit: 1, luck: 1 }
        },
        {
          id: "dual_trap",
          label: "\u8D74\u7EA6\u770B\u770B",
          blurb: "\u679C\u7136\u662F\u9677\u9631\u3002\u6389\u70B9\u7075\u6C14\uFF0C\u957F\u70B9\u8BB0\u6027\u3002",
          lingqiDelta: -800,
          attrsDelta: { def: 1 },
          combatEnemyId: "alchemy_thief",
          deathOnLose: false
        }
      ]
    }
  ];
  var ENDINGS = [
    {
      id: "yan_di",
      name: "\u708E\u5E1D\u4F59\u70EC",
      title: "\u5F02\u706B\u5F52\u4F4D\uFF0C\u711A\u5C3D\u8BF8\u5929\u963B\u62E6",
      body: "\u4F60\u4EE5\u711A\u708E\u8D70\u901A\u5927\u9053\uFF0C\u706B\u79CD\u4E0E\u5E1D\u708E\u865A\u5F71\u5171\u9E23\u3002\u6709\u4EBA\u8BF4\u4F60\u50CF\u6781\u4E86\u67D0\u672C\u5C0F\u8BF4\u7684\u5C01\u9762\u3002",
      priority: 100,
      minRealm: 11,
      requireBranch: "flame",
      requireFlags: ["strange_fire_affinity", "entered_dao_gate"],
      requireArts: { emperor_flame: 1 },
      requireTreasures: ["fire_lotus"]
    },
    {
      id: "pill_sovereign",
      name: "\u836F\u5C0A\u771F\u4EBA",
      title: "\u4E39\u9999\u8986\u9646\uFF0C\u836F\u6210\u800C\u9053\u6210",
      body: "\u4E39\u9053\u6B8B\u5377\u5728\u4F60\u638C\u4E2D\u7EED\u5199\u3002\u51E1\u4EBA\u5F0F\u7ED3\u5C40\uFF1A\u6D3B\u5F97\u591F\u4E45\uFF0C\u624D\u770B\u5F97\u591F\u8FDC\u3002",
      priority: 95,
      minRealm: 11,
      requireBranch: "alchemy",
      requireFlags: ["dantower_favor", "pill_formula"],
      requireArts: { pill_tower: 1 }
    },
    {
      id: "undying_body",
      name: "\u8352\u53E4\u4E0D\u706D",
      title: "\u8089\u8EAB\u6210\u9053\uFF0C\u62F3\u788E\u5929\u52AB",
      body: "\u906E\u5929\u5F0F\u6536\u675F\uFF1A\u4F60\u4E0D\u9760\u5916\u7269\uFF0C\u7B4B\u9AA8\u8840\u6C14\u649E\u5F00\u9053\u95E8\u3002",
      priority: 95,
      minRealm: 11,
      requireBranch: "body",
      requireFlags: ["undying_title", "survived_tribulation"],
      requireArts: { immortal_flesh: 1 },
      requireTreasures: ["desolate_bone"]
    },
    {
      id: "soul_heaven",
      name: "\u9006\u4ED9\u4E00\u5FF5",
      title: "\u795E\u9B42\u8986\u5929\uFF0C\u4E00\u5FF5\u6210\u9053",
      body: "\u4ED9\u9006\u4E4B\u610F\u5728\u4F60\u7709\u5FC3\u7741\u773C\u3002\u4E16\u4EBA\u79F0\u4F60\u4E3A\u9006\u3002",
      priority: 95,
      minRealm: 11,
      requireBranch: "soul",
      requireFlags: ["heaven_soul_clue", "entered_dao_gate"],
      requireArts: { heaven_soul: 1 },
      requireTreasures: ["soul_lamp"]
    },
    {
      id: "beast_sovereign",
      name: "\u4E07\u517D\u5171\u4E3B",
      title: "\u517D\u6F6E\u542C\u4EE4\uFF0C\u5171\u4E3B\u4E34\u4E16",
      body: "\u5951\u7EA6\u94FA\u6EE1\u661F\u7A7A\uFF0C\u4F60\u66F4\u50CF\u517D\u539F\u4E4B\u738B\u3002",
      priority: 95,
      minRealm: 11,
      requireBranch: "beast",
      requireFlags: ["ancient_companion"],
      requireArts: { beast_king_crown: 1 }
    },
    {
      id: "sword_heaven",
      name: "\u5251\u5F00\u5929\u95E8",
      title: "\u4E00\u5251\u95EE\u9053\uFF0C\u95E8\u5F00\u800C\u843D",
      body: "\u5FC3\u5251\u51FA\u9798\uFF0C\u5929\u95E8\u4E3A\u4F60\u800C\u88C2\u3002",
      priority: 95,
      minRealm: 11,
      requireBranch: "sword",
      requireFlags: ["heart_sword", "entered_dao_gate"],
      requireArts: { heaven_slash: 1 }
    },
    {
      id: "bottle_immortal",
      name: "\u74F6\u4E2D\u4ED9",
      title: "\u7EFF\u6DB2\u517B\u5C3D\u4ED9\u9014",
      body: "\u4F60\u4ECE\u672A\u89E3\u91CA\u8FC7\u90A3\u53EA\u5C0F\u74F6\u3002\u4F46\u8349\u6728\u3001\u4E39\u836F\u4E0E\u6C14\u8FD0\uFF0C\u90FD\u7AD9\u5728\u4F60\u8FD9\u8FB9\u3002",
      priority: 92,
      minRealm: 10,
      requireFlags: ["has_bottle"],
      requireTreasures: ["small_bottle"],
      minQiyun: 5
    },
    {
      id: "demon_lord",
      name: "\u9B54\u541B\u4E34\u4E16",
      title: "\u8840\u591C\u4E4B\u540E\uFF0C\u9B54\u540D\u8986\u57CE",
      body: "\u4F60\u4EE5\u9B54\u529F\u8E0F\u5165\u5927\u9053\uFF0C\u754C\u57DF\u6218\u6817\u3002",
      priority: 90,
      minRealm: 11,
      requireFaction: "dark",
      requireFlags: ["demon_lord_seed", "blood_hands"]
    },
    {
      id: "alliance_king",
      name: "\u6B63\u9053\u76DF\u4E3B",
      title: "\u6555\u4EE4\u5929\u4E0B\uFF0C\u76DF\u4E3B\u9547\u4E16",
      body: "\u6B63\u9053\u5927\u65D7\u5728\u4F60\u8EAB\u540E\u5C55\u5F00\u3002",
      priority: 88,
      minRealm: 11,
      requireFaction: "orthodox",
      requireFlags: ["alliance_leader"],
      requireDestiny: "guardian"
    },
    {
      id: "void_wanderer",
      name: "\u865A\u7A7A\u884C\u8005",
      title: "\u5F03\u754C\u95EE\u865A\uFF0C\u884C\u8E2A\u65E0\u5B9A",
      body: "\u4F60\u672A\u5750\u9053\u5EA7\uFF0C\u5374\u8D70\u8FDB\u66F4\u6DF1\u865A\u7A7A\u3002",
      priority: 88,
      minRealm: 10,
      requireDestiny: "void"
    },
    {
      id: "hermit_immortal",
      name: "\u900D\u9065\u6563\u4ED9",
      title: "\u9690\u4E16\u6E05\u4FEE\uFF0C\u9053\u6210\u65E0\u58F0",
      body: "\u65E0\u4EBA\u77E5\u4F60\u59D3\u540D\uFF0C\u53EA\u5728\u65E0\u540D\u5CF0\u9876\u6709\u5E1D\u5149\u4E00\u95EA\u3002",
      priority: 85,
      minRealm: 11,
      requireFaction: "hermit",
      requireDestiny: "guardian"
    },
    {
      id: "karmic_fall",
      name: "\u56E0\u679C\u9668\u843D",
      title: "\u503A\u6EE1\u8EAB\u706D\uFF0C\u9053\u95E8\u5D29\u584C",
      body: "\u79FB\u82B1\u63A5\u6728\u7684\u5929\u52AB\u56DE\u6765\u4E86\u3002\u4F60\u5728\u95E8\u524D\u6563\u4F5C\u98DE\u7070\u3002",
      priority: 120,
      minRealm: 9,
      requireFlags: ["karmic_debt", "entered_dao_gate"]
    },
    {
      id: "face_slap_god",
      name: "\u6253\u8138\u6210\u5723",
      title: "\u4E09\u5E74\u4E4B\u671F\uFF0C\u5168\u57CE\u6C89\u9ED8",
      body: "\u4F60\u5151\u73B0\u4E86\u6240\u6709\u8D4C\u7EA6\u3002\u6253\u8138\u6247\u6210\u4E3A\u6587\u7269\u3002",
      priority: 86,
      minRealm: 8,
      requireFlags: ["three_year", "trope_trash"],
      requireTreasures: ["face_slap_fan"],
      minAttrs: { atk: 40 }
    },
    {
      id: "patient_emperor",
      name: "\u9690\u5FCD\u6210\u9053",
      title: "\u89C2\u671B\u5343\u65E5\uFF0C\u4E00\u671D\u767B\u4E34",
      body: "\u4F60\u672A\u6025\u7740\u8E0F\u95E8\uFF0C\u6C14\u8FD0\u5806\u6EE1\uFF0C\u7EC8\u4EE5\u6700\u7A33\u59FF\u6001\u6210\u9053\u3002",
      priority: 80,
      minRealm: 11,
      requireFlags: ["patient_wait"],
      requireDestiny: "emperor",
      minQiyun: 8
    },
    {
      id: "default_dao",
      name: "\u9053\u6210\u8BF8\u5929",
      title: "\u5927\u9053\u843D\u5EA7\uFF0C\u8BF8\u5929\u4FA7\u76EE",
      body: "\u65E0\u8BBA\u9053\u9014\u5982\u4F55\uFF0C\u4F60\u7EC8\u7AD9\u4E0A\u5DC5\u5CF0\u3002\u6B64\u4E16\u843D\u5E55\uFF0C\u8F6E\u56DE\u53EF\u518D\u542F\uFF0C\u6CD5\u5B9D\u4E0E\u5C5E\u6027\u6216\u53EF\u7EE7\u627F\u3002",
      priority: 10,
      minRealm: 11
    },
    {
      id: "fallen_wild",
      name: "\u8352\u91CE\u67AF\u9AA8",
      title: "\u6C14\u6563\u4EBA\u4EA1\uFF0C\u65E0\u540D\u51A2",
      body: "\u6B64\u4E16\u592A\u77ED\u3002\u6709\u4EBA\u5728\u8352\u91CE\u89C1\u8FC7\u4E00\u5177\u67AF\u9AA8\uFF0C\u50A8\u7269\u888B\u662F\u7A7A\u7684\u3002",
      priority: 5,
      minRealm: 0
    }
  ];
  function getRealm(index) {
    return REALMS[Math.max(0, Math.min(REALMS.length - 1, index))];
  }
  function getArt(id) {
    return ARTS.find((a) => a.id === id);
  }
  function getBirth(id) {
    return BIRTHS.find((b) => b.id === id);
  }
  function getTreasure(id) {
    return TREASURES.find((t) => t.id === id);
  }
  function getEnemy(id) {
    return ENEMIES.find((e) => e.id === id);
  }
  function getEnding(id) {
    return ENDINGS.find((e) => e.id === id);
  }

  // xian/src/game/engine.ts
  var COMBAT_TIER_RATIOS = {
    prey: 0.55,
    fair: 0.98,
    threat: 1.4,
    deadly: 1.9,
    overreach: 2.45
  };
  var COMBAT_DIFFICULTIES = [
    "prey",
    "fair",
    "threat",
    "deadly",
    "overreach"
  ];
  function emptyOwned() {
    const owned = {};
    for (const a of ARTS) owned[a.id] = 0;
    return owned;
  }
  function clampInt(n, min, max) {
    const v = Math.floor(Number(n) || 0);
    return Math.max(min, Math.min(max, v));
  }
  function parseAttrs(raw, fallback) {
    const base = { ...fallback };
    if (!raw || typeof raw !== "object") return base;
    const o = raw;
    for (const k of ATTR_KEYS) {
      const n = Number(o[k]);
      base[k] = Number.isFinite(n) ? Math.floor(n) : base[k];
    }
    return base;
  }
  function migrateEquipped(raw, treasures, realmIndex = 0) {
    const eq = emptyEquipped(realmIndex);
    const place = (id) => {
      if (!treasures.includes(id)) return;
      const t = getTreasure(id);
      if (!t) return;
      const arr = eq[t.slot];
      const emptyIdx = arr.findIndex((x) => !x);
      if (emptyIdx >= 0 && !listEquippedIds(eq).includes(id)) arr[emptyIdx] = id;
    };
    if (Array.isArray(raw)) {
      for (const id of raw) {
        if (typeof id === "string") place(id);
      }
      return eq;
    }
    if (raw && typeof raw === "object") {
      const o = raw;
      for (const slot of EQUIP_SLOTS) {
        const val = o[slot];
        if (typeof val === "string") {
          place(val);
        } else if (Array.isArray(val)) {
          for (const id of val) {
            if (typeof id === "string") place(id);
          }
        }
      }
    }
    return eq;
  }
  function syncEquipCapacity(state) {
    const cap = slotCapacity(state.realmIndex);
    let changed = false;
    const equipped = { ...state.equipped };
    for (const slot of EQUIP_SLOTS) {
      const cur = [...equipped[slot] || []];
      const need = cap[slot];
      if (cur.length < need) {
        while (cur.length < need) cur.push(null);
        changed = true;
      } else if (cur.length > need) {
        equipped[slot] = cur.slice(0, need);
        changed = true;
        continue;
      }
      equipped[slot] = cur;
    }
    return changed ? { ...state, equipped } : state;
  }
  function parseMilestones(raw) {
    if (!Array.isArray(raw)) return [];
    const out = [];
    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const o = item;
      if (typeof o.title !== "string" || typeof o.detail !== "string") continue;
      const kind = o.kind || "other";
      out.push({
        id: typeof o.id === "string" ? o.id : `ms_${out.length}`,
        title: o.title,
        detail: o.detail,
        kind,
        realmLabel: typeof o.realmLabel === "string" ? o.realmLabel : void 0,
        ts: Number(o.ts) || Date.now()
      });
    }
    return out.slice(-MAX_MILESTONES);
  }
  function pushMilestone(state, entry, now = Date.now()) {
    const realm = getRealm(state.realmIndex);
    const full = {
      ...entry,
      realmLabel: entry.realmLabel || `${realm.name}${state.star}\u5C42`,
      ts: now
    };
    return {
      ...state,
      milestones: [...state.milestones, full].slice(-MAX_MILESTONES)
    };
  }
  function createMetaState(now = Date.now()) {
    return {
      lingqi: 0,
      totalLingqi: 0,
      tishu: 0,
      totalTishu: 0,
      jingshen: 0,
      totalJingshen: 0,
      qiyun: 0,
      owned: emptyOwned(),
      realmIndex: 0,
      star: 1,
      branchId: null,
      factionId: null,
      destinyId: null,
      doneEvents: [],
      flags: [],
      endingsUnlocked: [],
      endingId: null,
      lastTickAt: now,
      reincarnations: 0,
      saveVersion: SAVE_VERSION,
      chronicle: ["\u8F6E\u56DE\u4E4B\u95E8\u534A\u5F00\u3002\u8BF7\u62E9\u4E00\u51FA\u8EAB\uFF0C\u518D\u5165\u4ED9\u9014\u3002"],
      birthId: null,
      attrs: zeroAttrs(),
      freePoints: 0,
      treasures: [],
      treasureForge: {},
      equipped: emptyEquipped(),
      vault: [],
      naturals: [],
      naturalPassive: 0,
      mainChapter: 1,
      milestones: [],
      legacyAttrs: zeroAttrs(),
      peakRealmIndex: 0,
      phase: "rebirth",
      deathReason: null,
      combatWins: 0,
      combatLosses: 0,
      randomEventId: null,
      lastRandomAt: 0,
      alchemyMastery: 0,
      herbs: emptyHerbs(),
      pills: emptyPills(),
      bodyStage: 0,
      bodyProgress: 0
    };
  }
  function createNewState(now = Date.now()) {
    return createMetaState(now);
  }
  function loadState(raw, now = Date.now()) {
    const fresh = createMetaState(now);
    if (!raw || typeof raw !== "object") return fresh;
    const data = raw;
    const owned = { ...fresh.owned };
    if (data.owned && typeof data.owned === "object") {
      for (const a of ARTS) {
        const n = Number(data.owned[a.id] ?? 0);
        owned[a.id] = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
      }
    }
    const flags = Array.isArray(data.flags) ? data.flags.filter((f) => typeof f === "string") : [];
    const doneEvents = Array.isArray(data.doneEvents) ? data.doneEvents.filter((f) => typeof f === "string") : [];
    const endingsUnlocked = Array.isArray(data.endingsUnlocked) ? data.endingsUnlocked.filter((f) => typeof f === "string") : [];
    const chronicle = Array.isArray(data.chronicle) ? data.chronicle.filter((f) => typeof f === "string").slice(-MAX_CHRONICLE) : fresh.chronicle;
    const milestones = parseMilestones(data.milestones);
    const treasures = Array.isArray(data.treasures) ? data.treasures.filter((f) => typeof f === "string" && !!getTreasure(f)) : [];
    const equipped = migrateEquipped(
      data.equipped,
      treasures,
      clampInt(data.realmIndex, 0, REALMS.length - 1)
    );
    const vault = Array.isArray(data.vault) ? data.vault.filter((f) => typeof f === "string" && !!getTreasure(f)) : [];
    const naturals = Array.isArray(data.naturals) ? data.naturals.filter((f) => typeof f === "string" && !!getNatural(f)) : [];
    const treasureForge = {};
    const rawForge = data.treasureForge;
    if (rawForge && typeof rawForge === "object") {
      for (const [id, v] of Object.entries(rawForge)) {
        if (!getTreasure(id)) continue;
        if (!v || typeof v !== "object") continue;
        const o = v;
        const def = getTreasure(id);
        treasureForge[id] = {
          level: clampInt(o.level, 0, MAX_TEMPER_LEVEL),
          refined: !!o.refined,
          tierOverride: o.tierOverride === "mortal" || o.tierOverride === "spirit" || o.tierOverride === "immortal" ? o.tierOverride : void 0
        };
      }
    }
    const lastTickAt = Number(data.lastTickAt);
    const safeLast = Number.isFinite(lastTickAt) && lastTickAt > 0 ? Math.min(lastTickAt, now) : now;
    const lingqi = Math.max(0, Number(data.lingqi ?? data.douqi) || 0);
    const totalLingqi = Math.max(lingqi, Number(data.totalLingqi ?? data.totalDouqi) || 0);
    let tishu = Math.max(0, Number(data.tishu) || 0);
    let totalTishu = Math.max(tishu, Number(data.totalTishu) || 0);
    let jingshen = Math.max(0, Number(data.jingshen) || 0);
    let totalJingshen = Math.max(jingshen, Number(data.totalJingshen) || 0);
    const legacyFree = Math.max(0, Math.floor(Number(data.freePoints) || 0));
    if (legacyFree > 0) {
      const grant = legacyFree * FREE_POINT_TO_RESOURCE;
      tishu += grant;
      totalTishu += grant;
      jingshen += grant;
      totalJingshen += grant;
    }
    const herbs = emptyHerbs();
    if (data.herbs && typeof data.herbs === "object") {
      for (const h of HERBS) {
        const n = Number(data.herbs[h.id] ?? 0);
        herbs[h.id] = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
      }
    }
    const pills = emptyPills();
    if (data.pills && typeof data.pills === "object") {
      for (const p of PILL_RECIPES) {
        const n = Number(data.pills[p.id] ?? 0);
        pills[p.id] = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
      }
    }
    const phase = data.phase === "playing" || data.phase === "rebirth" || data.phase === "ended" ? data.phase : data.birthId ? "playing" : "rebirth";
    const loaded = {
      lingqi,
      totalLingqi,
      tishu,
      totalTishu,
      jingshen,
      totalJingshen,
      qiyun: Math.max(0, Math.floor(Number(data.qiyun) || 0)),
      owned,
      realmIndex: clampInt(data.realmIndex, 0, REALMS.length - 1),
      star: clampInt(data.star, 1, MAX_STAR),
      branchId: data.branchId || null,
      factionId: data.factionId || null,
      destinyId: data.destinyId || null,
      doneEvents,
      flags,
      endingsUnlocked,
      endingId: typeof data.endingId === "string" ? data.endingId : null,
      lastTickAt: safeLast,
      reincarnations: Math.max(0, Math.floor(Number(data.reincarnations) || 0)),
      saveVersion: SAVE_VERSION,
      chronicle,
      birthId: typeof data.birthId === "string" ? data.birthId : null,
      attrs: parseAttrs(data.attrs, zeroAttrs()),
      freePoints: 0,
      treasures,
      treasureForge,
      equipped,
      vault,
      naturals,
      naturalPassive: Math.max(0, Number(data.naturalPassive) || 0),
      mainChapter: Math.max(1, Math.floor(Number(data.mainChapter) || 1)),
      milestones,
      legacyAttrs: parseAttrs(data.legacyAttrs, zeroAttrs()),
      peakRealmIndex: clampInt(data.peakRealmIndex ?? data.realmIndex, 0, REALMS.length - 1),
      phase: !data.birthId && phase === "playing" ? "rebirth" : phase,
      deathReason: typeof data.deathReason === "string" ? data.deathReason : null,
      combatWins: Math.max(0, Math.floor(Number(data.combatWins) || 0)),
      combatLosses: Math.max(0, Math.floor(Number(data.combatLosses) || 0)),
      randomEventId: typeof data.randomEventId === "string" ? data.randomEventId : null,
      lastRandomAt: Math.max(0, Number(data.lastRandomAt) || 0),
      alchemyMastery: Math.max(0, Math.floor(Number(data.alchemyMastery) || 0)),
      herbs,
      pills,
      bodyStage: clampInt(data.bodyStage, 0, BODY_STAGES.length),
      bodyProgress: Math.max(0, Number(data.bodyProgress) || 0)
    };
    const caps = resourceCaps(loaded);
    loaded.lingqi = Math.min(loaded.lingqi, caps.lingli);
    loaded.tishu = Math.min(loaded.tishu, caps.tishu);
    loaded.jingshen = Math.min(loaded.jingshen, caps.jingshen);
    return syncEquipCapacity(loaded);
  }
  function artAvailable(state, art) {
    if (state.realmIndex < art.minRealm) return false;
    if (art.branch && art.branch !== state.branchId) return false;
    if (art.faction && art.faction !== state.factionId) return false;
    return true;
  }
  function artCost(state, artId) {
    const def = getArt(artId);
    if (!def || !artAvailable(state, def)) return null;
    const owned = state.owned[artId] ?? 0;
    return Math.ceil(def.baseCost * Math.pow(def.costMult, owned));
  }
  function qiyunMultiplier(qiyun) {
    return 1 + Math.max(0, qiyun) * QIYUN_BONUS_PER;
  }
  function starMultiplier(star) {
    return 1 + Math.max(0, star - 1) * 0.06;
  }
  function raiseStarCost(state) {
    if (state.star >= MAX_STAR) return null;
    const realm = getRealm(state.realmIndex);
    return Math.ceil(realm.starCostBase * Math.pow(1.72, state.star - 1));
  }
  function breakthroughCost(state) {
    if (state.realmIndex >= REALMS.length - 1) return null;
    if (state.star < MAX_STAR) return null;
    return getRealm(state.realmIndex).breakCost;
  }
  function calcQiyunGain(state) {
    const lifetime = state.totalLingqi + state.totalTishu * 0.8 + state.totalJingshen * 0.8;
    const fromLingqi = Math.floor(Math.sqrt(lifetime / 8e4));
    const fromRealm = Math.max(0, state.peakRealmIndex - 2);
    const fromFlags = state.flags.includes("survived_tribulation") ? 2 : 0;
    const fromCombat = Math.floor(state.combatWins / 3);
    return Math.max(0, fromLingqi + fromRealm + fromFlags + fromCombat);
  }
  function hasFlags(state, need) {
    if (!need || need.length === 0) return true;
    return need.every((f) => state.flags.includes(f));
  }
  function hasArts(state, need) {
    if (!need) return true;
    return Object.entries(need).every(([id, n]) => (state.owned[id] ?? 0) >= n);
  }
  function hasTreasures(state, need) {
    if (!need || !need.length) return true;
    return need.every((id) => state.treasures.includes(id) || state.vault.includes(id));
  }
  function hasMinAttrs(total, need) {
    if (!need) return true;
    return ATTR_KEYS.every((k) => total[k] >= (need[k] || 0));
  }
  function currentForgeRealmIndex(state) {
    return forgeRealmIndexFromTotal(state.totalTishu);
  }
  function currentForgeRealm(state) {
    return getForgeRealm(currentForgeRealmIndex(state));
  }
  function treasureEffectiveTier(state, id) {
    const def = getTreasure(id);
    if (!def) return "mortal";
    const forge = getTreasureForge(state, id);
    return forge.tierOverride || def.tier;
  }
  function getTreasureForge(state, id) {
    return state.treasureForge[id] || { level: 0, refined: false };
  }
  function temperScale(level) {
    return 1 + Math.max(0, level) * 0.1;
  }
  function temperCost(def, level) {
    return Math.floor(def.temperBaseCost * Math.pow(1.45, Math.max(0, level)));
  }
  function sellValue(state, id) {
    const def = getTreasure(id);
    if (!def) return 0;
    const forge = getTreasureForge(state, id);
    const tier = treasureEffectiveTier(state, id);
    const tierBonus = tier === "immortal" ? 1.8 : tier === "spirit" ? 1.35 : 1;
    return Math.floor(
      def.sellLingli * (1 + forge.level * 0.12) * (forge.refined ? 1.15 : 1) * tierBonus
    );
  }
  function treasureConsActive(def, forge, tier) {
    return tier !== "immortal" && !forge.refined && !!def.cons;
  }
  function effectiveTreasureEffects(state, id) {
    const def = getTreasure(id);
    if (!def) return null;
    const forge = getTreasureForge(state, id);
    const tier = treasureEffectiveTier(state, id);
    const scale = temperScale(forge.level);
    const consActive = treasureConsActive(def, forge, tier);
    const cons = consActive ? def.cons : void 0;
    const attrs = zeroAttrs();
    for (const k of ATTR_KEYS) {
      const base = def.attrs[k] || 0;
      const tierBoost = tier === "immortal" ? 1.35 : tier === "spirit" ? 1.15 : 1;
      const boosted = base > 0 ? base * scale * tierBoost : base;
      const pen = cons?.attrs?.[k] || 0;
      attrs[k] = boosted + pen;
    }
    let combatMult = 1;
    if (def.combatMult) {
      const tierBoost = tier === "immortal" ? 1.08 : tier === "spirit" ? 1.03 : 1;
      combatMult = 1 + (def.combatMult - 1) * scale * tierBoost;
    }
    if (cons?.combatMult) combatMult *= cons.combatMult;
    let cultivateClick = (def.cultivateClick || 0) * scale;
    let cultivatePassive = (def.cultivatePassive || 0) * scale;
    if (tier === "spirit") {
      cultivateClick *= 1.1;
      cultivatePassive *= 1.1;
    } else if (tier === "immortal") {
      cultivateClick *= 1.25;
      cultivatePassive *= 1.25;
    }
    if (cons?.cultivateClick) cultivateClick += cons.cultivateClick;
    if (cons?.cultivatePassive) cultivatePassive += cons.cultivatePassive;
    cultivateClick = Math.max(0, cultivateClick);
    cultivatePassive = Math.max(0, cultivatePassive);
    let triadDamp = (def.triadDamp || 0) * (1 + forge.level * 0.04);
    if (tier === "spirit") triadDamp *= 1.1;
    if (tier === "immortal") triadDamp *= 1.25;
    const triadBias = zeroResources();
    if (def.triadBias) {
      for (const key of RESOURCE_KEYS) {
        triadBias[key] += (def.triadBias[key] || 0) * scale;
      }
    }
    if (cons?.triadBias) {
      for (const key of RESOURCE_KEYS) {
        triadBias[key] += cons.triadBias[key] || 0;
      }
    }
    return {
      attrs,
      combatMult,
      cultivateClick,
      cultivatePassive,
      triadDamp,
      triadBias,
      combatEdges: def.combatEdges,
      consActive,
      level: forge.level,
      refined: forge.refined || tier === "immortal"
    };
  }
  function describeTreasureBonus(state, id) {
    const def = getTreasure(id);
    const eff = effectiveTreasureEffects(state, id);
    if (!def || !eff) return "";
    const tier = treasureEffectiveTier(state, id);
    const parts = [];
    parts.push(TREASURE_TIER_LABELS[tier]);
    if (eff.level > 0) parts.push(`\u70BC\u5668+${eff.level}`);
    if (eff.refined && tier !== "immortal") parts.push("\u5DF2\u6D17\u7EC3");
    for (const k of ATTR_KEYS) {
      if (eff.attrs[k]) {
        const v = Math.round(eff.attrs[k] * 10) / 10;
        parts.push(`${ATTR_LABELS[k]}${v > 0 ? "+" : ""}${v}`);
      }
    }
    if (eff.combatMult !== 1) parts.push(`\u6218\u529B\xD7${eff.combatMult.toFixed(2)}`);
    if (eff.cultivateClick) parts.push(`\u70B9\u51FB+${eff.cultivateClick.toFixed(1)}`);
    if (eff.cultivatePassive) parts.push(`\u88AB\u52A8+${eff.cultivatePassive.toFixed(1)}`);
    if (eff.triadDamp) parts.push(`\u8C03\u548C${Math.floor(eff.triadDamp * 100)}%`);
    if (def.pros?.length) parts.push("\u6B63\uFF1A" + def.pros.slice(0, 3).join("\u3001"));
    if (eff.consActive && def.cons?.labels?.length) {
      parts.push("\u8D1F\uFF1A" + def.cons.labels.join("\u3001"));
    } else if (tier === "immortal") {
      parts.push("\u4ED9\u54C1\u65E0\u8D1F\u9762");
    } else if (eff.refined) {
      parts.push("\u8D1F\u9762\u5DF2\u6D17");
    }
    return parts.join(" \xB7 ");
  }
  function treasureAttrBonus(state) {
    let sum = zeroAttrs();
    for (const id of listEquippedIds(state.equipped)) {
      const eff = effectiveTreasureEffects(state, id);
      if (eff) sum = addAttrs(sum, eff.attrs);
    }
    return {
      atk: Math.floor(sum.atk),
      def: Math.floor(sum.def),
      spd: Math.floor(sum.spd),
      spirit: Math.floor(sum.spirit),
      bone: Math.floor(sum.bone),
      luck: Math.floor(sum.luck)
    };
  }
  function cultivateBonuses(state) {
    let click = 0;
    let passive = 0;
    for (const id of listEquippedIds(state.equipped)) {
      const eff = effectiveTreasureEffects(state, id);
      if (!eff) continue;
      click += eff.cultivateClick;
      passive += eff.cultivatePassive;
    }
    return { click, passive };
  }
  function artAttrBonus(state) {
    let sum = zeroAttrs();
    for (const art of ARTS) {
      const n = state.owned[art.id] ?? 0;
      if (n <= 0 || !art.attrs) continue;
      const scaled = {};
      for (const k of ATTR_KEYS) {
        if (art.attrs[k]) scaled[k] = art.attrs[k] * n;
      }
      sum = addAttrs(sum, scaled);
    }
    return {
      atk: Math.floor(sum.atk),
      def: Math.floor(sum.def),
      spd: Math.floor(sum.spd),
      spirit: Math.floor(sum.spirit),
      bone: Math.floor(sum.bone),
      luck: Math.floor(sum.luck)
    };
  }
  function totalAttrs(state) {
    const base = addAttrs(
      addAttrs(addAttrs(state.attrs, state.legacyAttrs), treasureAttrBonus(state)),
      artAttrBonus(state)
    );
    const withBody = addAttrs(base, forgeAttrsBonus(currentForgeRealmIndex(state)));
    return addAttrs(withBody, resourceAttrsFromTotals(state));
  }
  function calcCombatPower(state, attrs) {
    const a = attrs || totalAttrs(state);
    const weighted = a.atk * 1.2 + a.def * 1 + a.spd * 0.9 + a.spirit * 1.1 + a.bone * 0.8 + a.luck * 0.6;
    let mult = 1;
    for (const id of listEquippedIds(state.equipped)) {
      const eff = effectiveTreasureEffects(state, id);
      if (eff && eff.combatMult !== 1) mult *= eff.combatMult;
    }
    const realmMult = 1 + state.realmIndex * 0.08 + state.star * 0.01;
    const forgeMult = forgeMultipliers(currentForgeRealmIndex(state)).combatMult;
    return Math.max(1, weighted * mult * realmMult * forgeMult);
  }
  function gatherCombatEdges(state) {
    let critChance = 0;
    let critMult = 1.4;
    let dodgeChance = 0;
    let plotArmorChance = 0;
    let firstStrikeChance = 0;
    let firstStrikeBonus = 0.1;
    for (const id of listEquippedIds(state.equipped)) {
      const e = getTreasure(id)?.combatEdges;
      if (!e) continue;
      critChance += e.critChance || 0;
      if (e.critMult && e.critMult > critMult) critMult = e.critMult;
      dodgeChance += e.dodgeChance || 0;
      plotArmorChance += e.plotArmorChance || 0;
      firstStrikeChance += e.firstStrikeChance || 0;
      if (e.firstStrikeBonus && e.firstStrikeBonus > firstStrikeBonus) {
        firstStrikeBonus = e.firstStrikeBonus;
      }
    }
    const luck = totalAttrs(state).luck;
    critChance = Math.min(0.55, critChance + luck * 2e-3);
    dodgeChance = Math.min(0.45, dodgeChance + luck * 15e-4);
    plotArmorChance = Math.min(0.5, plotArmorChance + luck * 1e-3);
    firstStrikeChance = Math.min(0.45, firstStrikeChance);
    return { critChance, critMult, dodgeChance, plotArmorChance, firstStrikeChance, firstStrikeBonus };
  }
  function enemyPower(enemyAttrs, realmIndex) {
    const weighted = enemyAttrs.atk * 1.2 + enemyAttrs.def * 1 + enemyAttrs.spd * 0.9 + enemyAttrs.spirit * 1.1 + enemyAttrs.bone * 0.8 + enemyAttrs.luck * 0.6;
    return Math.max(1, weighted * (1 + realmIndex * 0.05));
  }
  function combatRewardMultiplier(playerPower, ePower) {
    const ratio = ePower / Math.max(1, playerPower);
    const raw = Math.pow(Math.max(0.2, ratio), 1.2);
    return Math.min(3.6, Math.max(0.22, raw));
  }
  function combatBaselineReward(state, playerPower) {
    const realmGrow = 90 * Math.pow(2.55, state.realmIndex) * (0.85 + state.star * 0.04);
    const powerGrow = playerPower * 0.42;
    return Math.max(40, Math.floor(realmGrow + powerGrow));
  }
  function scaleEnemyAttrsToPower(baseAttrs, realmIndex, targetPower) {
    const cur = enemyPower(baseAttrs, realmIndex);
    let factor = targetPower / Math.max(1, cur);
    const out = { ...zeroAttrs() };
    for (const k of ATTR_KEYS) {
      out[k] = Math.max(1, Math.round((baseAttrs[k] || 1) * factor));
    }
    const mid = enemyPower(out, realmIndex);
    if (mid > 0 && Math.abs(mid - targetPower) / targetPower > 0.06) {
      factor = targetPower / mid;
      for (const k of ATTR_KEYS) {
        out[k] = Math.max(1, Math.round(out[k] * factor));
      }
    }
    return out;
  }
  function combatPoolSeed(state) {
    const power = calcCombatPower(state);
    const bucket = Math.floor(Math.log10(Math.max(10, power)) * 20);
    return (state.realmIndex * 1000003 ^ state.star * 10007 ^ state.combatWins * 97 ^ state.combatLosses * 13 ^ state.mainChapter * 31 ^ bucket * 17) >>> 0;
  }
  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a = a + 1831565813 >>> 0;
      let t = a;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function shuffleWith(arr, rng) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function encounterJitter(state, templateId, difficulty) {
    const rng = mulberry32((combatPoolSeed(state) ^ hashStr(`${templateId}:${difficulty}`)) >>> 0);
    return 0.94 + rng() * 0.12;
  }
  function parseCombatEncounterId(id) {
    const idx = id.lastIndexOf("__");
    if (idx <= 0) return null;
    const templateId = id.slice(0, idx);
    const difficulty = id.slice(idx + 2);
    if (!COMBAT_DIFFICULTIES.includes(difficulty)) return null;
    if (!getEnemy(templateId)) return null;
    return { templateId, difficulty };
  }
  function makeCombatEncounterId(templateId, difficulty) {
    return `${templateId}__${difficulty}`;
  }
  function difficultyDropMult(d) {
    if (d === "prey") return 0.55;
    if (d === "fair") return 1;
    if (d === "threat") return 1.35;
    return 1.7;
  }
  function buildCombatEncounter(state, template, difficulty, playerPower = calcCombatPower(state)) {
    const ratio = COMBAT_TIER_RATIOS[difficulty] * encounterJitter(state, template.id, difficulty);
    const targetPower = Math.max(3, playerPower * ratio);
    const attrs = scaleEnemyAttrsToPower(template.attrs, state.realmIndex, targetPower);
    const ePower = enemyPower(attrs, state.realmIndex);
    const baseline = combatBaselineReward(state, playerPower);
    const gapMult = combatRewardMultiplier(playerPower, ePower);
    const flavor = 0.9 + Math.min(0.2, Math.max(0, Math.log10(Math.max(10, template.rewardLingqi)) / 50));
    const tierBias = 0.88 + COMBAT_TIER_RATIOS[difficulty] * 0.22;
    const rewardLingqi = Math.max(
      10,
      Math.floor(baseline * gapMult * flavor * tierBias)
    );
    const rewardPoints = template.rewardPoints ? Math.max(
      1,
      Math.round(template.rewardPoints * (0.6 + COMBAT_TIER_RATIOS[difficulty] * 0.5))
    ) : void 0;
    const dropChance = template.dropChance ? Math.min(0.85, template.dropChance * difficultyDropMult(difficulty)) : void 0;
    return {
      id: makeCombatEncounterId(template.id, difficulty),
      templateId: template.id,
      name: template.name,
      blurb: template.blurb,
      lore: template.lore,
      minRealm: template.minRealm,
      maxRealm: template.maxRealm,
      attrs,
      rewardLingqi,
      rewardPoints,
      dropTreasureId: template.dropTreasureId,
      dropChance,
      difficulty,
      powerRatio: ePower / Math.max(1, playerPower)
    };
  }
  function resolveCombatEncounter(state, encounterId) {
    const parsed = parseCombatEncounterId(encounterId);
    if (parsed) {
      const template = getEnemy(parsed.templateId);
      if (!template) return null;
      return buildCombatEncounter(state, template, parsed.difficulty);
    }
    const enemy = getEnemy(encounterId);
    if (!enemy) return null;
    const playerPower = calcCombatPower(state);
    const ePower = enemyPower(enemy.attrs, state.realmIndex);
    const baseline = combatBaselineReward(state, playerPower);
    const gapMult = combatRewardMultiplier(playerPower, ePower);
    const flavor = 0.9 + Math.min(0.2, Math.max(0, Math.log10(Math.max(10, enemy.rewardLingqi)) / 50));
    return {
      ...enemy,
      templateId: enemy.id,
      difficulty: "fair",
      powerRatio: ePower / Math.max(1, playerPower),
      rewardLingqi: Math.max(10, Math.floor(baseline * gapMult * flavor))
    };
  }
  function matchEnding(state) {
    const attrs = totalAttrs(state);
    const candidates = ENDINGS.filter((e) => {
      if (e.id === "fallen_wild") return false;
      if (state.realmIndex < e.minRealm) return false;
      if (e.requireBranch && e.requireBranch !== state.branchId) return false;
      if (e.requireFaction && e.requireFaction !== state.factionId) return false;
      if (e.requireDestiny && e.requireDestiny !== state.destinyId) return false;
      if (e.minQiyun != null && state.qiyun < e.minQiyun) return false;
      if (!hasFlags(state, e.requireFlags)) return false;
      if (!hasArts(state, e.requireArts)) return false;
      if (!hasTreasures(state, e.requireTreasures)) return false;
      if (!hasMinAttrs(attrs, e.minAttrs)) return false;
      return true;
    });
    if (!candidates.length) return null;
    candidates.sort((a, b) => b.priority - a.priority);
    return candidates[0];
  }
  function findStoryEvent(state) {
    if (state.phase !== "playing" || state.endingId) return null;
    for (const ev of STORY_EVENTS) {
      if (state.doneEvents.includes(ev.id)) continue;
      if (state.realmIndex < ev.minRealm) continue;
      if (ev.minStar != null && state.star < ev.minStar) continue;
      if (ev.requireBranch && ev.requireBranch !== state.branchId) continue;
      if (ev.requireFaction && ev.requireFaction !== state.factionId) continue;
      if (ev.requireBirth && ev.requireBirth !== state.birthId) continue;
      if (!hasFlags(state, ev.requireFlags)) continue;
      if (ev.id === "choose_branch" && state.branchId) continue;
      if (ev.id === "choose_faction" && state.factionId) continue;
      if (ev.id === "choose_destiny" && state.destinyId) continue;
      return ev;
    }
    return null;
  }
  function findPendingEvent(state) {
    if (state.phase !== "playing" || state.endingId) return null;
    if (state.randomEventId) {
      const rnd = RANDOM_EVENTS.find((e) => e.id === state.randomEventId) || MAIN_STORY.find((e) => e.id === state.randomEventId);
      if (rnd) return rnd;
    }
    return findStoryEvent(state);
  }
  function tryRandomEvent(state, source, now = Date.now(), forceRoll) {
    if (state.phase !== "playing" || state.endingId) return { ok: false, state };
    if (state.randomEventId) return { ok: false, state };
    if (findStoryEvent(state)) return { ok: false, state };
    if (now - state.lastRandomAt < RANDOM_COOLDOWN_MS) return { ok: false, state };
    const chance = RANDOM_CHANCE[source];
    const roll = forceRoll != null ? forceRoll : Math.random();
    if (roll > chance) return { ok: false, state };
    const nextMain = MAIN_STORY.find((e) => e.mainChapter === state.mainChapter);
    if (nextMain && state.realmIndex >= nextMain.minRealm && !state.doneEvents.includes(nextMain.id) && Math.random() < 0.35) {
      return {
        ok: true,
        state: {
          ...state,
          randomEventId: nextMain.id,
          lastRandomAt: now
        },
        message: nextMain.title
      };
    }
    const pool = RANDOM_EVENTS.filter((e) => {
      if (state.realmIndex < e.minRealm) return false;
      if (e.minStar != null && state.star < e.minStar) return false;
      if (e.requireBranch && e.requireBranch !== state.branchId) return false;
      if (e.requireFaction && e.requireFaction !== state.factionId) return false;
      if (e.requireFlags && !hasFlags(state, e.requireFlags)) return false;
      return true;
    });
    if (!pool.length) return { ok: false, state };
    let total = 0;
    for (const e of pool) total += e.weight || 1;
    let pickRoll = Math.random() * total;
    let picked = pool[0];
    for (const e of pool) {
      pickRoll -= e.weight || 1;
      if (pickRoll <= 0) {
        picked = e;
        break;
      }
    }
    return {
      ok: true,
      state: {
        ...state,
        randomEventId: picked.id,
        lastRandomAt: now
      },
      message: picked.title
    };
  }
  function pushChronicle(state, line) {
    return { ...state, chronicle: [...state.chronicle, line].slice(-MAX_CHRONICLE) };
  }
  function resourceCaps(state) {
    const realm = getRealm(state.realmIndex);
    const starMult = 1 + (state.star - 1) * 0.1;
    const base = realm.starCostBase * 7 * starMult;
    const caps = {
      lingli: base,
      tishu: base * 0.75,
      jingshen: base * 0.75
    };
    const forgeIdx = currentForgeRealmIndex(state);
    if (forgeIdx > 0) {
      caps.tishu *= 1 + forgeIdx * 0.12;
      caps.lingli *= 1 + forgeIdx * 0.04;
    }
    for (const art of ARTS) {
      if (art.kind !== "cap") continue;
      const n = state.owned[art.id] ?? 0;
      if (n <= 0 || !artAvailable(state, art)) continue;
      caps[artChannel(art)] += art.power * n;
    }
    return caps;
  }
  function grantLingqi(state, amount) {
    return grantResource(state, "lingli", amount);
  }
  function getResource(state, key) {
    if (key === "lingli") return state.lingqi;
    if (key === "tishu") return state.tishu;
    return state.jingshen;
  }
  function grantResource(state, key, amount) {
    if (amount === 0) return state;
    if (amount > 0) {
      const caps = resourceCaps(state);
      if (key === "lingli") {
        const next2 = Math.min(caps.lingli, state.lingqi + amount);
        return { ...state, lingqi: next2, totalLingqi: state.totalLingqi + (next2 - state.lingqi) };
      }
      if (key === "tishu") {
        const next2 = Math.min(caps.tishu, state.tishu + amount);
        return { ...state, tishu: next2, totalTishu: state.totalTishu + (next2 - state.tishu) };
      }
      const next = Math.min(caps.jingshen, state.jingshen + amount);
      return { ...state, jingshen: next, totalJingshen: state.totalJingshen + (next - state.jingshen) };
    }
    if (key === "lingli") return { ...state, lingqi: Math.max(0, state.lingqi + amount) };
    if (key === "tishu") return { ...state, tishu: Math.max(0, state.tishu + amount) };
    return { ...state, jingshen: Math.max(0, state.jingshen + amount) };
  }
  function spendResource(state, key, amount) {
    if (amount <= 0) return state;
    if (getResource(state, key) < amount) return null;
    return grantResource(state, key, -amount);
  }
  function spendResources(state, costs) {
    let next = state;
    for (const key of RESOURCE_KEYS) {
      const c = costs[key] || 0;
      if (c <= 0) continue;
      const spent = spendResource(next, key, c);
      if (!spent) return null;
      next = spent;
    }
    return next;
  }
  function grantFromFreePoints(state, points) {
    if (points <= 0) return state;
    const amt = points * FREE_POINT_TO_RESOURCE;
    let next = grantResource(state, "lingli", amt);
    next = grantResource(next, "tishu", amt);
    next = grantResource(next, "jingshen", amt);
    return next;
  }
  function resourceAttrsFromTotals(state) {
    const score = (total, scale) => Math.floor(Math.log2(1 + Math.max(0, total) / scale) * 3);
    const L = score(state.totalLingqi, 80);
    const T = score(state.totalTishu, 60);
    const J = score(state.totalJingshen, 60);
    return {
      atk: Math.floor(T * 1 + L * 0.35),
      def: Math.floor(T * 0.8 + L * 0.25),
      spd: Math.floor(T * 0.4 + J * 0.55),
      spirit: Math.floor(J * 0.75 + L * 0.25),
      bone: Math.floor(T * 1 + L * 0.2),
      luck: Math.floor(J * 0.55 + L * 0.4)
    };
  }
  function resourceShares(state) {
    const L = Math.max(0, state.totalLingqi);
    const T = Math.max(0, state.totalTishu);
    const J = Math.max(0, state.totalJingshen);
    const sum = L + T + J;
    if (sum <= 1e-9) return { lingli: 1 / 3, tishu: 1 / 3, jingshen: 1 / 3 };
    return { lingli: L / sum, tishu: T / sum, jingshen: J / sum };
  }
  function shareExcess(share) {
    return (share - 1 / 3) / (2 / 3);
  }
  function clampTriad(n) {
    return Math.max(-TRIAD_INTERFERE_CAP, Math.min(TRIAD_INTERFERE_CAP, n));
  }
  function treasureTriadSupport(state) {
    let damp = 0;
    const bias = zeroResources();
    for (const id of listEquippedIds(state.equipped)) {
      const eff = effectiveTreasureEffects(state, id);
      if (!eff) continue;
      damp += eff.triadDamp;
      for (const key of RESOURCE_KEYS) {
        bias[key] += eff.triadBias[key] || 0;
      }
    }
    return { damp: Math.min(0.85, damp), bias };
  }
  function calcTriadMods(state) {
    const shares = resourceShares(state);
    const eL = shareExcess(shares.lingli);
    const eT = shareExcess(shares.tishu);
    const eJ = shareExcess(shares.jingshen);
    const cap = TRIAD_INTERFERE_CAP;
    let lingli = eJ * cap - eT * cap;
    let tishu = eL * cap - eJ * cap;
    let jingshen = eT * cap - eL * cap;
    const { damp, bias } = treasureTriadSupport(state);
    const keep = 1 - damp;
    lingli = clampTriad(lingli * keep + bias.lingli);
    tishu = clampTriad(tishu * keep + bias.tishu);
    jingshen = clampTriad(jingshen * keep + bias.jingshen);
    return {
      mods: { lingli, tishu, jingshen },
      shares,
      damp
    };
  }
  function grantTreasure(state, id) {
    if (!getTreasure(id)) return state;
    if (state.treasures.includes(id)) return state;
    const t = getTreasure(id);
    const treasures = [...state.treasures, id];
    const treasureForge = { ...state.treasureForge };
    if (!treasureForge[id]) treasureForge[id] = { level: 0, refined: false };
    let next = syncEquipCapacity({ ...state, treasures, treasureForge });
    const equipped = {
      combat: [...next.equipped.combat],
      cultivate: [...next.equipped.cultivate],
      assist: [...next.equipped.assist]
    };
    if (!listEquippedIds(equipped).includes(id)) {
      const emptyIdx = equipped[t.slot].findIndex((x) => !x);
      if (emptyIdx >= 0) equipped[t.slot][emptyIdx] = id;
    }
    const tier = TREASURE_TIER_LABELS[t.tier];
    return pushChronicle(
      { ...next, equipped },
      `\u83B7\u5F97${tier}\u6CD5\u5B9D\u300C${t.name}\u300D\u3014${EQUIP_SLOT_LABELS[t.slot]}\u3015\u3010${t.lore}\u3011`
    );
  }
  function grantNatural(state, id) {
    const n = getNatural(id);
    if (!n) return state;
    if (state.naturals.includes(id)) {
      let next2 = grantLingqi(state, Math.floor(n.lingqiGain * 0.4));
      return pushChronicle(next2, `\u518D\u6B21\u5BFB\u5F97\u300C${n.name}\u300D\uFF0C\u70BC\u5316\u6B8B\u529B\u5165\u4F53\u3002`);
    }
    let next = {
      ...state,
      naturals: [...state.naturals, id],
      naturalPassive: state.naturalPassive + n.passiveBonus
    };
    next = grantLingqi(next, n.lingqiGain);
    next = pushChronicle(
      next,
      `\u83B7\u5F97\u5929\u624D\u5730\u5B9D\u300C${n.name}\u300D\uFF1A\u7075\u529B +${Math.floor(n.lingqiGain)}\uFF0C\u6C38\u4E45\u88AB\u52A8 +${n.passiveBonus}/\u79D2\u3010${n.lore}\u3011`
    );
    if (n.minRealm >= 3 || n.passiveBonus >= 3) {
      next = pushMilestone(
        next,
        {
          id: `nat_${id}`,
          title: `\u5929\u624D\u5730\u5B9D\xB7${n.name}`,
          detail: `\u7075\u529B +${Math.floor(n.lingqiGain)}\uFF0C\u88AB\u52A8 +${n.passiveBonus}/\u79D2\uFF08${n.lore}\uFF09`,
          kind: "loot"
        }
      );
    }
    return next;
  }
  function updatePeak(state) {
    if (state.realmIndex > state.peakRealmIndex) {
      return { ...state, peakRealmIndex: state.realmIndex };
    }
    return state;
  }
  function derive(state) {
    const realm = getRealm(state.realmIndex);
    const qiyunMult = qiyunMultiplier(state.qiyun);
    const realmMult = realm.mult;
    const starMult = starMultiplier(state.star);
    const branchMult = state.branchId ? BRANCH_LABELS[state.branchId].mult : 1;
    const attrs = totalAttrs(state);
    const resourceAttrs = resourceAttrsFromTotals(state);
    const fixedBone = state.attrs.bone + state.legacyAttrs.bone + treasureAttrBonus(state).bone + artAttrBonus(state).bone + (forgeAttrsBonus(currentForgeRealmIndex(state)).bone || 0);
    const fixedSpirit = state.attrs.spirit + state.legacyAttrs.spirit + treasureAttrBonus(state).spirit + artAttrBonus(state).spirit;
    const fixedLuck = state.attrs.luck + state.legacyAttrs.luck + treasureAttrBonus(state).luck + artAttrBonus(state).luck;
    const boneFactor = 1 + fixedBone * 0.015;
    const spiritFactor = 1 + fixedSpirit * 0.012;
    const luckFactor = 1 + fixedLuck * 0.01;
    const clickBase = { lingli: 1, tishu: 1, jingshen: 1 };
    const passiveBase = zeroResources();
    for (const art of ARTS) {
      if (!artAvailable(state, art)) continue;
      const n = state.owned[art.id] ?? 0;
      if (n <= 0) continue;
      const ch = artChannel(art);
      if (art.kind === "click") clickBase[ch] += art.power * n;
      else if (art.kind === "passive") passiveBase[ch] += art.power * n;
    }
    const cult = cultivateBonuses(state);
    clickBase.lingli += cult.click;
    passiveBase.lingli += cult.passive + state.naturalPassive;
    const forgeIdx = currentForgeRealmIndex(state);
    const forgeMult = forgeMultipliers(forgeIdx).tishuMult;
    const alchemyMult = 1 + state.alchemyMastery * 0.01;
    const scale = realmMult * starMult * branchMult * qiyunMult * boneFactor;
    const triad = calcTriadMods(state);
    const triadFactor = (key) => 1 + triad.mods[key];
    const clickPowers = {
      lingli: clickBase.lingli * scale * triadFactor("lingli"),
      tishu: clickBase.tishu * scale * forgeMult * triadFactor("tishu"),
      jingshen: clickBase.jingshen * scale * alchemyMult * triadFactor("jingshen")
    };
    const perSec = {
      lingli: passiveBase.lingli * scale * spiritFactor * luckFactor * triadFactor("lingli"),
      tishu: passiveBase.tishu * scale * forgeMult * luckFactor * triadFactor("tishu"),
      jingshen: passiveBase.jingshen * scale * spiritFactor * alchemyMult * triadFactor("jingshen")
    };
    const nextStarCost = raiseStarCost(state);
    const breakCost = breakthroughCost(state);
    const playing = state.phase === "playing" && !state.endingId;
    const canRaiseStar = playing && nextStarCost != null && state.lingqi >= nextStarCost;
    const pillNeed = breakCost != null ? breakthroughPillNeed(state.realmIndex) : null;
    const breakthroughPill = pillNeed ? {
      pillId: pillNeed.pillId,
      pillName: getPillRecipe(pillNeed.pillId)?.name || pillNeed.pillId,
      count: pillNeed.count,
      owned: state.pills[pillNeed.pillId] || 0
    } : null;
    const hasBreakPill = !breakthroughPill || breakthroughPill.owned >= breakthroughPill.count;
    const canBreakthrough = playing && breakCost != null && state.lingqi >= breakCost && hasBreakPill;
    const peakRealm = getRealm(state.peakRealmIndex);
    const qiyunGain = calcQiyunGain(state);
    const canReincarnate = state.phase === "playing" && (qiyunGain > 0 && state.realmIndex >= 2 || !!state.endingId);
    const forgeRealm = getForgeRealm(forgeIdx);
    const nextForge = forgeIdx + 1 < FORGE_REALMS.length ? FORGE_REALMS[forgeIdx + 1].needTotalTishu : null;
    return {
      clickPowers,
      perSec,
      clickPower: clickPowers.lingli,
      lingqiPerSec: perSec.lingli,
      triadMods: triad.mods,
      resourceShares: triad.shares,
      triadDamp: triad.damp,
      caps: resourceCaps(state),
      qiyunMult,
      realmMult,
      starMult,
      branchMult,
      realm,
      nextStarCost,
      breakCost,
      canRaiseStar,
      canBreakthrough,
      breakthroughPill,
      qiyunGain,
      canReincarnate,
      pendingEvent: findPendingEvent(state),
      matchedEnding: matchEnding(state),
      totalAttrs: attrs,
      resourceAttrs,
      treasureAttrs: treasureAttrBonus(state),
      combatPower: calcCombatPower(state, attrs),
      cultivateClickBonus: cult.click,
      cultivatePassiveBonus: cult.passive + state.naturalPassive,
      forgeRealmName: forgeRealm.name,
      forgeRealmIndex: forgeIdx,
      nextForgeNeed: nextForge,
      bodyStageName: forgeRealm.name,
      inheritPreview: {
        attrRate: peakRealm.inheritAttrRate,
        treasureSlots: peakRealm.inheritTreasureSlots
      }
    };
  }
  function tick(state, now = Date.now()) {
    if (state.phase !== "playing") {
      return {
        state: { ...state, lastTickAt: now },
        gained: zeroResources(),
        cappedSeconds: 0,
        offlineSeconds: 0
      };
    }
    const elapsedRaw = Math.max(0, now - state.lastTickAt);
    const elapsed = Math.min(elapsedRaw, MAX_OFFLINE_MS);
    const offlineSeconds = elapsedRaw / 1e3;
    const cappedSeconds = elapsed / 1e3;
    const { perSec } = derive(state);
    let next = state;
    for (const key of RESOURCE_KEYS) {
      next = grantResource(next, key, perSec[key] * cappedSeconds);
    }
    const gained = {
      lingli: next.lingqi - state.lingqi,
      tishu: next.tishu - state.tishu,
      jingshen: next.jingshen - state.jingshen
    };
    next = { ...next, lastTickAt: now };
    return { state: next, gained, cappedSeconds, offlineSeconds };
  }
  function ensurePlaying(state) {
    if (state.phase === "rebirth") {
      return { ok: false, state, reason: "\u8BF7\u5148\u9009\u62E9\u51FA\u8EAB\u8F6C\u751F" };
    }
    if (state.phase === "ended" || state.endingId) {
      return { ok: false, state, reason: "\u6B64\u4E16\u5DF2\u843D\u5E55\uFF0C\u53EF\u8F6E\u56DE" };
    }
    return null;
  }
  function clickAbsorb(state, channel = "lingli", now = Date.now()) {
    const blocked = ensurePlaying(state);
    if (blocked) return blocked;
    if (!RESOURCE_KEYS.includes(channel)) {
      return { ok: false, state, reason: "\u672A\u77E5\u4FEE\u70BC\u901A\u9053" };
    }
    const ticked = tick(state, now).state;
    if (findPendingEvent(ticked)) {
      return { ok: false, state: ticked, reason: "\u8BF7\u5148\u5B8C\u6210\u5F53\u524D\u6289\u62E9" };
    }
    const { clickPowers } = derive(ticked);
    let next = grantResource(ticked, channel, clickPowers[channel]);
    const rnd = tryRandomEvent(next, "click", now);
    if (rnd.ok) next = rnd.state;
    return { ok: true, state: next, message: `\u5410\u7EB3\xB7${RESOURCE_LABELS[channel]}` };
  }
  function buyArt(state, artId, now = Date.now()) {
    const blocked = ensurePlaying(state);
    if (blocked) return blocked;
    const def = getArt(artId);
    if (!def) return { ok: false, state, reason: "\u672A\u77E5\u529F\u6CD5" };
    const ticked = tick(state, now).state;
    if (findPendingEvent(ticked)) {
      return { ok: false, state: ticked, reason: "\u8BF7\u5148\u5B8C\u6210\u5F53\u524D\u6289\u62E9" };
    }
    if (!artAvailable(ticked, def)) {
      return { ok: false, state: ticked, reason: "\u5C1A\u672A\u89E3\u9501\u8BE5\u529F\u6CD5" };
    }
    const cost = artCost(ticked, artId);
    const ch = artChannel(def);
    if (cost == null || getResource(ticked, ch) < cost) {
      return { ok: false, state: ticked, reason: `${RESOURCE_LABELS[ch]}\u4E0D\u8DB3` };
    }
    const spent = spendResource(ticked, ch, cost);
    if (!spent) return { ok: false, state: ticked, reason: `${RESOURCE_LABELS[ch]}\u4E0D\u8DB3` };
    const owned = { ...spent.owned, [artId]: (spent.owned[artId] ?? 0) + 1 };
    return {
      ok: true,
      state: { ...spent, owned },
      message: `\u4FEE\u4E60\u300C${def.name}\u300D`
    };
  }
  function buyTreasure(state, treasureId, now = Date.now()) {
    const blocked = ensurePlaying(state);
    if (blocked) return blocked;
    const def = getTreasure(treasureId);
    if (!def || def.cost <= 0) return { ok: false, state, reason: "\u65E0\u6CD5\u8D2D\u4E70\u8BE5\u6CD5\u5B9D" };
    const ticked = tick(state, now).state;
    if (ticked.treasures.includes(treasureId)) {
      return { ok: false, state: ticked, reason: "\u5DF2\u62E5\u6709\u8BE5\u6CD5\u5B9D" };
    }
    if (ticked.realmIndex < def.minRealm) {
      return { ok: false, state: ticked, reason: "\u5883\u754C\u4E0D\u8DB3" };
    }
    if (ticked.lingqi < def.cost) {
      return { ok: false, state: ticked, reason: "\u7075\u529B\u4E0D\u8DB3" };
    }
    let next = { ...ticked, lingqi: ticked.lingqi - def.cost };
    next = grantTreasure(next, treasureId);
    return { ok: true, state: next, message: `\u8D2D\u5F97\u300C${def.name}\u300D` };
  }
  function toggleEquip(state, treasureId, slotIndex) {
    const def = getTreasure(treasureId);
    if (!def || !state.treasures.includes(treasureId)) {
      return { ok: false, state, reason: "\u672A\u6301\u6709\u8BE5\u6CD5\u5B9D" };
    }
    let next = syncEquipCapacity(state);
    const slot = def.slot;
    const equipped = {
      combat: [...next.equipped.combat],
      cultivate: [...next.equipped.cultivate],
      assist: [...next.equipped.assist]
    };
    const arr = equipped[slot];
    const wornAt = arr.findIndex((id) => id === treasureId);
    if (wornAt >= 0) {
      arr[wornAt] = null;
      return {
        ok: true,
        state: { ...next, equipped },
        message: `\u5DF2\u5378\u4E0B\u3014${slotLabel(slot)}\u3015`
      };
    }
    let target = typeof slotIndex === "number" && slotIndex >= 0 && slotIndex < arr.length ? slotIndex : arr.findIndex((x) => !x);
    if (target < 0) {
      target = 0;
    }
    arr[target] = treasureId;
    return {
      ok: true,
      state: { ...next, equipped },
      message: `\u5DF2\u88C5\u5907\u81F3\u3014${slotLabel(slot)}\u3015\u69FD${target + 1}`
    };
  }
  function temperTreasure(state, treasureId, now = Date.now()) {
    const blocked = ensurePlaying(state);
    if (blocked) return blocked;
    const def = getTreasure(treasureId);
    if (!def || !state.treasures.includes(treasureId)) {
      return { ok: false, state, reason: "\u672A\u6301\u6709\u8BE5\u6CD5\u5B9D" };
    }
    const ticked = tick(state, now).state;
    const forge = getTreasureForge(ticked, treasureId);
    const tier = treasureEffectiveTier(ticked, treasureId);
    const realm = currentForgeRealm(ticked);
    if (!tierAllowed(realm.maxTier, tier)) {
      return {
        ok: false,
        state: ticked,
        reason: `${realm.name}\u4EC5\u53EF\u70BC${TREASURE_TIER_LABELS[realm.maxTier]}\u53CA\u4EE5\u4E0B`
      };
    }
    const levelCap = Math.min(MAX_TEMPER_LEVEL, realm.maxLevel);
    if (forge.level >= levelCap) {
      return {
        ok: false,
        state: ticked,
        reason: forge.level >= MAX_TEMPER_LEVEL ? "\u5DF2\u8FBE\u70BC\u5668\u4E0A\u9650 +9" : `${realm.name}\u6700\u591A\u70BC\u81F3 +${levelCap}`
      };
    }
    const cost = temperCost(def, forge.level);
    if (ticked.tishu < cost) {
      return { ok: false, state: ticked, reason: "\u4F53\u672F\u4E0D\u8DB3" };
    }
    const treasureForge = {
      ...ticked.treasureForge,
      [treasureId]: { ...forge, level: forge.level + 1 }
    };
    let next = {
      ...ticked,
      tishu: ticked.tishu - cost,
      treasureForge
    };
    next = pushChronicle(
      next,
      `\u70BC\u5668\u300C${def.name}\u300D\u81F3 +${forge.level + 1}\uFF08${TREASURE_TIER_LABELS[tier]}\uFF09\uFF0C\u8017\u4F53\u672F ${cost}\u3002`
    );
    return { ok: true, state: next, message: `\u70BC\u5668\u6210\u529F +${forge.level + 1}` };
  }
  function refineTreasure(state, treasureId, now = Date.now()) {
    const blocked = ensurePlaying(state);
    if (blocked) return blocked;
    const def = getTreasure(treasureId);
    if (!def || !state.treasures.includes(treasureId)) {
      return { ok: false, state, reason: "\u672A\u6301\u6709\u8BE5\u6CD5\u5B9D" };
    }
    const tier = treasureEffectiveTier(state, treasureId);
    if (tier === "immortal" || !def.cons) {
      return { ok: false, state, reason: "\u4ED9\u54C1/\u65E0\u8D1F\u9762\uFF0C\u65E0\u9700\u6D17\u7EC3" };
    }
    const ticked = tick(state, now).state;
    const forge = getTreasureForge(ticked, treasureId);
    if (forge.refined) {
      return { ok: false, state: ticked, reason: "\u5DF2\u6D17\u7EC3\u8FC7" };
    }
    const cost = def.refineCost;
    if (cost <= 0) return { ok: false, state: ticked, reason: "\u65E0\u6CD5\u6D17\u7EC3" };
    if (ticked.tishu < cost) {
      return { ok: false, state: ticked, reason: "\u4F53\u672F\u4E0D\u8DB3" };
    }
    const treasureForge = {
      ...ticked.treasureForge,
      [treasureId]: { ...forge, refined: true }
    };
    let next = {
      ...ticked,
      tishu: ticked.tishu - cost,
      treasureForge
    };
    next = pushChronicle(next, `\u6D17\u7EC3\u300C${def.name}\u300D\uFF0C\u8017\u4F53\u672F ${cost}\uFF0C\u8D1F\u9762\u5C3D\u53BB\u3002`);
    return { ok: true, state: next, message: `\u6D17\u7EC3\u6210\u529F` };
  }
  function promoteTreasure(state, treasureId, now = Date.now()) {
    const blocked = ensurePlaying(state);
    if (blocked) return blocked;
    const def = getTreasure(treasureId);
    if (!def || !state.treasures.includes(treasureId)) {
      return { ok: false, state, reason: "\u672A\u6301\u6709\u8BE5\u6CD5\u5B9D" };
    }
    const ticked = tick(state, now).state;
    const forge = getTreasureForge(ticked, treasureId);
    const tier = treasureEffectiveTier(ticked, treasureId);
    if (forge.level < MAX_TEMPER_LEVEL) {
      return { ok: false, state: ticked, reason: "\u9700\u5148\u70BC\u5668\u81F3 +9 \u65B9\u53EF\u5347\u54C1" };
    }
    const target = TIER_PROMOTE_TARGET[tier];
    if (!target) {
      return { ok: false, state: ticked, reason: "\u5DF2\u662F\u4ED9\u54C1\uFF0C\u65E0\u6CD5\u518D\u5347" };
    }
    const forgeIdx = currentForgeRealmIndex(ticked);
    let promoteRealm = null;
    for (let i = 0; i <= forgeIdx; i++) {
      const r = FORGE_REALMS[i];
      if (r.canPromoteFrom === tier) promoteRealm = r;
    }
    if (!promoteRealm || !promoteRealm.promoteCost) {
      return {
        ok: false,
        state: ticked,
        reason: `\u5F53\u524D\u70BC\u5668\u5883\u65E0\u6CD5\u5C06${TREASURE_TIER_LABELS[tier]}\u5347\u54C1`
      };
    }
    if (ticked.tishu < promoteRealm.promoteCost) {
      return { ok: false, state: ticked, reason: "\u4F53\u672F\u4E0D\u8DB3" };
    }
    const treasureForge = {
      ...ticked.treasureForge,
      [treasureId]: {
        level: 0,
        refined: true,
        tierOverride: target
      }
    };
    let next = {
      ...ticked,
      tishu: ticked.tishu - promoteRealm.promoteCost,
      treasureForge
    };
    next = pushChronicle(
      next,
      `\u5347\u54C1\u300C${def.name}\u300D\uFF1A${TREASURE_TIER_LABELS[tier]} \u2192 ${TREASURE_TIER_LABELS[target]}\uFF0C\u8017\u4F53\u672F ${promoteRealm.promoteCost}\uFF0C\u70BC\u5668\u7B49\u7EA7\u91CD\u7F6E\u3002`
    );
    next = pushMilestone(
      next,
      {
        id: `promote_${treasureId}_${target}`,
        title: `\u5347\u54C1\xB7${def.name}`,
        detail: `${TREASURE_TIER_LABELS[tier]} \u2192 ${TREASURE_TIER_LABELS[target]}`,
        kind: "loot"
      },
      now
    );
    return {
      ok: true,
      state: next,
      message: `\u5347\u4E3A${TREASURE_TIER_LABELS[target]}`
    };
  }
  function sellTreasure(state, treasureId, now = Date.now()) {
    const blocked = ensurePlaying(state);
    if (blocked) return blocked;
    const def = getTreasure(treasureId);
    if (!def || !state.treasures.includes(treasureId)) {
      return { ok: false, state, reason: "\u672A\u6301\u6709\u8BE5\u6CD5\u5B9D" };
    }
    const ticked = tick(state, now).state;
    if (listEquippedIds(ticked.equipped).includes(treasureId)) {
      return { ok: false, state: ticked, reason: "\u8BF7\u5148\u5378\u4E0B\u518D\u51FA\u552E" };
    }
    const gain = sellValue(ticked, treasureId);
    const treasures = ticked.treasures.filter((id) => id !== treasureId);
    const treasureForge = { ...ticked.treasureForge };
    delete treasureForge[treasureId];
    let next = {
      ...ticked,
      treasures,
      treasureForge
    };
    next = grantLingqi(next, gain);
    const got = Math.floor(next.lingqi - ticked.lingqi);
    next = pushChronicle(next, `\u552E\u51FA\u300C${def.name}\u300D\uFF0C\u5F97\u7075\u529B ${got}\u3002`);
    return { ok: true, state: next, message: `\u552E\u51FA\u5F97\u7075\u529B ${formatNumber(got)}` };
  }
  function slotLabel(slot) {
    return EQUIP_SLOT_LABELS[slot];
  }
  function allocatePoint(_state, _key) {
    return {
      ok: false,
      state: _state,
      reason: "\u5C5E\u6027\u7531\u7075\u529B/\u4F53\u672F/\u7CBE\u795E\u529B\u81EA\u52A8\u83B7\u5F97\uFF0C\u65E0\u9700\u624B\u52A8\u5206\u914D"
    };
  }
  function raiseStar(state, now = Date.now()) {
    const blocked = ensurePlaying(state);
    if (blocked) return blocked;
    const ticked = tick(state, now).state;
    if (findPendingEvent(ticked)) {
      return { ok: false, state: ticked, reason: "\u8BF7\u5148\u5B8C\u6210\u5F53\u524D\u6289\u62E9" };
    }
    const cost = raiseStarCost(ticked);
    if (cost == null) return { ok: false, state: ticked, reason: "\u5DF2\u6EE1\u4E5D\u5C42\uFF0C\u53EF\u5C1D\u8BD5\u7834\u5883" };
    if (ticked.lingqi < cost) return { ok: false, state: ticked, reason: "\u7075\u529B\u4E0D\u8DB3" };
    const nextStar = ticked.star + 1;
    let next = updatePeak({
      ...ticked,
      lingqi: ticked.lingqi - cost,
      star: nextStar
    });
    if (nextStar % 3 === 0) {
      next = grantFromFreePoints(next, 1);
    }
    next = pushChronicle(next, `${getRealm(next.realmIndex).name}${nextStar}\u5C42\u3002`);
    const rnd = tryRandomEvent(next, "level", now);
    if (rnd.ok) next = rnd.state;
    return { ok: true, state: next, message: `\u5347\u81F3 ${nextStar} \u5C42` };
  }
  function breakthrough(state, now = Date.now()) {
    const blocked = ensurePlaying(state);
    if (blocked) return blocked;
    const ticked = tick(state, now).state;
    if (findPendingEvent(ticked)) {
      return { ok: false, state: ticked, reason: "\u8BF7\u5148\u5B8C\u6210\u5F53\u524D\u6289\u62E9" };
    }
    const cost = breakthroughCost(ticked);
    if (cost == null) {
      return { ok: false, state: ticked, reason: "\u65E0\u6CD5\u7834\u5883\uFF08\u9700\u4E5D\u5C42\u4E14\u672A\u81F3\u5927\u9053\uFF09" };
    }
    if (ticked.lingqi < cost) return { ok: false, state: ticked, reason: "\u7075\u529B\u4E0D\u8DB3" };
    const pillNeed = breakthroughPillNeed(ticked.realmIndex);
    if (pillNeed) {
      const owned = ticked.pills[pillNeed.pillId] || 0;
      if (owned < pillNeed.count) {
        const name = getPillRecipe(pillNeed.pillId)?.name || pillNeed.pillId;
        return {
          ok: false,
          state: ticked,
          reason: `\u7834\u5883\u9700\u300C${name}\u300D\xD7${pillNeed.count}\uFF08\u80CC\u5305 ${owned}\uFF09`
        };
      }
    }
    const nextIndex = ticked.realmIndex + 1;
    const nextRealm = getRealm(nextIndex);
    const pills = { ...ticked.pills };
    let pillTxt = "";
    if (pillNeed) {
      pills[pillNeed.pillId] = Math.max(0, (pills[pillNeed.pillId] || 0) - pillNeed.count);
      const name = getPillRecipe(pillNeed.pillId)?.name || pillNeed.pillId;
      pillTxt = ` \xB7 \u670D\u300C${name}\u300D\xD7${pillNeed.count}`;
    }
    let next = updatePeak({
      ...ticked,
      lingqi: ticked.lingqi - cost,
      pills,
      realmIndex: nextIndex,
      star: 1
    });
    next = grantFromFreePoints(next, 2);
    next = syncEquipCapacity(next);
    next = pushChronicle(next, `\u7834\u5883\u6210\u529F\uFF1A${nextRealm.name}${pillTxt}\u3002${nextRealm.blurb}`);
    if (nextIndex === 1 || nextIndex === 3 || nextIndex === 6 || nextIndex >= 8) {
      next = pushMilestone(
        next,
        {
          id: `break_${nextRealm.id}`,
          title: `\u7834\u5883\xB7${nextRealm.name}`,
          detail: nextRealm.blurb,
          kind: "other"
        },
        now
      );
    }
    if (nextIndex >= REALMS.length - 1) {
      const ending = matchEnding(next);
      if (ending) {
        const unlocked = next.endingsUnlocked.includes(ending.id) ? next.endingsUnlocked : [...next.endingsUnlocked, ending.id];
        next = {
          ...next,
          endingId: ending.id,
          endingsUnlocked: unlocked,
          phase: "ended"
        };
        next = pushChronicle(next, `\u3010\u7ED3\u5C40\u3011${ending.name}\u2014\u2014${ending.title}`);
        next = pushMilestone(
          next,
          {
            id: `ending_${ending.id}`,
            title: `\u7ED3\u5C40\xB7${ending.name}`,
            detail: ending.title,
            kind: "destiny"
          },
          now
        );
      }
    } else {
      const rnd = tryRandomEvent(next, "level", now);
      if (rnd.ok) next = rnd.state;
    }
    return { ok: true, state: next, message: `\u7834\u5883\u81F3\u300C${nextRealm.name}\u300D` };
  }
  function startCombat(state, enemyId, now = Date.now(), opts) {
    const blocked = ensurePlaying(state);
    if (blocked) return blocked;
    let ticked = syncEquipCapacity(tick(state, now).state);
    const enemy = resolveCombatEncounter(ticked, enemyId);
    if (!enemy) return { ok: false, state, reason: "\u672A\u77E5\u5BF9\u624B" };
    const edgeEvents = [];
    const diffLabel = COMBAT_DIFFICULTY_LABELS[enemy.difficulty] || "";
    let pillBoost = 1;
    let fightAttrs = totalAttrs(ticked);
    if (opts?.pillId) {
      const recipe = getPillRecipe(opts.pillId);
      const owned = ticked.pills[opts.pillId] || 0;
      if (!recipe || owned < 1) {
        return { ok: false, state: ticked, reason: "\u4E39\u836F\u4E0D\u8DB3\uFF0C\u65E0\u6CD5\u6218\u524D\u670D\u7528" };
      }
      const pills = {
        ...ticked.pills,
        [opts.pillId]: owned - 1
      };
      ticked = { ...ticked, pills };
      pillBoost = recipe.effect.combatPowerMult || 1.12;
      if (recipe.effect.combatTempAttrs) {
        fightAttrs = addAttrs(fightAttrs, recipe.effect.combatTempAttrs);
      }
      edgeEvents.push(`\u670D\u300C${recipe.name}\u300D\xB7\u6218\u529B\xD7${pillBoost.toFixed(2)}`);
    }
    const basePower = calcCombatPower(ticked, fightAttrs) * pillBoost;
    const ePower = enemyPower(enemy.attrs, ticked.realmIndex);
    const luck = fightAttrs.luck;
    const edges = gatherCombatEdges(ticked);
    let pPower = basePower;
    if (Math.random() < edges.firstStrikeChance) {
      pPower *= 1 + edges.firstStrikeBonus;
      edgeEvents.push(`\u5148\u624B\xB7\u6218\u529B\xD7${(1 + edges.firstStrikeBonus).toFixed(2)}`);
    }
    if (Math.random() < edges.critChance) {
      pPower *= edges.critMult;
      edgeEvents.push(`\u66B4\u51FB\xB7\u6218\u529B\xD7${edges.critMult.toFixed(2)}`);
    }
    const makeRoll = () => 0.85 + Math.random() * 0.3 + Math.min(0.15, luck * 5e-3);
    let roll = makeRoll();
    let won = pPower * roll >= ePower;
    if (!won && Math.random() < edges.dodgeChance) {
      roll = makeRoll();
      won = pPower * roll >= ePower;
      edgeEvents.push(won ? "\u95EA\u907F\u5F97\u624B\xB7\u518D\u6218\u53D6\u80DC" : "\u95EA\u907F\u5931\u624B\xB7\u4ECD\u8D25");
    }
    if (won) {
      let next2 = grantLingqi(ticked, enemy.rewardLingqi);
      next2 = {
        ...next2,
        combatWins: next2.combatWins + 1
      };
      if (enemy.rewardPoints) next2 = grantFromFreePoints(next2, enemy.rewardPoints);
      next2 = grantResource(next2, "tishu", Math.floor(enemy.rewardLingqi * 0.15));
      next2 = grantResource(next2, "jingshen", Math.floor(enemy.rewardLingqi * 0.12));
      const lootBits = [];
      if (enemy.dropTreasureId && Math.random() < (enemy.dropChance || 0)) {
        next2 = grantTreasure(next2, enemy.dropTreasureId);
        lootBits.push(getTreasure(enemy.dropTreasureId)?.name || enemy.dropTreasureId);
      }
      const extraTreasureChance = 0.12 + COMBAT_TIER_RATIOS[enemy.difficulty] * 0.12;
      if (Math.random() < extraTreasureChance) {
        const pool = TREASURES.filter(
          (t) => t.minRealm <= next2.realmIndex && !next2.treasures.includes(t.id)
        );
        if (pool.length) {
          const pick = pool[Math.floor(Math.random() * pool.length)];
          next2 = grantTreasure(next2, pick.id);
          lootBits.push(pick.name);
        }
      }
      const naturalChance = 0.16 + COMBAT_TIER_RATIOS[enemy.difficulty] * 0.12;
      if (Math.random() < naturalChance) {
        const pool = NATURALS.filter((n) => n.minRealm <= next2.realmIndex);
        if (pool.length) {
          let total = 0;
          for (const n of pool) total += n.weight || 1;
          let r = Math.random() * total;
          let pick = pool[0];
          for (const n of pool) {
            r -= n.weight || 1;
            if (r <= 0) {
              pick = n;
              break;
            }
          }
          next2 = grantNatural(next2, pick.id);
          lootBits.push(pick.name);
        }
      }
      const herbChance = 0.22 + COMBAT_TIER_RATIOS[enemy.difficulty] * 0.12;
      if (Math.random() < herbChance) {
        const pool = HERBS.filter((h) => h.minRealm <= next2.realmIndex);
        if (pool.length) {
          const pick = pool[Math.floor(Math.random() * pool.length)];
          const herbs = { ...next2.herbs, [pick.id]: (next2.herbs[pick.id] || 0) + 1 };
          next2 = { ...next2, herbs };
          lootBits.push(pick.name);
        }
      }
      const loot = lootBits.length ? lootBits.join("\u3001") : void 0;
      const edgeTxt2 = edgeEvents.length ? ` \xB7 ${edgeEvents.join("\u3001")}` : "";
      next2 = pushChronicle(
        next2,
        `\u5BF9\u6218\u80DC\u5229\uFF1A\u51FB\u8D25\u300C${enemy.name}\u300D[${diffLabel}]\uFF08${Math.floor(pPower)} vs ${Math.floor(ePower)} \xB7 \u8D4F ${Math.floor(enemy.rewardLingqi)}\uFF09${edgeTxt2}${loot ? " \xB7 \u7F34\u83B7 " + loot : ""}\u3010${enemy.lore}\u3011`
      );
      return {
        ok: true,
        state: next2,
        won: true,
        playerPower: pPower,
        enemyPower: ePower,
        message: `\u6218\u80DC ${enemy.name}\uFF08${diffLabel}\uFF09`,
        loot,
        edgeEvents
      };
    }
    let next = {
      ...ticked,
      combatLosses: ticked.combatLosses + 1
    };
    const pressure = Math.min(0.12, 0.04 + Math.max(0, ePower - pPower) / Math.max(ePower, 1) * 0.1);
    const deathRoll = Math.random();
    if (deathRoll < pressure) {
      if (Math.random() < edges.plotArmorChance) {
        edgeEvents.push("\u5267\u60C5\u62A4\u7532\xB7\u514D\u6B7B");
        next = grantLingqi(next, -Math.floor(enemy.rewardLingqi * 0.12));
        next = pushChronicle(
          next,
          `\u5BF9\u6218\u5931\u8D25\uFF1A\u9669\u6B7B\u8FD8\u751F\uFF08${edgeEvents.join("\u3001")}\uFF09\uFF0C\u8F7B\u4F24\u9003\u56DE\uFF08${Math.floor(pPower)} vs ${Math.floor(ePower)}\uFF09`
        );
        return {
          ok: true,
          state: next,
          won: false,
          playerPower: pPower,
          enemyPower: ePower,
          message: `\u8D25\u4E8E ${enemy.name}\uFF0C\u62A4\u7532\u4FDD\u547D`,
          defeatOutcome: "bruise",
          edgeEvents
        };
      }
      const dead = die(next, `\u8D25\u4E8E\u300C${enemy.name}\u300D\uFF0C\u4F24\u91CD\u4E0D\u6CBB`, now);
      return {
        ok: true,
        state: dead.state,
        won: false,
        playerPower: pPower,
        enemyPower: ePower,
        message: dead.message,
        defeatOutcome: "death",
        edgeEvents
      };
    }
    if (Math.random() < 0.38) {
      next = demoteRank(next);
      next = grantLingqi(next, -Math.floor(enemy.rewardLingqi * 0.15));
      const edgeTxt2 = edgeEvents.length ? ` \xB7 ${edgeEvents.join("\u3001")}` : "";
      next = pushChronicle(
        next,
        `\u5BF9\u6218\u5931\u8D25\uFF1A\u4E0D\u654C\u300C${enemy.name}\u300D[${diffLabel}]\uFF0C\u5883\u754C\u53D7\u632B\uFF08\u73B0 ${getRealm(next.realmIndex).name}${next.star}\u5C42\uFF09${edgeTxt2}`
      );
      return {
        ok: true,
        state: next,
        won: false,
        playerPower: pPower,
        enemyPower: ePower,
        message: `\u8D25\u4E8E ${enemy.name}\uFF0C\u6389\u6BB5`,
        defeatOutcome: "demote",
        edgeEvents
      };
    }
    next = grantLingqi(next, -Math.floor(enemy.rewardLingqi * 0.08));
    const edgeTxt = edgeEvents.length ? ` \xB7 ${edgeEvents.join("\u3001")}` : "";
    next = pushChronicle(
      next,
      `\u5BF9\u6218\u5931\u8D25\uFF1A\u4E0D\u654C\u300C${enemy.name}\u300D[${diffLabel}]\uFF0C\u8F7B\u4F24\u9003\u56DE\uFF08${Math.floor(pPower)} vs ${Math.floor(ePower)}\uFF09${edgeTxt}`
    );
    return {
      ok: true,
      state: next,
      won: false,
      playerPower: pPower,
      enemyPower: ePower,
      message: `\u8D25\u4E8E ${enemy.name}`,
      defeatOutcome: "bruise",
      edgeEvents
    };
  }
  function demoteRank(state) {
    if (state.star > 1) {
      return { ...state, star: state.star - 1 };
    }
    if (state.realmIndex > 0) {
      return { ...state, realmIndex: state.realmIndex - 1, star: MAX_STAR };
    }
    return state;
  }
  function listCombatEnemies(state) {
    const playerPower = calcCombatPower(state);
    const rng = mulberry32(combatPoolSeed(state));
    let templates = ENEMIES.filter(
      (e) => state.realmIndex >= Math.max(0, e.minRealm - 1) && state.realmIndex <= e.maxRealm + 2
    );
    if (templates.length < 3) {
      templates = ENEMIES.filter(
        (e) => Math.abs(e.minRealm - state.realmIndex) <= 4 || Math.abs(e.maxRealm - state.realmIndex) <= 4
      );
    }
    if (!templates.length) templates = ENEMIES.slice();
    const shuffled = shuffleWith(templates, rng);
    const tiers = ["prey", "fair", "threat"];
    if (state.realmIndex >= 1 || playerPower >= 40 || state.combatWins >= 1) {
      tiers.push("deadly");
    }
    if (state.realmIndex >= 2 || playerPower >= 80 || state.combatWins >= 2) {
      tiers.push("overreach");
    }
    const used = /* @__PURE__ */ new Set();
    const out = [];
    for (let i = 0; i < tiers.length; i++) {
      let pick;
      for (let probe = 0; probe < shuffled.length; probe++) {
        const cand = shuffled[(i + probe) % shuffled.length];
        if (!used.has(cand.id)) {
          pick = cand;
          break;
        }
      }
      if (!pick) pick = shuffled[i % shuffled.length];
      used.add(pick.id);
      out.push(buildCombatEncounter(state, pick, tiers[i], playerPower));
    }
    return out;
  }
  function die(state, reason, now = Date.now()) {
    const ticked = tick(state, now).state;
    let next = updatePeak(ticked);
    next = pushChronicle(next, `\u3010\u8EAB\u6B7B\u3011${reason}`);
    next = pushMilestone(
      next,
      {
        id: `death_${now}`,
        title: "\u8EAB\u6B7B\u9053\u6D88",
        detail: reason,
        kind: "combat"
      },
      now
    );
    const gain = Math.max(1, calcQiyunGain(next));
    let endingsUnlocked = [...next.endingsUnlocked];
    if (next.peakRealmIndex < 2 && !endingsUnlocked.includes("fallen_wild")) {
      endingsUnlocked.push("fallen_wild");
    }
    next = {
      ...next,
      phase: "rebirth",
      deathReason: reason,
      qiyun: next.qiyun + gain,
      endingsUnlocked,
      endingId: null
    };
    next = pushChronicle(
      next,
      `\u8F6E\u56DE\u5C06\u542F\u3002\u672C\u4E16\u5CF0\u503C\u300C${getRealm(next.peakRealmIndex).name}\u300D\uFF0C\u6C14\u8FD0 +${gain}\u3002\u53EF\u7EE7\u627F\u5C5E\u6027\u7EA6 ${Math.floor(getRealm(next.peakRealmIndex).inheritAttrRate * 100)}%\uFF0C\u6CD5\u5B9D\u680F ${getRealm(next.peakRealmIndex).inheritTreasureSlots}\u3002`
    );
    return { ok: true, state: next, message: reason };
  }
  function beginReincarnation(state, now = Date.now()) {
    const ticked = tick(state, now).state;
    const stats = derive(ticked);
    if (ticked.phase === "rebirth") {
      return { ok: false, state: ticked, reason: "\u5DF2\u5728\u8F6E\u56DE\u9009\u62E9\u4E2D" };
    }
    if (!stats.canReincarnate && ticked.phase !== "ended") {
      return { ok: false, state: ticked, reason: "\u9700\u8FBE\u7B51\u57FA\u4EE5\u4E0A\u4E14\u6709\u6C14\u8FD0\u6536\u76CA\uFF0C\u6216\u5DF2\u89E6\u53D1\u7ED3\u5C40" };
    }
    return die(
      ticked,
      ticked.endingId ? "\u9053\u6210\u8EAB\u9000\uFF0C\u4E3B\u52A8\u8F6E\u56DE" : "\u6563\u529F\u8F6E\u56DE\uFF0C\u53E6\u8F9F\u4ED9\u9014",
      now
    );
  }
  function chooseBirth(state, birthId, bringTreasureIds = [], now = Date.now()) {
    if (state.phase !== "rebirth") {
      return { ok: false, state, reason: "\u5F53\u524D\u4E0D\u5728\u8F6E\u56DE\u9009\u62E9\u4E2D" };
    }
    const birth = getBirth(birthId);
    if (!birth) return { ok: false, state, reason: "\u672A\u77E5\u51FA\u8EAB" };
    const peak = getRealm(state.peakRealmIndex);
    const inheritRate = state.reincarnations === 0 && !state.deathReason ? 0 : peak.inheritAttrRate;
    const slots = state.reincarnations === 0 && !state.deathReason ? 0 : peak.inheritTreasureSlots;
    const fromLife = scaleAttrs(addAttrs(state.attrs, artAttrBonus(state)), inheritRate);
    const legacyAttrs = addAttrs(state.legacyAttrs, fromLife);
    let vault = [...state.vault];
    for (const id of state.treasures) {
      const t = getTreasure(id);
      if (t?.vaultable && !vault.includes(id)) vault.push(id);
    }
    const bring = bringTreasureIds.filter((id) => vault.includes(id)).slice(0, Math.max(0, slots));
    const attrs = addAttrs(zeroAttrs(), birth.attrs);
    const flags = [...birth.flags || []];
    const equipped = emptyEquipped(0);
    for (const id of bring) {
      const t = getTreasure(id);
      if (!t) continue;
      const emptyIdx = equipped[t.slot].findIndex((x) => !x);
      if (emptyIdx >= 0) equipped[t.slot][emptyIdx] = id;
    }
    const lifeNo = state.deathReason ? state.reincarnations + 1 : Math.max(1, state.reincarnations);
    const next = {
      lingqi: 0,
      totalLingqi: 0,
      tishu: 0,
      totalTishu: 0,
      jingshen: 0,
      totalJingshen: 0,
      qiyun: state.qiyun,
      owned: emptyOwned(),
      realmIndex: 0,
      star: 1,
      branchId: null,
      factionId: null,
      destinyId: null,
      doneEvents: [],
      flags,
      endingsUnlocked: state.endingsUnlocked,
      endingId: null,
      lastTickAt: now,
      reincarnations: state.deathReason ? state.reincarnations + 1 : state.reincarnations,
      saveVersion: SAVE_VERSION,
      chronicle: [
        `\u7B2C ${lifeNo} \u4E16\uFF1A\u51FA\u8EAB\u300C${birth.name}\u300D\u3002${birth.blurb}`,
        inheritRate > 0 ? `\u7EE7\u627F\u6C38\u4E45\u5C5E\u6027\uFF08${Math.floor(inheritRate * 100)}%\uFF09\uFF0C\u643A\u6CD5\u5B9D ${bring.length}/${slots}\u3002` : "\u521D\u5165\u4ED9\u9014\uFF0C\u5C1A\u65E0\u7EE7\u627F\u3002\u597D\u597D\u6D3B\u7740\u3002",
        "\u4E09\u624D\u7686\u7A7A\uFF1A\u70B9\u51FB\u300C\u7075 / \u4F53 / \u795E\u300D\u5410\u7EB3\u83B7\u53D6\u3002\u504F\u79D1\u4F1A\u6BD4\u4F8B\u7275\u5236\u53E6\u4E24\u9014\uFF08\u6700\u591A \xB115%\uFF09\uFF0C\u6CD5\u5B9D\u53EF\u8C03\u548C\u3002"
      ],
      birthId,
      attrs,
      freePoints: 0,
      treasures: [...bring],
      treasureForge: Object.fromEntries(bring.map((id) => [id, { level: 0, refined: false }])),
      equipped,
      vault,
      naturals: [],
      naturalPassive: 0,
      mainChapter: 1,
      milestones: [],
      legacyAttrs,
      peakRealmIndex: 0,
      phase: "playing",
      deathReason: null,
      combatWins: 0,
      combatLosses: 0,
      randomEventId: null,
      lastRandomAt: 0,
      alchemyMastery: 0,
      herbs: emptyHerbs(),
      pills: emptyPills(),
      bodyStage: 0,
      bodyProgress: 0
    };
    return { ok: true, state: next, message: `\u8F6C\u751F\u4E3A\u300C${birth.name}\u300D` };
  }
  function resolveEvent(state, eventId, optionId, now = Date.now()) {
    const blocked = ensurePlaying(state);
    if (blocked) return blocked;
    const ticked = tick(state, now).state;
    const pending = findPendingEvent(ticked);
    if (!pending || pending.id !== eventId) {
      return { ok: false, state: ticked, reason: "\u5F53\u524D\u6CA1\u6709\u8BE5\u4E8B\u4EF6" };
    }
    const option = pending.options.find((o) => o.id === optionId);
    if (!option) return { ok: false, state: ticked, reason: "\u672A\u77E5\u9009\u9879" };
    if (option.forceDeath) {
      return die(ticked, option.deathReason || "\u4F5C\u6B7B\u8EAB\u4EA1", now);
    }
    let next = {
      ...ticked,
      doneEvents: pending.repeatable ? ticked.doneEvents : [...ticked.doneEvents, eventId],
      randomEventId: null
    };
    if (pending.mainChapter && pending.mainChapter === ticked.mainChapter) {
      next = { ...next, mainChapter: ticked.mainChapter + 1 };
    }
    if (option.set?.branchId) next = { ...next, branchId: option.set.branchId };
    if (option.set?.factionId) next = { ...next, factionId: option.set.factionId };
    if (option.set?.destinyId) next = { ...next, destinyId: option.set.destinyId };
    if (option.flags?.length) {
      const flags = [...next.flags];
      for (const f of option.flags) {
        if (!flags.includes(f)) flags.push(f);
      }
      next = { ...next, flags };
    }
    if (option.lingqiDelta) next = grantLingqi(next, option.lingqiDelta);
    if (option.tishuDelta) next = grantResource(next, "tishu", option.tishuDelta);
    if (option.jingshenDelta) next = grantResource(next, "jingshen", option.jingshenDelta);
    if (option.qiyunDelta) {
      next = { ...next, qiyun: Math.max(0, next.qiyun + option.qiyunDelta) };
    }
    if (option.freePointsDelta && option.freePointsDelta > 0) {
      next = grantFromFreePoints(next, option.freePointsDelta);
    }
    if (option.attrsDelta) {
      next = { ...next, attrs: addAttrs(next.attrs, option.attrsDelta) };
    }
    if (option.grantTreasureId) {
      next = grantTreasure(next, option.grantTreasureId);
    }
    if (option.grantNaturalId) {
      next = grantNatural(next, option.grantNaturalId);
    }
    if (option.grantHerbId && getHerb(option.grantHerbId)) {
      const count = Math.max(1, option.grantHerbCount || 1);
      const herbs = {
        ...next.herbs,
        [option.grantHerbId]: (next.herbs[option.grantHerbId] || 0) + count
      };
      next = { ...next, herbs };
    }
    next = pushChronicle(
      next,
      `\u3010${pending.title}\u3011\u4F60\u9009\u62E9\u4E86\u300C${option.label}\u300D\u3002${option.blurb}${pending.lore ? `\uFF08${pending.lore}\uFF09` : ""}`
    );
    if (pending.mainChapter) {
      next = pushMilestone(
        next,
        {
          id: `main_${pending.mainChapter}`,
          title: pending.title.replace(/^【主线】/, ""),
          detail: `\u9009\u62E9\u300C${option.label}\u300D\u3002${option.blurb}`,
          kind: "main"
        },
        now
      );
    } else if (option.set?.branchId || option.set?.factionId || option.set?.destinyId) {
      next = pushMilestone(
        next,
        {
          id: `path_${eventId}_${optionId}`,
          title: pending.title,
          detail: `\u9009\u62E9\u300C${option.label}\u300D\u3002${option.blurb}`,
          kind: option.set?.destinyId ? "destiny" : "branch"
        },
        now
      );
    } else if (!pending.repeatable && !RANDOM_EVENTS.some((e) => e.id === eventId)) {
      next = pushMilestone(
        next,
        {
          id: `story_${eventId}`,
          title: pending.title,
          detail: `\u9009\u62E9\u300C${option.label}\u300D\u3002${option.blurb}`,
          kind: "other"
        },
        now
      );
    }
    if (option.combatEnemyId) {
      const combat = startCombat(next, option.combatEnemyId, now);
      next = combat.state;
      if (!combat.won && option.deathOnLose) {
        return die(next, option.deathReason || `\u8D25\u4E8E\u5F3A\u654C\uFF0C\u8EAB\u6B7B\u9053\u6D88`, now);
      }
      if (!combat.ok) {
        return { ok: false, state: next, reason: combat.reason };
      }
    }
    const ending = matchEnding(next);
    if (ending && (ending.id === "karmic_fall" || next.realmIndex >= REALMS.length - 1 && !next.endingId)) {
      const unlocked = next.endingsUnlocked.includes(ending.id) ? next.endingsUnlocked : [...next.endingsUnlocked, ending.id];
      next = {
        ...next,
        endingId: ending.id,
        endingsUnlocked: unlocked,
        phase: "ended"
      };
      next = pushChronicle(next, `\u3010\u7ED3\u5C40\u3011${ending.name}\u2014\u2014${ending.title}`);
      next = pushMilestone(
        next,
        {
          id: `ending_${ending.id}`,
          title: `\u7ED3\u5C40\xB7${ending.name}`,
          detail: ending.title,
          kind: "destiny"
        },
        now
      );
    }
    return { ok: true, state: next, message: option.label };
  }
  function buyHerb(state, herbId, now = Date.now()) {
    const blocked = ensurePlaying(state);
    if (blocked) return blocked;
    const def = getHerb(herbId);
    if (!def || def.cost <= 0) return { ok: false, state, reason: "\u65E0\u6CD5\u8D2D\u4E70\u8BE5\u836F\u6750" };
    const ticked = tick(state, now).state;
    if (ticked.realmIndex < def.minRealm) {
      return { ok: false, state: ticked, reason: "\u5883\u754C\u4E0D\u8DB3" };
    }
    if (ticked.lingqi < def.cost) return { ok: false, state: ticked, reason: "\u7075\u529B\u4E0D\u8DB3" };
    const herbs = { ...ticked.herbs, [herbId]: (ticked.herbs[herbId] || 0) + 1 };
    return {
      ok: true,
      state: { ...ticked, lingqi: ticked.lingqi - def.cost, herbs },
      message: `\u8D2D\u5F97\u836F\u6750\u300C${def.name}\u300D`
    };
  }
  function craftPill(state, recipeId, now = Date.now()) {
    const blocked = ensurePlaying(state);
    if (blocked) return blocked;
    const recipe = getPillRecipe(recipeId);
    if (!recipe) return { ok: false, state, reason: "\u672A\u77E5\u4E39\u65B9" };
    const ticked = tick(state, now).state;
    if (ticked.realmIndex < recipe.minRealm) {
      return { ok: false, state: ticked, reason: "\u5883\u754C\u4E0D\u8DB3\uFF0C\u706B\u5019\u4E0D\u591F" };
    }
    for (const [hid, need] of Object.entries(recipe.herbs)) {
      if ((ticked.herbs[hid] || 0) < need) {
        return { ok: false, state: ticked, reason: `\u836F\u6750\u4E0D\u8DB3\uFF1A${getHerb(hid)?.name || hid}` };
      }
    }
    const spent = spendResources(ticked, recipe.costs);
    if (!spent) return { ok: false, state: ticked, reason: "\u4FEE\u70BC\u8D44\u6E90\u4E0D\u8DB3" };
    const herbs = { ...spent.herbs };
    for (const [hid, need] of Object.entries(recipe.herbs)) {
      herbs[hid] = Math.max(0, (herbs[hid] || 0) - need);
    }
    const pills = { ...spent.pills, [recipeId]: (spent.pills[recipeId] || 0) + 1 };
    let next = {
      ...spent,
      herbs,
      pills,
      alchemyMastery: spent.alchemyMastery + (recipe.effect.mastery || 0)
    };
    next = pushChronicle(
      next,
      `\u70BC\u6210\u300C${recipe.name}\u300D\u5165\u5E93\u3002\u4E39\u9053\u7CBE\u901A ${next.alchemyMastery}\u3002\u53EF\u670D\u4E0B\u3001\u6218\u524D\u670D\u7528\u6216\u7834\u5883\u6D88\u8017\uFF0C\u4EA6\u53EF\u9AD8\u4EF7\u51FA\u552E\u3002`
    );
    return { ok: true, state: next, message: `\u70BC\u6210\u300C${recipe.name}\u300D\xB7\u5DF2\u5165\u5E93` };
  }
  function usePill(state, pillId, now = Date.now()) {
    const blocked = ensurePlaying(state);
    if (blocked) return blocked;
    const recipe = getPillRecipe(pillId);
    if (!recipe) return { ok: false, state, reason: "\u672A\u77E5\u4E39\u836F" };
    const ticked = tick(state, now).state;
    const owned = ticked.pills[pillId] || 0;
    if (owned < 1) return { ok: false, state: ticked, reason: "\u80CC\u5305\u4E2D\u65E0\u6B64\u4E39\u836F" };
    const pills = { ...ticked.pills, [pillId]: owned - 1 };
    let next = { ...ticked, pills };
    if (recipe.effect.resources) {
      for (const key of RESOURCE_KEYS) {
        const amt = recipe.effect.resources[key] || 0;
        if (amt) next = grantResource(next, key, amt);
      }
    }
    if (recipe.effect.attrs) {
      next = { ...next, attrs: addAttrs(next.attrs, recipe.effect.attrs) };
    }
    next = pushChronicle(next, `\u670D\u4E0B\u300C${recipe.name}\u300D\uFF0C\u836F\u529B\u878D\u5165\u5DF1\u8EAB\u3002`);
    return { ok: true, state: next, message: `\u670D\u4E0B\u300C${recipe.name}\u300D` };
  }
  function sellHerb(state, herbId, now = Date.now()) {
    const blocked = ensurePlaying(state);
    if (blocked) return blocked;
    const def = getHerb(herbId);
    if (!def) return { ok: false, state, reason: "\u672A\u77E5\u836F\u6750" };
    const ticked = tick(state, now).state;
    const owned = ticked.herbs[herbId] || 0;
    if (owned < 1) return { ok: false, state: ticked, reason: "\u80CC\u5305\u4E2D\u65E0\u6B64\u836F\u6750" };
    const price = sellHerbValue(herbId);
    if (price <= 0) return { ok: false, state: ticked, reason: "\u6B64\u836F\u4E0D\u53EF\u51FA\u552E" };
    const herbs = { ...ticked.herbs, [herbId]: owned - 1 };
    let next = { ...ticked, herbs };
    next = grantLingqi(next, price);
    next = pushChronicle(next, `\u51FA\u552E\u836F\u6750\u300C${def.name}\u300D\uFF0C\u5F97\u7075\u529B ${Math.floor(price)}\u3002`);
    return { ok: true, state: next, message: `\u552E\u51FA\u300C${def.name}\u300D+${Math.floor(price)}\u7075\u529B` };
  }
  function sellPill(state, pillId, now = Date.now()) {
    const blocked = ensurePlaying(state);
    if (blocked) return blocked;
    const recipe = getPillRecipe(pillId);
    if (!recipe) return { ok: false, state, reason: "\u672A\u77E5\u4E39\u836F" };
    const ticked = tick(state, now).state;
    const owned = ticked.pills[pillId] || 0;
    if (owned < 1) return { ok: false, state: ticked, reason: "\u80CC\u5305\u4E2D\u65E0\u6B64\u4E39\u836F" };
    const price = sellPillValue(pillId);
    const pills = { ...ticked.pills, [pillId]: owned - 1 };
    let next = { ...ticked, pills };
    next = grantLingqi(next, price);
    next = pushChronicle(
      next,
      `\u51FA\u552E\u4E39\u836F\u300C${recipe.name}\u300D\uFF0C\u5F97\u7075\u529B ${Math.floor(price)}\uFF08\u70BC\u4E39\u5012\u5356\uFF09\u3002`
    );
    return { ok: true, state: next, message: `\u552E\u51FA\u300C${recipe.name}\u300D+${Math.floor(price)}\u7075\u529B` };
  }
  function temperBody(state, _now = Date.now()) {
    return {
      ok: false,
      state,
      reason: "\u70BC\u4F53\u5DF2\u6539\u4E3A\u70BC\u5668\uFF1A\u7D2F\u8BA1\u4F53\u672F\u51B3\u5B9A\u70BC\u5668\u5883\u754C\uFF0C\u8BF7\u5728\u300C\u70BC\u5668\u300D\u9875\u5F3A\u5316\u6CD5\u5B9D"
    };
  }
  function formatNumber(n) {
    if (!Number.isFinite(n)) return "0";
    const abs = Math.abs(n);
    if (abs < 1e3) return String(Math.floor(n * 10) / 10);
    const units = [
      { v: 1e14, s: "\u4EBF\u4EBF" },
      { v: 1e12, s: "\u4E07\u4EBF" },
      { v: 1e8, s: "\u4EBF" },
      { v: 1e4, s: "\u4E07" }
    ];
    for (const u of units) {
      if (abs >= u.v) {
        const val = n / u.v;
        return (Math.abs(val) >= 100 ? val.toFixed(0) : val.toFixed(2)) + u.s;
      }
    }
    return String(Math.floor(n));
  }
  function getMeta() {
    return {
      version: void 0,
      realms: REALMS.map((r, i) => ({
        index: i,
        id: r.id,
        name: r.name,
        mult: r.mult,
        inheritAttrRate: r.inheritAttrRate,
        inheritTreasureSlots: r.inheritTreasureSlots
      })),
      births: BIRTHS.map((b) => ({
        id: b.id,
        name: b.name,
        blurb: b.blurb,
        freePoints: b.freePoints
      })),
      treasures: TREASURES.map((t) => ({
        id: t.id,
        name: t.name,
        lore: t.lore,
        cost: t.cost,
        minRealm: t.minRealm,
        vaultable: t.vaultable
      })),
      enemies: ENEMIES.map((e) => ({
        id: e.id,
        name: e.name,
        lore: e.lore,
        minRealm: e.minRealm,
        maxRealm: e.maxRealm
      })),
      endings: ENDINGS.map((e) => ({ id: e.id, name: e.name, title: e.title })),
      branches: Object.entries(BRANCH_LABELS).map(([id, v]) => ({ id, ...v })),
      maxOfflineMs: MAX_OFFLINE_MS,
      qiyunBonusPer: QIYUN_BONUS_PER,
      maxStar: MAX_STAR,
      maxEquip: MAX_EQUIP_PER_SLOT,
      equipSlots: EQUIP_SLOTS,
      slotCapacityHint: {
        combat: "\u58830/3/7 \u89E3\u9501 1/2/3 \u683C",
        cultivate: "\u58830/2/6 \u89E3\u9501 1/2/3 \u683C",
        assist: "\u58830/4/8 \u89E3\u9501 1/2/3 \u683C"
      },
      naturals: NATURALS.map((n) => ({ id: n.id, name: n.name, minRealm: n.minRealm })),
      mainStory: MAIN_STORY.map((e) => ({ id: e.id, title: e.title, chapter: e.mainChapter })),
      attrKeys: ATTR_KEYS,
      resourceKeys: RESOURCE_KEYS,
      resourceLabels: RESOURCE_LABELS,
      herbs: HERBS.map((h) => ({ id: h.id, name: h.name, cost: h.cost, minRealm: h.minRealm })),
      pills: PILL_RECIPES.map((p) => ({ id: p.id, name: p.name, minRealm: p.minRealm })),
      forgeRealms: FORGE_REALMS.map((b, i) => ({
        index: i,
        id: b.id,
        name: b.name,
        needTotalTishu: b.needTotalTishu,
        maxTier: b.maxTier,
        maxLevel: b.maxLevel,
        canPromoteFrom: b.canPromoteFrom || null
      })),
      maxTemperLevel: MAX_TEMPER_LEVEL,
      /** @deprecated */
      bodyStages: FORGE_REALMS.map((b, i) => ({ index: i, id: b.id, name: b.name }))
    };
  }

  // xian/src/game/browser.ts
  var LEGACY_SAVE_KEYS = [
    "xian-save-v10",
    "xian-save-v9",
    "xian-save-v8",
    "xian-save-v7",
    "xian-save-v6",
    "xian-save-v5",
    "xian-save-v4",
    "xian-save-v3",
    "xian-save-v2",
    "xian-save-v1"
  ];
  function saveToStorage(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      for (const key of LEGACY_SAVE_KEYS) localStorage.removeItem(key);
    } catch {
    }
  }
  function loadFromStorage(now = Date.now()) {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        for (const key of LEGACY_SAVE_KEYS) {
          raw = localStorage.getItem(key);
          if (raw) break;
        }
      }
      if (!raw) return createNewState(now);
      return loadState(JSON.parse(raw), now);
    } catch {
      return createNewState(now);
    }
  }
  function clearStorage() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      for (const key of LEGACY_SAVE_KEYS) localStorage.removeItem(key);
    } catch {
    }
  }
  var Xian = {
    ARTS,
    ATTR_KEYS,
    ATTR_LABELS,
    BIRTHS,
    BODY_STAGES,
    COMBAT_DIFFICULTY_LABELS,
    FORGE_REALMS,
    BRANCH_LABELS,
    ENDINGS,
    ENEMIES,
    EQUIP_SLOTS,
    EQUIP_SLOT_LABELS,
    HERBS,
    MAIN_STORY,
    MAX_EQUIP_PER_SLOT,
    MAX_OFFLINE_MS,
    MAX_STAR,
    MAX_TEMPER_LEVEL,
    NATURALS,
    PILL_RECIPES,
    QIYUN_BONUS_PER,
    REALMS,
    RESOURCE_KEYS,
    RESOURCE_LABELS,
    SAVE_VERSION,
    STORAGE_KEY,
    STORY_EVENTS,
    TREASURES,
    TREASURE_TIER_LABELS,
    TIER_RANK,
    RANDOM_EVENTS,
    artChannel,
    getEnding,
    getEnemy,
    getHerb,
    getNatural,
    getPillRecipe,
    getRealm,
    getTreasure,
    listEquippedIds,
    slotCapacity,
    allocatePoint,
    artAvailable,
    artCost,
    beginReincarnation,
    breakthrough,
    breakthroughCost,
    breakthroughPillNeed,
    buyArt,
    buyHerb,
    buyTreasure,
    buildCombatEncounter,
    calcCombatPower,
    calcQiyunGain,
    calcTriadMods,
    chooseBirth,
    clickAbsorb,
    combatBaselineReward,
    combatRewardMultiplier,
    craftPill,
    createNewState,
    derive,
    describeTreasureBonus,
    die,
    effectiveTreasureEffects,
    findPendingEvent,
    formatNumber,
    gatherCombatEdges,
    getMeta,
    getTreasureForge,
    listCombatEnemies,
    loadState,
    loadFromStorage,
    makeCombatEncounterId,
    matchEnding,
    parseCombatEncounterId,
    raiseStar,
    raiseStarCost,
    refineTreasure,
    resolveCombatEncounter,
    resolveEvent,
    resourceAttrsFromTotals,
    resourceCaps,
    saveToStorage,
    clearStorage,
    sellHerb,
    sellHerbValue,
    sellPill,
    sellPillValue,
    sellTreasure,
    sellValue,
    startCombat,
    syncEquipCapacity,
    temperBody,
    temperCost,
    temperTreasure,
    promoteTreasure,
    tick,
    toggleEquip,
    totalAttrs,
    tryRandomEvent,
    enemyPower,
    treasureEffectiveTier,
    currentForgeRealm,
    currentForgeRealmIndex,
    usePill
  };
  window.Xian = Xian;
})();
