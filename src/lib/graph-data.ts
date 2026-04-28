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
    role?: "selected" | "related" | "derived" | "secondLevel";
  };
};

export type VizEdge = {
  id: string;
  source: string;
  target: string;
  data?: {
    label?: string;
    tone?: "source" | "type" | "period" | "place" | "person" | "primary" | "related" | "derived";
    focus?: boolean;
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

function getDerivedRecords(surname: SurnameRecord) {
  return (surname.derivedSurnames ?? [])
    .map((relation) => ({
      relation,
      surname: surnames.find((item) => item.name === relation.name),
    }))
    .filter((item): item is { relation: NonNullable<SurnameRecord["derivedSurnames"]>[number]; surname: SurnameRecord } =>
      Boolean(item.surname),
    );
}

function getRelatedRecords(surname: SurnameRecord) {
  return surname.relatedSurnames
    .map((relation) => ({
      relation,
      surname: surnames.find((item) => item.name === relation.name),
    }))
    .filter((item): item is { relation: SurnameRecord["relatedSurnames"][number]; surname: SurnameRecord } =>
      Boolean(item.surname),
    );
}

function sharedOriginReasons(left: SurnameRecord, right: SurnameRecord) {
  const leftRoots = new Set(left.origins.map((origin) => origin.sourceRoot).filter(Boolean));
  const leftKinds = new Set(left.origins.map((origin) => origin.kind));
  const leftPeriods = new Set(left.origins.map((origin) => origin.period));

  return {
    roots: unique(right.origins.map((origin) => origin.sourceRoot).filter((root): root is string => Boolean(root && leftRoots.has(root)))),
    kinds: unique(right.origins.map((origin) => origin.kind).filter((kind) => leftKinds.has(kind))),
    periods: unique(right.origins.map((origin) => origin.period).filter((period) => leftPeriods.has(period))),
  };
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

      const connectedSurnameNodes = surnameNodes.filter((node) => node.id !== selectedNode.id && adjacency.get(node.id)?.includes(selectedNode.id));
      connectedSurnameNodes.forEach((node, index) => {
        node.style = placeOnArc(index, connectedSurnameNodes.length, 720, 360, 255, 42, 96);
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
        data: { label: originTypeLabels[origin.kind], tone: "type" },
      });

    if (origin.sourceRoot) {
      const root = rootGroups.find((group) => group.name === origin.sourceRoot);
      if (root) {
        addEdge(edges, {
          id: `${root.id}-${surnameNodeId}-${index}`,
          source: root.id,
          target: surnameNodeId,
          data: { label: "源流", tone: "source" },
        });
      }
    }

    const period = periodGroups.find((group) => group.periods.includes(origin.period));
    if (period) {
      addEdge(edges, {
        id: `${period.id}-${surnameNodeId}-${index}`,
        source: period.id,
        target: surnameNodeId,
        data: { label: "时代", tone: "period" },
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
        data: { label: index === 0 ? "主要来源" : "支流", tone: "primary", focus: true },
      });
      addEdge(edges, {
        id: `${typeNodeId}-${originNodeId}`,
        source: typeNodeId,
        target: originNodeId,
        data: { label: originTypeLabels[origin.kind], tone: "type", focus: true },
      });

      if (origin.sourceRoot) {
        const root = rootGroups.find((group) => group.name === origin.sourceRoot);
        if (root) {
          addEdge(edges, {
            id: `${root.id}-${originNodeId}`,
            source: root.id,
            target: originNodeId,
            data: { label: "源流", tone: "source", focus: true },
          });
        }
      }

      if (period) {
        addEdge(edges, {
          id: `${period.id}-${originNodeId}`,
          source: period.id,
          target: originNodeId,
          data: { label: "时代", tone: "period", focus: true },
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
          data: { label: "人物", tone: "person", focus: true },
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
          data: { label: "地望", tone: "place", focus: true },
        });
      }
    }
  });

}

