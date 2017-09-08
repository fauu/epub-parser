require('source-map-support').install()
module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 24);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const last = __webpack_require__(18);
function parseHref(href) {
    const hash = href.split('#')[1];
    const url = href.split('#')[0];
    const prefix = url.split('/').slice(0, -1).join('/');
    const filename = last(url.split('/'));
    const name = filename.split('.').slice(0, -1).join('.');
    let ext = last(filename.split('.'));
    if (filename.indexOf('.') === -1) {
        ext = '';
    }
    return { hash, name, ext, prefix, url };
}
exports.default = parseHref;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const jsdom_1 = __webpack_require__(11);
const isEmpty = __webpack_require__(3);
const utils_1 = __webpack_require__(2);
const debug = __webpack_require__(9)('readr:html');
const OMITTED_TAGS = ['head', 'input', 'textarea', 'script', 'style', 'svg'];
const UNWRAP_TAGS = ['body', 'html', 'div', 'span'];
const PICKED_ATTRS = ['href', 'src', 'id'];
const parseRawHTML = HTMLString => {
    return jsdom_1.default.jsdom(HTMLString, {
        features: {
            FetchExternalResources: [],
            ProcessExternalResources: false
        }
    }).documentElement;
};
/**
 * recursivelyReadParent
 * @param node
 * @param callback invoke every time a parent node is read, return truthy value to stop the reading process
 * @param final callback when reaching the root
 */
