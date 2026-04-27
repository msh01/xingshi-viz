import type { OriginTypeGroup, RootGroup, SurnameRecord } from "@/types/surname";

export const rootGroups: RootGroup[] = [
  {
    id: "root-ji",
    name: "姬姓源流",
    description: "周族及姬姓诸侯国分化出的姓氏，是百家姓中极重要的一支。",
    surnameIds: ["wang", "zhou", "wu", "zheng", "lu", "cao"],
  },
  {
    id: "root-jiang",
    name: "姜姓源流",
    description: "相传与炎帝系统相关，齐国、吕国等支派影响深远。",
    surnameIds: ["jiang", "lv", "xu", "qi"],
  },
  {
    id: "root-ying",
    name: "嬴姓源流",
    description: "秦、赵等古国宗族相关支派，常见于先秦封国脉络。",
    surnameIds: ["zhao", "qin", "liang", "ma"],
  },
  {
    id: "root-zi",
    name: "子姓源流",
    description: "商族及宋国相关姓源，常与殷商后裔叙事相连。",
    surnameIds: ["song", "kong", "niu", "wang"],
  },
  {
    id: "root-gui",
    name: "妫姓源流",
    description: "舜帝后裔系统，陈、田、胡等姓氏常见于这一脉络。",
    surnameIds: ["chen", "tian", "hu", "wang"],
  },
];

export const originTypes: OriginTypeGroup[] = [
  {
    id: "ancient-root",
    name: "古姓源头",
    description: "从上古姓源、部族传说或早期宗族系统延展出的姓氏。",
  },
  {
    id: "place",
    name: "封地得姓",
    description: "以封国、采邑、居住地或地望为姓。",
  },
  {
    id: "office",
    name: "官职得姓",
    description: "以官名、职掌、爵号等形成姓氏。",
  },
  {
    id: "ancestor-name",
    name: "祖名得姓",
    description: "以后世尊奉的先祖名、字、谥号为姓。",
  },
  {
    id: "grant",
    name: "赐姓",
    description: "由君主赐予、改赐或褒奖而形成姓氏。",
  },
  {
    id: "changed-name",
    name: "改姓避讳",
    description: "因避难、避讳、迁徙或政治原因改姓。",
  },
  {
    id: "ethnic-fusion",
    name: "民族融合",
    description: "少数民族汉化、复姓简化或族群融合产生的姓氏。",
  },
];

