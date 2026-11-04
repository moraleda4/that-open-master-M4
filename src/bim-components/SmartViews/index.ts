import * as THREE from "three"
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { DataMap } from "@thatopen/fragments";
import { SmartView, SmartViewsExport, SerializedModelIdMap } from "./src";

export class SmartViews extends OBC.Component {
    static uuid = "0d8413c5-7563-4de5-a213-5ac949eacbb1" as const;
    readonly list = new DataMap<string, SmartView>()
    enabled = true;

    currentState: SmartView = {
        name: "SmartView",
        defaultVisibility: true,
        visibilityExceptions: {},
        colors: {},
    };

    // Asegura que se está editando la vista correcta
    currentViewId: string | null = null;

    addQueryColor(color: string, query: string, items: OBC.ModelIdMap) {
        // La nueva query pasa a controlar el color de sus elementos.
        // Elimina esos elementos de cualquier color individual guardado anteriormente.
        const itemColors = this.currentState.colors.items;

        if (itemColors) {
        for (const [itemColor, modelIdMap] of Object.entries(itemColors)) {
            for (const [modelId, localIds] of Object.entries(items)) {
            const storedIds = modelIdMap[modelId];
            if (!storedIds) continue;

            for (const localId of localIds) {
                storedIds.delete(localId);
            }

            if (storedIds.size === 0) {
                delete modelIdMap[modelId];
            }
            }

            if (Object.keys(modelIdMap).length === 0) {
            delete itemColors[itemColor];
            }
        }

        if (Object.keys(itemColors).length === 0) {
            delete this.currentState.colors.items;
        }
        }
        
        let queriesColors = this.currentState.colors.queries;
        if (!queriesColors) {
            queriesColors = {};
            this.currentState.colors.queries = queriesColors;
        }

        for (const [existingColor, queryNames] of Object.entries(queriesColors)) {
            queryNames.delete(query);

            if (queryNames.size === 0) {
                delete queriesColors[existingColor];
            }
        }

        let queriesList = queriesColors[color];
        if (!queriesList) {
            queriesList = new Set();
            queriesColors[color] = queriesList;
        }

        queriesList.add(query);
    }

    removeQueryReferences(queryName: string) {
        for (const [, view] of this.list.entries()) {
            const queryColors = view.colors.queries;

            if (queryColors) {
            for (const [color, queryNames] of Object.entries(queryColors)) {
                queryNames.delete(queryName);

                if (queryNames.size === 0) {
                delete queryColors[color];
                }
            }

            if (Object.keys(queryColors).length === 0) {
                delete view.colors.queries;
            }
            }

            const visibilityQueries = view.visibilityExceptions.queries;

            if (visibilityQueries) {
            visibilityQueries.delete(queryName);

            if (visibilityQueries.size === 0) {
                delete view.visibilityExceptions.queries;
            }
            }
        }
    }

    addItemColor(color: string, items: OBC.ModelIdMap) {
        const itemColors = this.currentState.colors.items ?? {};
        this.currentState.colors.items = itemColors;

        // Quita los elementos recoloreados de sus colores individuales anteriores.
        for (const [existingColor, existingMap] of Object.entries(itemColors)) {
            for (const [modelId, localIds] of Object.entries(items)) {
                const storedIds = existingMap[modelId];
                if (!storedIds) continue;

                for (const localId of localIds) {
                    storedIds.delete(localId);
                }

                if (storedIds.size === 0) {
                    delete existingMap[modelId];
                }
            }

            if (Object.keys(existingMap).length === 0) {
                delete itemColors[existingColor];
            }
        }

        // Añade los elementos seleccionados al nuevo color.
        const colorMap = itemColors[color] ?? (itemColors[color] = {});

        for (const [modelId, localIds] of Object.entries(items)) {
            const storedIds = colorMap[modelId] ?? (colorMap[modelId] = new Set());

            for (const localId of localIds) {
                storedIds.add(localId);
            }
        }
    }

