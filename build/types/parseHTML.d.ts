export interface ParseHTMLObjectConfig {
    resolveSrc?: (src: string) => string;
    resolveHref?: (href: string) => string;
}
declare const parseHTMLObject: (HTMLString: any, config?: ParseHTMLObjectConfig) => HtmlNodeObject[];
export default parseHTMLObject;
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

