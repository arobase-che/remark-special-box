const visit = require('unist-util-visit');


const PLUGIN_NAME = 'remark-mermaid-simple';

/**
 * Given the MDAST ast, look for all fenced codeblocks that have a language of
 * `mermaid` and pass that to mermaid.cli to render the image. Replaces the
 * codeblocks with an image of the rendered graph.
 *
 * @param {object} ast
 * @param {vFile} vFile
 * @return {function}
 */
function visitCodeBlock(ast, vFile) {
  return visit(ast, 'code', (node, index, parent) => {
    const { lang, value, position } = node;
    const destinationDir = getDestinationDir(vFile);

    // If this codeblock is not mermaid, bail.
    if (lang !== 'mermaid') {
      return node;
    }

    const image = {
      type: 'mermaid',
      value: value,
      data: {
        hName: 'div',
        hProperties: {
          className: 'mermaid'
        },
        hChildren: [
          {
            type: 'text',
            value: value
          }
        ]
      }
    };

    parent.children.splice(index, 1, image);

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
function mermaid() {
  /**
   * @param {object} ast MDAST
   * @param {vFile} vFile
   * @param {function} next
   * @return {object}
   */
  return function transformer(ast, vFile, next) {
    visitCodeBlock(ast, vFile);

    if (typeof next === 'function') {
      return next(null, ast, vFile);
    }

    return ast;
  };
}

module.exports = mermaid;
