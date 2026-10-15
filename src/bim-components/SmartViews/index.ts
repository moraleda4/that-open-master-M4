import * as THREE from "three"
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { DataMap } from "@thatopen/fragments";
import { SmartView } from "./src";

export class SmartViews extends OBC.Component {
    static uuid = "0d8413c5-7563-4de5-a213-5ac949eacbb1" as const;
    readonly list = new DataMap<string, SmartView>()
    enabled = true;

    async apply(view: SmartView) {
        if (!this.enabled) return;
        const { defaultVisibility, visibilityExceptions, colors } = view;

        const highlighter = this.components.get(OBF.Highlighter);
        const hider = this.components.get(OBC.Hider);
        const finder = this.components.get(OBC.ItemsFinder);

        const promises = [hider.set(defaultVisibility)];

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
    }
}

export * from "./src"