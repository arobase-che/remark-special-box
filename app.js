const visit = require('unist-util-visit');


const PLUGIN_NAME = 'remark-special-box';

/**
 * Given the MDAST ast, look for all fenced Blockquote
 *
 * @param {object} ast
 * @param {vFile} vFile
 * @return {function}
 */
function visitBlockquote(ast, vFile) {
  return visit(ast, 'blockquote', (node, index, parent) => {
    const { position } = node;

    const firstNode = node.children[0]

    if( firstNode.type == 'paragraph' ) {
      if( firstNode.children[0].type == 'text' ) {
        if( firstNode.children[0].value.startsWith('!secret') ) {
          node.type = 'div';
          firstNode.children[0].value = firstNode.children[0].value.substr(7);
          var sum = ""
          if( firstNode.children[0].value.indexOf('\n') >= 0 ) {
            sum = firstNode.children[0].value.substr( 0,
              firstNode.children[0].value.indexOf('\n') );
            firstNode.children[0].value = firstNode.children[0].value.substr( 
              firstNode.children[0].value.indexOf('\n') );
          } else {
            sum = firstNode.children[0].value;
            firstNode.children[0].value = "";
          }

          const secret = {
            type: 'special-box-secret',
            children: [ {
                type: 'summary',
                data: {
                  hName: 'summary',
                  hChildren: [{
                    type:'text',
                    value: sum ? sum : 'Spoiler'
                  }]
                }
              },
              node ],
            data: {
              hName: 'details',
              hProperties: {
                className: 'special-box secret'
              },
            }
          };

          parent.children.splice(index, 1, secret);

          return node;
        }else if( firstNode.children[0].value.startsWith('!information') ||
            firstNode.children[0].value.startsWith('!good') ||
            firstNode.children[0].value.startsWith('!bad') ||
            firstNode.children[0].value.startsWith('!comment') ||
            firstNode.children[0].value.startsWith('!attention') ||
            firstNode.children[0].value.startsWith('!question') ) {
          node.type = 'div';
          node.data = {
            hName: 'div',
            hProperties: {
              className: 'special-box-content'
            }
          };
          var type = ""
          if( firstNode.children[0].value.indexOf("\n") > 0) {
            type = firstNode.children[0].value.substr(1, firstNode.children[0].value.indexOf("\n") );
            firstNode.children[0].value = firstNode.children[0].value.substr( firstNode.children[0].value.indexOf("\n") );
            console.log(type);
          }else{
            type = firstNode.children[0].value.substr(1)
            firstNode.children[0].value = "";
          }

          const box = {
            type: 'special-box-div',
            children: [node],
            data: {
              hName: 'div',
              hProperties: {
                className: 'special-box ' + type
              },
            }
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
  return function transformer(ast, vFile, next) {
    visitBlockquote(ast, vFile);

    if (typeof next === 'function') {
      return next(null, ast, vFile);
    }

    return ast;
  };
}

module.exports = box;