    clone(view = this.currentState) {
        const clone: SmartView = {
            name: view.name,
            defaultVisibility: view.defaultVisibility,
            visibilityExceptions: {},
            colors: {},
        };

        if (view.colors.items) {
            clone.colors.items = {}
            for (const [style, map] of Object.entries(view.colors.items)) {
                clone.colors.items[style] = OBC.ModelIdMapUtils.clone(map);
            }
        }

        if (view.colors.queries) {
            clone.colors.queries = {};
            for (const [style, names] of Object.entries(view.colors.queries)) {
                const set = new Set<string>();
                for (const name of names) {
                    set.add(name)
                };
                clone.colors.queries[style] = set;
            }
        }

        if (view.visibilityExceptions.queries) {
            const queries = new Set<string>();
            for (const name of view.visibilityExceptions.queries) {
                queries.add(name);
            }
            clone.visibilityExceptions.queries = queries;
        }

        if (view.visibilityExceptions.items) {
            clone.visibilityExceptions.items = OBC.ModelIdMapUtils.clone(
                view.visibilityExceptions.items,
            );
        }

        return clone;
    }

    saveCurrentState (name: string) {
        const smartView = this.clone();
        smartView.name = name
        const id = OBC.UUID.create()
        this.list.set(id, smartView)
        return { id, smartView }
    }

    // Para poder actualizar las Smart Views
    updateView(id: string, name?: string) {

        const existingView = this.list.get(id);

        if (!existingView) {
            throw new Error(`Smart View "${id}" not found.`);
        }

        const updatedView = this.clone(this.currentState);
        updatedView.name = name?.trim() || existingView.name;

        this.list.set(id, updatedView);
        return updatedView;
    }

    // Nuevos métodos para poder exportar e importar smart views
    private serializeModelIdMap(
        modelIdMap: OBC.ModelIdMap,
        ): SerializedModelIdMap {
        return Object.fromEntries(
            Object.entries(modelIdMap).map(([modelId, localIds]) => [
            modelId,
            [...localIds],
            ]),
        );
        }

    private deserializeModelIdMap(
        modelIdMap: SerializedModelIdMap,
        ): OBC.ModelIdMap {
        return Object.fromEntries(
            Object.entries(modelIdMap).map(([modelId, localIds]) => [
            modelId,
            new Set(localIds),
            ]),
        );
        }

    exportToJSON(includeQueries = true): SmartViewsExport {
        const finder = this.components.get(OBC.ItemsFinder);

        return {
            format: "smart-views",
            version: 1,
            // Las vistas dependen de las consultas registradas con estos nombres.
            ...(includeQueries && { queries: finder.export() }),
            views: [...this.list.entries()].map(([id, view]) => ({
                id,
                view: {
                    name: view.name,
                    defaultVisibility: view.defaultVisibility,
                    visibilityExceptions: {
                        ...(view.visibilityExceptions.queries && {
                            queries: [...view.visibilityExceptions.queries],
                        }),
                        ...(view.visibilityExceptions.items && {
                            items: this.serializeModelIdMap(
                                view.visibilityExceptions.items,
                            ),
                        }),
                    },
                    colors: {
                        ...(view.colors.queries && {
                            queries: Object.fromEntries(
                                Object.entries(view.colors.queries).map(
                                    ([color, names]) => [color, [...names]],
                                ),
                            ),
                        }),
                        ...(view.colors.items && {
                            items: Object.fromEntries(
                                Object.entries(view.colors.items).map(
                                    ([color, modelIdMap]) => [
                                        color,
                                        this.serializeModelIdMap(modelIdMap),
                                    ],
                                ),
                            ),
                        }),
                    },
                },
            })),
        };
    }

    importFromJSON(data: SmartViewsExport) {
        if (
            data.format !== "smart-views" ||
            data.version !== 1 ||
            !Array.isArray(data.views)
        ) {
            throw new Error("Invalid Smart Views export file.");
        }

        // Registrar primero las consultas que las vistas referencian por nombre.
        if (data.queries) {
            const finder = this.components.get(OBC.ItemsFinder);
            finder.import(data.queries);
        }

        for (const { id, view } of data.views) {
            this.list.set(id, {
                name: view.name,
                defaultVisibility: view.defaultVisibility,
                visibilityExceptions: {
                    ...(view.visibilityExceptions.queries && {
                        queries: new Set(view.visibilityExceptions.queries),
                    }),
                    ...(view.visibilityExceptions.items && {
                        items: this.deserializeModelIdMap(
                            view.visibilityExceptions.items,
                        ),
                    }),
                },
                colors: {
                    ...(view.colors.queries && {
                        queries: Object.fromEntries(
                            Object.entries(view.colors.queries).map(
                                ([color, names]) => [color, new Set(names)],
                            ),
                        ),
                    }),
                    ...(view.colors.items && {
                        items: Object.fromEntries(
                            Object.entries(view.colors.items).map(
                                ([color, modelIdMap]) => [
                                    color,
                                    this.deserializeModelIdMap(modelIdMap),
                                ],
                            ),
                        ),
                    }),
                },
            });
        }
    }

