import { originTypes, rootGroups, surnameById, surnames } from "@/data/surnames";
import type { GraphNodeKind, OriginKind, SurnameRecord } from "@/types/surname";

export type VizNode = {
  id: string;
  style?: {
    x: number;
    y: number;
  };
  data: {
    label: string;
    kind: GraphNodeKind;
    description?: string;
    surnameId?: string;
    count?: number;
    originIndex?: number;
  };
};

export type VizEdge = {
  id: string;
  source: string;
  target: string;
  data?: {
    label?: string;
  };
};

export type VizGraphData = {
  nodes: VizNode[];
  edges: VizEdge[];
};

export const originTypeLabels: Record<OriginKind, string> = {
  "ancient-root": "古姓源头",
  place: "封地得姓",
  office: "官职得姓",
  "ancestor-name": "祖名得姓",
  grant: "赐姓",
  "changed-name": "改姓避讳",
  "ethnic-fusion": "民族融合",
};

const periodGroups = [
  {
    id: "period-ancient",
    name: "上古",
    periods: ["上古"],
  },
  {
    id: "period-preqin",
    name: "先秦",
    periods: ["先秦"],
  },
  {
    id: "period-qinhan",
    name: "秦汉",
    periods: ["秦汉"],
  },
  {
    id: "period-wei-jin",
    name: "魏晋南北朝",
    periods: ["魏晋南北朝"],
  },
  {
    id: "period-sui-tang",
    name: "隋唐",
    periods: ["隋唐"],
  },
];

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function surnameMatchesRoot(surname: SurnameRecord, rootName: string) {
  return surname.origins.some((origin) => origin.sourceRoot === rootName);
}

function addNode(nodes: Map<string, VizNode>, node: VizNode) {
  if (!nodes.has(node.id)) nodes.set(node.id, node);
}

function addEdge(edges: Map<string, VizEdge>, edge: VizEdge) {
  if (!edges.has(edge.id)) edges.set(edge.id, edge);
}

function placeOnArc(index: number, total: number, centerX: number, centerY: number, radius: number, start = -120, span = 240) {
  const step = total > 1 ? span / (total - 1) : 0;
  const angle = ((start + step * index) * Math.PI) / 180;

  return {
    x: Math.round(centerX + Math.cos(angle) * radius),
    y: Math.round(centerY + Math.sin(angle) * radius),
  };
}

function assignStablePositions(nodes: VizNode[], edges: VizEdge[], selectedSurnameId?: string) {
  const rootNodes = nodes.filter((node) => node.data.kind === "root");
  const typeNodes = nodes.filter((node) => node.data.kind === "originType");
  const periodNodes = nodes.filter((node) => node.data.kind === "period");
  const surnameNodes = nodes.filter((node) => node.data.kind === "surname");
  const detailNodes = nodes.filter((node) => ["originDetail", "person", "region"].includes(node.data.kind));

  rootNodes.forEach((node, index) => {
    node.style = placeOnArc(index, rootNodes.length, 390, 360, 250, 142, 76);
  });

  typeNodes.forEach((node, index) => {
    node.style = placeOnArc(index, typeNodes.length, 690, 360, 245, -112, 224);
  });

  periodNodes.forEach((node, index) => {
    node.style = placeOnArc(index, periodNodes.length, 985, 360, 220, -105, 210);
  });

  const adjacency = new Map<string, string[]>();
  edges.forEach((edge) => {
    adjacency.set(edge.source, [...(adjacency.get(edge.source) ?? []), edge.target]);
    adjacency.set(edge.target, [...(adjacency.get(edge.target) ?? []), edge.source]);
  });

  const surnameByRoot = new Map<string, VizNode[]>();
  const floatingSurnames: VizNode[] = [];
  surnameNodes.forEach((node) => {
    const rootId = adjacency.get(node.id)?.find((id) => id.startsWith("root-"));
    if (!rootId) {
      floatingSurnames.push(node);
      return;
    }

    surnameByRoot.set(rootId, [...(surnameByRoot.get(rootId) ?? []), node]);
  });

  surnameByRoot.forEach((group, rootId) => {
    const root = nodes.find((node) => node.id === rootId);
    const origin = root?.style ?? { x: 390, y: 360 };
    group.forEach((node, index) => {
      node.style = placeOnArc(index, group.length, origin.x + 150, origin.y, 118, -68, 136);
    });
  });

  floatingSurnames.forEach((node, index) => {
    node.style = placeOnArc(index, floatingSurnames.length, 690, 650, 165, 190, 160);
  });

  if (selectedSurnameId) {
    const selectedNode = nodes.find((node) => node.id === `surname-${selectedSurnameId}`);
    if (selectedNode) {
      selectedNode.style = { x: 720, y: 360 };

      const detailLayout = detailNodes.filter((node) => node.id.startsWith(`detail-${selectedSurnameId}-`));
      detailLayout.forEach((node, index) => {
        node.style = placeOnArc(index, detailLayout.length, 720, 360, 165, -150, 300);
      });

      const relatedNodes = surnameNodes.filter((node) => node.id !== selectedNode.id && adjacency.get(node.id)?.includes(selectedNode.id));
      relatedNodes.forEach((node, index) => {
        node.style = placeOnArc(index, relatedNodes.length, 720, 360, 255, 42, 96);
      });
    }
  }
}

