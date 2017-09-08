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
/******/ 	return __webpack_require__(__webpack_require__.s = 15);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = parseHref;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_lodash__);

function parseHref(href) {
    const hash = href.split('#')[1];
    const url = href.split('#')[0];
    const prefix = url.split('/').slice(0, -1).join('/');
    const filename = __WEBPACK_IMPORTED_MODULE_0_lodash___default.a.last(url.split('/'));
    const name = filename.split('.').slice(0, -1).join('.');
    let ext = __WEBPACK_IMPORTED_MODULE_0_lodash___default.a.last(filename.split('.'));
    if (filename.indexOf('.') === -1) {
        ext = '';
    }
    return { hash, name, ext, prefix, url };
}


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("lodash");

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jsdom__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jsdom___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jsdom__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_lodash__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_lodash___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_lodash__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils__ = __webpack_require__(3);



const debug = __webpack_require__(8)('readr:html');
const OMITTED_TAGS = ['head', 'input', 'textarea', 'script', 'style', 'svg'];
const UNWRAP_TAGS = ['body', 'html', 'div', 'span'];
const PICKED_ATTRS = ['href', 'src', 'id'];
const parseRawHTML = HTMLString => {
    return __WEBPACK_IMPORTED_MODULE_0_jsdom___default.a
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
    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__utils__["a" /* parseNestedObject */])(rootNode, {
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
            return !__WEBPACK_IMPORTED_MODULE_1_lodash___default.a.isEmpty(node);
        }
    });
};
/* harmony default export */ __webpack_exports__["a"] = (parseHTMLObject);


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_lodash__);

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
    const parseNestedObject = (rootObject) => {
        const makeArray = () => {
            if (Array.isArray(rootObject) || __WEBPACK_IMPORTED_MODULE_0_lodash___default.a.isArrayLikeObject(rootObject) || __WEBPACK_IMPORTED_MODULE_0_lodash___default.a.isArrayLike(rootObject)) {
                return rootObject;
            }
            return [rootObject];
        };
        const rootArray = makeArray();
        let result = rootArray;
        if (preFilter) {
            result = __WEBPACK_IMPORTED_MODULE_0_lodash___default.a.filter(result, preFilter);
        }
        result = __WEBPACK_IMPORTED_MODULE_0_lodash___default.a.map(result, (object, index) => {
            if (object[childrenKey]) {
                const parsedChildren = parseNestedObject(object[childrenKey]);
                // in parseHTML, if a tag is in unwrap list, like <span>aaa<span>bbb</span></span>
                // the result needs to be flatten
                const children = __WEBPACK_IMPORTED_MODULE_0_lodash___default.a.isEmpty(parsedChildren) ? undefined : __WEBPACK_IMPORTED_MODULE_0_lodash___default.a.flattenDeep(parsedChildren);
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
            result = __WEBPACK_IMPORTED_MODULE_0_lodash___default.a.filter(result, postFilter);
        }
        return result;
    };
    return __WEBPACK_IMPORTED_MODULE_0_lodash___default.a.flattenDeep(parseNestedObject(_rootObject));
};
const parseNestedObject = parseNestedObjectWrapper;
/* harmony export (immutable) */ __webpack_exports__["a"] = parseNestedObject;



/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__epubParser__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__parseLink__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__parseHTML__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__utils__ = __webpack_require__(3);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "parseLink", function() { return __WEBPACK_IMPORTED_MODULE_1__parseLink__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "parseHTML", function() { return __WEBPACK_IMPORTED_MODULE_2__parseHTML__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "parseNestedObject", function() { return __WEBPACK_IMPORTED_MODULE_3__utils__["a"]; });





/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_0__epubParser__["a" /* default */]);


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = parserWrapper;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_fs__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_fs___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_fs__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_xml2js__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_xml2js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_xml2js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_lodash__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_lodash___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_lodash__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_node_zip__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_node_zip___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_node_zip__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__parseLink__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__parseSection__ = __webpack_require__(7);
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};






