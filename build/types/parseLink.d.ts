export default function parseHref(href: any): {
    hash: any;
    name: string;
    ext: string;
    prefix: any;
    url: any;
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

