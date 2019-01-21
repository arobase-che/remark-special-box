"use strict";

var visit = require('unist-util-visit');
/**
 * Given the MDAST ast, look for all fenced Blockquote
 *
 * @param {object} ast
 * @param {vFile} vFile
 * @return {function}
 */


function visitBlockquote(ast) {
  return visit(ast, 'blockquote', function (node, index, parent) {
    var firstNode = node.children[0];

    if (firstNode.type === 'paragraph') {
      if (firstNode.children[0].type === 'text') {
        var firstChild = firstNode.children[0];

        if (firstChild.value.startsWith('!secret')) {
          node.type = 'div';
          firstChild.value = firstChild.value.substr(7);
          var sum = '';

          if (firstChild.value.indexOf('\n') >= 0) {
            sum = firstChild.value.substr(0, firstChild.value.indexOf('\n')).trim();
            firstChild.value = firstChild.value.substr(firstChild.value.indexOf('\n') + 1);
          } else {
            sum = firstChild.value;
            firstChild.value = '';
          }

          var secret = {
            type: 'special-box-secret',
            children: [node, {
              type: 'summary',
              data: {
                hName: 'summary',
                hChildren: [{
                  type: 'text',
                  value: sum || 'Spoiler'
                }]
              }
            }],
            data: {
              hName: 'details',
              hProperties: {
                className: 'special-box secret'
              }
            }
          };
          parent.children.splice(index, 1, secret);
        } else if (firstChild.value.startsWith('!information\n') || firstChild.value.startsWith('!good\n') || firstChild.value.startsWith('!bad\n') || firstChild.value.startsWith('!comment\n') || firstChild.value.startsWith('!attention\n') || firstChild.value.startsWith('!question')) {
          node.type = 'div';
          node.data = {
            hName: 'div',
            hProperties: {
              className: 'special-box-content'
            }
          };
          var type = '';

          if (firstChild.value.indexOf('\n') > 0) {
            type = firstChild.value.substr(1, firstChild.value.indexOf('\n'));
            firstChild.value = firstChild.value.substr(firstChild.value.indexOf('\n') + 1);
          } else {
            type = firstChild.value.substr(1);
            firstChild.value = '';
          }

          var _box = {
            type: 'special-box-div',
            children: [node],
            data: {
              hName: 'div',
              hProperties: {
                className: "special-box ".concat(type)
              }
            }
          };
          parent.children.splice(index, 1, _box);
        }
      }
    }

    return node;
  });
}
/**
 * Returns the transformer which acst on the MDAST tree and given VFile.
 *
 * @link https://github.com/unifiedjs/unified#function-transformernode-file-next
 * @link https://github.com/syntax-tree/mdast
 * @link https://github.com/vfile/vfile
 * @return {function}
 */


function box() {
  /**
   * @param {object} ast MDAST
   * @param {vFile} vFile
   * @param {function} next
   * @return {object}
   */
  return function (ast, vFile, next) {
    // Transformer
    visitBlockquote(ast);

    if (typeof next === 'function') {
      return next(null, ast, vFile);
    }

    return ast;
  };
}

module.exports = box;