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

    addQueryColor(color: string, query: string) {
        let queriesColors = this.currentState.colors.queries;
        if (!queriesColors) {
            queriesColors = {};
            this.currentState.colors.queries = queriesColors;
        }

        let queriesList = queriesColors[color];
        if (!queriesList) {
            queriesList = new Set();
            queriesColors[color] = queriesList;
        }

        queriesList.add(query);
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

    exportToJSON(): SmartViewsExport {
        const finder = this.components.get(OBC.ItemsFinder);

        return {
            format: "smart-views",
            version: 1,
            // Las vistas dependen de las consultas registradas con estos nombres.
            queries: finder.export(),
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
        const finder = this.components.get(OBC.ItemsFinder);
        finder.import(data.queries);

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

    async reset() {
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
    }

    async apply(view: SmartView) {
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
    }
}

export * from "./src"