function addSurnamePath(
  nodes: Map<string, VizNode>,
  edges: Map<string, VizEdge>,
  surname: SurnameRecord,
  selectedId?: string,
) {
  const surnameNodeId = `surname-${surname.id}`;
  addNode(nodes, {
    id: surnameNodeId,
    data: {
      label: surname.name,
      kind: "surname",
      description: surname.brief,
      surnameId: surname.id,
    },
  });

  surname.origins.forEach((origin, index) => {
    const typeNodeId = `type-${origin.kind}`;
    addEdge(edges, {
      id: `${typeNodeId}-${surnameNodeId}-${index}`,
      source: typeNodeId,
      target: surnameNodeId,
      data: { label: originTypeLabels[origin.kind] },
    });

    if (origin.sourceRoot) {
      const root = rootGroups.find((group) => group.name === origin.sourceRoot);
      if (root) {
        addEdge(edges, {
          id: `${root.id}-${surnameNodeId}-${index}`,
          source: root.id,
          target: surnameNodeId,
          data: { label: "源流" },
        });
      }
    }

    const period = periodGroups.find((group) => group.periods.includes(origin.period));
    if (period) {
      addEdge(edges, {
        id: `${period.id}-${surnameNodeId}-${index}`,
        source: period.id,
        target: surnameNodeId,
        data: { label: "时代" },
      });
    }

    if (selectedId === surname.id) {
      const originNodeId = `detail-${surname.id}-${index}-origin`;
      const originLabel = origin.place ?? origin.ancestor ?? originTypeLabels[origin.kind];
      addNode(nodes, {
        id: originNodeId,
        data: {
          label: originLabel,
          kind: "originDetail",
          description: origin.summary,
          originIndex: index,
        },
      });

      addEdge(edges, {
        id: `${originNodeId}-${surnameNodeId}`,
        source: originNodeId,
        target: surnameNodeId,
        data: { label: index === 0 ? "主要来源" : "支流" },
      });
      addEdge(edges, {
        id: `${typeNodeId}-${originNodeId}`,
        source: typeNodeId,
        target: originNodeId,
        data: { label: originTypeLabels[origin.kind] },
      });

      if (origin.sourceRoot) {
        const root = rootGroups.find((group) => group.name === origin.sourceRoot);
        if (root) {
          addEdge(edges, {
            id: `${root.id}-${originNodeId}`,
            source: root.id,
            target: originNodeId,
            data: { label: "源流" },
          });
        }
      }

      if (period) {
        addEdge(edges, {
          id: `${period.id}-${originNodeId}`,
          source: period.id,
          target: originNodeId,
          data: { label: "时代" },
        });
      }

      if (origin.ancestor) {
        const personNodeId = `detail-${surname.id}-${index}-person`;
        addNode(nodes, {
          id: personNodeId,
          data: {
            label: origin.ancestor,
            kind: "person",
            description: "起源叙事中的关键人物。",
            originIndex: index,
          },
        });
        addEdge(edges, {
          id: `${personNodeId}-${originNodeId}`,
          source: personNodeId,
          target: originNodeId,
          data: { label: "人物" },
        });
      }

      if (origin.place) {
        const placeNodeId = `detail-${surname.id}-${index}-place`;
        addNode(nodes, {
          id: placeNodeId,
          data: {
            label: origin.place,
            kind: "region",
            description: "起源叙事中的地望或封邑。",
            originIndex: index,
          },
        });
        addEdge(edges, {
          id: `${placeNodeId}-${originNodeId}`,
          source: placeNodeId,
          target: originNodeId,
          data: { label: "地望" },
        });
      }
    }
  });

  if (selectedId === surname.id) {
    surname.relatedSurnames.forEach((relatedName) => {
      const related = surnames.find((item) => item.name === relatedName);
      if (!related) return;

      const relatedNodeId = `surname-${related.id}`;
      addNode(nodes, {
        id: relatedNodeId,
        data: {
          label: related.name,
          kind: "surname",
          description: related.brief,
          surnameId: related.id,
        },
      });
      addEdge(edges, {
        id: `${surnameNodeId}-${relatedNodeId}-related`,
        source: surnameNodeId,
        target: relatedNodeId,
        data: { label: "相关" },
      });
    });
  }
}

