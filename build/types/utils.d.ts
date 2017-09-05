export interface ParseNestedObjectConfig {
    preFilter?: (node) => boolean;
    postFilter?: (node) => boolean;
    parser?: (node, children) => any;
    finalParser?: (node) => any;
    childrenKey: string;
}
export declare const parseNestedObject: (_rootObject: Object | Object[], config: ParseNestedObjectConfig) => any[];
