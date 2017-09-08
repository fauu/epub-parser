"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const xml2js = require('xml2js');
const get = require("lodash/get");
const find = require("lodash/find");
const map = require("lodash/map");
const union = require("lodash/union");
const nodeZip = require('node-zip');
const parseLink_1 = require("./parseLink");
const parseSection_1 = require("./parseSection");
const xmlParser = new xml2js.Parser();
const xmlToJs = xml => {
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
class Epub {
    constructor(buffer) {
        this._zip = new nodeZip(buffer, {
            binary: true,
            base64: false,
            checkCRC32: true
        });
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
        return get(content, ['package', 'manifest', 0, 'item'], []).map(item => item.$);
    }
    _resolveIdFromLink(href) {
        const { name: tarName } = parseLink_1.default(href);
        const tarItem = find(this._manifest, item => {
            const { name } = parseLink_1.default(item.href);
            return name === tarName;
        });
        return get(tarItem, 'id');
    }
    _getSpine() {
        return get(this._content, ['package', 'spine', 0, 'itemref'], []).map(item => {
            return item.$.idref;
        });
    }
    _genStructure(tocObj, resolveNodeId = false) {
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
    _resolveSectionsFromSpine(expand = false) {
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
    parse(expand = false) {
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
}
exports.Epub = Epub;
function parserWrapper(target, options = {}) {
    // seems 260 is the length limit of old windows standard
    // so path length is not used to determine whether it's path or binary string
    // the downside here is that if the filepath is incorrect, it will be treated as binary string by default
    // but it can use options to define the target type
    const { type, expand } = options;
    let _target = target;
    if (type === 'path' ||
        (typeof target === 'string' && fs_1.default.existsSync(target))) {
        _target = fs_1.default.readFileSync(target, 'binary');
    }
    return new Epub(_target).parse(expand);
}
exports.default = parserWrapper;
