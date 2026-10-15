// ======================================================
// RESPONSABILIDAD DE ESTE ARCHIVO
// ======================================================
// Este archivo define el tipado del ComponentsGrid. No crea ningún Grid ni construye ninguna interfaz.
// Su única función es describir, mediante TypeScript, qué elementos puede contener el Grid y qué layouts admite.
// Gracias a ello, TypeScript puede comprobar que el ViewerGrid se configura correctamente y detectar errores durante el desarrollo.

// ======================================================
// IMPORTACIONES
// ======================================================
import * as BUI from "@thatopen/ui";
import { ItemsDataPanelState, ModelsPanelState, DataSourcesPanelState } from "../../../sections";

// ======================================================
// 1º TIPO
// ======================================================
type Viewport = {
  name: "viewport";
  state: {};
}

// ======================================================
// 2º TIPO
// ======================================================
export type ItemsData = {
  name: "itemsData"
  state: ItemsDataPanelState
}

// ======================================================
// 3º TIPO
// ======================================================
export type Models = {
  name: "models";
  state: ModelsPanelState
}

// ======================================================
// 4º TIPO
// ======================================================
export type DataSources = {
  name: "dataSources";
  state: DataSourcesPanelState;
}

type ComponentsGridElements = [Viewport, ItemsData, Models, DataSources];
type ComponentsGridLayouts = ["Models", "Queries", "Viewer"];

export type ComponentsGrid = BUI.Grid<ComponentsGridLayouts, ComponentsGridElements>