    async reset(preserveCurrentViewId = false) {
        const highlighter = this.components.get(OBF.Highlighter);
        const hider = this.components.get(OBC.Hider);
        const promises = [highlighter.clear(), hider.set(true)];
        await Promise.all(promises);

        this.currentState = {
            name: "SmartView",
            defaultVisibility: true,
            visibilityExceptions: {},
            colors: {},
        };

        if (!preserveCurrentViewId) {
            this.currentViewId = null;
}
    }

    async apply(view: SmartView, id: string) {
        if (!this.enabled) return;
        const { defaultVisibility, visibilityExceptions, colors } = view;

        const highlighter = this.components.get(OBF.Highlighter);
        const hider = this.components.get(OBC.Hider);
        const finder = this.components.get(OBC.ItemsFinder);

        const promises = [this.reset(), hider.set(defaultVisibility)];

        if (visibilityExceptions.items) {
            promises.push(hider.set(!defaultVisibility, visibilityExceptions.items));
        }

        if (visibilityExceptions.queries) {
            const queryPromises = [];
            for (const name of visibilityExceptions.queries) {
                const finderQuery = finder.list.get(name);
                if (!finderQuery) continue;
                queryPromises.push(finderQuery.test());
            }
            const maps = await Promise.all(queryPromises);
            const map = OBC.ModelIdMapUtils.join(maps);
            promises.push(hider.set(!defaultVisibility, map));
        }

        const colorsMap = new Map <string, OBC.ModelIdMap>();
        const addStyleMap = (color: string, map: OBC.ModelIdMap) => {
            let colorMap = colorsMap.get(color);
            if (!colorMap) {
                colorMap = {};
                colorsMap.set(color, colorMap);
            }
            OBC.ModelIdMapUtils.add(colorMap, map)
        }

        if (colors.queries) {
            for (const [color, queryNames] of Object.entries(colors.queries)) {
                const queryPromises = []
                for (const name of queryNames) {
                    const finderQuery = finder.list.get(name);
                    if (!finderQuery) continue;
                    queryPromises.push(finderQuery.test())
                }
                const maps = await Promise.all(queryPromises);
                const map = OBC.ModelIdMapUtils.join(maps);
                addStyleMap(color, map);
            }
        }

        if (colors.items) {
            // Los colores individuales prevalecen sobre los colores aplicados por consulta.
            // Quita esos elementos de los mapas de color de las consultas antes de añadir
            // los mapas de colores individuales.
            for (const queryColorMap of colorsMap.values()) {
                for (const itemColorMap of Object.values(colors.items)) {
                    for (const [modelId, localIds] of Object.entries(itemColorMap)) {
                        const queryLocalIds = queryColorMap[modelId];
                        if (!queryLocalIds) continue;

                        for (const localId of localIds) {
                            queryLocalIds.delete(localId);
                        }

                        if (queryLocalIds.size === 0) {
                            delete queryColorMap[modelId];
                        }
                    }
                }
            }
        }

        if (colors.items) {
            for (const [style, map] of Object.entries(colors.items)) {
                addStyleMap(style, map);
            }
        }

        for (const [color, map] of colorsMap.entries()) {
            if (!highlighter.styles.has(color)) {
                highlighter.styles.set(color, {
                    color: new THREE.Color(color),
                    renderedFaces: 1,
                    opacity: 1,
                    transparent: false,
                });
            }
            promises.push(highlighter.highlightByID(color, map));
        }

        await Promise.all(promises);

        this.currentState = this.clone(view);
        this.currentViewId = id;
    }
}

export * from "./src"