const xmlParser = new __WEBPACK_IMPORTED_MODULE_1_xml2js___default.a.Parser();
const xmlToJs = (xml) => {
    return new Promise((resolve, reject) => {
        xmlParser.parseString(xml, (err, object) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(object);
            }
        });
    });
};
const determineRoot = (opfPath) => {
    let root = '';
    // set the opsRoot for resolving paths
    if (opfPath.match(/\//)) {
        root = opfPath.replace(/\/([^\/]+)\.opf/i, '');
        if (!root.match(/\/$/)) {
            root += '/';
        }
        if (root.match(/^\//)) {
            root = root.replace(/^\//, '');
        }
    }
    return root;
};
const parseMetadata = (metadata) => {
    const title = __WEBPACK_IMPORTED_MODULE_2_lodash___default.a.get(metadata[0], ['dc:title', 0]);
    let author = __WEBPACK_IMPORTED_MODULE_2_lodash___default.a.get(metadata[0], ['dc:creator', 0]);
    if (typeof author === 'object') {
        author = __WEBPACK_IMPORTED_MODULE_2_lodash___default.a.get(author, ['_']);
    }
    const publisher = __WEBPACK_IMPORTED_MODULE_2_lodash___default.a.get(metadata[0], ['dc:publisher', 0]);
    const meta = {
        title,
        author,
        publisher
    };
    return meta;
};
class Epub {
    constructor(buffer) {
        this._zip = new __WEBPACK_IMPORTED_MODULE_3_node_zip___default.a(buffer, { binary: true, base64: false, checkCRC32: true });
    }
    resolve(path) {
        let _path;
        if (path[0] === '/') {
            // use absolute path, root is zip root
            _path = path.substr(1);
        }
        else {
            _path = this._root + path;
        }
        const file = this._zip.file(decodeURI(_path));
        if (file) {
            return file;
        }
        else {
            throw new Error(`${_path} not found!`);
        }
    }
    _resolveXMLAsJsObject(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const xml = this.resolve(path).asText();
            return xmlToJs(xml);
        });
    }
    _getOpfPath() {
        return __awaiter(this, void 0, void 0, function* () {
            const container = yield this._resolveXMLAsJsObject('/META-INF/container.xml');
            const opfPath = container.container.rootfiles[0].rootfile[0]['$']['full-path'];
            return opfPath;
        });
    }
    _getManifest(content) {
        return __WEBPACK_IMPORTED_MODULE_2_lodash___default.a.get(content, ['package', 'manifest', 0, 'item'], [])
            .map(item => item.$);
    }
    _resolveIdFromLink(href) {
        const { name: tarName } = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__parseLink__["a" /* default */])(href);
        const tarItem = __WEBPACK_IMPORTED_MODULE_2_lodash___default.a.find(this._manifest, item => {
            const { name } = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__parseLink__["a" /* default */])(item.href);
            return name === tarName;
        });
        return __WEBPACK_IMPORTED_MODULE_2_lodash___default.a.get(tarItem, 'id');
    }
    _getSpine() {
        return __WEBPACK_IMPORTED_MODULE_2_lodash___default.a.get(this._content, ['package', 'spine', 0, 'itemref'], [])
            .map(item => {
            return item.$.idref;
        });
    }
    _genStructure(tocObj, resolveNodeId = false) {
        const rootNavPoints = __WEBPACK_IMPORTED_MODULE_2_lodash___default.a.get(tocObj, ['ncx', 'navMap', '0', 'navPoint'], []);
        const parseNavPoint = (navPoint) => {
            // link to section
            const path = __WEBPACK_IMPORTED_MODULE_2_lodash___default.a.get(navPoint, ['content', '0', '$', 'src'], '');
            const name = __WEBPACK_IMPORTED_MODULE_2_lodash___default.a.get(navPoint, ['navLabel', '0', 'text', '0']);
            const playOrder = __WEBPACK_IMPORTED_MODULE_2_lodash___default.a.get(navPoint, ['$', 'playOrder']);
            const { hash: nodeId } = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__parseLink__["a" /* default */])(path);
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
        const parseNavPoints = (navPoints) => {
            return navPoints.map(point => {
                return parseNavPoint(point);
            });
        };
        return parseNavPoints(rootNavPoints);
    }
    _resolveSectionsFromSpine(expand = false) {
        // no chain
        return __WEBPACK_IMPORTED_MODULE_2_lodash___default.a.map(__WEBPACK_IMPORTED_MODULE_2_lodash___default.a.union(this._spine), id => {
            const path = __WEBPACK_IMPORTED_MODULE_2_lodash___default.a.find(this._manifest, { id }).href;
            const html = this.resolve(path).asText();
            return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__parseSection__["a" /* default */])({
                id,
                htmlString: html,
                resourceResolver: this.resolve.bind(this),
                idResolver: this._resolveIdFromLink.bind(this),
                expand
            });
        });
    }
    parse(expand = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const opfPath = yield this._getOpfPath();
            this._root = determineRoot(opfPath);
            const content = yield this._resolveXMLAsJsObject('/' + opfPath);
            const manifest = this._getManifest(content);
            const tocID = __WEBPACK_IMPORTED_MODULE_2_lodash___default.a.get(content, ['package', 'spine', 0, '$', 'toc'], '');
            const tocPath = __WEBPACK_IMPORTED_MODULE_2_lodash___default.a.find(manifest, { id: tocID }).href;
            const toc = yield this._resolveXMLAsJsObject(tocPath);
            const metadata = __WEBPACK_IMPORTED_MODULE_2_lodash___default.a.get(content, ['package', 'metadata'], []);
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
}
/* unused harmony export Epub */

