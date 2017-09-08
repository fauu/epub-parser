"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const _toMarkdown = require('to-markdown');
const parseLink_1 = require("./parseLink");
const parseHTML_1 = require("./parseHTML");
const mdConverters = require("./mdConverters");
const isInternalUri = uri => {
    return uri.indexOf('http://') === -1 && uri.indexOf('https://') === -1;
};
class Section {
    constructor({ id, htmlString, resourceResolver, idResolver, expand }) {
        this.id = id;
        this.htmlString = htmlString;
        this._resourceResolver = resourceResolver;
        this._idResolver = idResolver;
        if (expand) {
            this.htmlObjects = this.toHtmlObjects();
        }
    }
    toMarkdown() {
        return _toMarkdown(this.htmlString, {
            converters: [
                mdConverters.h,
                mdConverters.span,
                mdConverters.div,
                mdConverters.img,
                mdConverters.a
            ]
        });
    }
    toHtmlObjects() {
        return parseHTML_1.default(this.htmlString, {
            resolveHref: href => {
                if (isInternalUri(href)) {
                    const { hash } = parseLink_1.default(href);
                    // todo: what if a link only contains hash part?
                    const sectionId = this._idResolver(href);
                    if (hash) {
                        return `#${sectionId},${hash}`;
                    }
                    return `#${sectionId}`;
                }
                return href;
            },
            resolveSrc: src => {
                if (isInternalUri(src)) {
                    // todo: may have bugs
                    const absolutePath = path_1.default.resolve('/', src).substr(1);
                    const buffer = this._resourceResolver(absolutePath).asNodeBuffer();
                    const base64 = buffer.toString('base64');
                    return `data:image/png;base64,${base64}`;
                }
                return src;
            }
        });
    }
}
exports.Section = Section;
const parseSection = (config) => {
    return new Section(config);
};
exports.default = parseSection;
