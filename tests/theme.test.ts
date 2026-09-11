import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseTheme } from '../src/lib/theme.ts'

test('主题仅接受三个选项，缺失或损坏偏好默认跟随系统', () => {
  for (const theme of ['system', 'light', 'dark']) assert.equal(parseTheme(theme), theme)
  for (const value of [null, undefined, '', 'invalid', 'constructor', '__proto__', {}]) assert.equal(parseTheme(value), 'system')
})
