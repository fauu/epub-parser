"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const map = require("lodash/map");
const isEmpty = require("lodash/isEmpty");
const filter = require("lodash/filter");
const isArrayLike = require("lodash/isArrayLike");
const isArrayLikeObject = require("lodash/isArrayLikeObject");
const flattenDeep = require("lodash/flattenDeep");
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
            if (Array.isArray(rootObject) ||
                isArrayLikeObject(rootObject) ||
                isArrayLike(rootObject)) {
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
                const children = isEmpty(parsedChildren)
                    ? undefined
                    : flattenDeep(parsedChildren);
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
