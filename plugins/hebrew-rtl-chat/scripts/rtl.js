#!/usr/bin/env node
// MessageDisplay hook: makes Hebrew/Arabic lines that start with an English word
// render right-to-left, by putting an invisible RLM (U+200F) at the start of them.
// Display-only: Claude never sees the change, so it costs no context.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

const RLM = '\u200F';
const RTL = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
const LETTER = /\p{L}/u;
const FENCE = /^\s*(```|~~~)/;
// Markdown that comes before the text: indent, quotes, heading, bullet, task box, number.
const PREFIX = /^(\s*(?:>\s*)*(?:#{1,6}\s+|[-*+]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+)?)/;

// 'R', 'L', or null: the direction of the first letter in s.
function firstStrong(s) {
  for (const ch of s) {
    if (ch === RLM) return 'R';
    if (RTL.test(ch)) return 'R';
    if (LETTER.test(ch)) return 'L';
  }
  return null;
}

function fixText(text) {
  return firstStrong(text) === 'L' && RTL.test(text) ? RLM + text : text;
}

function fixLine(line) {
  if (!RTL.test(line)) return line;
  if (line.trimStart().startsWith('|')) {
    // Table row: each cell gets its own direction.
    return line.replace(/\|([^|\n]*)/g, (_, cell) => {
      const lead = cell.match(/^\s*/)[0];
      return '|' + lead + fixText(cell.slice(lead.length));
    });
  }
  const prefix = line.match(PREFIX)[0];
  return prefix + fixText(line.slice(prefix.length));
}

// Writes the hook's JSON with every non-ASCII character escaped (\uXXXX), so the
// RLM survives whatever encoding the host reads stdout with.
function emit(hookSpecificOutput) {
  const json = JSON.stringify({ hookSpecificOutput })
    .replace(/[^\x00-\x7e]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
  process.stdout.write(json);
}

function main(input) {
  const e = JSON.parse(input);
  const delta = e.delta || '';
  const stateFile = path.join(os.tmpdir(), 'hebrew-rtl-chat-' + String(e.message_id || 'x').replace(/\W/g, ''));
  let inFence = fs.existsSync(stateFile);

  const out = delta.split(/(?<=\n)/).map((line) => {
    if (FENCE.test(line)) { inFence = !inFence; return line; }
    return inFence ? line : fixLine(line);
  }).join('');

  if (inFence && !e.final) fs.writeFileSync(stateFile, '');
  else if (fs.existsSync(stateFile)) fs.unlinkSync(stateFile);

  if (out !== delta) {
    emit({ hookEventName: 'MessageDisplay', displayContent: out });
  }
}

if (require.main === module) {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (c) => { input += c; });
  process.stdin.on('end', () => {
    try { main(input); } catch { /* on any error, show the original text */ }
  });
}

module.exports = { fixLine };
