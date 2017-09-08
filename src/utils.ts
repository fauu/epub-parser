import map = require('lodash/map')
import isEmpty = require('lodash/isEmpty')
import filter = require('lodash/filter')
import isArrayLike = require('lodash/isArrayLike')
import isArrayLikeObject = require('lodash/isArrayLikeObject')
import flattenDeep = require('lodash/flattenDeep')

export interface ParseNestedObjectConfig {
  preFilter?: (node) => boolean
  postFilter?: (node) => boolean

  // children must be returned from parser
  // or it may not work as expected
  parser?: (node, children) => any
  finalParser?: (node) => any

  childrenKey: string
}

/**
 * parseNestedObject
 * a note about config.parser
 * `children` is a recursively parsed object and should be returned for parser to take effect
 * objects without `children` will be parsed by finalParser
 * @param _rootObject
 * @param config
 */
const parseNestedObjectWrapper = (
  _rootObject: Object | Object[],
  config: ParseNestedObjectConfig
) => {
  const { childrenKey, parser, preFilter, postFilter, finalParser } = config

  if (!_rootObject) {
    return []
  }

  const parseNestedObject = (rootObject: any | any[]): any[] => {
    const makeArray = () => {
      if (
        Array.isArray(rootObject) ||
        isArrayLikeObject(rootObject) ||
        isArrayLike(rootObject)
      ) {
        return rootObject
      }
      return [rootObject]
    }
    const rootArray = makeArray()

    let result = rootArray

    if (preFilter) {
      result = filter(result, preFilter)
    }

    result = map(result, (object, index) => {
      if (object[childrenKey]) {
        const parsedChildren = parseNestedObject(object[childrenKey])
        // in parseHTML, if a tag is in unwrap list, like <span>aaa<span>bbb</span></span>
        // the result needs to be flatten
        const children = isEmpty(parsedChildren)
          ? undefined
          : flattenDeep(parsedChildren)
        if (parser) {
          return parser(object, children)
        }
        return {
          ...object,
          ...{
            [childrenKey]: children
          }
        }
      }

      if (finalParser) {
        return finalParser(object)
      }
      return object
    })

    if (postFilter) {
      result = filter(result, postFilter)
    }

    return result
  }

  return flattenDeep(parseNestedObject(_rootObject))
}

export const parseNestedObject = parseNestedObjectWrapper
