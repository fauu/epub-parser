import jsdom from 'jsdom';
import _ from 'lodash';
import { parseNestedObject } from './utils';
const debug = require('debug')('readr:html');
const OMITTED_TAGS = ['head', 'input', 'textarea', 'script', 'style', 'svg'];
const UNWRAP_TAGS = ['body', 'html', 'div', 'span'];
const PICKED_ATTRS = ['href', 'src', 'id'];
const parseRawHTML = HTMLString => {
    return jsdom
        .jsdom(HTMLString, {
        features: {
            FetchExternalResources: [],
            ProcessExternalResources: false
        }
    })
        .documentElement;
};
/**
 * recursivelyReadParent
 * @param node
 * @param callback invoke every time a parent node is read, return truthy value to stop the reading process
 * @param final callback when reaching the root
 */
const recursivelyReadParent = (node, callback, final) => {
    const _read = (_node) => {
        const parent = _node.parentNode;
        if (parent) {
            const newNode = callback(parent);
            if (!newNode) {
                return _read(parent);
            }
            return newNode;
        }
        else {
            if (final) {
                return final();
            }
            return node;
        }
    };
    return _read(node);
};
const parseHTMLObject = (HTMLString, config = {}) => {
    debug('parseHTMLObject');
    const rootNode = parseRawHTML(HTMLString);
    const { resolveHref, resolveSrc } = config;
    // initial parse
    return parseNestedObject(rootNode, {
        childrenKey: 'childNodes',
        preFilter(node) {
            return node.nodeType === 1 || node.nodeType === 3;
        },
        parser(node, children) {
            if (node.nodeType === 1) {
                const tag = node.tagName.toLowerCase();
                const attrs = {};
                if (OMITTED_TAGS.indexOf(tag) !== -1) {
                    return null;
                }
                if (UNWRAP_TAGS.indexOf(tag) !== -1 && children) {
                    return children.length === 1 ? children[0] : children;
                }
                PICKED_ATTRS.forEach(attr => {
                    let attrVal = node.getAttribute(attr) || undefined;
                    if (attrVal && attr === 'href' && resolveHref) {
                        attrVal = resolveHref(attrVal);
                    }
                    if (attrVal && attr === 'src' && resolveSrc) {
                        attrVal = resolveSrc(attrVal);
                    }
                    attrs[attr] = attrVal;
                });
                return { tag, type: 1, children, attrs };
            }
            else {
                const text = node.textContent.trim();
                if (!text) {
                    return null;
                }
                const makeTextObject = () => {
                    return {
                        type: 3,
                        text
                    };
                };
                // find the cloest parent which is not in UNWRAP_TAGS
                // if failed then wrap with p tag
                return recursivelyReadParent(node, parent => {
                    const tag = parent.tagName && parent.tagName.toLowerCase();
                    if (!tag || (UNWRAP_TAGS.indexOf(tag) !== -1)) {
                        return false;
                    }
                    return makeTextObject();
                }, () => {
                    return {
                        tag: 'p',
                        children: [makeTextObject()]
                    };
                });
            }
        },
        postFilter(node) {
            return !_.isEmpty(node);
        }
    });
};
export default parseHTMLObject;