const recursivelyReadParent = (node, callback, final) => {
    const _read = _node => {
        const parent = _node.parentNode;
        if (parent) {
            const newNode = callback(parent);
            if (!newNode) {
                return _read(parent);
            }
            return newNode;
        } else {
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
    return utils_1.parseNestedObject(rootNode, {
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
            } else {
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
                    if (!tag || UNWRAP_TAGS.indexOf(tag) !== -1) {
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
            return !isEmpty(node);
        }
    });
};
exports.default = parseHTMLObject;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const map = __webpack_require__(4);
const isEmpty = __webpack_require__(3);
const filter = __webpack_require__(12);
const isArrayLike = __webpack_require__(16);
const isArrayLikeObject = __webpack_require__(17);
const flattenDeep = __webpack_require__(14);
/**
 * parseNestedObject
 * a note about config.parser
 * `children` is a recursively parsed object and should be returned for parser to take effect
 * objects without `children` will be parsed by finalParser
 * @param _rootObject
 * @param config
 */
const parseNestedObjectWrapper = (_rootObject, config) => {
    const { childrenKey, parser, preFilter, postFilter, finalParser } = config;
    if (!_rootObject) {
        return [];
    }
    const parseNestedObject = rootObject => {
        const makeArray = () => {
            if (Array.isArray(rootObject) || isArrayLikeObject(rootObject) || isArrayLike(rootObject)) {
                return rootObject;
            }
            return [rootObject];
        };
        const rootArray = makeArray();
        let result = rootArray;
        if (preFilter) {
            result = filter(result, preFilter);
        }
        result = map(result, (object, index) => {
            if (object[childrenKey]) {
                const parsedChildren = parseNestedObject(object[childrenKey]);
                // in parseHTML, if a tag is in unwrap list, like <span>aaa<span>bbb</span></span>
                // the result needs to be flatten
                const children = isEmpty(parsedChildren) ? undefined : flattenDeep(parsedChildren);
                if (parser) {
                    return parser(object, children);
                }
                return Object.assign({}, object, {
                    [childrenKey]: children
                });
            }
            if (finalParser) {
                return finalParser(object);
            }
            return object;
        });
        if (postFilter) {
            result = filter(result, postFilter);
        }
        return result;
    };
    return flattenDeep(parseNestedObject(_rootObject));
};
exports.parseNestedObject = parseNestedObjectWrapper;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("lodash/isEmpty");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("lodash/map");

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const epubParser_1 = __webpack_require__(6);
const parseLink_1 = __webpack_require__(0);
exports.parseLink = parseLink_1.default;
const parseHTML_1 = __webpack_require__(1);
exports.parseHTML = parseHTML_1.default;
const utils_1 = __webpack_require__(2);
exports.parseNestedObject = utils_1.parseNestedObject;
exports.default = epubParser_1.default;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __webpack_require__(10);
const xml2js_1 = __webpack_require__(23);
const get = __webpack_require__(15);
const find = __webpack_require__(13);
const map = __webpack_require__(4);
const union = __webpack_require__(19);
const node_zip_1 = __webpack_require__(20);
const parseLink_1 = __webpack_require__(0);
const parseSection_1 = __webpack_require__(8);
const xmlParser = new xml2js_1.default.Parser();
const xmlToJs = xml => {
    return new Promise((resolve, reject) => {
        xmlParser.parseString(xml, (err, object) => {
            if (err) {
                reject(err);
            } else {
                resolve(object);
            }
        });
    });
};
const determineRoot = opfPath => {
    let root = '';
    // set the opsRoot for resolving paths
    if (opfPath.match(/\//)) {
        // not at top level
        root = opfPath.replace(/\/([^\/]+)\.opf/i, '');
        if (!root.match(/\/$/)) {
            // 以 '/' 结尾，下面的 zip 路径写法会简单很多
            root += '/';
        }
        if (root.match(/^\//)) {
            root = root.replace(/^\//, '');
        }
    }
    return root;
};
const parseMetadata = metadata => {
    const title = get(metadata[0], ['dc:title', 0]);
    let author = get(metadata[0], ['dc:creator', 0]);
    if (typeof author === 'object') {
        author = get(author, ['_']);
    }
    const publisher = get(metadata[0], ['dc:publisher', 0]);
    const meta = {
        title,
        author,
        publisher
    };
    return meta;
};

let Epub = function () {
    function Epub(buffer) {
        _classCallCheck(this, Epub);

        this._zip = new node_zip_1.default(buffer, {
            binary: true,
            base64: false,
            checkCRC32: true
        });
    }

    _createClass(Epub, [{
        key: "resolve",
        value: function resolve(path) {
            let _path;
            if (path[0] === '/') {
                // use absolute path, root is zip root
                _path = path.substr(1);
            } else {
                _path = this._root + path;
            }
            const file = this._zip.file(decodeURI(_path));
            if (file) {
                return file;
            } else {
                throw new Error(`${_path} not found!`);
            }
        }
    }, {
        key: "_resolveXMLAsJsObject",
        value: function _resolveXMLAsJsObject(path) {
            return __awaiter(this, void 0, void 0, function* () {
                const xml = this.resolve(path).asText();
                return xmlToJs(xml);
            });
        }
    }, {
        key: "_getOpfPath",
        value: function _getOpfPath() {
            return __awaiter(this, void 0, void 0, function* () {
                const container = yield this._resolveXMLAsJsObject('/META-INF/container.xml');
                const opfPath = container.container.rootfiles[0].rootfile[0]['$']['full-path'];
                return opfPath;
            });
        }
    }, {
        key: "_getManifest",
        value: function _getManifest(content) {
            return get(content, ['package', 'manifest', 0, 'item'], []).map(item => item.$);
        }
    }, {
        key: "_resolveIdFromLink",
        value: function _resolveIdFromLink(href) {
            const { name: tarName } = parseLink_1.default(href);
            const tarItem = find(this._manifest, item => {
                const { name } = parseLink_1.default(item.href);
                return name === tarName;
            });
            return get(tarItem, 'id');
        }
    }, {
        key: "_getSpine",
        value: function _getSpine() {
            return get(this._content, ['package', 'spine', 0, 'itemref'], []).map(item => {
                return item.$.idref;
            });
        }
    }, {
        key: "_genStructure",
        value: function _genStructure(tocObj, resolveNodeId = false) {
            const rootNavPoints = get(tocObj, ['ncx', 'navMap', '0', 'navPoint'], []);
            const parseNavPoint = navPoint => {
                // link to section
                const path = get(navPoint, ['content', '0', '$', 'src'], '');
                const name = get(navPoint, ['navLabel', '0', 'text', '0']);
                const playOrder = get(navPoint, ['$', 'playOrder']);
                const { hash: nodeId } = parseLink_1.default(path);
                let children = navPoint.navPoint;
                if (children) {
                    // tslint:disable-next-line:no-use-before-declare
                    children = parseNavPoints(children);
                }
                const sectionId = this._resolveIdFromLink(path);
                return {
                    name,
                    sectionId,
                    nodeId,
                    path,
                    playOrder,
                    children
                };
            };
            const parseNavPoints = navPoints => {
                return navPoints.map(point => {
                    return parseNavPoint(point);
                });
            };
            return parseNavPoints(rootNavPoints);
        }
    }, {
        key: "_resolveSectionsFromSpine",
        value: function _resolveSectionsFromSpine(expand = false) {
            // no chain
            return map(union(this._spine), id => {
                const path = find(this._manifest, { id }).href;
                const html = this.resolve(path).asText();
                return parseSection_1.default({
                    id,
                    htmlString: html,
                    resourceResolver: this.resolve.bind(this),
                    idResolver: this._resolveIdFromLink.bind(this),
                    expand
                });
            });
        }
    }, {
        key: "parse",
        value: function parse(expand = false) {
            return __awaiter(this, void 0, void 0, function* () {
                const opfPath = yield this._getOpfPath();
                this._root = determineRoot(opfPath);
                const content = yield this._resolveXMLAsJsObject('/' + opfPath);
                const manifest = this._getManifest(content);
                const tocID = get(content, ['package', 'spine', 0, '$', 'toc'], '');
                const tocPath = find(manifest, { id: tocID }).href;
                const toc = yield this._resolveXMLAsJsObject(tocPath);
                const metadata = get(content, ['package', 'metadata'], []);
                this._manifest = manifest;
                this._content = content;
                this._opfPath = opfPath;
                this._toc = toc;
                this._spine = this._getSpine();
                this._metadata = metadata;
                this.info = parseMetadata(metadata);
                this.sections = this._resolveSectionsFromSpine(expand);
                this.structure = this._genStructure(toc);
                return this;
            });
        }
    }]);

    return Epub;
}();

exports.Epub = Epub;
function parserWrapper(target, options = {}) {
    // seems 260 is the length limit of old windows standard
    // so path length is not used to determine whether it's path or binary string
    // the downside here is that if the filepath is incorrect, it will be treated as binary string by default
    // but it can use options to define the target type
    const { type, expand } = options;
    let _target = target;
    if (type === 'path' || typeof target === 'string' && fs_1.default.existsSync(target)) {
        _target = fs_1.default.readFileSync(target, 'binary');
    }
    return new Epub(_target).parse(expand);
}
exports.default = parserWrapper;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const parseLink_1 = __webpack_require__(0);
exports.resolveInlineNavHref = href => {
    if (href && href.indexOf('http://') === -1) {
        const parsed = parseLink_1.default(href);
        if (parsed.hash) {
            return `#${parsed.name}$${parsed.hash}`;
        }
        return `#${parsed.name}`;
    }
    return href;
};
exports.h = {
    filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    replacement: function (innerHTML, node) {
        let hLevel = node.tagName.charAt(1);
        let hPrefix = '';
        for (let i = 0; i < hLevel; i++) {
            hPrefix += '#';
        }
        // return `\n${hPrefix} ${innerHTML.trim()}\n\n`
        const hTag = node.tagName.toLowerCase();
        const id = node.getAttribute('id');
        if (!id) {
            return `\n${hPrefix} ${innerHTML}\n\n`;
        }
        // 块级元素若保留原标签需添加换行符，否则临近元素渲染会出现问题
        return `\n<${hTag} id="${id}">${innerHTML.trim().split('\n').join(' ')}</${hTag}>\n\n`;
    }
};
exports.span = {
    filter: ['span'],
    replacement: function (innerHTML, node) {
        return innerHTML;
    }
};
exports.a = {
    filter: ['a'],
    replacement: function (innerHTML, node) {
        const href = node.getAttribute('href');
        return `\n[${innerHTML}](${exports.resolveInlineNavHref(href)})\n\n`;
    }
};
exports.div = {
    filter: ['div'],
    replacement: function (innerHTML, node) {
        return `\n${innerHTML}\n\n`;
    }
};
exports.img = {
    filter: ['img'],
    replacement: function (innerHTML, node) {
        return `\n[图]\n\n`;
    }
};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __webpack_require__(21);
const to_markdown_1 = __webpack_require__(22);
const parseLink_1 = __webpack_require__(0);
const parseHTML_1 = __webpack_require__(1);
const mdConverters = __webpack_require__(7);
const isInternalUri = uri => {
    return uri.indexOf('http://') === -1 && uri.indexOf('https://') === -1;
};

let Section = function () {
    function Section({ id, htmlString, resourceResolver, idResolver, expand }) {
        _classCallCheck(this, Section);

        this.id = id;
        this.htmlString = htmlString;
        this._resourceResolver = resourceResolver;
        this._idResolver = idResolver;
        if (expand) {
            this.htmlObjects = this.toHtmlObjects();
        }
    }

    _createClass(Section, [{
        key: "toMarkdown",
        value: function toMarkdown() {
            return to_markdown_1.default(this.htmlString, {
                converters: [mdConverters.h, mdConverters.span, mdConverters.div, mdConverters.img, mdConverters.a]
            });
        }
    }, {
        key: "toHtmlObjects",
        value: function toHtmlObjects() {
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
    }]);

    return Section;
}();

exports.Section = Section;
const parseSection = config => {
    return new Section(config);
};
exports.default = parseSection;

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("debug");

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("jsdom");

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("lodash/filter");

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = require("lodash/find");

/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = require("lodash/flattenDeep");

/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = require("lodash/get");

/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = require("lodash/isArrayLike");

/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = require("lodash/isArrayLikeObject");

/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = require("lodash/last");

/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = require("lodash/union");

/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = require("node-zip");

/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = require("to-markdown");

/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = require("xml2js");

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(5);


/***/ })
/******/ ]);