const visit = require('unist-util-visit');

/**
 * Given the MDAST ast, look for all fenced Blockquote
 *
 * @param {object} ast
 * @param {vFile} vFile
 * @return {function}
 */
function visitBlockquote(ast) {
  return visit(ast, 'blockquote', (node, index, parent) => {
    const firstNode = node.children[0];

    if (firstNode.type === 'paragraph') {
      if (firstNode.children[0].type === 'text') {
        const firstChild = firstNode.children[0];
        if (firstChild.value.startsWith('!secret')) {
          node.type = 'div';
          firstChild.value = firstChild.value.substr(7);
          let sum = '';
          if (firstChild.value.indexOf('\n') >= 0) {
            sum = firstChild.value.substr(0,
              firstChild.value.indexOf('\n'));
            firstChild.value = firstChild.value.substr(
              firstChild.value.indexOf('\n'));
          } else {
            sum = firstChild.value;
            firstChild.value = '';
          }

          const secret = {
            type: 'special-box-secret',
            children: [
              node,
              {
                type: 'summary',
                data: {
                  hName: 'summary',
                  hChildren: [{
                    type: 'text',
                    value: sum || 'Spoiler',
                  }],
                },
              },
            ],
            data: {
              hName: 'details',
              hProperties: {
                className: 'special-box secret',
              },
            },
          };

          parent.children.splice(index, 1, secret);

          return node;
        } else if (firstChild.value.startsWith('!information') ||
            firstChild.value.startsWith('!good') ||
            firstChild.value.startsWith('!bad') ||
            firstChild.value.startsWith('!comment') ||
            firstChild.value.startsWith('!attention') ||
            firstChild.value.startsWith('!question')) {
          node.type = 'div';
          node.data = {
            hName: 'div',
            hProperties: {
              className: 'special-box-content',
            },
          };
          let type = '';
          if (firstChild.value.indexOf('\n') > 0) {
            type = firstChild.value.substr(1, firstChild.value.indexOf('\n'));
            firstChild.value = firstChild.value.substr(firstChild.value.indexOf('\n'));
          } else {
            type = firstChild.value.substr(1);
            firstChild.value = '';
          }

          const box = {
            type: 'special-box-div',
            children: [node],
            data: {
              hName: 'div',
              hProperties: {
                className: `special-box ${type}`,
              },
            },
          };

          parent.children.splice(index, 1, box);

          return node;
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
  return function (ast, vFile, next) { // Transformer
    visitBlockquote(ast);

    if (typeof next === 'function') {
      return next(null, ast, vFile);
    }

    return ast;
  };
}

module.exports = box;