function parserWrapper(target, options = {}) {
    // seems 260 is the length limit of old windows standard
    // so path length is not used to determine whether it's path or binary string
    // the downside here is that if the filepath is incorrect, it will be treated as binary string by default
    // but it can use options to define the target type
    const { type, expand } = options;
    let _target = target;
    if (type === 'path' || (typeof target === 'string' && __WEBPACK_IMPORTED_MODULE_0_fs___default.a.existsSync(target))) {
        _target = __WEBPACK_IMPORTED_MODULE_0_fs___default.a.readFileSync(target, 'binary');
    }
    return new Epub(_target).parse(expand);
}


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__parseLink__ = __webpack_require__(0);

const resolveInlineNavHref = href => {
    if (href && href.indexOf('http://') === -1) {
        const parsed = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__parseLink__["a" /* default */])(href);
        if (parsed.hash) {
            return `#${parsed.name}$${parsed.hash}`;
        }
        return `#${parsed.name}`;
    }
    return href;
};
/* unused harmony export resolveInlineNavHref */

const h = {
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
/* harmony export (immutable) */ __webpack_exports__["a"] = h;

const span = {
    filter: ['span'],
    replacement: function (innerHTML, node) {
        return innerHTML;
    }
};
/* harmony export (immutable) */ __webpack_exports__["b"] = span;

const a = {
    filter: ['a'],
    replacement: function (innerHTML, node) {
        const href = node.getAttribute('href');
        return `\n[${innerHTML}](${resolveInlineNavHref(href)})\n\n`;
    }
};
/* harmony export (immutable) */ __webpack_exports__["e"] = a;

const div = {
    filter: ['div'],
    replacement: function (innerHTML, node) {
        return `\n${innerHTML}\n\n`;
    }
};
/* harmony export (immutable) */ __webpack_exports__["c"] = div;

const img = {
    filter: ['img'],
    replacement: function (innerHTML, node) {
        return `\n[图]\n\n`;
    }
};
/* harmony export (immutable) */ __webpack_exports__["d"] = img;



/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_path__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_path___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_path__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_to_markdown__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_to_markdown___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_to_markdown__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__parseLink__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__parseHTML__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__mdConverters__ = __webpack_require__(6);





const isInternalUri = (uri) => {
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
        return __WEBPACK_IMPORTED_MODULE_1_to_markdown___default()(this.htmlString, {
            converters: [__WEBPACK_IMPORTED_MODULE_4__mdConverters__["a" /* h */], __WEBPACK_IMPORTED_MODULE_4__mdConverters__["b" /* span */], __WEBPACK_IMPORTED_MODULE_4__mdConverters__["c" /* div */], __WEBPACK_IMPORTED_MODULE_4__mdConverters__["d" /* img */], __WEBPACK_IMPORTED_MODULE_4__mdConverters__["e" /* a */]]
        });
    }
    toHtmlObjects() {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__parseHTML__["a" /* default */])(this.htmlString, {
            resolveHref: (href) => {
                if (isInternalUri(href)) {
                    const { hash } = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__parseLink__["a" /* default */])(href);
                    // todo: what if a link only contains hash part?
                    const sectionId = this._idResolver(href);
                    if (hash) {
                        return `#${sectionId},${hash}`;
                    }
                    return `#${sectionId}`;
                }
                return href;
            },
            resolveSrc: (src) => {
                if (isInternalUri(src)) {
                    // todo: may have bugs
                    const absolutePath = __WEBPACK_IMPORTED_MODULE_0_path___default.a.resolve('/', src).substr(1);
                    const buffer = this._resourceResolver(absolutePath).asNodeBuffer();
                    const base64 = buffer.toString('base64');
                    return `data:image/png;base64,${base64}`;
                }
                return src;
            }
        });
    }
}
/* unused harmony export Section */

const parseSection = (config) => {
    return new Section(config);
};
/* harmony default export */ __webpack_exports__["a"] = (parseSection);


/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("debug");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("jsdom");

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("node-zip");

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = require("to-markdown");

/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = require("xml2js");

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(4);


/***/ })
/******/ ]);