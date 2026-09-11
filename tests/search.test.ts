import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { engines, isEngine, matchBookmarks, searchDestination } from '../src/lib/search.ts'

test('网址识别、搜索编码和协议安全', () => {
  for (const [query, expected] of [
    [' github.com ', 'https://github.com/'],
    ['https://example.com/a?q=1#x', 'https://example.com/a?q=1#x'],
    ['localhost:3000/a', 'http://localhost:3000/a'],
    ['127.0.0.1:8080', 'http://127.0.0.1:8080/'],
    ['[::1]:3000', 'http://[::1]:3000/'],
    ['example.com:8080/a', 'https://example.com:8080/a'],
    ['例子.中国', 'https://xn--fsqu00a.xn--fiqs8s/'],
  ]) assert.equal(searchDestination(query, 'google'), expected)
  for (const key of Object.keys(engines)) {
    assert.ok(isEngine(key))
    for (const query of ['React 19.2', '3.14', '你好 & 世界', 'foo', 'example..com', 'a@b.com']) {
      assert.equal(searchDestination(query, key), engines[key].url + encodeURIComponent(query))
    }
  }
  for (const query of ['javascript:alert(1)', 'data:text/html,test', 'file:///tmp/a', 'ftp://example.com', 'https://', 'https://user:pass@example.com', 'https://exa mple.com']) {
    assert.throws(() => searchDestination(query, 'google'))
  }
  assert.equal(searchDestination('  ', 'google'), null)
  for (const key of [null, 'bad', 'constructor', '__proto__']) assert.equal(isEngine(key), false)
})

test('书签配置可发布：有效名称、HTTP(S) 网址、无重复 key', () => {
  const groups = JSON.parse(readFileSync(new URL('../src/bookmarks.json', import.meta.url), 'utf8'))
  assert.ok(Array.isArray(groups))
  const names = new Set()
  for (const group of groups) {
    assert.equal(typeof group.name, 'string')
    assert.ok(group.name.trim() && !names.has(group.name), '分组名不可为空或重复')
    names.add(group.name)
    assert.ok(Array.isArray(group.links))
    const urls = new Set()
    for (const link of group.links) {
      assert.equal(typeof link.name, 'string')
      assert.ok(link.name.trim())
      assert.equal(typeof link.url, 'string')
      const url = new URL(link.url)
      assert.ok(['http:', 'https:'].includes(url.protocol) && !url.username && !url.password)
      assert.ok(!urls.has(link.url), '同组网址不可重复')
      urls.add(link.url)
    }
  }
})

test('书签搜索按名称或域名匹配，保留分组和顺序，最多五条', () => {
  const groups = [{ name: '开发', links: Array.from({ length: 6 }, (_, i) => ({ name: `工具 ${i}`, url: `https://site${i}.dev/path-only` })) }]
  assert.equal(matchBookmarks(groups, ' 工具 ').length, 5)
  assert.deepEqual(matchBookmarks(groups, 'SITE2.DEV'), [{ ...groups[0].links[2], group: '开发' }])
  for (const query of ['', '  ', '不存在', 'path-only']) assert.deepEqual(matchBookmarks(groups, query), [])
})