function buildSelectedSurnameGraph(selected: SurnameRecord): VizGraphData {
  const nodes = new Map<string, VizNode>();
  const edges = new Map<string, VizEdge>();
  const surnameNodeId = `surname-${selected.id}`;
  const rowGap = 160;
  const startY = 360 - ((selected.origins.length - 1) * rowGap) / 2;

  addNode(nodes, {
    id: surnameNodeId,
    style: { x: 840, y: 360 },
    data: {
      label: selected.name,
      kind: "surname",
      description: selected.brief,
      surnameId: selected.id,
      role: "selected",
    },
  });

  selected.origins.forEach((origin, index) => {
    const y = startY + index * rowGap;
    const typeNodeId = `type-${origin.kind}`;
    const period = periodGroups.find((group) => group.periods.includes(origin.period));
    const originNodeId = `detail-${selected.id}-${index}-origin`;
    const root = origin.sourceRoot ? rootGroups.find((group) => group.name === origin.sourceRoot) : undefined;

    if (root) {
      addNode(nodes, {
        id: root.id,
        style: { x: 210, y: y - 52 },
        data: {
          label: root.name,
          kind: "root",
          description: root.description,
          count: root.surnameIds.length,
        },
      });
      addEdge(edges, {
        id: `${root.id}-${originNodeId}`,
        source: root.id,
        target: originNodeId,
        data: { label: "源流", tone: "source", focus: true },
      });
    }

    addNode(nodes, {
      id: typeNodeId,
      style: { x: 210, y },
      data: {
        label: originTypeLabels[origin.kind],
        kind: "originType",
        description: originTypes.find((type) => type.id === origin.kind)?.description,
      },
    });
    addEdge(edges, {
      id: `${typeNodeId}-${originNodeId}`,
      source: typeNodeId,
      target: originNodeId,
      data: { label: "类型", tone: "type", focus: true },
    });

    if (period) {
      addNode(nodes, {
        id: period.id,
        style: { x: 210, y: y + 52 },
        data: {
          label: period.name,
          kind: "period",
          description: "按历史阶段聚合姓氏源流。",
        },
      });
      addEdge(edges, {
        id: `${period.id}-${originNodeId}`,
        source: period.id,
        target: originNodeId,
        data: { label: "时代", tone: "period", focus: true },
      });
    }

    addNode(nodes, {
      id: originNodeId,
      style: { x: 570, y },
      data: {
        label: origin.place ?? origin.ancestor ?? originTypeLabels[origin.kind],
        kind: "originDetail",
        description: origin.summary,
        originIndex: index,
      },
    });
    addEdge(edges, {
      id: `${originNodeId}-${surnameNodeId}`,
      source: originNodeId,
      target: surnameNodeId,
      data: { label: index === 0 ? "主要来源" : "支流", tone: "primary", focus: true },
    });

    if (origin.ancestor) {
      const personNodeId = `detail-${selected.id}-${index}-person`;
      addNode(nodes, {
        id: personNodeId,
        style: { x: 405, y: y - 42 },
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
        data: { label: "人物", tone: "person", focus: true },
      });
    }

    if (origin.place) {
      const placeNodeId = `detail-${selected.id}-${index}-place`;
      addNode(nodes, {
        id: placeNodeId,
        style: { x: 405, y: origin.ancestor ? y + 42 : y },
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
        data: { label: "地望", tone: "place", focus: true },
      });
    }
  });

  const relatedRecords = getRelatedRecords(selected);
  relatedRecords.forEach(({ relation, surname: related }, index) => {
    const relatedNodeId = `surname-${related.id}`;
    const shared = sharedOriginReasons(selected, related);
    addNode(nodes, {
      id: relatedNodeId,
      style: placeOnArc(index, relatedRecords.length, 1090, 360, 210, -70, 140),
      data: {
        label: related.name,
        kind: "surname",
        description: related.brief,
        surnameId: related.id,
        role: "related",
      },
    });
    addEdge(edges, {
      id: `${surnameNodeId}-${relatedNodeId}-related`,
      source: surnameNodeId,
      target: relatedNodeId,
      data: { label: relation.label, tone: "related", focus: true },
    });

    shared.roots.forEach((rootName) => {
      const root = rootGroups.find((group) => group.name === rootName);
      if (!root) return;
      addEdge(edges, {
        id: `${root.id}-${relatedNodeId}-shared`,
        source: root.id,
        target: relatedNodeId,
        data: { label: "同源流", tone: "source", focus: true },
      });
    });

    shared.kinds.forEach((kind) => {
      addEdge(edges, {
        id: `type-${kind}-${relatedNodeId}-shared`,
        source: `type-${kind}`,
        target: relatedNodeId,
        data: { label: "同类型", tone: "type", focus: true },
      });
    });

    shared.periods.forEach((periodName) => {
      const period = periodGroups.find((group) => group.periods.includes(periodName));
      if (!period) return;
      addEdge(edges, {
        id: `${period.id}-${relatedNodeId}-shared`,
        source: period.id,
        target: relatedNodeId,
        data: { label: "同时代", tone: "period", focus: true },
      });
    });
  });

  const derivedRecords = getDerivedRecords(selected);
  derivedRecords.forEach(({ relation, surname: derived }, index) => {
    const derivedNodeId = `surname-${derived.id}`;
    addNode(nodes, {
      id: derivedNodeId,
      style: placeOnArc(index, derivedRecords.length, 1085, 360, 130, -70, 140),
      data: {
        label: derived.name,
        kind: "surname",
        description: derived.brief,
        surnameId: derived.id,
        role: "derived",
      },
    });
    addEdge(edges, {
      id: `${surnameNodeId}-${derivedNodeId}-derived`,
      source: surnameNodeId,
      target: derivedNodeId,
      data: { label: relation.label, tone: "derived", focus: true },
    });

    const secondLevelRecords = getDerivedRecords(derived);
    secondLevelRecords.forEach(({ relation: secondRelation, surname: secondLevel }, secondIndex) => {
      const secondLevelNodeId = `surname-${secondLevel.id}`;
      addNode(nodes, {
        id: secondLevelNodeId,
        style: placeOnArc(secondIndex, secondLevelRecords.length, 1295, derivedRecords.length > 1 ? 300 + index * 120 : 360, 90, -55, 110),
        data: {
          label: secondLevel.name,
          kind: "surname",
          description: secondLevel.brief,
          surnameId: secondLevel.id,
          role: "secondLevel",
        },
      });
      addEdge(edges, {
        id: `${derivedNodeId}-${secondLevelNodeId}-derived`,
        source: derivedNodeId,
        target: secondLevelNodeId,
        data: { label: secondRelation.label, tone: "derived", focus: true },
      });
    });
  });

  return {
    nodes: Array.from(nodes.values()),
    edges: Array.from(edges.values()),
  };
}

export function buildGraphData(expandedIds: string[], selectedSurnameId?: string): VizGraphData {
  if (selectedSurnameId) {
    const selected = surnameById.get(selectedSurnameId);
    if (selected) return buildSelectedSurnameGraph(selected);
  }

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
