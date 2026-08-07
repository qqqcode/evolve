"use strict";
(() => {
  // xian/src/game/data.ts
  var MAX_OFFLINE_MS = 8 * 60 * 60 * 1e3;
  var QIYUN_BONUS_PER = 0.08;
  var SAVE_VERSION = 3;
  var STORAGE_KEY = "xian-save-v3";
  var MAX_STAR = 9;
  var MAX_CHRONICLE = 28;
  var MAX_EQUIP = 3;
  var RANDOM_COOLDOWN_MS = 18e3;
  var RANDOM_CHANCE = {
    click: 0.07,
    level: 0.28,
    time: 0.12
  };
  function zeroAttrs() {
    return { atk: 0, def: 0, spd: 0, spirit: 0, bone: 0, luck: 0 };
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
      description: "\u6BCF\u6B21\u5410\u7EB3\u5438\u5165\u66F4\u591A\u7075\u6C14\u3002",
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
      description: "\u758F\u901A\u7ECF\u8109\uFF0C\u70B9\u51FB\u66F4\u731B\u3002",
      kind: "click",
      baseCost: 140,
      costMult: 1.15,
      power: 2.2,
      minRealm: 0,
      attrs: { bone: 0.2 },
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
      description: "\u6BCF\u79D2\u7F13\u6162\u79EF\u6512\u7075\u6C14\u3002",
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
  var TREASURES = [
    {
      id: "bamboo_cloud_sword",
      name: "\u9752\u7AF9\u8702\u4E91\u5251\u6B8B\u950B",
      description: "\u51E1\u4EBA\u540C\u6B3E\u98DE\u5251\u6B8B\u950B\uFF0C\u5FA1\u5251\u65F6\u603B\u60F3\u558A\u51FA\u5251\u540D\u3002",
      lore: "\u51E1\u4EBA\u4FEE\u4ED9",
      cost: 2500,
      minRealm: 1,
      attrs: { atk: 3, spd: 2 },
      combatMult: 1.05,
      mark: "\u7AF9",
      vaultable: true
    },
    {
      id: "small_bottle",
      name: "\u7EFF\u6DB2\u5C0F\u74F6",
      description: "\u795E\u79D8\u7EFF\u6DB2\uFF0C\u6EF4\u8349\u6728\u75AF\u957F\u3002\u4F60\u6000\u7591\u5B83\u6BD4\u4F60\u8FD8\u6709\u4E3B\u89D2\u5149\u73AF\u3002",
      lore: "\u51E1\u4EBA\u4FEE\u4ED9",
      cost: 0,
      minRealm: 0,
      attrs: { luck: 4, bone: 2, spirit: 1 },
      combatMult: 1.03,
      mark: "\u74F6",
      vaultable: true
    },
    {
      id: "flame_tome",
      name: "\u711A\u8BC0\u6B8B\u9875",
      description: "\u6597\u7834\u540C\u6B3E\uFF1A\u7EC3\u7740\u7EC3\u7740\u5C31\u60F3\u627E\u5F02\u706B\u3002",
      lore: "\u6597\u7834\u82CD\u7A79",
      cost: 6e3,
      minRealm: 2,
      attrs: { atk: 5, bone: 1 },
      combatMult: 1.06,
      mark: "\u711A",
      vaultable: true
    },
    {
      id: "fire_lotus",
      name: "\u9752\u83B2\u5730\u5FC3\u706B\u79CD",
      description: "\u5C0F\u5C0F\u706B\u79CD\uFF0C\u5927\u5927\u6392\u9762\u3002",
      lore: "\u6597\u7834\u82CD\u7A79",
      cost: 0,
      minRealm: 3,
      attrs: { atk: 6, spirit: 2 },
      combatMult: 1.08,
      mark: "\u83B2",
      vaultable: true
    },
    {
      id: "desolate_bone",
      name: "\u8352\u53E4\u6B8B\u9AA8",
      description: "\u906E\u5929\u540C\u6B3E\uFF1A\u6478\u4E00\u4E0B\u6839\u9AA8\u90FD\u5728\u53D1\u5149\u3002",
      lore: "\u906E\u5929",
      cost: 12e3,
      minRealm: 2,
      attrs: { bone: 6, def: 3 },
      combatMult: 1.07,
      mark: "\u8352",
      vaultable: true
    },
    {
      id: "cauldron_lid",
      name: "\u9752\u94DC\u9F0E\u76D6",
      description: "\u7591\u4F3C\u4E5D\u79D8\u76F8\u5173\u3002\u76D6\u4E0A\u80FD\u7838\u4EBA\uFF0C\u63ED\u5F00\u80FD\u88C5\u903C\u3002",
      lore: "\u906E\u5929",
      cost: 4e4,
      minRealm: 4,
      attrs: { def: 5, spirit: 3, atk: 2 },
      combatMult: 1.09,
      mark: "\u9F0E",
      vaultable: true
    },
    {
      id: "mountain_river",
      name: "\u5C71\u6CB3\u8F66\u6B8B\u8F6E",
      description: "\u4ED9\u9006\u540C\u6B3E\uFF1A\u8F6C\u4E00\u4E0B\uFF0C\u5267\u60C5\u5C31\u6C89\u91CD\u4E09\u5206\u3002",
      lore: "\u4ED9\u9006",
      cost: 2e4,
      minRealm: 3,
      attrs: { spirit: 5, atk: 3 },
      combatMult: 1.07,
      mark: "\u8F66",
      vaultable: true
    },
    {
      id: "soul_lamp",
      name: "\u9B42\u706F\u4E00\u76CF",
      description: "\u706F\u706B\u5982\u8C46\uFF0C\u7167\u89C1\u5FC3\u9B54\u3002\u4E5F\u53EF\u80FD\u7167\u89C1\u9694\u58C1\u5077\u529F\u6CD5\u7684\u3002",
      lore: "\u4ED9\u9006",
      cost: 0,
      minRealm: 4,
      attrs: { spirit: 7, luck: 1 },
      combatMult: 1.08,
      mark: "\u706F",
      vaultable: true
    },
    {
      id: "storage_pouch",
      name: "\u4E0B\u54C1\u50A8\u7269\u888B",
      description: "\u80FD\u88C5\u7075\u8349\uFF0C\u4E5F\u80FD\u88C5\u4F60\u7684\u68A6\u60F3\u3002",
      lore: "\u8BF8\u5929\u901A\u7528",
      cost: 400,
      minRealm: 0,
      attrs: { luck: 1 },
      mark: "\u888B",
      vaultable: false
    },
    {
      id: "spirit_boat",
      name: "\u7834\u65E7\u7075\u821F",
      description: "\u901F\u5EA6\u4E00\u822C\uFF0C\u88C5\u903C\u4E00\u6D41\u3002",
      lore: "\u51E1\u4EBA\u4FEE\u4ED9",
      cost: 8e3,
      minRealm: 2,
      attrs: { spd: 5, def: 1 },
      combatMult: 1.04,
      mark: "\u821F",
      vaultable: true
    },
    {
      id: "face_slap_fan",
      name: "\u6253\u8138\u6247",
      description: "\u4E13\u6CBB\u5404\u79CD\u4E0D\u670D\u3002\u5E9F\u67F4\u5F00\u5C40\u65F6\u66B4\u51FB\u7FFB\u500D\uFF08\u5FC3\u7406\u4E0A\uFF09\u3002",
      lore: "\u8BF8\u5929\u6897",
      cost: 3e3,
      minRealm: 1,
      attrs: { atk: 2, luck: 3 },
      combatMult: 1.05,
      mark: "\u6247",
      vaultable: true
    },
    {
      id: "plot_armor",
      name: "\u5267\u60C5\u62A4\u7532",
      description: "\u4F5C\u8005\u4EB2\u5973\u513F\u9650\u5B9A\u3002\u6328\u6253\u4E5F\u80FD\u7AD9\u8D77\u6765\u8BF4\u300C\u6211\u8FD8\u6709\u540E\u624B\u300D\u3002",
      lore: "\u5143\u6897",
      cost: 0,
      minRealm: 0,
      attrs: { def: 4, luck: 5 },
      combatMult: 1.1,
      mark: "\u7532",
      vaultable: true
    },
    {
      id: "heaven_stele",
      name: "\u6B8B\u7834\u5929\u7891",
      description: "\u7891\u4E0A\u5B57\u770B\u4E0D\u6E05\uFF0C\u4F46\u4F60\u9690\u7EA6\u611F\u5230\u300C\u9053\u300D\u3002",
      lore: "\u906E\u5929/\u8BF8\u5929",
      cost: 5e5,
      minRealm: 6,
      attrs: { spirit: 8, bone: 4, atk: 4 },
      combatMult: 1.12,
      mark: "\u7891",
      vaultable: true
    },
    {
      id: "dao_seed",
      name: "\u9053\u79CD\u4E00\u679A",
      description: "\u5927\u9053\u5C06\u6210\u65F6\u624D\u4F1A\u663E\u5316\u7684\u79CD\u5B50\u3002",
      lore: "\u5927\u9053",
      cost: 0,
      minRealm: 10,
      attrs: { atk: 10, def: 10, spd: 10, spirit: 10, bone: 10, luck: 10 },
      combatMult: 1.2,
      mark: "\u79CD",
      vaultable: true
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

  // xian/src/game/types.ts
  var ATTR_KEYS = ["atk", "def", "spd", "spirit", "bone", "luck"];
  var ATTR_LABELS = {
    atk: "\u653B\u4F10",
    def: "\u62A4\u4F53",
    spd: "\u8EAB\u6CD5",
    spirit: "\u795E\u8BC6",
    bone: "\u6839\u9AA8",
    luck: "\u6C14\u673A"
  };

  // xian/src/game/engine.ts
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
  function createMetaState(now = Date.now()) {
    return {
      lingqi: 0,
      totalLingqi: 0,
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
      equipped: [],
      vault: [],
      legacyAttrs: zeroAttrs(),
      peakRealmIndex: 0,
      phase: "rebirth",
      deathReason: null,
      combatWins: 0,
      combatLosses: 0,
      randomEventId: null,
      lastRandomAt: 0
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
    const treasures = Array.isArray(data.treasures) ? data.treasures.filter((f) => typeof f === "string" && !!getTreasure(f)) : [];
    const equipped = Array.isArray(data.equipped) ? data.equipped.filter((f) => typeof f === "string" && treasures.includes(f)).slice(0, MAX_EQUIP) : [];
    const vault = Array.isArray(data.vault) ? data.vault.filter((f) => typeof f === "string" && !!getTreasure(f)) : [];
    const lastTickAt = Number(data.lastTickAt);
    const safeLast = Number.isFinite(lastTickAt) && lastTickAt > 0 ? Math.min(lastTickAt, now) : now;
    const lingqi = Math.max(0, Number(data.lingqi ?? data.douqi) || 0);
    const totalLingqi = Math.max(lingqi, Number(data.totalLingqi ?? data.totalDouqi) || 0);
    const phase = data.phase === "playing" || data.phase === "rebirth" || data.phase === "ended" ? data.phase : data.birthId ? "playing" : "rebirth";
    return {
      lingqi,
      totalLingqi,
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
      freePoints: Math.max(0, Math.floor(Number(data.freePoints) || 0)),
      treasures,
      equipped,
      vault,
      legacyAttrs: parseAttrs(data.legacyAttrs, zeroAttrs()),
      peakRealmIndex: clampInt(data.peakRealmIndex ?? data.realmIndex, 0, REALMS.length - 1),
      phase: !data.birthId && phase === "playing" ? "rebirth" : phase,
      deathReason: typeof data.deathReason === "string" ? data.deathReason : null,
      combatWins: Math.max(0, Math.floor(Number(data.combatWins) || 0)),
      combatLosses: Math.max(0, Math.floor(Number(data.combatLosses) || 0)),
      randomEventId: typeof data.randomEventId === "string" ? data.randomEventId : null,
      lastRandomAt: Math.max(0, Number(data.lastRandomAt) || 0)
    };
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
    const fromLingqi = Math.floor(Math.sqrt(state.totalLingqi / 8e4));
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
  function treasureAttrBonus(state) {
    let sum = zeroAttrs();
    for (const id of state.equipped) {
      const t = getTreasure(id);
      if (t) sum = addAttrs(sum, t.attrs);
    }
    return sum;
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
    return addAttrs(
      addAttrs(addAttrs(state.attrs, state.legacyAttrs), treasureAttrBonus(state)),
      artAttrBonus(state)
    );
  }
  function calcCombatPower(state, attrs) {
    const a = attrs || totalAttrs(state);
    const weighted = a.atk * 1.2 + a.def * 1 + a.spd * 0.9 + a.spirit * 1.1 + a.bone * 0.8 + a.luck * 0.6;
    let mult = 1;
    for (const id of state.equipped) {
      const t = getTreasure(id);
      if (t?.combatMult) mult *= t.combatMult;
    }
    const realmMult = 1 + state.realmIndex * 0.08 + state.star * 0.01;
    return Math.max(1, weighted * mult * realmMult);
  }
  function enemyPower(enemyAttrs, realmIndex) {
    const weighted = enemyAttrs.atk * 1.2 + enemyAttrs.def * 1 + enemyAttrs.spd * 0.9 + enemyAttrs.spirit * 1.1 + enemyAttrs.bone * 0.8 + enemyAttrs.luck * 0.6;
    return Math.max(1, weighted * (1 + realmIndex * 0.05));
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
      const rnd = RANDOM_EVENTS.find((e) => e.id === state.randomEventId);
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
  function grantLingqi(state, amount) {
    if (amount === 0) return state;
    const next = Math.max(0, state.lingqi + amount);
    const total = amount > 0 ? state.totalLingqi + amount : state.totalLingqi;
    return { ...state, lingqi: next, totalLingqi: total };
  }
  function grantTreasure(state, id) {
    if (!getTreasure(id)) return state;
    if (state.treasures.includes(id)) return state;
    const treasures = [...state.treasures, id];
    let equipped = state.equipped;
    if (equipped.length < MAX_EQUIP) equipped = [...equipped, id];
    return pushChronicle(
      { ...state, treasures, equipped },
      `\u83B7\u5F97\u6CD5\u5B9D\u300C${getTreasure(id).name}\u300D\u3010${getTreasure(id).lore}\u3011`
    );
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
    const boneFactor = 1 + attrs.bone * 0.015;
    const spiritFactor = 1 + attrs.spirit * 0.012;
    const luckFactor = 1 + attrs.luck * 0.01;
    let clickBase = 1;
    let passiveBase = 0;
    for (const art of ARTS) {
      if (!artAvailable(state, art)) continue;
      const n = state.owned[art.id] ?? 0;
      if (n <= 0) continue;
      if (art.kind === "click") clickBase += art.power * n;
      else passiveBase += art.power * n;
    }
    const scale = realmMult * starMult * branchMult * qiyunMult * boneFactor;
    const clickPower = clickBase * scale;
    const lingqiPerSec = passiveBase * scale * spiritFactor * luckFactor;
    const nextStarCost = raiseStarCost(state);
    const breakCost = breakthroughCost(state);
    const playing = state.phase === "playing" && !state.endingId;
    const canRaiseStar = playing && nextStarCost != null && state.lingqi >= nextStarCost;
    const canBreakthrough = playing && breakCost != null && state.lingqi >= breakCost;
    const peakRealm = getRealm(state.peakRealmIndex);
    const qiyunGain = calcQiyunGain(state);
    const canReincarnate = state.phase === "playing" && (qiyunGain > 0 && state.realmIndex >= 2 || !!state.endingId);
    return {
      clickPower,
      lingqiPerSec,
      qiyunMult,
      realmMult,
      starMult,
      branchMult,
      realm,
      nextStarCost,
      breakCost,
      canRaiseStar,
      canBreakthrough,
      qiyunGain,
      canReincarnate,
      pendingEvent: findPendingEvent(state),
      matchedEnding: matchEnding(state),
      totalAttrs: attrs,
      treasureAttrs: treasureAttrBonus(state),
      combatPower: calcCombatPower(state, attrs),
      inheritPreview: {
        attrRate: peakRealm.inheritAttrRate,
        treasureSlots: peakRealm.inheritTreasureSlots
      }
    };
  }
  function tick(state, now = Date.now()) {
    if (state.phase !== "playing") {
      return { state: { ...state, lastTickAt: now }, gained: 0, cappedSeconds: 0, offlineSeconds: 0 };
    }
    const elapsedRaw = Math.max(0, now - state.lastTickAt);
    const elapsed = Math.min(elapsedRaw, MAX_OFFLINE_MS);
    const offlineSeconds = elapsedRaw / 1e3;
    const cappedSeconds = elapsed / 1e3;
    const { lingqiPerSec } = derive(state);
    const gained = lingqiPerSec * cappedSeconds;
    let next = grantLingqi(state, gained);
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
  function clickAbsorb(state, now = Date.now()) {
    const blocked = ensurePlaying(state);
    if (blocked) return blocked;
    const ticked = tick(state, now).state;
    if (findPendingEvent(ticked)) {
      return { ok: false, state: ticked, reason: "\u8BF7\u5148\u5B8C\u6210\u5F53\u524D\u6289\u62E9" };
    }
    const { clickPower } = derive(ticked);
    let next = grantLingqi(ticked, clickPower);
    const rnd = tryRandomEvent(next, "click", now);
    if (rnd.ok) next = rnd.state;
    return { ok: true, state: next };
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
    if (cost == null || ticked.lingqi < cost) {
      return { ok: false, state: ticked, reason: "\u7075\u6C14\u4E0D\u8DB3" };
    }
    const owned = { ...ticked.owned, [artId]: (ticked.owned[artId] ?? 0) + 1 };
    return {
      ok: true,
      state: { ...ticked, lingqi: ticked.lingqi - cost, owned },
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
      return { ok: false, state: ticked, reason: "\u7075\u6C14\u4E0D\u8DB3" };
    }
    let next = { ...ticked, lingqi: ticked.lingqi - def.cost };
    next = grantTreasure(next, treasureId);
    return { ok: true, state: next, message: `\u8D2D\u5F97\u300C${def.name}\u300D` };
  }
  function toggleEquip(state, treasureId) {
    if (!state.treasures.includes(treasureId)) {
      return { ok: false, state, reason: "\u672A\u6301\u6709\u8BE5\u6CD5\u5B9D" };
    }
    if (state.equipped.includes(treasureId)) {
      return {
        ok: true,
        state: { ...state, equipped: state.equipped.filter((id) => id !== treasureId) },
        message: "\u5DF2\u5378\u4E0B"
      };
    }
    if (state.equipped.length >= MAX_EQUIP) {
      return { ok: false, state, reason: `\u6700\u591A\u88C5\u5907 ${MAX_EQUIP} \u4EF6\u6CD5\u5B9D` };
    }
    return {
      ok: true,
      state: { ...state, equipped: [...state.equipped, treasureId] },
      message: "\u5DF2\u88C5\u5907"
    };
  }
  function allocatePoint(state, key) {
    if (state.phase !== "playing") return { ok: false, state, reason: "\u5F53\u524D\u65E0\u6CD5\u5206\u914D\u5C5E\u6027" };
    if (state.freePoints <= 0) return { ok: false, state, reason: "\u6CA1\u6709\u53EF\u5206\u914D\u5C5E\u6027\u70B9" };
    if (!ATTR_KEYS.includes(key)) return { ok: false, state, reason: "\u672A\u77E5\u5C5E\u6027" };
    return {
      ok: true,
      state: {
        ...state,
        freePoints: state.freePoints - 1,
        attrs: { ...state.attrs, [key]: state.attrs[key] + 1 }
      }
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
    if (ticked.lingqi < cost) return { ok: false, state: ticked, reason: "\u7075\u6C14\u4E0D\u8DB3" };
    const nextStar = ticked.star + 1;
    let next = updatePeak({
      ...ticked,
      lingqi: ticked.lingqi - cost,
      star: nextStar
    });
    if (nextStar % 3 === 0) {
      next = { ...next, freePoints: next.freePoints + 1 };
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
    if (ticked.lingqi < cost) return { ok: false, state: ticked, reason: "\u7075\u6C14\u4E0D\u8DB3" };
    const nextIndex = ticked.realmIndex + 1;
    const nextRealm = getRealm(nextIndex);
    let next = updatePeak({
      ...ticked,
      lingqi: ticked.lingqi - cost,
      realmIndex: nextIndex,
      star: 1,
      freePoints: ticked.freePoints + 2
    });
    next = pushChronicle(next, `\u7834\u5883\u6210\u529F\uFF1A${nextRealm.name}\u3002${nextRealm.blurb}`);
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
      }
    } else {
      const rnd = tryRandomEvent(next, "level", now);
      if (rnd.ok) next = rnd.state;
    }
    return { ok: true, state: next, message: `\u7834\u5883\u81F3\u300C${nextRealm.name}\u300D` };
  }
  function startCombat(state, enemyId, now = Date.now()) {
    const blocked = ensurePlaying(state);
    if (blocked) return blocked;
    const enemy = getEnemy(enemyId);
    if (!enemy) return { ok: false, state, reason: "\u672A\u77E5\u5BF9\u624B" };
    const ticked = tick(state, now).state;
    const pPower = calcCombatPower(ticked);
    const ePower = enemyPower(enemy.attrs, ticked.realmIndex);
    const luck = totalAttrs(ticked).luck;
    const roll = 0.85 + Math.random() * 0.3 + Math.min(0.15, luck * 5e-3);
    const won = pPower * roll >= ePower;
    if (won) {
      let next2 = grantLingqi(ticked, enemy.rewardLingqi);
      next2 = {
        ...next2,
        combatWins: next2.combatWins + 1,
        freePoints: next2.freePoints + (enemy.rewardPoints || 0)
      };
      if (enemy.dropTreasureId && Math.random() < (enemy.dropChance || 0)) {
        next2 = grantTreasure(next2, enemy.dropTreasureId);
      }
      next2 = pushChronicle(
        next2,
        `\u5BF9\u6218\u80DC\u5229\uFF1A\u51FB\u8D25\u300C${enemy.name}\u300D\uFF08\u6218\u529B ${Math.floor(pPower)} vs ${Math.floor(ePower)}\uFF09\u3010${enemy.lore}\u3011`
      );
      return {
        ok: true,
        state: next2,
        won: true,
        playerPower: pPower,
        enemyPower: ePower,
        message: `\u6218\u80DC ${enemy.name}`
      };
    }
    let next = {
      ...ticked,
      combatLosses: ticked.combatLosses + 1
    };
    next = pushChronicle(
      next,
      `\u5BF9\u6218\u5931\u8D25\uFF1A\u4E0D\u654C\u300C${enemy.name}\u300D\uFF08\u6218\u529B ${Math.floor(pPower)} vs ${Math.floor(ePower)}\uFF09`
    );
    return {
      ok: true,
      state: next,
      won: false,
      playerPower: pPower,
      enemyPower: ePower,
      message: `\u8D25\u4E8E ${enemy.name}`
    };
  }
  function listCombatEnemies(state) {
    return ENEMIES.filter(
      (e) => state.realmIndex >= e.minRealm && state.realmIndex <= e.maxRealm + 1
    );
  }
  function die(state, reason, now = Date.now()) {
    const ticked = tick(state, now).state;
    let next = updatePeak(ticked);
    next = pushChronicle(next, `\u3010\u8EAB\u6B7B\u3011${reason}`);
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
    const lifeNo = state.deathReason ? state.reincarnations + 1 : Math.max(1, state.reincarnations);
    const next = {
      lingqi: birth.startLingqi,
      totalLingqi: birth.startLingqi,
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
        inheritRate > 0 ? `\u7EE7\u627F\u6C38\u4E45\u5C5E\u6027\uFF08${Math.floor(inheritRate * 100)}%\uFF09\uFF0C\u643A\u6CD5\u5B9D ${bring.length}/${slots}\u3002` : "\u521D\u5165\u4ED9\u9014\uFF0C\u5C1A\u65E0\u7EE7\u627F\u3002\u597D\u597D\u6D3B\u7740\u3002"
      ],
      birthId,
      attrs,
      freePoints: birth.freePoints,
      treasures: [...bring],
      equipped: bring.slice(0, MAX_EQUIP),
      vault,
      legacyAttrs,
      peakRealmIndex: 0,
      phase: "playing",
      deathReason: null,
      combatWins: 0,
      combatLosses: 0,
      randomEventId: null,
      lastRandomAt: 0
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
    if (option.qiyunDelta) {
      next = { ...next, qiyun: Math.max(0, next.qiyun + option.qiyunDelta) };
    }
    if (option.freePointsDelta) {
      next = { ...next, freePoints: Math.max(0, next.freePoints + option.freePointsDelta) };
    }
    if (option.attrsDelta) {
      next = { ...next, attrs: addAttrs(next.attrs, option.attrsDelta) };
    }
    if (option.grantTreasureId) {
      next = grantTreasure(next, option.grantTreasureId);
    }
    next = pushChronicle(
      next,
      `\u3010${pending.title}\u3011\u4F60\u9009\u62E9\u4E86\u300C${option.label}\u300D\u3002${option.blurb}${pending.lore ? `\uFF08${pending.lore}\uFF09` : ""}`
    );
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
    }
    return { ok: true, state: next, message: option.label };
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
      maxEquip: MAX_EQUIP,
      attrKeys: ATTR_KEYS
    };
  }

  // xian/src/game/browser.ts
  function saveToStorage(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      localStorage.removeItem("xian-save-v1");
    } catch {
    }
  }
  function loadFromStorage(now = Date.now()) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("xian-save-v2") || localStorage.getItem("xian-save-v1");
      if (!raw) return createNewState(now);
      return loadState(JSON.parse(raw), now);
    } catch {
      return createNewState(now);
    }
  }
  function clearStorage() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("xian-save-v2");
      localStorage.removeItem("xian-save-v1");
    } catch {
    }
  }
  var Xian = {
    ARTS,
    ATTR_KEYS,
    ATTR_LABELS,
    BIRTHS,
    BRANCH_LABELS,
    ENDINGS,
    ENEMIES,
    MAX_EQUIP,
    MAX_OFFLINE_MS,
    MAX_STAR,
    QIYUN_BONUS_PER,
    REALMS,
    SAVE_VERSION,
    STORAGE_KEY,
    STORY_EVENTS,
    TREASURES,
    RANDOM_EVENTS,
    getEnding,
    getEnemy,
    getRealm,
    getTreasure,
    allocatePoint,
    artAvailable,
    artCost,
    beginReincarnation,
    breakthrough,
    breakthroughCost,
    buyArt,
    buyTreasure,
    calcCombatPower,
    calcQiyunGain,
    chooseBirth,
    clickAbsorb,
    createNewState,
    derive,
    die,
    findPendingEvent,
    formatNumber,
    getMeta,
    listCombatEnemies,
    loadState,
    loadFromStorage,
    matchEnding,
    raiseStar,
    raiseStarCost,
    resolveEvent,
    saveToStorage,
    clearStorage,
    startCombat,
    tick,
    toggleEquip,
    totalAttrs,
    tryRandomEvent
  };
  window.Xian = Xian;
})();
