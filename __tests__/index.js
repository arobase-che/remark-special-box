import test from 'ava';
import unified from 'unified';
import raw from 'rehype-raw';
import reParse from 'remark-parse';
import stringify from 'rehype-stringify';
import remark2rehype from 'remark-rehype';

import plugin from '../app';

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
  t.is(contents, '<blockquote>\n<p>This is a citation</p>\n</blockquote>');
});

test('simple citation raw', t => {
  const {contents} = renderRaw('>This is a citation');
  t.is(contents, '<blockquote>\n<p>This is a citation</p>\n</blockquote>');
});

test('question', t => {
  const {contents} = renderRaw('>!question\nWhat does the 🦊 say ?');
  t.snapshot(contents);
});

