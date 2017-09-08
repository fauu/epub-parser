"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const last = require("lodash/last");
function parseHref(href) {
    const hash = href.split('#')[1];
    const url = href.split('#')[0];
    const prefix = url
        .split('/')
        .slice(0, -1)
        .join('/');
    const filename = last(url.split('/'));
    const name = filename
        .split('.')
        .slice(0, -1)
        .join('.');
    let ext = last(filename.split('.'));
    if (filename.indexOf('.') === -1) {
        ext = '';
    }
    return { hash, name, ext, prefix, url };
}
exports.default = parseHref;
