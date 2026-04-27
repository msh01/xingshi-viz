export type OriginKind =
  | "ancient-root"
  | "place"
  | "office"
  | "ancestor-name"
  | "grant"
  | "changed-name"
  | "ethnic-fusion";

export type OriginRecord = {
  kind: OriginKind;
  sourceRoot?: string;
  period: string;
  place?: string;
  ancestor?: string;
  summary: string;
};

export type SurnameRecord = {
  id: string;
  name: string;
  pinyin: string;
  brief: string;
  origins: OriginRecord[];
  relatedSurnames: SurnameRelation[];
  derivedSurnames?: SurnameRelation[];
};

export type SurnameRelation = {
  name: string;
  label: string;
  note: string;
};

export type RootGroup = {
  id: string;
  name: string;
  description: string;
  surnameIds: string[];
};

export type OriginTypeGroup = {
  id: OriginKind;
  name: string;
  description: string;
};

export type GraphNodeKind = "root" | "originType" | "period" | "region" | "person" | "originDetail" | "surname";
