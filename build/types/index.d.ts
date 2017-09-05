import parser from './epubParser';
import parseLink from './parseLink';
import parseHTML from './parseHTML';
import { parseNestedObject } from './utils';
export { parseLink, parseHTML, parseNestedObject };
export default parser;

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

