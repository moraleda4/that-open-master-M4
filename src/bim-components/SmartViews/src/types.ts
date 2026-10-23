import * as OBC from "@thatopen/components"

export interface ViewColors {
    queries?: Record<string, Set<string>>;
    items?: Record<string, OBC.ModelIdMap>;
}

export interface ViewExceptions {
    queries?: Set<string>;
    items?: OBC.ModelIdMap;
}

export interface SmartView {
    name: string;
    colors: ViewColors;
    // Default item visibility behavior
    // If not set, everything will ne visible (see exceptions)
    defaultVisibility: boolean;
    // Items except from the visibility rule
    // If visibility is false, all items will be hidden unless those in exceptions
    // If visibility is true, all items will be visible unless those in exceptions
    visibilityExceptions: ViewExceptions;
}

// Se añade lo siguiente para poder exportar e importar smart views en la app:
export type SerializedModelIdMap = Record<string, number[]>;

export interface SerializedSmartView {
    name: string;
    defaultVisibility: boolean;
    visibilityExceptions: {
        queries?: string[];
        items?: SerializedModelIdMap;
    };
    colors: {
        queries?: Record<string, string[]>;
        items?: Record<string, SerializedModelIdMap>;
    };
}

export interface SmartViewsExport {
    format: "smart-views";
    version: 1;
    queries: ReturnType<import("@thatopen/components").ItemsFinder["export"]>;
    views: Array<{
        id: string;
        view: SerializedSmartView;
    }>;
}