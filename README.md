# hebrew-rtl-chat

[![test](https://github.com/ofeksoffer/hebrew-rtl-chat/actions/workflows/test.yml/badge.svg)](https://github.com/ofeksoffer/hebrew-rtl-chat/actions/workflows/test.yml)

A Claude Code plugin that shows Claude's Hebrew (and Arabic) replies right-to-left in the chat, even when a line starts with an English word.

[הסבר בעברית למטה](#בעברית)

## The problem

The Claude desktop app picks each paragraph's direction from its first letter. A Hebrew line that starts with an English word, such as `Claude Code הוא הכלי שלי`, is shown left-to-right and its word order breaks.

## What it does

A `MessageDisplay` hook puts an invisible RLM character (U+200F) at the start of every line that:

- contains Hebrew or Arabic, and
- starts with an English letter, after any markdown such as `- `, `1. `, `### ` or `> `.

Table cells are handled one by one. Code blocks and English-only lines are left alone.

The change is display-only. Claude never sees it, so the plugin uses no context and doesn't depend on Claude remembering a rule, even in long sessions or after compaction.

## Install

In a terminal:

```bash
claude plugin marketplace add ofeksoffer/hebrew-rtl-chat
```

```bash
claude plugin install hebrew-rtl-chat@hebrew-rtl-chat
```

Then start a new session. Requires Node.js 18 or later on your `PATH`. If Claude Code can't find `node`, the hook fails and replies display as they would without it.

## Where it works

- Tested by hand: Claude's replies in the Claude desktop app, Code tab, on Windows.
- The script uses only Node's standard library and no shell, so it runs the same on macOS and Linux. The automated tests run on all three systems (see the badge above).
- Not fixable by a plugin: the question dialog (AskUserQuestion), your own messages and the input box. The app always draws them left-to-right, and shows the RLM character in the dialog as a broken glyph.
- Doesn't change `.md` files opened in the app's file pane. That pane ignores the RLM character.
- Not expected to help in a terminal. Most terminals don't support mixed-direction text.

## Test

```bash
node --test test/rtl.test.js
```

## License

MIT

---

<div dir="rtl">

## בעברית

תוסף ל-Claude Code שמציג את התשובות של Claude בעברית מימין לשמאל, גם כששורה מתחילה במילה באנגלית.

### הבעיה

באפליקציה של Claude הכיוון של כל פסקה נקבע לפי האות הראשונה שלה. שורה כמו `Claude Code הוא הכלי שלי` מתחילה באנגלית, ולכן היא מוצגת משמאל לימין וסדר המילים בה נשבר.

### מה התוסף עושה

התוסף מוסיף תו בלתי נראה (RLM) בתחילת כל שורה שיש בה עברית ומתחילה באות אנגלית. זה עובד בפסקאות, בתבליטים, ברשימות ממוספרות, בכותרות, בציטוטים ובתאי טבלה. בלוקים של קוד ושורות באנגלית בלבד נשארים כמו שהם.

השינוי הוא רק בתצוגה. Claude לא רואה אותו, ולכן התוסף לא תופס מקום ב-context ולא תלוי בכך ש-Claude יזכור הוראה כלשהי, גם בשיחה ארוכה ואחרי compaction.

### התקנה

מריצים בטרמינל את שתי הפקודות שבחלק Install למעלה, ואחר כך פותחים שיחה חדשה. נדרש Node.js בגרסה 18 ומעלה. אם Claude Code לא מוצא את `node`, התוסף לא פועל והתשובות מוצגות כמו בלעדיו.

### איפה זה עובד

- נבדק ידנית על התשובות של Claude באפליקציה לשולחן העבודה, בלשונית Code, ב-Windows.
- הסקריפט משתמש רק בספרייה הבסיסית של Node ובלי shell, ולכן הוא רץ אותו דבר ב-macOS ובלינוקס. הבדיקות האוטומטיות רצות על שלוש מערכות ההפעלה.
- חלון השאלות (AskUserQuestion), ההודעות שאתה שולח ותיבת הכתיבה לא ניתנים לתיקון בתוסף. האפליקציה מציגה אותם תמיד משמאל לימין, ובחלון השאלות התו מופיע כסימן שבור.
- קבצי Markdown שנפתחים בחלונית הקבצים של האפליקציה לא משתנים, כי החלונית מתעלמת מהתו.
- בטרמינל התוסף כנראה לא יעזור, כי רוב הטרמינלים לא תומכים בטקסט בכיוונים מעורבים.

</div>
