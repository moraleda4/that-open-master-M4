import * as OBC from "@thatopen/components"

export interface SmartViewsListState {
    components: OBC.Components;
    onSmartViewsChange: () => Promise<void>;
    onUpdateRequest: (id: string, name: string) => void;
}

export type SmartViewsListTableData = {
    guid: string;
    Name: string;
    Actions: string;
};

