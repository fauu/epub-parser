export interface ParseNestedObjectConfig {
    preFilter?: (node) => boolean;
    postFilter?: (node) => boolean;
    parser?: (node, children) => any;
    finalParser?: (node) => any;
    childrenKey: string;
}
export declare const parseNestedObject: (_rootObject: Object | Object[], config: ParseNestedObjectConfig) => any[];
interface GeneralObject {
  [key: string]: any
}

interface HtmlNodeObject {
  tag?: string
  type: 1 | 3
  text?: string
  children?: HtmlNodeObject[]
  attrs: {
    id: string
    href: string
    src: string
  }
}