export const surnames: SurnameRecord[] = [
  {
    id: "wang",
    name: "王",
    pinyin: "wang",
    brief: "王姓为典型多源姓氏，常见源流包括姬姓、子姓、妫姓以及民族融合改姓。",
    origins: [
      {
        kind: "ancestor-name",
        sourceRoot: "姬姓源流",
        period: "先秦",
        place: "山西太原",
        ancestor: "太子晋",
        summary: "一支以周灵王太子晋后裔为代表，因王族身份衍为王氏。",
      },
      {
        kind: "ethnic-fusion",
        period: "魏晋南北朝",
        summary: "历史上亦有少数民族汉化改为王姓的记载。",
      },
    ],
    relatedSurnames: ["周", "姬", "赵", "陈"],
  },
  {
    id: "li",
    name: "李",
    pinyin: "li",
    brief: "李姓多与理官传说、陇西地望和唐代国姓扩散相关。",
    origins: [
      {
        kind: "office",
        period: "先秦",
        place: "陇西",
        ancestor: "皋陶",
        summary: "常见说法认为李姓与理官职掌及后世音变相关。",
      },
      {
        kind: "grant",
        period: "隋唐",
        summary: "唐代李氏为国姓，赐姓和依附改姓使其分布进一步扩大。",
      },
    ],
    relatedSurnames: ["理", "赵", "唐"],
  },
  {
    id: "zhao",
    name: "赵",
    pinyin: "zhao",
    brief: "赵姓多归入嬴姓系统，与赵城、赵国及先秦贵族支派相关。",
    origins: [
      {
        kind: "place",
        sourceRoot: "嬴姓源流",
        period: "先秦",
        place: "赵城",
        ancestor: "造父",
        summary: "相传造父受封于赵城，后世以邑为氏。",
      },
    ],
    relatedSurnames: ["秦", "梁", "马"],
  },
  {
    id: "zhou",
    name: "周",
    pinyin: "zhou",
    brief: "周姓常与周王室、周地和姬姓支派相关。",
    origins: [
      {
        kind: "place",
        sourceRoot: "姬姓源流",
        period: "先秦",
        place: "岐周",
        summary: "周王室及其后裔中有以国号、地名为氏者。",
      },
    ],
    relatedSurnames: ["姬", "吴", "郑"],
  },
  {
    id: "wu",
    name: "吴",
    pinyin: "wu",
    brief: "吴姓常见源头为姬姓吴国，兼有地名和国名得姓色彩。",
    origins: [
      {
        kind: "place",
        sourceRoot: "姬姓源流",
        period: "先秦",
        place: "吴地",
        ancestor: "太伯",
        summary: "吴国后裔以国为氏，是吴姓重要来源之一。",
      },
    ],
    relatedSurnames: ["周", "泰", "郑"],
  },
  {
    id: "zheng",
    name: "郑",
    pinyin: "zheng",
    brief: "郑姓多源于姬姓郑国，属于典型国名为氏。",
    origins: [
      {
        kind: "place",
        sourceRoot: "姬姓源流",
        period: "先秦",
        place: "郑国",
        summary: "郑国亡后，宗族及国人有以国为氏者。",
      },
    ],
    relatedSurnames: ["周", "姬", "韩"],
  },
  {
    id: "lu",
    name: "鲁",
    pinyin: "lu",
    brief: "鲁姓多与鲁国及周公后裔相关。",
    origins: [
      {
        kind: "place",
        sourceRoot: "姬姓源流",
        period: "先秦",
        place: "鲁国",
        ancestor: "周公旦",
        summary: "鲁国后裔以国名为氏，是鲁姓代表性来源。",
      },
    ],
    relatedSurnames: ["周", "姬", "曹"],
  },
  {
    id: "cao",
    name: "曹",
    pinyin: "cao",
    brief: "曹姓有姬姓曹国来源，也见其他支系传说。",
    origins: [
      {
        kind: "place",
        sourceRoot: "姬姓源流",
        period: "先秦",
        place: "曹国",
        summary: "曹国后人以国名为氏，是曹姓的重要源流。",
      },
    ],
    relatedSurnames: ["周", "鲁"],
  },
  {
    id: "jiang",
    name: "姜",
    pinyin: "jiang",
    brief: "姜姓为上古大姓之一，常与炎帝传说和齐国吕氏系统相关。",
    origins: [
      {
        kind: "ancient-root",
        sourceRoot: "姜姓源流",
        period: "上古",
        summary: "姜姓常被视为炎帝系统的重要姓源。",
      },
    ],
    relatedSurnames: ["吕", "齐", "许"],
  },
  {
    id: "lv",
    name: "吕",
    pinyin: "lv",
    brief: "吕姓常与姜姓吕国、吕尚一系相关。",
    origins: [
      {
        kind: "place",
        sourceRoot: "姜姓源流",
        period: "先秦",
        place: "吕国",
        ancestor: "吕尚",
        summary: "姜姓支派有以吕国为氏者。",
      },
    ],
    relatedSurnames: ["姜", "齐"],
  },
  {
    id: "xu",
    name: "许",
    pinyin: "xu",
    brief: "许姓常见来源为姜姓许国。",
    origins: [
      {
        kind: "place",
        sourceRoot: "姜姓源流",
        period: "先秦",
        place: "许国",
        summary: "许国后人以国名为氏。",
      },
    ],
    relatedSurnames: ["姜", "吕"],
  },
  {
    id: "qi",
    name: "齐",
    pinyin: "qi",
    brief: "齐姓多与齐国国名及姜姓、田氏齐相关。",
    origins: [
      {
        kind: "place",
        sourceRoot: "姜姓源流",
        period: "先秦",
        place: "齐国",
        summary: "齐国宗族、国人及相关支派有以齐为氏者。",
      },
    ],
    relatedSurnames: ["姜", "吕", "田"],
  },
  {
    id: "chen",
    name: "陈",
    pinyin: "chen",
    brief: "陈姓多与妫姓陈国及陈胡公后裔相关。",
    origins: [
      {
        kind: "place",
        sourceRoot: "妫姓源流",
        period: "先秦",
        place: "陈国",
        ancestor: "陈胡公",
        summary: "舜帝后裔受封陈国，后人以国为氏。",
      },
    ],
    relatedSurnames: ["胡", "田", "妫"],
  },
  {
    id: "tian",
    name: "田",
    pinyin: "tian",
    brief: "田姓常与陈氏入齐、陈田音转及田氏齐相关。",
    origins: [
      {
        kind: "changed-name",
        sourceRoot: "妫姓源流",
        period: "先秦",
        place: "齐国",
        summary: "陈氏入齐后有改称田氏的流变。",
      },
    ],
    relatedSurnames: ["陈", "齐", "胡"],
  },
  {
    id: "hu",
    name: "胡",
    pinyin: "hu",
    brief: "胡姓来源较多，陈胡公谥号相关说法较常见。",
    origins: [
      {
        kind: "ancestor-name",
        sourceRoot: "妫姓源流",
        period: "先秦",
        ancestor: "陈胡公",
        summary: "一支以后世尊奉的陈胡公谥号为氏。",
      },
    ],
    relatedSurnames: ["陈", "田"],
  },
  {
    id: "song",
    name: "宋",
    pinyin: "song",
    brief: "宋姓多与子姓宋国、殷商后裔相关。",
    origins: [
      {
        kind: "place",
        sourceRoot: "子姓源流",
        period: "先秦",
        place: "宋国",
        summary: "宋国后人以国名为氏。",
      },
    ],
    relatedSurnames: ["孔", "牛"],
  },
  {
    id: "kong",
    name: "孔",
    pinyin: "kong",
    brief: "孔姓常与子姓宋国贵族支派及孔子家族相关。",
    origins: [
      {
        kind: "ancestor-name",
        sourceRoot: "子姓源流",
        period: "先秦",
        ancestor: "孔父嘉",
        summary: "常见说法以宋国孔父嘉为孔姓重要先祖。",
      },
    ],
    relatedSurnames: ["宋", "子"],
  },
  {
    id: "niu",
    name: "牛",
    pinyin: "niu",
    brief: "牛姓有子姓宋国支派和官职、地名等多种说法。",
    origins: [
      {
        kind: "ancestor-name",
        sourceRoot: "子姓源流",
        period: "先秦",
        summary: "部分源流归入宋国子姓系统。",
      },
    ],
    relatedSurnames: ["宋", "孔"],
  },
  {
    id: "qin",
    name: "秦",
    pinyin: "qin",
    brief: "秦姓多与嬴姓秦国、秦地相关。",
    origins: [
      {
        kind: "place",
        sourceRoot: "嬴姓源流",
        period: "先秦",
        place: "秦国",
        summary: "秦国宗族及国人有以国为氏者。",
      },
    ],
    relatedSurnames: ["赵", "梁"],
  },
  {
    id: "liang",
    name: "梁",
    pinyin: "liang",
    brief: "梁姓来源较多，其中一支与嬴姓梁国相关。",
    origins: [
      {
        kind: "place",
        sourceRoot: "嬴姓源流",
        period: "先秦",
        place: "梁国",
        summary: "梁国后裔以国名为氏。",
      },
    ],
    relatedSurnames: ["秦", "赵"],
  },
  {
    id: "ma",
    name: "马",
    pinyin: "ma",
    brief: "马姓常见源流归入嬴姓赵氏系统，一支以赵国名将赵奢封号“马服君”为关键线索。",
    origins: [
      {
        kind: "place",
        sourceRoot: "嬴姓源流",
        period: "先秦",
        place: "赵国马服",
        ancestor: "赵奢",
        summary: "赵奢因功受封马服君，其后人有以封号或封邑中的“马”为氏者。",
      },
      {
        kind: "ethnic-fusion",
        period: "魏晋南北朝",
        summary: "历史上亦有复姓简化或族群融合过程中改为马姓的支流。",
      },
    ],
    relatedSurnames: ["赵", "秦", "梁"],
  },
];

export const surnameById = new Map(surnames.map((surname) => [surname.id, surname]));
