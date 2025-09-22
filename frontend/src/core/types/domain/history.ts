import type { ProjectId, LayerId, Layer } from "./entities";
import type { GraphicObject } from "../graphics";

// Типы действий в истории
export type HistoryActionType =
  | "LAYER_CREATED"
  | "LAYER_DELETED"
  | "LAYER_RENAMED"
  | "LAYER_VISIBILITY_CHANGED"
  | "LAYER_OPACITY_CHANGED"
  | "OBJECT_CREATED"
  | "OBJECT_DELETED"
  | "OBJECT_MODIFIED";

// Данные для каждого типа действия
export interface LayerCreatedData {
  layer: Layer;
}

export interface LayerDeletedData {
  layerId: LayerId;
  layerName: string;
}

export interface LayerRenamedData {
  layerId: LayerId;
  oldName: string;
  newName: string;
}

export interface LayerVisibilityChangedData {
  layerId: LayerId;
  isVisible: boolean;
}

export interface LayerOpacityChangedData {
  layerId: LayerId;
  opacity: number;
}

export interface ObjectCreatedData {
  object: GraphicObject;
}

export interface ObjectDeletedData {
  objectId: string;
  layerId: LayerId;
}

export interface ObjectModifiedData {
  objectId: string;
  layerId: LayerId;
  changes: Partial<GraphicObject>;
}

// Union тип всех данных
export type HistoryActionData =
  | LayerCreatedData
  | LayerDeletedData
  | LayerRenamedData
  | LayerVisibilityChangedData
  | LayerOpacityChangedData
  | ObjectCreatedData
  | ObjectDeletedData
  | ObjectModifiedData;

// Главный интерфейс истории
export interface HistoryEntry {
  readonly id: string;
  readonly projectId: ProjectId;
  readonly action: HistoryActionType;
  readonly description: string; // Человекочитаемое описание
  readonly data: HistoryActionData;
  readonly createdAt: string;
}

// Утилитарные типы
export type CreateHistoryInput = Omit<HistoryEntry, "id" | "createdAt">;

// Type guards
export const isLayerAction = (
  entry: HistoryEntry
): entry is HistoryEntry & {
  data:
    | LayerCreatedData
    | LayerDeletedData
    | LayerRenamedData
    | LayerVisibilityChangedData
    | LayerOpacityChangedData;
} => {
  return entry.action.startsWith("LAYER_");
};

export const isObjectAction = (
  entry: HistoryEntry
): entry is HistoryEntry & {
  data: ObjectCreatedData | ObjectDeletedData | ObjectModifiedData;
} => {
  return entry.action.startsWith("OBJECT_");
};
