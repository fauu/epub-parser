export interface ParseHTMLObjectConfig {
    resolveSrc?: (src: string) => string;
    resolveHref?: (href: string) => string;
}
declare const parseHTMLObject: (HTMLString: any, config?: ParseHTMLObjectConfig) => HtmlNodeObject[];
export default parseHTMLObject;
