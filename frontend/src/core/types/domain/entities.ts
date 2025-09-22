import type { GraphicObject } from "../graphics";

// Branded types для ID
export type ProjectId = string & { readonly __brand: "ProjectId" };
export type LayerId = string & { readonly __brand: "LayerId" };

export interface Project {
  readonly id: ProjectId;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Layer {
  readonly id: LayerId;
  readonly projectId: ProjectId;
  readonly name: string;
  readonly order: number;
  readonly isVisible: boolean;
  readonly opacity: number; // 0-100
  readonly data: readonly GraphicObject[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

// Утилитарные типы
export type CreateProjectInput = Omit<
  Project,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateProjectInput = Partial<
  Pick<Project, "name" | "width" | "height">
>;

export type CreateLayerInput = Omit<Layer, "id" | "createdAt" | "updatedAt">;
export type UpdateLayerInput = Partial<
  Pick<Layer, "name" | "order" | "isVisible" | "opacity" | "data">
>;
