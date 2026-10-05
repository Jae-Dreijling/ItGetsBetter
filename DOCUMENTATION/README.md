# ItGetsBetter — Documentation

**Start here.** Folders are numbered in reading order: the lower the number, the more it matters for the work happening now.

| Folder | What's in it | Status |
|---|---|---|
| [1-principles/](1-principles/) | [RULEBOOK.md](1-principles/RULEBOOK.md): the UX rules every version must follow (never punish absence, four-tab ceiling, etc.) | **Timeless.** Read before designing anything. |
| [2-v2/](2-v2/) | Planning for the 2.0 remake. [V2-PLAN.md](2-v2/V2-PLAN.md): priorities, design and build order. [V2-PLAN-REVIEW.md](2-v2/V2-PLAN-REVIEW.md): feasibility check with sources. [EIGHT-JOURNEYS-LESSONS.md](2-v2/EIGHT-JOURNEYS-LESSONS.md): what to take from the Eight Journeys plan into the app. | **Active.** New 2.0 docs go here. |
| [3-game/](3-game/) | The optional RPG layer. [GAME-LAYER-DESIGN.md](3-game/GAME-LAYER-DESIGN.md) is the authoritative design, [GAME-IMPLEMENTATION.md](3-game/GAME-IMPLEMENTATION.md) tracks what's built, [REWARD-SHOP.md](3-game/REWARD-SHOP.md) covers the shop. `research/` holds the early option analysis and the AI-to-AI handoff doc that led to the design. | Tiers 1–2 built in v1, tier 3+ not started. |
| [4-companion/](4-companion/) | [message-import-template.txt](4-companion/message-import-template.txt): the format for bulk-importing companion messages, plus every trigger category. | Matches v1 code. |
| [5-ideas/](5-ideas/) | [IDEAS.md](5-ideas/IDEAS.md): the feature idea list, most of which got built in v1. | Ongoing backlog. |
| [6-v1-reference/](6-v1-reference/) | The original v1 spec: [PRD](6-v1-reference/PRD.md) (what), [ARCHITECTURE](6-v1-reference/ARCHITECTURE.md) (how), [MOSCOW](6-v1-reference/MOSCOW.md) (priorities), [ROADMAP](6-v1-reference/ROADMAP.md) (build phases). | **Historical.** Describes v1 as built in June 2026. Look things up here; don't treat it as the plan for 2.0. |
| [7-eight-journeys/](7-eight-journeys/) | Export from the separate Eight Journeys project: a weight-loss plan with nutrition, exercise, cravings, reviews and recipes. Start with its [README](7-eight-journeys/README.md). | **Source material.** Kept as-is; personal numbers live here and nowhere else. |

## Notes

- The v1 docs say **"Version 2.0"** in their headers. That's the doc revision, not the app. App 2.0 lives in `2-v2/`.
- Code comments point into this folder (`src/hooks/useCharacter.ts`, `src/lib/defaultPersonalityGroups.ts`, `src/types/entities.ts`). If you move a doc, update those too.
- Where to put a new doc: a rule that should never change → `1-principles/`. Anything about the remake → `2-v2/`. Game or shop design → `3-game/`. A loose idea → add it to `5-ideas/IDEAS.md`.
