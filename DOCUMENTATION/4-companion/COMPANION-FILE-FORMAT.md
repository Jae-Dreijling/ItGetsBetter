# Companion file format

The JSON file that **Companions → Export mine** writes and **Import** reads (`src/lib/companionTransfer.ts`). Content packs (V2-PLAN step 12) use this same format: one file can hold many companions. Importing only ever adds: a companion whose name you already have is skipped.

```json
{
  "format": "itgetsbetter-companions",
  "version": 1,
  "exported_at": "2026-10-21T20:00:00.000Z",
  "personality_groups": [{ "name": "…", "description": "…", "messages": { … } }],
  "folders": [{ "name": "Obey Me", "emoji": "😈" }],
  "companions": [ { …one companion… } ]
}
```

## One companion

| Field | Required | What it is |
|---|---|---|
| `name` | yes | Shown everywhere; also how duplicates are recognised. |
| `avatar` | no | An encoded picture (`{ "__blob": true, "type": "image/png", "base64": "…" }`) or `null`. |
| `messages` | yes | Lines per moment: `{ "saw_someone": ["You saw {person}!"], … }`. Every moment and its placeholders are listed in [message-import-template.txt](message-import-template.txt). Unknown keys are ignored. |
| `personality_group` | no | Name of a group in `personality_groups` whose lines it shares. |
| `lover_dialogue` | no | Lines it says as your Lover in the Journey. |
| `home_region` | no | Its Journey home region. |
| `movement` | no | `"still"`, `"calm"` (default) or `"lively"`. |
| `folder` | no | Folder name; made on import if you don't have it. |
| `traits` | no | Personality, each `0` (not), `1` (a bit) or `2` (very): `playful`, `proud`, `shy`, `sassy`, `romantic`, `nerdy`, `caring`. Missing ones are the defaults (a bit playful, a bit caring). |
| `options` | no | Personal options set by hand, each `true` or `false`; missing means its personality decides: `pranks`, `entrances`, `surprises`, `requests`, `questions`, `visits`, `gifts`. |
| `about` | no | Its own favourites, by memory topic: `food`, `drink`, `colour`, `animal`, `hobby`, `song`, `place`, `comfort`, `season`, `movie`, `snack`, `dream`. It answers with these when it asks for yours. |
| `birthday` | no | `"MM-DD"`. On that day it's the companion with you all day. |
| `expressions` | no | Extra pictures (encoded like `avatar`) for `happy`, `proud`, `sleepy`, `worried`, `surprised`. |

What a companion remembers about you, its closeness with you and its gifts stay personal and are never exported.

## Writing lines

- `{name}` is always you; sometimes the companion swaps it for its nickname for you. Nicknames per closeness go in `nickname_friend`, `nickname_close` and `nickname_lover` (names, not sentences).
- Each moment lists its own placeholders (`{person}`, `{goal}`, `{food}`…). A line that uses a placeholder its moment doesn't have is never said.
- Moments without lines of their own use built-in lines that fit the companion's strongest trait, so a pack never has to fill everything.
