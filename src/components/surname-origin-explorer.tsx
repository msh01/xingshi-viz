"use client";

import { Search, LocateFixed, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { originTypes, surnameById, surnames } from "@/data/surnames";
import { buildGraphData, findSurnameByQuery, originTypeLabels, type VizGraphData } from "@/lib/graph-data";
import type { SurnameRecord } from "@/types/surname";
import type { IEvent } from "@antv/g6";

type G6Graph = InstanceType<typeof import("@antv/g6").Graph>;
type GraphNodeDatum = {
  id?: string;
  style?: {
    x?: number;
    y?: number;
  };
  data?: {
    kind?: keyof typeof nodePalette;
    label?: string;
  };
};
type GraphEdgeDatum = {
  id?: string;
  data?: {
    label?: string;
  };
};

const nodePalette = {
  root: {
    fill: "#7c3aed",
    stroke: "#5b21b6",
    text: "#ffffff",
    size: 68,
  },
  originType: {
    fill: "#0f766e",
    stroke: "#115e59",
    text: "#ffffff",
    size: 56,
  },
  period: {
    fill: "#475569",
    stroke: "#334155",
    text: "#ffffff",
    size: 54,
  },
  originDetail: {
    fill: "#f97316",
    stroke: "#c2410c",
    text: "#ffffff",
    size: 62,
  },
  person: {
    fill: "#2563eb",
    stroke: "#1d4ed8",
    text: "#ffffff",
    size: 50,
  },
  region: {
    fill: "#15803d",
    stroke: "#166534",
    text: "#ffffff",
    size: 50,
  },
  surname: {
    fill: "#f8fafc",
    stroke: "#0f172a",
    text: "#0f172a",
    size: 46,
  },
};

const hundredFamilySurnames = [
  "赵",
  "钱",
  "孙",
  "李",
  "周",
  "吴",
  "郑",
  "王",
  "冯",
  "陈",
  "褚",
  "卫",
  "蒋",
  "沈",
  "韩",
  "杨",
  "朱",
  "秦",
  "尤",
  "许",
  "何",
  "吕",
  "施",
  "张",
  "孔",
  "曹",
  "严",
  "华",
  "金",
  "魏",
  "陶",
  "姜",
  "戚",
  "谢",
  "邹",
  "喻",
  "柏",
  "水",
  "窦",
  "章",
  "云",
  "苏",
  "潘",
  "葛",
  "奚",
  "范",
  "彭",
  "郎",
  "鲁",
  "韦",
  "昌",
  "马",
  "苗",
  "凤",
  "花",
  "方",
  "俞",
  "任",
  "袁",
  "柳",
  "酆",
  "鲍",
  "史",
  "唐",
  "费",
  "廉",
  "岑",
  "薛",
  "雷",
  "贺",
  "倪",
  "汤",
  "滕",
  "殷",
  "罗",
  "毕",
  "郝",
  "邬",
  "安",
  "常",
  "乐",
  "于",
  "时",
  "傅",
  "皮",
  "卞",
  "齐",
  "康",
  "伍",
  "余",
  "元",
  "卜",
  "顾",
  "孟",
  "平",
  "黄",
  "和",
  "穆",
  "萧",
  "尹",
];

function getNodeMeta(id: string) {
  if (id.startsWith("surname-")) {
    const surnameId = id.replace("surname-", "");
    return surnameById.get(surnameId);
  }

  return undefined;
}

function readEventNodeId(event: IEvent) {
  const target = "target" in event ? event.target : undefined;
  if (!target || typeof target !== "object") return undefined;

  if ("id" in target && typeof target.id === "string") return target.id;

  if ("attributes" in target && target.attributes && typeof target.attributes === "object") {
    const attributes = target.attributes as { id?: unknown };
    if (typeof attributes.id === "string") return attributes.id;
  }

  return undefined;
}

function selectedPathIds(data: VizGraphData, selectedSurnameId?: string) {
  if (!selectedSurnameId) return new Set<string>();

  const target = `surname-${selectedSurnameId}`;
  const ids = new Set<string>([target]);
  const detailPrefix = `detail-${selectedSurnameId}-`;

  data.edges.forEach((edge) => {
    const touchesTarget = edge.source === target || edge.target === target;
    const touchesDetail = edge.source.startsWith(detailPrefix) || edge.target.startsWith(detailPrefix);

    if (touchesTarget || touchesDetail) {
      ids.add(edge.source);
      ids.add(edge.target);
      ids.add(edge.id);
    }
  });

  return ids;
}

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.52 2.86 8.35 6.84 9.7.5.1.68-.22.68-.5v-1.74c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05A9.34 9.34 0 0 1 12 6.91c.85 0 1.7.12 2.5.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9v2.8c0 .28.18.6.69.5A10.16 10.16 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function DetailPanel({
  selected,
  fallbackTitle,
}: {
  selected?: SurnameRecord;
  fallbackTitle: string;
}) {
  if (!selected) {
    return (
      <aside className="flex min-h-0 flex-col border-l border-slate-200 bg-white px-6 py-5">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">当前焦点</div>
        <h2 className="mt-3 text-2xl font-semibold text-slate-950">{fallbackTitle}</h2>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          默认只展示高层结构。点击“姬姓源流”“封地得姓”等节点会展开代表姓氏；搜索姓氏会自动补齐它的起源路径。
        </p>
      </aside>
    );
  }

  return (
    <aside className="flex min-h-0 flex-col overflow-y-auto border-l border-slate-200 bg-white px-6 py-5">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">姓氏详情</div>
      <div className="mt-3 flex items-end gap-3">
        <h2 className="text-5xl font-semibold leading-none text-slate-950">{selected.name}</h2>
        <span className="pb-1 font-mono text-sm text-slate-500">{selected.pinyin}</span>
      </div>
      <p className="mt-5 text-sm leading-7 text-slate-700">{selected.brief}</p>

      <div className="mt-6 space-y-4">
        {selected.origins.map((origin, index) => (
          <section key={`${origin.kind}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-medium text-white">
                {originTypeLabels[origin.kind]}
              </span>
              <span className="font-mono text-xs text-slate-500">{origin.period}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700">{origin.summary}</p>
            <div className="mt-3 grid gap-2 text-xs text-slate-500">
              {origin.sourceRoot ? <span>源流：{origin.sourceRoot}</span> : null}
              {origin.place ? <span>地望：{origin.place}</span> : null}
              {origin.ancestor ? <span>人物：{origin.ancestor}</span> : null}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-6">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">关系说明</div>
        <div className="mt-3 space-y-2">
          {selected.relatedSurnames.map((relation) => (
            <div key={relation.name} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-950">{relation.name}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{relation.label}</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">{relation.note}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function SurnameOriginExplorer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<G6Graph | null>(null);
  const graphDataRef = useRef<VizGraphData | null>(null);
  const selectedSurnameIdRef = useRef<string | undefined>(undefined);
  const highlightedIdsRef = useRef<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [selectedSurnameId, setSelectedSurnameId] = useState<string>();
  const [query, setQuery] = useState("");
  const [activeNodeLabel, setActiveNodeLabel] = useState("高层起源结构");

  const graphData = useMemo(() => buildGraphData(expandedIds, selectedSurnameId), [expandedIds, selectedSurnameId]);
  const selectedSurname = selectedSurnameId ? surnameById.get(selectedSurnameId) : undefined;
  const searchResults = useMemo(() => findSurnameByQuery(query).slice(0, 7), [query]);
  const highlightedIds = useMemo(() => selectedPathIds(graphData, selectedSurnameId), [graphData, selectedSurnameId]);
  const surnameByName = useMemo(() => new Map(surnames.map((surname) => [surname.name, surname])), []);

  const focusSurname = useCallback((surname: SurnameRecord) => {
    setSelectedSurnameId(surname.id);
    setActiveNodeLabel(`${surname.name}姓`);
    setQuery(surname.name);
  }, []);

  const toggleExpansion = useCallback((nodeId: string) => {
    setExpandedIds((current) =>
      current.includes(nodeId) ? current.filter((id) => id !== nodeId) : [...current, nodeId],
    );
  }, []);

  useEffect(() => {
    graphDataRef.current = graphData;
    selectedSurnameIdRef.current = selectedSurnameId;
    highlightedIdsRef.current = highlightedIds;
  }, [graphData, highlightedIds, selectedSurnameId]);

  useEffect(() => {
    let disposed = false;

    async function mountGraph() {
      if (!containerRef.current || graphRef.current) return;

      const { Graph, NodeEvent } = await import("@antv/g6");
      if (disposed || !containerRef.current) return;

      const graph = new Graph({
        container: containerRef.current,
        autoFit: "view",
        animation: false,
        data: graphDataRef.current ?? { nodes: [], edges: [] },
        node: {
          type: "circle",
          style: (datum: GraphNodeDatum) => {
            const kind = datum.data?.kind ?? "surname";
            const palette = nodePalette[kind as keyof typeof nodePalette] ?? nodePalette.surname;
            const currentSelected = selectedSurnameIdRef.current;
            const currentHighlighted = highlightedIdsRef.current;
            const isSelected = currentSelected && datum.id === `surname-${currentSelected}`;
            const isDimmed = currentHighlighted.size > 0 && (!datum.id || !currentHighlighted.has(datum.id));

            return {
              x: datum.style?.x,
              y: datum.style?.y,
              size: isSelected ? palette.size + 10 : palette.size,
              fill: palette.fill,
              stroke: isSelected ? "#f97316" : palette.stroke,
              lineWidth: isSelected ? 4 : 2,
              opacity: isDimmed ? 0.26 : 1,
              labelText: datum.data?.label,
              labelFill: palette.text,
              labelFontSize: kind === "surname" ? 18 : kind === "originDetail" ? 13 : 12,
              labelFontWeight: 700,
              labelPlacement: "center",
              cursor: "pointer",
            };
          },
        },
        edge: {
          type: "line",
          style: (datum: GraphEdgeDatum) => {
            const currentHighlighted = highlightedIdsRef.current;
            const isHighlighted = datum.id ? currentHighlighted.has(datum.id) : false;
            const isDimmed = currentHighlighted.size > 0 && !isHighlighted;

            return {
              stroke: isHighlighted ? "#f97316" : "#94a3b8",
              lineWidth: isHighlighted ? 2.5 : 1.2,
              opacity: isDimmed ? 0.14 : 0.72,
              endArrow: true,
              labelText: isHighlighted ? datum.data?.label : undefined,
              labelFill: "#475569",
              labelFontSize: 11,
              labelBackground: true,
              labelBackgroundFill: "#ffffff",
              labelBackgroundOpacity: 0.86,
            };
          },
        },
        behaviors: ["drag-canvas", "zoom-canvas", "drag-element"],
      });

      graph.on(NodeEvent.CLICK, (event: IEvent) => {
        const nodeId = readEventNodeId(event);
        if (!nodeId) return;

        const surname = getNodeMeta(nodeId);
        if (surname) {
          focusSurname(surname);
          return;
        }

        const node = graphDataRef.current?.nodes.find((item) => item.id === nodeId);
        setActiveNodeLabel(node?.data.label ?? "高层起源结构");
        setSelectedSurnameId(undefined);

        if (nodeId.startsWith("root-") || nodeId.startsWith("type-") || nodeId.startsWith("period-")) {
          toggleExpansion(nodeId);
        }
      });

      graphRef.current = graph;
      await graph.render();
    }

    mountGraph();

    return () => {
      disposed = true;
      graphRef.current?.destroy();
      graphRef.current = null;
    };
  }, [focusSurname, toggleExpansion]);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;

    graph.setData(graphData);
    graph.render().then(() => {
      if (selectedSurnameId) {
        graph.fitView({ when: "always", direction: "both" }, { duration: 320 });
      }
    });
  }, [graphData, selectedSurnameId, highlightedIds]);

  const reset = () => {
    setExpandedIds([]);
    setSelectedSurnameId(undefined);
    setActiveNodeLabel("高层起源结构");
    setQuery("");
    graphRef.current?.fitView({ when: "always", direction: "both" }, { duration: 450 });
  };

  return (
    <main className="flex h-screen min-h-[720px] bg-slate-100 text-slate-950">
      <section className="flex w-[310px] min-w-[310px] flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">姓氏图谱</div>
              <h1 className="mt-2 text-2xl font-semibold text-slate-950">百家姓起源探索</h1>
            </div>
            <a
              aria-label="打开 GitHub 仓库"
              className="grid size-9 shrink-0 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
              href="https://github.com/msh01/xingshi-viz"
              rel="noreferrer"
              target="_blank"
              title="GitHub 仓库"
            >
              <GitHubMark className="size-4" />
            </a>
          </div>
        </div>

        <div className="border-b border-slate-200 px-5 py-4">
          <label className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400" htmlFor="surname-search">
            搜索姓氏
          </label>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              id="surname-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="输入 王 / wang"
              className="h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-10 text-sm outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
            />
            {query ? (
              <button
                aria-label="清空搜索"
                className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setQuery("")}
                type="button"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          {query ? (
            <div className="mt-3 max-h-60 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-1">
              {searchResults.length ? (
                searchResults.map((surname) => (
                  <button
                    key={surname.id}
                    type="button"
                    onClick={() => focusSurname(surname)}
                    className="flex w-full items-center justify-between rounded px-3 py-2 text-left hover:bg-white"
                  >
                    <span className="font-medium text-slate-950">{surname.name}</span>
                    <span className="font-mono text-xs text-slate-500">{surname.pinyin}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-sm text-slate-500">没有找到匹配姓氏</div>
              )}
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">百家姓入口</div>
            <span className="font-mono text-xs text-slate-400">{hundredFamilySurnames.length}</span>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {hundredFamilySurnames.map((name, index) => {
              const surname = surnameByName.get(name);
              const isSelected = selectedSurname?.name === name;

              return (
                <button
                  key={`${name}-${index}`}
                  type="button"
                  onClick={() => {
                    if (surname) {
                      focusSurname(surname);
                      return;
                    }

                    setSelectedSurnameId(undefined);
                    setActiveNodeLabel(`${name}姓`);
                    setQuery(name);
                  }}
                  className={`flex h-12 flex-col items-center justify-center rounded-md border text-center transition ${
                    isSelected
                      ? "border-slate-950 bg-slate-950 text-white"
                      : surname
                        ? "border-slate-200 bg-white text-slate-900 hover:border-violet-300 hover:bg-violet-50"
                        : "border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300 hover:bg-white"
                  }`}
                  title={surname ? `${name}姓详情` : `${name}姓资料待补充`}
                >
                  <span className="text-base font-semibold leading-none">{name}</span>
                  {surname ? null : <span className="mt-1 text-[10px] leading-none">待补</span>}
                </button>
              );
            })}
          </div>

          <div className="mt-6 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">起源类型</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {originTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => toggleExpansion(`type-${type.id}`)}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={() => graphRef.current?.fitView({ when: "always", direction: "both" }, { duration: 450 })}
            className="grid size-10 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            title="适配视图"
          >
            <LocateFixed className="size-4" />
          </button>
          <button
            type="button"
            onClick={reset}
            className="grid size-10 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            title="重置"
          >
            <RotateCcw className="size-4" />
          </button>
          <div className="flex flex-1 items-center justify-end font-mono text-xs text-slate-400">{surnames.length} surnames</div>
        </div>
      </section>

      <section className="relative min-w-0 flex-1">
        <div className="absolute left-5 top-5 z-10 rounded-lg border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
          <div className="text-xs font-medium text-slate-500">当前视图</div>
          <div className="mt-1 text-sm font-semibold text-slate-950">{activeNodeLabel}</div>
        </div>
        <div ref={containerRef} className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,#cbd5e1_1px,transparent_0)] [background-size:24px_24px]" />
      </section>

      <div className="w-[360px] min-w-[360px]">
        <DetailPanel selected={selectedSurname} fallbackTitle={activeNodeLabel} />
      </div>
    </main>
  );
}
