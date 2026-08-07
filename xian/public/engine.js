"use strict";
(() => {
  // xian/src/game/data.ts
  var MAX_OFFLINE_MS = 8 * 60 * 60 * 1e3;
  var QIYUN_BONUS_PER = 0.08;
  var SAVE_VERSION = 1;
  var STORAGE_KEY = "xian-save-v1";
  var MAX_STAR = 9;
  var MAX_CHRONICLE = 24;
  var REALMS = [
    {
      id: "qi",
      name: "\u6597\u4E4B\u6C14",
      mult: 1,
      starCostBase: 40,
      breakCost: 800,
      blurb: "\u6C14\u611F\u521D\u5F00\uFF0C\u7ECF\u8109\u5982\u7EC6\u7EBF\uFF0C\u6BCF\u4E00\u6B21\u5410\u7EB3\u90FD\u5728\u62D3\u5370\u6839\u57FA\u3002",
      hue: 38
    },
    {
      id: "zhe",
      name: "\u6597\u8005",
      mult: 1.8,
      starCostBase: 220,
      breakCost: 6e3,
      blurb: "\u6597\u6C14\u51DD\u6210\u8584\u96FE\uFF0C\u53EF\u52C9\u5F3A\u50AC\u52A8\u4F4E\u7EA7\u6597\u6280\u3002",
      hue: 32
    },
    {
      id: "shi",
      name: "\u6597\u5E08",
      mult: 3.2,
      starCostBase: 1200,
      breakCost: 4e4,
      blurb: "\u6C14\u6D77\u6210\u5F62\uFF0C\u9053\u9014\u6289\u62E9\u5C06\u5728\u6B64\u5206\u5C94\u3002",
      hue: 28
    },
    {
      id: "dashi",
      name: "\u5927\u6597\u5E08",
      mult: 5.5,
      starCostBase: 7e3,
      breakCost: 25e4,
      blurb: "\u6597\u6C14\u5316\u7FFC\u4E4B\u5146\u521D\u73B0\uFF0C\u5B97\u95E8\u5F00\u59CB\u7559\u610F\u4F60\u7684\u540D\u5B57\u3002",
      hue: 22
    },
    {
      id: "ling",
      name: "\u6597\u7075",
      mult: 9.5,
      starCostBase: 4e4,
      breakCost: 16e5,
      blurb: "\u6597\u6C14\u5316\u7FBD\uFF0C\u7075\u57DF\u53EF\u8986\u5341\u4E08\uFF0C\u5929\u5730\u7075\u6C14\u4E3B\u52A8\u6C47\u805A\u3002",
      hue: 18
    },
    {
      id: "wang",
      name: "\u6597\u738B",
      mult: 16,
      starCostBase: 22e4,
      breakCost: 1e7,
      blurb: "\u4E00\u57DF\u4E4B\u738B\uFF0C\u6C14\u673A\u53EF\u538B\u57CE\u3002\u9ED1\u89D2\u57DF\u4E0E\u6B63\u9053\u7686\u5728\u62DB\u63FD\u3002",
      hue: 12
    },
    {
      id: "huang",
      name: "\u6597\u7687",
      mult: 28,
      starCostBase: 12e5,
      breakCost: 6e7,
      blurb: "\u7687\u5A01\u521D\u663E\uFF0C\u9635\u8425\u7AD9\u961F\u51B3\u5B9A\u4F60\u65E5\u540E\u7684\u654C\u4EBA\u4E0E\u76DF\u53CB\u3002",
      hue: 8
    },
    {
      id: "zong",
      name: "\u6597\u5B97",
      mult: 48,
      starCostBase: 7e6,
      breakCost: 35e7,
      blurb: "\u7A7A\u95F4\u4E4B\u529B\u53EF\u6495\u5F00\u88C2\u9699\uFF0C\u5B97\u4E3B\u4E4B\u4F4D\u5DF2\u5728\u811A\u4E0B\u3002",
      hue: 350
    },
    {
      id: "zun",
      name: "\u6597\u5C0A",
      mult: 85,
      starCostBase: 4e7,
      breakCost: 2e9,
      blurb: "\u5C0A\u8005\u4E00\u6012\uFF0C\u5C71\u6CB3\u53D8\u8272\u3002\u6C14\u8FD0\u6289\u62E9\u5173\u4E4E\u6210\u5E1D\u4E4B\u8DEF\u3002",
      hue: 330
    },
    {
      id: "bansheng",
      name: "\u534A\u5723",
      mult: 150,
      starCostBase: 22e7,
      breakCost: 12e9,
      blurb: "\u534A\u53EA\u811A\u8E0F\u5165\u5723\u5883\uFF0C\u5929\u52AB\u9690\u9690\u4F5C\u54CD\u3002",
      hue: 280
    },
    {
      id: "sheng",
      name: "\u6597\u5723",
      mult: 280,
      starCostBase: 12e8,
      breakCost: 8e10,
      blurb: "\u5723\u5A01\u5982\u6E0A\uFF0C\u4E00\u5FF5\u53EF\u706D\u56FD\u3002\u6597\u5E1D\u4E4B\u95E8\u5728\u4E91\u7AEF\u534A\u5F00\u3002",
      hue: 200
    },
    {
      id: "di",
      name: "\u6597\u5E1D",
      mult: 500,
      starCostBase: 8e9,
      breakCost: 0,
      blurb: "\u5E1D\u4F4D\u4E34\u4E16\uFF0C\u5929\u9053\u4FA7\u76EE\u3002\u6B64\u5883\u4E4B\u4E0A\uFF0C\u552F\u4F59\u4F20\u8BF4\u3002",
      hue: 45
    }
  ];
  var BRANCH_LABELS = {
    flame: {
      name: "\u711A\u708E\u9053\u9014",
      blurb: "\u4EE5\u5F02\u706B\u70BC\u4F53\u70BC\u9B42\uFF0C\u711A\u5C3D\u62E6\u8DEF\u4E4B\u7269\u3002",
      mult: 1.12
    },
    alchemy: {
      name: "\u70BC\u836F\u9053\u9014",
      blurb: "\u4E39\u9999\u5165\u9AA8\uFF0C\u4EE5\u836F\u529B\u8865\u5148\u5929\u4E4B\u7F3A\u3002",
      mult: 1.1
    },
    body: {
      name: "\u9738\u4F53\u9053\u9014",
      blurb: "\u8089\u8EAB\u6210\u5723\uFF0C\u62F3\u53EF\u5D29\u5C71\uFF0C\u4E0D\u501F\u5916\u7269\u3002",
      mult: 1.15
    },
    soul: {
      name: "\u9B42\u566C\u9053\u9014",
      blurb: "\u4EE5\u7075\u9B42\u4E3A\u5203\uFF0C\u8BE1\u5F02\u96BE\u6D4B\uFF0C\u4EA6\u6613\u5165\u9B54\u3002",
      mult: 1.14
    },
    beast: {
      name: "\u517D\u5951\u9053\u9014",
      blurb: "\u4E0E\u9B54\u517D\u5FC3\u610F\u76F8\u901A\uFF0C\u4E07\u517D\u53EF\u4E3A\u7FBD\u7FFC\u3002",
      mult: 1.11
    },
    sword: {
      name: "\u5251\u5FC3\u9053\u9014",
      blurb: "\u4E00\u5251\u7834\u4E07\u6CD5\uFF0C\u6597\u6280\u51DD\u6210\u5251\u610F\u3002",
      mult: 1.13
    }
  };
  var ARTS = [
    // —— 通用吐纳 ——
    {
      id: "tuna_basic",
      name: "\u57FA\u7840\u5410\u7EB3",
      description: "\u6BCF\u6B21\u5410\u7EB3\u5438\u5165\u66F4\u591A\u6597\u6C14\u3002",
      kind: "click",
      baseCost: 15,
      costMult: 1.13,
      power: 0.6,
      minRealm: 0,
      mark: "\u7EB3"
    },
    {
      id: "meridian_open",
      name: "\u6D17\u7ECF\u4F10\u8109",
      description: "\u758F\u901A\u7ECF\u8109\uFF0C\u70B9\u51FB\u5438\u6C14\u66F4\u731B\u3002",
      kind: "click",
      baseCost: 140,
      costMult: 1.15,
      power: 2.2,
      minRealm: 0,
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
      mark: "\u6DA1"
    },
    {
      id: "dragon_breath",
      name: "\u9F99\u606F\u5410\u7EB3",
      description: "\u4EFF\u9F99\u65CF\u547C\u5438\uFF0C\u70B9\u51FB\u529B\u66B4\u6DA8\u3002",
      kind: "click",
      baseCost: 12e3,
      costMult: 1.17,
      power: 35,
      minRealm: 3,
      mark: "\u9F99"
    },
    {
      id: "heaven_draw",
      name: "\u62BD\u5929\u593A\u6C14",
      description: "\u5F3A\u884C\u62BD\u53D6\u5929\u5730\u7075\u6C14\uFF0C\u51F6\u9669\u5374\u6781\u5FEB\u3002",
      kind: "click",
      baseCost: 15e4,
      costMult: 1.18,
      power: 140,
      minRealm: 5,
      mark: "\u593A"
    },
    {
      id: "emperor_inhale",
      name: "\u5E1D\u606F\u4E00\u7F15",
      description: "\u6A21\u62DF\u6597\u5E1D\u547C\u5438\u8282\u594F\uFF0C\u70B9\u51FB\u5982\u6F6E\u3002",
      kind: "click",
      baseCost: 3e6,
      costMult: 1.2,
      power: 600,
      minRealm: 8,
      mark: "\u5E1D"
    },
    // —— 通用运转 ——
    {
      id: "sit_meditation",
      name: "\u9759\u5BA4\u6253\u5750",
      description: "\u6BCF\u79D2\u7F13\u6162\u79EF\u6512\u6597\u6C14\u3002",
      kind: "passive",
      baseCost: 50,
      costMult: 1.12,
      power: 0.4,
      minRealm: 0,
      mark: "\u5750"
    },
    {
      id: "spirit_gather",
      name: "\u805A\u7075\u9635\u7EB9",
      description: "\u5728\u6D1E\u5E9C\u523B\u753B\u805A\u7075\uFF0C\u88AB\u52A8\u63D0\u5347\u3002",
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
      description: "\u5360\u636E\u4E00\u5904\u7075\u8109\uFF0C\u65E5\u591C\u6ECB\u517B\u3002",
      kind: "passive",
      baseCost: 4e3,
      costMult: 1.15,
      power: 10,
      minRealm: 2,
      mark: "\u5E9C"
    },
    {
      id: "sect_salary",
      name: "\u5B97\u95E8\u4FF8\u7984",
      description: "\u6302\u540D\u5B97\u95E8\uFF0C\u6708\u4F8B\u5316\u4E3A\u6597\u6C14\u3002",
      kind: "passive",
      baseCost: 3e4,
      costMult: 1.16,
      power: 45,
      minRealm: 3,
      mark: "\u4FF8"
    },
    {
      id: "domain_tax",
      name: "\u9886\u5730\u6C14\u7A0E",
      description: "\u4EE5\u52BF\u538B\u4EBA\uFF0C\u9886\u5730\u7075\u6C14\u4E0A\u4F9B\u3002",
      kind: "passive",
      baseCost: 25e4,
      costMult: 1.17,
      power: 180,
      minRealm: 5,
      mark: "\u7A0E"
    },
    {
      id: "void_well",
      name: "\u865A\u7A7A\u4E95",
      description: "\u8FDE\u901A\u865A\u7A7A\uFF0C\u6E90\u6E90\u4E0D\u65AD\u3002",
      kind: "passive",
      baseCost: 4e6,
      costMult: 1.18,
      power: 800,
      minRealm: 7,
      mark: "\u4E95"
    },
    {
      id: "heaven_vein",
      name: "\u5929\u8109\u5171\u9E23",
      description: "\u4E0E\u5927\u9646\u5929\u8109\u5171\u9E23\uFF0C\u88AB\u52A8\u5982\u7011\u3002",
      kind: "passive",
      baseCost: 6e7,
      costMult: 1.2,
      power: 3500,
      minRealm: 9,
      mark: "\u5929"
    },
    // —— 焚炎 ——
    {
      id: "flame_seed",
      name: "\u706B\u79CD\u6E29\u517B",
      description: "\u638C\u5FC3\u6E29\u517B\u4E00\u679A\u706B\u79CD\uFF0C\u52A9\u63A8\u5410\u7EB3\u3002",
      kind: "click",
      baseCost: 3e3,
      costMult: 1.16,
      power: 18,
      minRealm: 2,
      branch: "flame",
      mark: "\u706B"
    },
    {
      id: "beast_flame",
      name: "\u517D\u706B\u70BC\u4F53",
      description: "\u4EE5\u517D\u706B\u6DEC\u4F53\uFF0C\u88AB\u52A8\u707C\u70E7\u6742\u8D28\u3002",
      kind: "passive",
      baseCost: 8e3,
      costMult: 1.15,
      power: 22,
      minRealm: 3,
      branch: "flame",
      mark: "\u517D"
    },
    {
      id: "strange_fire",
      name: "\u5F02\u706B\u6B8B\u79CD",
      description: "\u5BFB\u5F97\u5F02\u706B\u6B8B\u79CD\uFF0C\u711A\u5C3D\u963B\u788D\u3002",
      kind: "passive",
      baseCost: 2e5,
      costMult: 1.17,
      power: 120,
      minRealm: 5,
      branch: "flame",
      mark: "\u5F02"
    },
    {
      id: "flame_lotus",
      name: "\u4E09\u5343\u7131\u708E",
      description: "\u706B\u83B2\u7EFD\u653E\uFF0C\u70B9\u51FB\u4E0E\u88AB\u52A8\u7686\u76DB\u3002",
      kind: "click",
      baseCost: 5e6,
      costMult: 1.19,
      power: 900,
      minRealm: 7,
      branch: "flame",
      mark: "\u83B2"
    },
    {
      id: "emperor_flame",
      name: "\u5E1D\u708E\u865A\u5F71",
      description: "\u6A21\u62DF\u5E1D\u7EA7\u5F02\u706B\u865A\u5F71\uFF0C\u88AB\u52A8\u711A\u5929\u3002",
      kind: "passive",
      baseCost: 8e7,
      costMult: 1.21,
      power: 4200,
      minRealm: 9,
      branch: "flame",
      mark: "\u708E"
    },
    // —— 炼药 ——
    {
      id: "herb_pick",
      name: "\u8BC6\u836F\u8FA8\u8349",
      description: "\u91C7\u836F\u5165\u9F0E\uFF0C\u70B9\u51FB\u70BC\u5316\u836F\u529B\u3002",
      kind: "click",
      baseCost: 2800,
      costMult: 1.15,
      power: 16,
      minRealm: 2,
      branch: "alchemy",
      mark: "\u836F"
    },
    {
      id: "cauldron",
      name: "\u9752\u94DC\u4E39\u7089",
      description: "\u4E39\u7089\u5E38\u71C3\uFF0C\u88AB\u52A8\u51FA\u4E39\u3002",
      kind: "passive",
      baseCost: 9e3,
      costMult: 1.15,
      power: 24,
      minRealm: 3,
      branch: "alchemy",
      mark: "\u7089"
    },
    {
      id: "soul_flame_refine",
      name: "\u9B42\u706B\u70BC\u836F",
      description: "\u4EE5\u7075\u9B42\u4E4B\u706B\u63A7\u4E39\uFF0C\u6210\u4E39\u7387\u5927\u589E\u3002",
      kind: "passive",
      baseCost: 22e4,
      costMult: 1.17,
      power: 130,
      minRealm: 5,
      branch: "alchemy",
      mark: "\u9B42"
    },
    {
      id: "tier8_pill",
      name: "\u516B\u54C1\u4E39\u65B9",
      description: "\u516B\u54C1\u4E39\u836F\u5165\u8179\uFF0C\u5410\u7EB3\u5982\u8679\u3002",
      kind: "click",
      baseCost: 4e6,
      costMult: 1.18,
      power: 850,
      minRealm: 7,
      branch: "alchemy",
      mark: "\u516B"
    },
    {
      id: "pill_tower",
      name: "\u4E39\u5854\u4F20\u627F",
      description: "\u4E39\u5854\u53E4\u7C4D\u52A0\u6301\uFF0C\u88AB\u52A8\u7EF5\u957F\u3002",
      kind: "passive",
      baseCost: 7e7,
      costMult: 1.2,
      power: 4e3,
      minRealm: 9,
      branch: "alchemy",
      mark: "\u5854"
    },
    // —— 霸体 ——
    {
      id: "bone_temper",
      name: "\u953B\u9AA8\u6DEC\u7B4B",
      description: "\u4EE5\u529B\u7834\u5DE7\uFF0C\u70B9\u51FB\u66F4\u521A\u731B\u3002",
      kind: "click",
      baseCost: 3200,
      costMult: 1.16,
      power: 20,
      minRealm: 2,
      branch: "body",
      mark: "\u9AA8"
    },
    {
      id: "blood_boil",
      name: "\u8840\u6C14\u5982\u6F6E",
      description: "\u6C14\u8840\u7FFB\u6D8C\uFF0C\u88AB\u52A8\u4E0D\u606F\u3002",
      kind: "passive",
      baseCost: 1e4,
      costMult: 1.15,
      power: 26,
      minRealm: 3,
      branch: "body",
      mark: "\u8840"
    },
    {
      id: "diamond_body",
      name: "\u91D1\u521A\u4E0D\u574F",
      description: "\u8089\u8EAB\u786C\u6297\u6597\u6280\uFF0C\u6839\u57FA\u6DF1\u539A\u3002",
      kind: "passive",
      baseCost: 28e4,
      costMult: 1.17,
      power: 145,
      minRealm: 5,
      branch: "body",
      mark: "\u91D1"
    },
    {
      id: "titan_fist",
      name: "\u5F00\u5C71\u62F3\u610F",
      description: "\u4E00\u62F3\u5D29\u5C71\uFF0C\u70B9\u51FB\u7206\u53D1\u3002",
      kind: "click",
      baseCost: 55e5,
      costMult: 1.19,
      power: 980,
      minRealm: 7,
      branch: "body",
      mark: "\u62F3"
    },
    {
      id: "immortal_flesh",
      name: "\u4E0D\u706D\u9738\u4F53",
      description: "\u8089\u8EAB\u8FD1\u5723\uFF0C\u88AB\u52A8\u5982\u5C71\u5CB3\u3002",
      kind: "passive",
      baseCost: 9e7,
      costMult: 1.21,
      power: 4500,
      minRealm: 9,
      branch: "body",
      mark: "\u9738"
    },
    // —— 魂噬 ——
    {
      id: "soul_sense",
      name: "\u7075\u9B42\u611F\u77E5",
      description: "\u4EE5\u795E\u8BC6\u641C\u522E\u6E38\u79BB\u6597\u6C14\u3002",
      kind: "click",
      baseCost: 3100,
      costMult: 1.16,
      power: 19,
      minRealm: 2,
      branch: "soul",
      mark: "\u8BC6"
    },
    {
      id: "soul_devour",
      name: "\u566C\u9B42\u6B8B\u8BC0",
      description: "\u541E\u566C\u6B8B\u9B42\uFF0C\u88AB\u52A8\u9634\u51B7\u589E\u957F\u3002",
      kind: "passive",
      baseCost: 9500,
      costMult: 1.16,
      power: 25,
      minRealm: 3,
      branch: "soul",
      mark: "\u566C"
    },
    {
      id: "soul_palace",
      name: "\u7075\u9B42\u6BBF\u5802",
      description: "\u7B51\u7075\u9B42\u6BBF\uFF0C\u7A33\u56FA\u795E\u8BC6\u3002",
      kind: "passive",
      baseCost: 26e4,
      costMult: 1.17,
      power: 135,
      minRealm: 5,
      branch: "soul",
      mark: "\u6BBF"
    },
    {
      id: "soul_storm",
      name: "\u7075\u9B42\u98CE\u66B4",
      description: "\u795E\u8BC6\u5316\u98CE\u66B4\uFF0C\u70B9\u51FB\u5E2D\u5377\u3002",
      kind: "click",
      baseCost: 52e5,
      costMult: 1.19,
      power: 920,
      minRealm: 7,
      branch: "soul",
      mark: "\u66B4"
    },
    {
      id: "heaven_soul",
      name: "\u5929\u9B42\u6B8B\u5377",
      description: "\u6CBE\u67D3\u5929\u9B42\u4E4B\u529B\uFF0C\u88AB\u52A8\u8BE1\u8C32\u3002",
      kind: "passive",
      baseCost: 85e6,
      costMult: 1.21,
      power: 4300,
      minRealm: 9,
      branch: "soul",
      mark: "\u5929"
    },
    // —— 兽契 ——
    {
      id: "beast_whisper",
      name: "\u517D\u8BED\u4F4E\u8BED",
      description: "\u4E0E\u4F4E\u9636\u9B54\u517D\u6C9F\u901A\uFF0C\u5F97\u5176\u7075\u606F\u3002",
      kind: "click",
      baseCost: 2900,
      costMult: 1.15,
      power: 17,
      minRealm: 2,
      branch: "beast",
      mark: "\u8BED"
    },
    {
      id: "contract_pup",
      name: "\u5951\u7EA6\u5E7C\u517D",
      description: "\u7B7E\u4E0B\u7B2C\u4E00\u4EFD\u5951\u7EA6\uFF0C\u88AB\u52A8\u5171\u4EAB\u8840\u8109\u3002",
      kind: "passive",
      baseCost: 8500,
      costMult: 1.15,
      power: 23,
      minRealm: 3,
      branch: "beast",
      mark: "\u5951"
    },
    {
      id: "winged_mount",
      name: "\u7FFC\u517D\u5750\u9A91",
      description: "\u5929\u7A7A\u4EA6\u662F\u730E\u573A\uFF0C\u88AB\u52A8\u52A0\u901F\u3002",
      kind: "passive",
      baseCost: 24e4,
      costMult: 1.17,
      power: 125,
      minRealm: 5,
      branch: "beast",
      mark: "\u7FFC"
    },
    {
      id: "ancient_blood",
      name: "\u53E4\u517D\u7CBE\u8840",
      description: "\u996E\u53E4\u517D\u7CBE\u8840\uFF0C\u70B9\u51FB\u72C2\u66B4\u3002",
      kind: "click",
      baseCost: 48e5,
      costMult: 1.18,
      power: 880,
      minRealm: 7,
      branch: "beast",
      mark: "\u8840"
    },
    {
      id: "beast_king_crown",
      name: "\u4E07\u517D\u671D\u62DC",
      description: "\u517D\u6F6E\u542C\u4EE4\uFF0C\u88AB\u52A8\u5982\u6797\u6D77\u3002",
      kind: "passive",
      baseCost: 75e6,
      costMult: 1.2,
      power: 4100,
      minRealm: 9,
      branch: "beast",
      mark: "\u738B"
    },
    // —— 剑心 ——
    {
      id: "sword_basic",
      name: "\u57FA\u7840\u5251\u5F0F",
      description: "\u4EE5\u5251\u610F\u5F15\u6C14\uFF0C\u5410\u7EB3\u66F4\u950B\u3002",
      kind: "click",
      baseCost: 3e3,
      costMult: 1.16,
      power: 18,
      minRealm: 2,
      branch: "sword",
      mark: "\u5F0F"
    },
    {
      id: "sword_domain",
      name: "\u5251\u57DF\u96CF\u5F62",
      description: "\u5BF8\u8BB8\u5251\u57DF\uFF0C\u88AB\u52A8\u524A\u94C1\u3002",
      kind: "passive",
      baseCost: 9200,
      costMult: 1.15,
      power: 24,
      minRealm: 3,
      branch: "sword",
      mark: "\u57DF"
    },
    {
      id: "flying_sword",
      name: "\u5FA1\u5251\u5343\u91CC",
      description: "\u98DE\u5251\u5DE1\u7A7A\uFF0C\u641C\u7F57\u7075\u6C14\u3002",
      kind: "passive",
      baseCost: 25e4,
      costMult: 1.17,
      power: 128,
      minRealm: 5,
      branch: "sword",
      mark: "\u5FA1"
    },
    {
      id: "sword_heart",
      name: "\u5251\u5FC3\u901A\u660E",
      description: "\u5FC3\u5251\u5408\u4E00\uFF0C\u70B9\u51FB\u7834\u5984\u3002",
      kind: "click",
      baseCost: 5e6,
      costMult: 1.19,
      power: 910,
      minRealm: 7,
      branch: "sword",
      mark: "\u5FC3"
    },
    {
      id: "heaven_slash",
      name: "\u5F00\u5929\u4E00\u5251",
      description: "\u5251\u610F\u95EE\u5929\uFF0C\u88AB\u52A8\u88C2\u7A7A\u3002",
      kind: "passive",
      baseCost: 8e7,
      costMult: 1.21,
      power: 4400,
      minRealm: 9,
      branch: "sword",
      mark: "\u5F00"
    },
    // —— 阵营专属 ——
    {
      id: "orthodox_edict",
      name: "\u6B63\u9053\u6555\u4EE4",
      description: "\u6B63\u9053\u8D44\u6E90\u503E\u659C\uFF0C\u88AB\u52A8\u4E30\u539A\u3002",
      kind: "passive",
      baseCost: 8e5,
      costMult: 1.16,
      power: 220,
      minRealm: 6,
      faction: "orthodox",
      mark: "\u6B63"
    },
    {
      id: "dark_plunder",
      name: "\u9ED1\u89D2\u63A0\u593A",
      description: "\u4EE5\u63A0\u593A\u6362\u8D44\u6E90\uFF0C\u70B9\u51FB\u51F6\u72E0\u3002",
      kind: "click",
      baseCost: 7e5,
      costMult: 1.17,
      power: 260,
      minRealm: 6,
      faction: "dark",
      mark: "\u9ED1"
    },
    {
      id: "hermit_quiet",
      name: "\u9690\u4E16\u6E05\u4FEE",
      description: "\u4E0D\u95EE\u4E16\u4E8B\uFF0C\u6253\u5750\u6548\u7387\u5947\u9AD8\u3002",
      kind: "passive",
      baseCost: 75e4,
      costMult: 1.16,
      power: 240,
      minRealm: 6,
      faction: "hermit",
      mark: "\u9690"
    }
  ];
  var STORY_EVENTS = [
    {
      id: "choose_branch",
      title: "\u9053\u9014\u5206\u5C94",
      body: "\u6597\u5E08\u4E2D\u671F\uFF0C\u4F60\u611F\u5E94\u5230\u516D\u6761\u622A\u7136\u4E0D\u540C\u7684\u6C14\u673A\u3002\u9009\u9519\u53EF\u518D\u8F6E\u56DE\uFF0C\u4F46\u6B64\u4E16\u53EA\u80FD\u6267\u4E00\u6761\u9053\u9014\u8D70\u5230\u5E95\u3002",
      minRealm: 2,
      minStar: 3,
      options: [
        {
          id: "pick_flame",
          label: "\u711A\u708E",
          blurb: BRANCH_LABELS.flame.blurb,
          set: { branchId: "flame" },
          flags: ["path_flame"]
        },
        {
          id: "pick_alchemy",
          label: "\u70BC\u836F",
          blurb: BRANCH_LABELS.alchemy.blurb,
          set: { branchId: "alchemy" },
          flags: ["path_alchemy"]
        },
        {
          id: "pick_body",
          label: "\u9738\u4F53",
          blurb: BRANCH_LABELS.body.blurb,
          set: { branchId: "body" },
          flags: ["path_body"]
        },
        {
          id: "pick_soul",
          label: "\u9B42\u566C",
          blurb: BRANCH_LABELS.soul.blurb,
          set: { branchId: "soul" },
          flags: ["path_soul"]
        },
        {
          id: "pick_beast",
          label: "\u517D\u5951",
          blurb: BRANCH_LABELS.beast.blurb,
          set: { branchId: "beast" },
          flags: ["path_beast"]
        },
        {
          id: "pick_sword",
          label: "\u5251\u5FC3",
          blurb: BRANCH_LABELS.sword.blurb,
          set: { branchId: "sword" },
          flags: ["path_sword"]
        }
      ]
    },
    {
      id: "flame_trial",
      title: "\u706B\u5C71\u8BD5\u70BC",
      body: "\u5730\u5E95\u5CA9\u6D46\u6D8C\u52A8\uFF0C\u4E00\u7F15\u5F02\u706B\u6B8B\u606F\u6251\u9762\u800C\u6765\u3002\u662F\u5F3A\u884C\u541E\u7EB3\uFF0C\u8FD8\u662F\u7A33\u59A5\u6E29\u517B\uFF1F",
      minRealm: 4,
      requireBranch: "flame",
      options: [
        {
          id: "flame_swallow",
          label: "\u5F3A\u884C\u541E\u7EB3",
          blurb: "\u9669\u4E2D\u6C42\u80DC\uFF0C\u83B7\u300C\u5F02\u706B\u4EB2\u548C\u300D\u3002",
          flags: ["strange_fire_affinity"],
          douqiDelta: -5e4,
          qiyunDelta: 1
        },
        {
          id: "flame_nurture",
          label: "\u7A33\u59A5\u6E29\u517B",
          blurb: "\u6839\u57FA\u66F4\u7A33\uFF0C\u83B7\u300C\u706B\u83B2\u82D7\u300D\u3002",
          flags: ["fire_lotus_seed"],
          douqiDelta: 2e4
        }
      ]
    },
    {
      id: "alchemy_auction",
      title: "\u9ED1\u5E02\u4E39\u62CD",
      body: "\u9ED1\u5E02\u51FA\u73B0\u4E00\u4EFD\u6B8B\u7F3A\u516B\u54C1\u4E39\u65B9\u3002\u4E89\u62A2\u8005\u4F17\uFF0C\u4F60\u5982\u4F55\u53D6\u820D\uFF1F",
      minRealm: 4,
      requireBranch: "alchemy",
      options: [
        {
          id: "alchemy_bid",
          label: "\u503E\u56CA\u7ADE\u62CD",
          blurb: "\u6362\u5F97\u4E39\u65B9\uFF0C\u4E39\u5854\u65E5\u540E\u6216\u8BA4\u4F60\u3002",
          flags: ["pill_formula", "dantower_favor"],
          douqiDelta: -8e4
        },
        {
          id: "alchemy_steal",
          label: "\u795E\u8BC6\u7A83\u53D6",
          blurb: "\u8BB0\u4E0B\u534A\u5377\uFF0C\u5374\u67D3\u4E0A\u300C\u76D7\u65B9\u300D\u4E4B\u540D\u3002",
          flags: ["pill_formula", "thief_name"],
          douqiDelta: -1e4
        }
      ]
    },
    {
      id: "body_arena",
      title: "\u89D2\u6597\u573A",
      body: "\u6709\u4EBA\u4EE5\u91CD\u91D1\u8BF7\u4F60\u4E0B\u573A\u786C\u78B0\u3002\u8D62\u5219\u626C\u540D\uFF0C\u8F93\u5219\u4F24\u7B4B\u3002",
      minRealm: 4,
      requireBranch: "body",
      options: [
        {
          id: "body_fight",
          label: "\u4E0B\u573A\u786C\u78B0",
          blurb: "\u6253\u51FA\u540D\u53F7\u300C\u4E0D\u706D\u300D\u3002",
          flags: ["undying_title"],
          douqiDelta: 3e4,
          qiyunDelta: 1
        },
        {
          id: "body_refuse",
          label: "\u62D2\u800C\u4E0D\u6218",
          blurb: "\u6F5C\u5FC3\u953B\u4F53\uFF0C\u83B7\u300C\u9759\u4FEE\u300D\u3002",
          flags: ["quiet_temper"],
          douqiDelta: 5e4
        }
      ]
    },
    {
      id: "soul_whisper",
      title: "\u9AA8\u9AB8\u4F4E\u8BED",
      body: "\u8352\u91CE\u9AA8\u5806\u4E2D\u6709\u6B8B\u9B42\u6C42\u4F60\u5E26\u8D70\u3002\u5B83\u8BB8\u4EE5\u79D8\u6CD5\uFF0C\u4E5F\u5E26\u7740\u6028\u6BD2\u3002",
      minRealm: 4,
      requireBranch: "soul",
      options: [
        {
          id: "soul_accept",
          label: "\u6536\u7EB3\u6B8B\u9B42",
          blurb: "\u5F97\u300C\u5929\u9B42\u7EBF\u7D22\u300D\uFF0C\u4EA6\u6CBE\u300C\u6028\u6BD2\u300D\u3002",
          flags: ["heaven_soul_clue", "resentment"],
          qiyunDelta: 1
        },
        {
          id: "soul_seal",
          label: "\u9547\u538B\u8D85\u5EA6",
          blurb: "\u5FC3\u5883\u6E05\u660E\uFF0C\u83B7\u300C\u51C0\u9B42\u300D\u3002",
          flags: ["pure_soul"],
          douqiDelta: 2e4
        }
      ]
    },
    {
      id: "beast_egg",
      title: "\u53E4\u517D\u86CB",
      body: "\u4F60\u5728\u5C71\u8C37\u53D1\u73B0\u4E00\u679A\u6E29\u70ED\u7684\u517D\u86CB\uFF0C\u58F3\u4E0A\u53E4\u7EB9\u6D41\u52A8\u3002",
      minRealm: 4,
      requireBranch: "beast",
      options: [
        {
          id: "beast_hatch",
          label: "\u4EE5\u8840\u5B75\u5316",
          blurb: "\u7ED3\u4E0B\u751F\u6B7B\u5951\uFF0C\u83B7\u300C\u53E4\u517D\u4F34\u300D\u3002",
          flags: ["ancient_companion"],
          douqiDelta: -3e4,
          qiyunDelta: 1
        },
        {
          id: "beast_sell",
          label: "\u5356\u4E88\u5546\u4F1A",
          blurb: "\u6362\u6765\u6D77\u91CF\u8D44\u6E90\uFF0C\u5374\u5931\u673A\u7F18\u3002",
          flags: ["sold_destiny"],
          douqiDelta: 12e4
        }
      ]
    },
    {
      id: "sword_grave",
      title: "\u5251\u51A2\u4E00\u591C",
      body: "\u4E07\u5251\u55E1\u9E23\uFF0C\u4E00\u5EA7\u53E4\u5251\u4E3B\u52A8\u98DE\u8D77\uFF0C\u60AC\u4E8E\u4F60\u7709\u5FC3\u3002",
      minRealm: 4,
      requireBranch: "sword",
      options: [
        {
          id: "sword_bond",
          label: "\u4EE5\u5FC3\u8BA4\u5251",
          blurb: "\u5251\u610F\u5165\u4F53\uFF0C\u83B7\u300C\u5FC3\u5251\u300D\u3002",
          flags: ["heart_sword"],
          douqiDelta: -2e4,
          qiyunDelta: 1
        },
        {
          id: "sword_leave",
          label: "\u4E00\u62DC\u79BB\u53BB",
          blurb: "\u4E0D\u8D2A\u4E0D\u6267\uFF0C\u83B7\u300C\u7A7A\u660E\u300D\u3002",
          flags: ["sword_empty"],
          douqiDelta: 4e4
        }
      ]
    },
    {
      id: "choose_faction",
      title: "\u9635\u8425\u62DB\u63FD",
      body: "\u6597\u7687\u4E4B\u5883\uFF0C\u4E09\u65B9\u4F7F\u8005\u540C\u65E5\u81F3\u5E9C\uFF1A\u6B63\u9053\u8054\u76DF\u3001\u9ED1\u89D2\u57DF\u3001\u4EE5\u53CA\u4E00\u4F4D\u4E0D\u7559\u540D\u7684\u9690\u8005\u3002",
      minRealm: 6,
      minStar: 1,
      options: [
        {
          id: "fac_orthodox",
          label: "\u52A0\u5165\u6B63\u9053",
          blurb: "\u8D44\u6E90\u4E0E\u540D\u58F0\uFF0C\u4E5F\u6709\u67B7\u9501\u3002",
          set: { factionId: "orthodox" },
          flags: ["faction_orthodox"],
          douqiDelta: 5e5
        },
        {
          id: "fac_dark",
          label: "\u6295\u5411\u9ED1\u89D2",
          blurb: "\u81EA\u7531\u4E0E\u8840\u8165\u5E76\u5B58\u3002",
          set: { factionId: "dark" },
          flags: ["faction_dark"],
          douqiDelta: 8e5,
          qiyunDelta: -1
        },
        {
          id: "fac_hermit",
          label: "\u9690\u4E16\u6563\u4FEE",
          blurb: "\u65E0\u4EBA\u6405\u6270\uFF0C\u4EA6\u65E0\u4EBA\u63F4\u624B\u3002",
          set: { factionId: "hermit" },
          flags: ["faction_hermit"],
          qiyunDelta: 2
        }
      ]
    },
    {
      id: "dark_massacre",
      title: "\u8840\u591C",
      body: "\u9ED1\u89D2\u57DF\u547D\u4F60\u5C60\u4E00\u5EA7\u62D2\u8D21\u7684\u57CE\u3002\u62D2\u5219\u88AB\u8FFD\u6740\uFF0C\u4ECE\u5219\u53CC\u624B\u67D3\u8840\u3002",
      minRealm: 7,
      requireFaction: "dark",
      options: [
        {
          id: "dark_kill",
          label: "\u8840\u6D17\u5168\u57CE",
          blurb: "\u9B54\u540D\u8FDC\u626C\uFF0C\u83B7\u300C\u9B54\u541B\u96CF\u5F62\u300D\u3002",
          flags: ["demon_lord_seed", "blood_hands"],
          douqiDelta: 2e6
        },
        {
          id: "dark_fake",
          label: "\u5047\u62A5\u519B\u60C5",
          blurb: "\u6697\u4E2D\u653E\u4EBA\uFF0C\u83B7\u300C\u53CC\u9762\u300D\u3002",
          flags: ["double_face"],
          douqiDelta: -5e5,
          qiyunDelta: 1
        }
      ]
    },
    {
      id: "orthodox_trial",
      title: "\u6B63\u9053\u5927\u6BD4",
      body: "\u8054\u76DF\u4E3E\u529E\u5927\u6BD4\uFF0C\u9080\u4F60\u538B\u9635\u3002\u662F\u663E\u9732\u950B\u8292\uFF0C\u8FD8\u662F\u85CF\u62D9\uFF1F",
      minRealm: 7,
      requireFaction: "orthodox",
      options: [
        {
          id: "ortho_win",
          label: "\u5168\u529B\u593A\u9B41",
          blurb: "\u6B63\u9053\u9886\u8896\u4E4B\u4F4D\u76F8\u9732\u3002",
          flags: ["alliance_leader"],
          douqiDelta: 1e6,
          qiyunDelta: 1
        },
        {
          id: "ortho_hide",
          label: "\u70B9\u5230\u4E3A\u6B62",
          blurb: "\u5C11\u6811\u654C\uFF0C\u83B7\u300C\u7A33\u91CD\u300D\u3002",
          flags: ["steady_name"],
          douqiDelta: 4e5
        }
      ]
    },
    {
      id: "choose_destiny",
      title: "\u6C14\u8FD0\u6289\u62E9",
      body: "\u6597\u5C0A\u5DC5\u5CF0\uFF0C\u5929\u9053\u964D\u4E0B\u4E09\u9053\u6C14\u673A\uFF1A\u6210\u5E1D\u3001\u5B88\u754C\u3001\u6216\u95EE\u865A\u7A7A\u3002",
      minRealm: 8,
      minStar: 5,
      options: [
        {
          id: "des_emperor",
          label: "\u6267\u610F\u6210\u5E1D",
          blurb: "\u4EE5\u6C14\u8FD0\u8D4C\u90A3\u4E00\u7EBF\u5E1D\u4F4D\u3002",
          set: { destinyId: "emperor" },
          flags: ["destiny_emperor"],
          qiyunDelta: -2
        },
        {
          id: "des_guardian",
          label: "\u9547\u5B88\u5927\u9646",
          blurb: "\u62A4\u4E00\u65B9\u751F\u7075\uFF0C\u6210\u5B88\u62A4\u8005\u3002",
          set: { destinyId: "guardian" },
          flags: ["destiny_guardian"],
          qiyunDelta: 3
        },
        {
          id: "des_void",
          label: "\u95EE\u9053\u865A\u7A7A",
          blurb: "\u629B\u4E0B\u5927\u9646\uFF0C\u8FFD\u9010\u66F4\u9AD8\u672A\u77E5\u3002",
          set: { destinyId: "void" },
          flags: ["destiny_void"],
          douqiDelta: 5e7
        }
      ]
    },
    {
      id: "heaven_tribulation",
      title: "\u5929\u52AB\u5C06\u81F3",
      body: "\u534A\u5723\u5173\u53E3\uFF0C\u4E5D\u8272\u96F7\u4E91\u538B\u9876\u3002\u662F\u786C\u6297\uFF0C\u501F\u9635\uFF0C\u8FD8\u662F\u4EE5\u4ED6\u4EBA\u6321\u707E\uFF1F",
      minRealm: 9,
      minStar: 2,
      options: [
        {
          id: "trib_hard",
          label: "\u8089\u8EAB\u786C\u6297",
          blurb: "\u82E5\u6D3B\uFF0C\u5219\u300C\u52AB\u540E\u4F59\u751F\u300D\u3002",
          flags: ["survived_tribulation"],
          douqiDelta: -2e8,
          qiyunDelta: 2
        },
        {
          id: "trib_array",
          label: "\u501F\u805A\u7075\u9635",
          blurb: "\u7A33\u59A5\u6E21\u52AB\uFF0C\u83B7\u300C\u9635\u6CD5\u6E21\u52AB\u300D\u3002",
          flags: ["array_tribulation"],
          douqiDelta: -5e7
        },
        {
          id: "trib_sacrifice",
          label: "\u79FB\u82B1\u63A5\u6728",
          blurb: "\u707E\u79FB\u4ED6\u4EBA\uFF0C\u83B7\u300C\u56E0\u679C\u503A\u300D\u3002",
          flags: ["karmic_debt", "blood_hands"],
          douqiDelta: 1e8,
          qiyunDelta: -3
        }
      ]
    },
    {
      id: "final_gate",
      title: "\u5E1D\u95E8\u534A\u5F00",
      body: "\u6597\u5723\u5DC5\u5CF0\uFF0C\u4E00\u9053\u5E1D\u95E8\u865A\u5F71\u73B0\u4E8E\u4E91\u7AEF\u3002\u8DE8\u5165\u4E0E\u5426\uFF0C\u51B3\u5B9A\u6B64\u4E16\u6536\u675F\u3002",
      minRealm: 10,
      minStar: 8,
      options: [
        {
          id: "gate_enter",
          label: "\u8E0F\u5165\u5E1D\u95E8",
          blurb: "\u8D4C\u90A3\u6210\u5E1D\u4E00\u7EBF\u3002",
          flags: ["entered_emperor_gate"],
          douqiDelta: -1e10
        },
        {
          id: "gate_wait",
          label: "\u6682\u4E14\u89C2\u671B",
          blurb: "\u518D\u79EF\u6C14\u8FD0\uFF0C\u83B7\u300C\u9690\u5FCD\u300D\u3002",
          flags: ["patient_wait"],
          qiyunDelta: 2
        }
      ]
    }
  ];
  var ENDINGS = [
    {
      id: "yan_di",
      name: "\u708E\u5E1D\u8F6C\u4E16",
      title: "\u5F02\u706B\u5F52\u4F4D\uFF0C\u708E\u5E1D\u4E4B\u540D\u91CD\u4E34",
      body: "\u4F60\u4EE5\u711A\u708E\u9053\u9014\u8D70\u901A\u5E1D\u5883\uFF0C\u5F02\u706B\u4EB2\u548C\u4E0E\u5E1D\u708E\u865A\u5F71\u5171\u9E23\uFF0C\u5927\u9646\u53EA\u8BB0\u5F97\u90A3\u4E00\u56E2\u4E0D\u706D\u7684\u706B\u5149\u3002",
      priority: 100,
      minRealm: 11,
      requireBranch: "flame",
      requireFlags: ["strange_fire_affinity", "entered_emperor_gate"],
      requireArts: { emperor_flame: 1 }
    },
    {
      id: "pill_sovereign",
      name: "\u836F\u5C0A\u65E0\u4E0A",
      title: "\u4E39\u9999\u8986\u9646\uFF0C\u836F\u5C0A\u767B\u4E34",
      body: "\u4E39\u5854\u4F20\u627F\u5728\u4F60\u638C\u4E2D\u7EED\u5199\u3002\u516B\u54C1\u4E4B\u4E0A\uFF0C\u4E39\u6210\u800C\u5E1D\u6210\u3002",
      priority: 95,
      minRealm: 11,
      requireBranch: "alchemy",
      requireFlags: ["dantower_favor", "pill_formula"],
      requireArts: { pill_tower: 1 }
    },
    {
      id: "undying_body",
      name: "\u4E0D\u706D\u9738\u4F53",
      title: "\u8089\u8EAB\u6210\u5E1D\uFF0C\u62F3\u788E\u5929\u52AB",
      body: "\u4F60\u672A\u501F\u5916\u706B\u5916\u4E39\uFF0C\u4EC5\u4EE5\u7B4B\u9AA8\u8840\u6C14\u649E\u5F00\u5E1D\u95E8\u3002\u5C71\u6CB3\u8BB0\u4F4F\u4E86\u90A3\u4E00\u62F3\u3002",
      priority: 95,
      minRealm: 11,
      requireBranch: "body",
      requireFlags: ["undying_title", "survived_tribulation"],
      requireArts: { immortal_flesh: 1 }
    },
    {
      id: "soul_heaven",
      name: "\u9B42\u5929\u5E1D\u5F71",
      title: "\u7075\u9B42\u8986\u5929\uFF0C\u5E1D\u5F71\u5982\u9B45",
      body: "\u5929\u9B42\u6B8B\u5377\u5C55\u5F00\uFF0C\u4F60\u4E0E\u90A3\u9053\u53E4\u8001\u610F\u5FD7\u77ED\u6682\u91CD\u53E0\u3002\u4E16\u4EBA\u79F0\u4F60\u4E3A\u9B42\u5929\u3002",
      priority: 95,
      minRealm: 11,
      requireBranch: "soul",
      requireFlags: ["heaven_soul_clue", "entered_emperor_gate"],
      requireArts: { heaven_soul: 1 }
    },
    {
      id: "beast_sovereign",
      name: "\u4E07\u517D\u5171\u4E3B",
      title: "\u517D\u6F6E\u542C\u4EE4\uFF0C\u5171\u4E3B\u4E34\u4E16",
      body: "\u53E4\u517D\u4F34\u4F60\u5DE6\u53F3\uFF0C\u4E07\u517D\u4F4E\u4F0F\u3002\u5E1D\u4F4D\u4E4B\u4E0A\uFF0C\u4F60\u66F4\u50CF\u4E00\u4F4D\u517D\u539F\u7684\u738B\u3002",
      priority: 95,
      minRealm: 11,
      requireBranch: "beast",
      requireFlags: ["ancient_companion"],
      requireArts: { beast_king_crown: 1 }
    },
    {
      id: "sword_heaven",
      name: "\u5251\u5F00\u5929\u95E8",
      title: "\u4E00\u5251\u95EE\u5929\uFF0C\u95E8\u5F00\u5E1D\u843D",
      body: "\u5FC3\u5251\u51FA\u9798\uFF0C\u5929\u95E8\u4E3A\u4F60\u800C\u88C2\u3002\u5251\u610F\u5373\u5E1D\u610F\u3002",
      priority: 95,
      minRealm: 11,
      requireBranch: "sword",
      requireFlags: ["heart_sword", "entered_emperor_gate"],
      requireArts: { heaven_slash: 1 }
    },
    {
      id: "demon_lord",
      name: "\u9B54\u541B\u4E34\u4E16",
      title: "\u9ED1\u89D2\u5347\u8D77\uFF0C\u9B54\u541B\u8986\u57CE",
      body: "\u8840\u591C\u4E4B\u540E\u518D\u65E0\u56DE\u5934\u8DEF\u3002\u4F60\u4EE5\u9ED1\u89D2\u4E4B\u529B\u8E0F\u5165\u5E1D\u5883\uFF0C\u5927\u9646\u6218\u6817\u3002",
      priority: 90,
      minRealm: 11,
      requireFaction: "dark",
      requireFlags: ["demon_lord_seed", "blood_hands"]
    },
    {
      id: "alliance_king",
      name: "\u6B63\u9053\u76DF\u4E3B",
      title: "\u6555\u4EE4\u5929\u4E0B\uFF0C\u76DF\u4E3B\u9547\u4E16",
      body: "\u6B63\u9053\u5927\u65D7\u5728\u4F60\u8EAB\u540E\u5C55\u5F00\u3002\u5E1D\u4F4D\u662F\u6743\u67C4\uFF0C\u4E5F\u662F\u67B7\u9501\u3002",
      priority: 88,
      minRealm: 11,
      requireFaction: "orthodox",
      requireFlags: ["alliance_leader"],
      requireDestiny: "guardian"
    },
    {
      id: "void_wanderer",
      name: "\u865A\u7A7A\u884C\u8005",
      title: "\u5F03\u9646\u95EE\u865A\uFF0C\u884C\u8E2A\u65E0\u5B9A",
      body: "\u4F60\u672A\u5750\u5E1D\u5EA7\uFF0C\u5374\u8D70\u8FDB\u4E86\u66F4\u6DF1\u7684\u865A\u7A7A\u3002\u6709\u4EBA\u8BF4\u4F60\u6210\u4E86\uFF0C\u6709\u4EBA\u8BF4\u4F60\u6D88\u6563\u4E86\u3002",
      priority: 88,
      minRealm: 10,
      requireDestiny: "void",
      requireFlags: ["destiny_void"]
    },
    {
      id: "hermit_immortal",
      name: "\u900D\u9065\u6563\u4ED9",
      title: "\u9690\u4E16\u6E05\u4FEE\uFF0C\u900D\u9065\u81EA\u5728",
      body: "\u65E0\u4EBA\u77E5\u4F60\u59D3\u540D\uFF0C\u53EA\u5728\u67D0\u5EA7\u65E0\u540D\u5CF0\u9876\uFF0C\u6709\u4EBA\u770B\u89C1\u5E1D\u5149\u4E00\u95EA\u5373\u9690\u3002",
      priority: 85,
      minRealm: 11,
      requireFaction: "hermit",
      requireDestiny: "guardian"
    },
    {
      id: "karmic_fall",
      name: "\u56E0\u679C\u9668\u843D",
      title: "\u503A\u6EE1\u8EAB\u706D\uFF0C\u5E1D\u8DEF\u5D29\u584C",
      body: "\u79FB\u82B1\u63A5\u6728\u7684\u5929\u52AB\u7EC8\u4E8E\u56DE\u6765\u3002\u4F60\u5728\u5E1D\u95E8\u524D\u6563\u4F5C\u98DE\u7070\uFF0C\u53EA\u7559\u4E0B\u4E00\u53E5\u7B11\u3002",
      priority: 120,
      minRealm: 10,
      requireFlags: ["karmic_debt", "entered_emperor_gate"]
    },
    {
      id: "patient_emperor",
      name: "\u9690\u5FCD\u6210\u5E1D",
      title: "\u89C2\u671B\u5343\u65E5\uFF0C\u4E00\u671D\u767B\u4E34",
      body: "\u4F60\u672A\u6025\u7740\u8E0F\u95E8\uFF0C\u6C14\u8FD0\u5806\u53E0\u81F3\u6EE1\uFF0C\u7EC8\u4EE5\u6700\u7A33\u7684\u59FF\u6001\u5750\u4E0B\u5E1D\u5EA7\u3002",
      priority: 80,
      minRealm: 11,
      requireFlags: ["patient_wait"],
      requireDestiny: "emperor",
      minQiyun: 8
    },
    {
      id: "thief_pill",
      name: "\u76D7\u4E39\u90AA\u5C0A",
      title: "\u7A83\u65B9\u6210\u9053\uFF0C\u90AA\u540D\u8FDC\u64AD",
      body: "\u4F60\u4EE5\u76D7\u6765\u7684\u4E39\u65B9\u8D70\u5230\u5DC5\u5CF0\u3002\u4E39\u9999\u4E0E\u6076\u540D\u4E00\u6837\u6D53\u3002",
      priority: 70,
      minRealm: 10,
      requireBranch: "alchemy",
      requireFlags: ["thief_name", "pill_formula"]
    },
    {
      id: "default_emperor",
      name: "\u6597\u5E1D\u767B\u4E34",
      title: "\u5E1D\u4F4D\u843D\u5EA7\uFF0C\u5929\u9053\u4FA7\u76EE",
      body: "\u65E0\u8BBA\u9053\u9014\u5982\u4F55\uFF0C\u4F60\u7EC8\u7A76\u7AD9\u4E0A\u4E86\u90A3\u5EA7\u4EBA\u4EBA\u4EF0\u671B\u7684\u5DC5\u5CF0\u3002\u6B64\u4E16\u843D\u5E55\uFF0C\u8F6E\u56DE\u53EF\u518D\u542F\u3002",
      priority: 10,
      minRealm: 11
    },
    {
      id: "fallen_wild",
      name: "\u9668\u843D\u8352\u91CE",
      title: "\u6C14\u6563\u4EBA\u4EA1\uFF0C\u8352\u91CE\u65E0\u540D\u51A2",
      body: "\u8F6E\u56DE\u4E4B\u65F6\u4F60\u51E0\u4E4E\u4E00\u65E0\u6240\u83B7\u3002\u6709\u4EBA\u5728\u8352\u91CE\u89C1\u8FC7\u4E00\u5177\u67AF\u9AA8\uFF0C\u6597\u6C14\u65E9\u5DF2\u6563\u5C3D\u3002",
      priority: 5,
      minRealm: 0,
      minQiyun: 0
    }
  ];
  function getRealm(index) {
    return REALMS[Math.max(0, Math.min(REALMS.length - 1, index))];
  }
  function getArt(id) {
    return ARTS.find((a) => a.id === id);
  }
  function getEnding(id) {
    return ENDINGS.find((e) => e.id === id);
  }

  // xian/src/game/engine.ts
  function emptyOwned() {
    const owned = {};
    for (const a of ARTS) owned[a.id] = 0;
    return owned;
  }
  function createNewState(now = Date.now()) {
    return {
      douqi: 0,
      totalDouqi: 0,
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
      chronicle: ["\u6C14\u611F\u521D\u5F00\u3002\u4F60\u81EA\u8352\u91CE\u62FE\u8D77\u7B2C\u4E00\u7F15\u6597\u6C14\u3002"]
    };
  }
  function clampInt(n, min, max) {
    const v = Math.floor(Number(n) || 0);
    return Math.max(min, Math.min(max, v));
  }
  function loadState(raw, now = Date.now()) {
    const fresh = createNewState(now);
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
    const lastTickAt = Number(data.lastTickAt);
    const safeLast = Number.isFinite(lastTickAt) && lastTickAt > 0 ? Math.min(lastTickAt, now) : now;
    return {
      douqi: Math.max(0, Number(data.douqi) || 0),
      totalDouqi: Math.max(0, Number(data.totalDouqi) || 0),
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
      chronicle
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
    const fromDouqi = Math.floor(Math.sqrt(state.totalDouqi / 8e4));
    const fromRealm = Math.max(0, state.realmIndex - 2);
    const fromFlags = state.flags.includes("survived_tribulation") ? 2 : 0;
    return Math.max(0, fromDouqi + fromRealm + fromFlags);
  }
  function hasFlags(state, need) {
    if (!need || need.length === 0) return true;
    return need.every((f) => state.flags.includes(f));
  }
  function hasArts(state, need) {
    if (!need) return true;
    return Object.entries(need).every(([id, n]) => (state.owned[id] ?? 0) >= n);
  }
  function matchEnding(state) {
    const candidates = ENDINGS.filter((e) => {
      if (e.id === "fallen_wild") return false;
      if (state.realmIndex < e.minRealm) return false;
      if (e.requireBranch && e.requireBranch !== state.branchId) return false;
      if (e.requireFaction && e.requireFaction !== state.factionId) return false;
      if (e.requireDestiny && e.requireDestiny !== state.destinyId) return false;
      if (e.minQiyun != null && state.qiyun < e.minQiyun) return false;
      if (!hasFlags(state, e.requireFlags)) return false;
      if (!hasArts(state, e.requireArts)) return false;
      return true;
    });
    if (!candidates.length) return null;
    candidates.sort((a, b) => b.priority - a.priority);
    return candidates[0];
  }
  function findPendingEvent(state) {
    if (state.endingId) return null;
    for (const ev of STORY_EVENTS) {
      if (state.doneEvents.includes(ev.id)) continue;
      if (state.realmIndex < ev.minRealm) continue;
      if (ev.minStar != null && state.star < ev.minStar) continue;
      if (ev.requireBranch && ev.requireBranch !== state.branchId) continue;
      if (ev.requireFaction && ev.requireFaction !== state.factionId) continue;
      if (!hasFlags(state, ev.requireFlags)) continue;
      if (ev.id === "choose_branch" && state.branchId) continue;
      if (ev.id === "choose_faction" && state.factionId) continue;
      if (ev.id === "choose_destiny" && state.destinyId) continue;
      return ev;
    }
    return null;
  }
  function pushChronicle(state, line) {
    const chronicle = [...state.chronicle, line].slice(-MAX_CHRONICLE);
    return { ...state, chronicle };
  }
  function grantDouqi(state, amount) {
    if (amount === 0) return state;
    const next = Math.max(0, state.douqi + amount);
    const total = amount > 0 ? state.totalDouqi + amount : state.totalDouqi;
    return { ...state, douqi: next, totalDouqi: total };
  }
  function derive(state) {
    const realm = getRealm(state.realmIndex);
    const qiyunMult = qiyunMultiplier(state.qiyun);
    const realmMult = realm.mult;
    const starMult = starMultiplier(state.star);
    const branchMult = state.branchId ? BRANCH_LABELS[state.branchId].mult : 1;
    let clickBase = 1;
    let passiveBase = 0;
    for (const art of ARTS) {
      if (!artAvailable(state, art)) continue;
      const n = state.owned[art.id] ?? 0;
      if (n <= 0) continue;
      if (art.kind === "click") clickBase += art.power * n;
      else passiveBase += art.power * n;
    }
    const scale = realmMult * starMult * branchMult * qiyunMult;
    const clickPower = clickBase * scale;
    const douqiPerSec = passiveBase * scale;
    const nextStarCost = raiseStarCost(state);
    const breakCost = breakthroughCost(state);
    const canRaiseStar = nextStarCost != null && state.douqi >= nextStarCost;
    const canBreakthrough = breakCost != null && state.douqi >= breakCost;
    const qiyunGain = calcQiyunGain(state);
    const canReincarnate = qiyunGain > 0 && state.realmIndex >= 3;
    return {
      clickPower,
      douqiPerSec,
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
      matchedEnding: matchEnding(state)
    };
  }
  function tick(state, now = Date.now()) {
    const elapsedRaw = Math.max(0, now - state.lastTickAt);
    const elapsed = Math.min(elapsedRaw, MAX_OFFLINE_MS);
    const offlineSeconds = elapsedRaw / 1e3;
    const cappedSeconds = elapsed / 1e3;
    const { douqiPerSec } = derive(state);
    const gained = douqiPerSec * cappedSeconds;
    let next = grantDouqi(state, gained);
    next = { ...next, lastTickAt: now };
    return { state: next, gained, cappedSeconds, offlineSeconds };
  }
  function clickAbsorb(state, now = Date.now()) {
    if (state.endingId) return { ok: false, state, reason: "\u6B64\u4E16\u5DF2\u843D\u5E55" };
    const ticked = tick(state, now).state;
    if (findPendingEvent(ticked)) {
      return { ok: false, state: ticked, reason: "\u8BF7\u5148\u5B8C\u6210\u5F53\u524D\u6289\u62E9" };
    }
    const { clickPower } = derive(ticked);
    return { ok: true, state: grantDouqi(ticked, clickPower) };
  }
  function buyArt(state, artId, now = Date.now()) {
    if (state.endingId) return { ok: false, state, reason: "\u6B64\u4E16\u5DF2\u843D\u5E55" };
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
    if (cost == null || ticked.douqi < cost) {
      return { ok: false, state: ticked, reason: "\u6597\u6C14\u4E0D\u8DB3" };
    }
    const owned = { ...ticked.owned, [artId]: (ticked.owned[artId] ?? 0) + 1 };
    return {
      ok: true,
      state: { ...ticked, douqi: ticked.douqi - cost, owned },
      message: `\u4FEE\u4E60\u300C${def.name}\u300D`
    };
  }
  function raiseStar(state, now = Date.now()) {
    if (state.endingId) return { ok: false, state, reason: "\u6B64\u4E16\u5DF2\u843D\u5E55" };
    const ticked = tick(state, now).state;
    if (findPendingEvent(ticked)) {
      return { ok: false, state: ticked, reason: "\u8BF7\u5148\u5B8C\u6210\u5F53\u524D\u6289\u62E9" };
    }
    const cost = raiseStarCost(ticked);
    if (cost == null) return { ok: false, state: ticked, reason: "\u5DF2\u6EE1\u4E5D\u661F\uFF0C\u53EF\u5C1D\u8BD5\u7834\u5883" };
    if (ticked.douqi < cost) return { ok: false, state: ticked, reason: "\u6597\u6C14\u4E0D\u8DB3" };
    const nextStar = ticked.star + 1;
    let next = {
      ...ticked,
      douqi: ticked.douqi - cost,
      star: nextStar
    };
    next = pushChronicle(next, `${getRealm(next.realmIndex).name}${nextStar}\u661F\u3002\u6C14\u6D77\u53C8\u9614\u4E00\u5206\u3002`);
    return { ok: true, state: next, message: `\u5347\u81F3 ${nextStar} \u661F` };
  }
  function breakthrough(state, now = Date.now()) {
    if (state.endingId) return { ok: false, state, reason: "\u6B64\u4E16\u5DF2\u843D\u5E55" };
    const ticked = tick(state, now).state;
    if (findPendingEvent(ticked)) {
      return { ok: false, state: ticked, reason: "\u8BF7\u5148\u5B8C\u6210\u5F53\u524D\u6289\u62E9" };
    }
    const cost = breakthroughCost(ticked);
    if (cost == null) {
      return { ok: false, state: ticked, reason: "\u65E0\u6CD5\u7834\u5883\uFF08\u9700\u4E5D\u661F\u4E14\u672A\u81F3\u6597\u5E1D\uFF09" };
    }
    if (ticked.douqi < cost) return { ok: false, state: ticked, reason: "\u6597\u6C14\u4E0D\u8DB3" };
    const nextIndex = ticked.realmIndex + 1;
    const nextRealm = getRealm(nextIndex);
    let next = {
      ...ticked,
      douqi: ticked.douqi - cost,
      realmIndex: nextIndex,
      star: 1
    };
    next = pushChronicle(next, `\u7834\u5883\u6210\u529F\uFF1A${nextRealm.name}\u3002${nextRealm.blurb}`);
    if (nextIndex >= REALMS.length - 1) {
      const ending = matchEnding(next);
      if (ending) {
        const unlocked = next.endingsUnlocked.includes(ending.id) ? next.endingsUnlocked : [...next.endingsUnlocked, ending.id];
        next = {
          ...next,
          endingId: ending.id,
          endingsUnlocked: unlocked
        };
        next = pushChronicle(next, `\u3010\u7ED3\u5C40\u3011${ending.name}\u2014\u2014${ending.title}`);
      }
    }
    return { ok: true, state: next, message: `\u7834\u5883\u81F3\u300C${nextRealm.name}\u300D` };
  }
  function resolveEvent(state, eventId, optionId, now = Date.now()) {
    if (state.endingId) return { ok: false, state, reason: "\u6B64\u4E16\u5DF2\u843D\u5E55" };
    const ticked = tick(state, now).state;
    const pending = findPendingEvent(ticked);
    if (!pending || pending.id !== eventId) {
      return { ok: false, state: ticked, reason: "\u5F53\u524D\u6CA1\u6709\u8BE5\u4E8B\u4EF6" };
    }
    const option = pending.options.find((o) => o.id === optionId);
    if (!option) return { ok: false, state: ticked, reason: "\u672A\u77E5\u9009\u9879" };
    let next = {
      ...ticked,
      doneEvents: [...ticked.doneEvents, eventId]
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
    if (option.douqiDelta) next = grantDouqi(next, option.douqiDelta);
    if (option.qiyunDelta) {
      next = {
        ...next,
        qiyun: Math.max(0, next.qiyun + option.qiyunDelta)
      };
    }
    next = pushChronicle(
      next,
      `\u3010${pending.title}\u3011\u4F60\u9009\u62E9\u4E86\u300C${option.label}\u300D\u3002${option.blurb}`
    );
    const ending = matchEnding(next);
    if (ending && (ending.id === "karmic_fall" || next.realmIndex >= REALMS.length - 1 && !next.endingId)) {
      const unlocked = next.endingsUnlocked.includes(ending.id) ? next.endingsUnlocked : [...next.endingsUnlocked, ending.id];
      next = {
        ...next,
        endingId: ending.id,
        endingsUnlocked: unlocked
      };
      next = pushChronicle(next, `\u3010\u7ED3\u5C40\u3011${ending.name}\u2014\u2014${ending.title}`);
    }
    return { ok: true, state: next, message: option.label };
  }
  function reincarnate(state, now = Date.now()) {
    const ticked = tick(state, now).state;
    const stats = derive(ticked);
    if (!stats.canReincarnate && !ticked.endingId) {
      return { ok: false, state: ticked, reason: "\u9700\u8FBE\u5927\u6597\u5E08\u4EE5\u4E0A\u4E14\u6709\u6C14\u8FD0\u6536\u76CA\uFF0C\u6216\u5DF2\u89E6\u53D1\u7ED3\u5C40" };
    }
    const gain = Math.max(stats.qiyunGain, ticked.endingId ? 1 : 0);
    let endingsUnlocked = [...ticked.endingsUnlocked];
    if (!ticked.endingId && gain <= 1 && ticked.realmIndex < 5) {
      const fallen = getEnding("fallen_wild");
      if (fallen && !endingsUnlocked.includes(fallen.id)) {
        endingsUnlocked.push(fallen.id);
      }
    }
    const fresh = createNewState(now);
    const next = {
      ...fresh,
      qiyun: ticked.qiyun + gain,
      endingsUnlocked,
      reincarnations: ticked.reincarnations + 1,
      chronicle: [
        `\u7B2C ${ticked.reincarnations + 1} \u6B21\u8F6E\u56DE\u3002\u6C14\u8FD0 +${gain}\uFF0C\u7D2F\u8BA1\u6C14\u8FD0 ${ticked.qiyun + gain}\u3002`,
        "\u6C14\u611F\u518D\u5F00\u3002\u6B64\u4E16\u9053\u8DEF\uFF0C\u6216\u4E0E\u4E0A\u4E16\u4E0D\u540C\u3002"
      ]
    };
    return {
      ok: true,
      state: next,
      message: `\u8F6E\u56DE\u6210\u529F\uFF0C\u6C14\u8FD0 +${gain}`
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
        breakCost: r.breakCost
      })),
      arts: ARTS.map((a) => ({
        id: a.id,
        name: a.name,
        kind: a.kind,
        minRealm: a.minRealm,
        branch: a.branch ?? null,
        faction: a.faction ?? null
      })),
      branches: Object.entries(BRANCH_LABELS).map(([id, v]) => ({ id, ...v })),
      endings: ENDINGS.map((e) => ({
        id: e.id,
        name: e.name,
        title: e.title,
        priority: e.priority
      })),
      events: STORY_EVENTS.map((e) => ({
        id: e.id,
        title: e.title,
        minRealm: e.minRealm
      })),
      maxOfflineMs: MAX_OFFLINE_MS,
      qiyunBonusPer: QIYUN_BONUS_PER,
      maxStar: MAX_STAR
    };
  }

  // xian/src/game/browser.ts
  function saveToStorage(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
    }
  }
  function loadFromStorage(now = Date.now()) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createNewState(now);
      return loadState(JSON.parse(raw), now);
    } catch {
      return createNewState(now);
    }
  }
  function clearStorage() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
    }
  }
  var Xian = {
    ARTS,
    BRANCH_LABELS,
    ENDINGS,
    MAX_OFFLINE_MS,
    MAX_STAR,
    QIYUN_BONUS_PER,
    REALMS,
    SAVE_VERSION,
    STORAGE_KEY,
    STORY_EVENTS,
    getEnding,
    getRealm,
    artAvailable,
    artCost,
    breakthrough,
    breakthroughCost,
    buyArt,
    calcQiyunGain,
    clickAbsorb,
    createNewState,
    derive,
    findPendingEvent,
    formatNumber,
    getMeta,
    loadState,
    loadFromStorage,
    matchEnding,
    raiseStar,
    raiseStarCost,
    reincarnate,
    resolveEvent,
    saveToStorage,
    clearStorage,
    tick
  };
  window.Xian = Xian;
})();
