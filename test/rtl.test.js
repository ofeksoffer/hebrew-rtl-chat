'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const { fixLine } = require('../plugins/hebrew-rtl-chat/scripts/rtl.js');

const R = '\u200F';
const SCRIPT = path.join(__dirname, '../plugins/hebrew-rtl-chat/scripts/rtl.js');

const cases = [
  ['paragraph', 'Claude Code הוא הכלי שלי.', R + 'Claude Code הוא הכלי שלי.'],
  ['bullet', '- Python היא השפה.', '- ' + R + 'Python היא השפה.'],
  ['nested bullet', '   * Git לניהול גרסאות', '   * ' + R + 'Git לניהול גרסאות'],
  ['task box', '- [x] Todoist עודכן', '- [x] ' + R + 'Todoist עודכן'],
  ['numbered', '2. Todoist משמש למשימות.', '2. ' + R + 'Todoist משמש למשימות.'],
  ['heading', '### Docker - התקנה', '### ' + R + 'Docker - התקנה'],
  ['quote', '> Notion הוחלף', '> ' + R + 'Notion הוחלף'],
  ['bold start', '**Claude Code** הוא הכלי', R + '**Claude Code** הוא הכלי'],
  ['inline code start', '`npm install` מתקין הכל', R + '`npm install` מתקין הכל'],
  ['number then English', '2026 Claude עובד', R + '2026 Claude עובד'],
  ['table cells', '| Notion הוחלף | עברית | Git |', '| ' + R + 'Notion הוחלף | עברית | Git |'],
  ['Hebrew first: unchanged', 'זה Claude Code באמצע.', 'זה Claude Code באמצע.'],
  ['English only: unchanged', 'This is plain English.', 'This is plain English.'],
  ['already has RLM: unchanged', R + 'Claude עובד', R + 'Claude עובד'],
  ['number then Hebrew: unchanged', '3 שעות ביום', '3 שעות ביום'],
  ['Arabic', 'Python هي اللغة', R + 'Python هي اللغة'],
];

for (const [name, input, expected] of cases) {
  test(name, () => assert.strictEqual(fixLine(input), expected));
}

function run(event) {
  const out = execFileSync(process.execPath, [SCRIPT], { input: JSON.stringify(event), encoding: 'utf8' });
  return out ? JSON.parse(out).hookSpecificOutput.displayContent : null;
}

test('hook: rewrites a batch and keeps newlines', () => {
  const delta = 'שלום\nClaude עובד\n- Git כלי\n';
  assert.strictEqual(run({ message_id: 'a1', index: 0, final: true, delta }),
    'שלום\n' + R + 'Claude עובד\n- ' + R + 'Git כלי\n');
});

test('hook: no output when nothing changes', () => {
  assert.strictEqual(run({ message_id: 'a2', index: 0, final: true, delta: 'שלום עולם\n' }), null);
});

test('hook: code fence spanning batches is left alone', () => {
  const id = 'fence' + Date.now();
  assert.strictEqual(run({ message_id: id, index: 0, final: false, delta: '```\nClaude עובד\n' }), null);
  assert.strictEqual(run({ message_id: id, index: 1, final: false, delta: 'Git כלי\n```\n' }), null);
  assert.strictEqual(run({ message_id: id, index: 2, final: true, delta: 'Git כלי\n' }), R + 'Git כלי\n');
});

test('hook: bad input shows the original (no output, no crash)', () => {
  const out = execFileSync(process.execPath, [SCRIPT], { input: 'not json', encoding: 'utf8' });
  assert.strictEqual(out, '');
});