export function buildGraphData(expandedIds: string[], selectedSurnameId?: string): VizGraphData {
  const nodes = new Map<string, VizNode>();
  const edges = new Map<string, VizEdge>();

  rootGroups.forEach((root) => {
    addNode(nodes, {
      id: root.id,
      data: {
        label: root.name,
        kind: "root",
        description: root.description,
        count: root.surnameIds.length,
      },
    });
  });

  originTypes.forEach((type) => {
    addNode(nodes, {
      id: `type-${type.id}`,
      data: {
        label: type.name,
        kind: "originType",
        description: type.description,
      },
    });
  });

  periodGroups.forEach((period) => {
    addNode(nodes, {
      id: period.id,
      data: {
        label: period.name,
        kind: "period",
        description: "按历史阶段聚合姓氏源流。",
      },
    });
  });

  rootGroups.forEach((root) => {
    addEdge(edges, {
      id: `hub-${root.id}`,
      source: root.id,
      target: "type-place",
      data: { label: "常见" },
    });
  });

  addEdge(edges, { id: "period-preqin-type-place", source: "period-preqin", target: "type-place" });
  addEdge(edges, { id: "period-preqin-type-ancestor", source: "period-preqin", target: "type-ancestor-name" });
  addEdge(edges, { id: "period-sui-tang-type-grant", source: "period-sui-tang", target: "type-grant" });
  addEdge(edges, { id: "period-wei-jin-type-ethnic", source: "period-wei-jin", target: "type-ethnic-fusion" });

  const expandedSurnames = unique(
    expandedIds.flatMap((id) => {
      if (id.startsWith("root-")) {
        return rootGroups.find((root) => root.id === id)?.surnameIds ?? [];
      }

      if (id.startsWith("type-")) {
        const kind = id.replace("type-", "") as OriginKind;
        return surnames
          .filter((surname) => surname.origins.some((origin) => origin.kind === kind))
          .map((surname) => surname.id);
      }

      if (id.startsWith("period-")) {
        const group = periodGroups.find((period) => period.id === id);
        return surnames
          .filter((surname) => surname.origins.some((origin) => group?.periods.includes(origin.period)))
          .map((surname) => surname.id);
      }

      return [];
    }),
  );

  if (selectedSurnameId) {
    expandedSurnames.push(selectedSurnameId);
    const selected = surnameById.get(selectedSurnameId);
    if (selected) {
      rootGroups
        .filter((root) => surnameMatchesRoot(selected, root.name))
        .forEach((root) => expandedSurnames.push(...root.surnameIds.slice(0, 2)));
    }
  }

  unique(expandedSurnames)
    .map((id) => surnameById.get(id))
    .filter((surname): surname is SurnameRecord => Boolean(surname))
    .forEach((surname) => addSurnamePath(nodes, edges, surname, selectedSurnameId));

  const graphNodes = Array.from(nodes.values());
  const graphEdges = Array.from(edges.values());
  assignStablePositions(graphNodes, graphEdges, selectedSurnameId);

  return {
    nodes: graphNodes,
    edges: graphEdges,
  };
}

export function findSurnameByQuery(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return surnames.filter(
    (surname) =>
      surname.name.includes(normalized) ||
      surname.pinyin.includes(normalized) ||
      surname.id.includes(normalized),
  );
}
