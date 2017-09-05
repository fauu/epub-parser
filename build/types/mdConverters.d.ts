export declare const resolveInlineNavHref: (href: any) => any;
export declare const h: {
    filter: string[];
    replacement: (innerHTML: any, node: HTMLElement) => string;
};
export declare const span: {
    filter: string[];
    replacement: (innerHTML: any, node: any) => any;
};
export declare const a: {
    filter: string[];
    replacement: (innerHTML: any, node: HTMLEmbedElement) => string;
};
export declare const div: {
    filter: string[];
    replacement: (innerHTML: any, node: any) => string;
};
export declare const img: {
    filter: string[];
    replacement: (innerHTML: any, node: any) => string;
};
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

