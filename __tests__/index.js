'user strict';

import plugin from '..';

const test = require('ava');
const unified = require('unified');
const raw = require('rehype-raw');
const reParse = require('remark-parse');
const stringify = require('rehype-stringify');
const remark2rehype = require('remark-rehype');
const parse5 = require('parse5');

const render = text => unified()
  .use(reParse)
  .use(plugin)
  .use(remark2rehype)
  .use(stringify)
  .processSync(text);

const renderRaw = text => unified()
  .use(reParse)
  .use(plugin)
  .use(remark2rehype, {allowDangerousHTML: true})
  .use(raw)
  .use(stringify)
  .processSync(text);

test('simple citation', t => {
  const {contents} = render('>This is a citation');
  t.deepEqual(parse5.parse(contents),
    parse5.parse('<blockquote>\n<p>This is a citation</p>\n</blockquote>')
  );
});

test('simple citation raw', t => {
  const {contents} = renderRaw('>This is a citation');
  t.deepEqual(parse5.parse(contents),
    parse5.parse('<blockquote>\n<p>This is a citation</p>\n</blockquote>')
  );
});

test('question', t => {
  const {contents} = renderRaw('>!question\nWhat does the 🦊 say ?');
  t.deepEqual(parse5.parse(contents),
    parse5.parse('<div class="special-box question"><div class="special-box-content"><p>What does the 🦊 say ?</p></div></div>'));
});

test('attention', t => {
  const {contents} = renderRaw('>!attention\nBe carefull');
  t.deepEqual(parse5.parse(contents),
    parse5.parse('<div class="special-box attention"><div class="special-box-content"><p>Be carefull</p></div></div>'));
});

test('good', t => {
  const {contents} = renderRaw('>!good\n🎉');
  t.deepEqual(parse5.parse(contents),
    parse5.parse('<div class="special-box good"><div class="special-box-content"><p>🎉</p></div></div>'));
});

test('bad', t => {
  const {contents} = renderRaw('>!bad\n☢️');
  t.deepEqual(parse5.parse(contents),
    parse5.parse('<div class="special-box bad"><div class="special-box-content"><p>☢️</p></div></div>'));
});

test('secret', t => {
  const {contents} = renderRaw('>!secret Don\'t tell others about it\n🤫');
  t.deepEqual(parse5.parse(contents),
    parse5.parse('<details class="special-box secret"><div><p>🤫</p></div><summary>Don\'t tell others about it</summary></details>'));
});
