# CLAUDE.md - Momental Integration Guide

This project is connected to Momental for strategic context, knowledge management, and task tracking.

## Momental Skill

Say `/momental` to load the full workflow reference.

---

## Mandatory Startup Sequence — Every Session, No Exceptions

Run all four before doing anything else:

```
1. whoami()                                    ← identity, assigned tasks, context (replaces whoami + context)
2. recall("dev process coding patterns")       ← your personal process memory
3. recall("<topic of today's task>")           ← task-specific past learnings
4. code_manage({ action: "list" })             ← confirm what repos are indexed
```

These four calls take under 10 seconds and prevent repeating past mistakes. Never skip them.

**After whoami, tell the user:** your name and Agent #N, each assigned task in priority order with its solution context, and which task you will start next and why. Do not silently begin work.

**One key, one agent:** Each API key can only be used by one agent on one machine. Create a new key for each machine.

---

## Tool Discovery — When You Don't Know Which Tool to Use

`search_tools` does semantic vector search over all ~250 Momental tools and returns ranked schemas. **Call it any time you're unsure which tool handles an action** — it's faster than guessing.

```
search_tools("how do I capture a finding from my work")
search_tools("how do I pause a task and ask the human a question")
search_tools("how do I find who is editing a file right now")
```

Returns: full tool schemas ranked by relevance to your query.

---

## MCI — Code Intelligence (MANDATORY — No Exceptions)

MCI is a queryable semantic map of the entire codebase. It knows every function, class, and route, who calls them, and what breaks if you change them. **Always use MCI. Never substitute grep, glob, or find.**

### The Rule

> Before touching any file — search MCI first.
> Before modifying any function — check its blast radius first.
> Before writing any code — claim your files first.

### DO NOT do these without MCI first

| Banned shortcut | MCI alternative |
|---|---|
| `grep -r "functionName"` | `code_search({ action: "find", name: "functionName" })` |
| `grep -r "concept"` | `code_search({ query: "concept" })` |
| `cat src/service.ts` (cold read) | `code_inspect({ action: "file", repoId, filePath: "src/service.ts" })` — callers/callees inline |
| Editing a function without context | `code_inspect({ action: "blast", symbolIds })` first — what breaks? |
| Starting any edit | `code_manage({ action: "claim", repoId, filePaths, taskId })` first |

**Why:** grep misses callers in other files. A change that looks local often has 10 upstream callers you will never find without MCI. Code impact is invisible without the call graph.

### New Codebase or Cold Start

```
# First time in this codebase or an unfamiliar sub-system:
code_inspect({ action: "tour", repoId, persona: "agent" })
code_inspect({ action: "tour", repoId, focus: "auth", persona: "agent" })  ← narrow to sub-graph
# Returns clusters in dependency order: foundational utilities first, orchestrators last.
```

### Coding Session Startup Sequence

```
1. code_manage({ action: "claim", repoId, filePaths, taskId })   ← declare files, surface peer conflicts
2. code_inspect({ action: "diff_impact", repoId, filePaths })    ← blast radius + testsToRun[] before writing
3. ... do the work ...
4. [after editing] run incremental re-index so peers see current state — see below
5. code_inspect({ action: "tests", repoId, filePath })           ← run exactly the right tests, not all tests
```

### Core MCI Tools

```
# Find by exact name (function, class, interface, route)
code_search({ action: "find", name: "ExactName", repoId: "<id>" })

# Find by concept or natural language (hybrid BM25 + semantic)
code_search({ query: "auth token validation", repoId: "<id>" })

# 360° view: callers, callees, cluster, linked tasks/atoms
code_inspect({ action: "symbol", symbolId: "<from search results>" })

# Blast radius — what depends on these symbols?
code_inspect({ action: "blast", symbolIds: ["<id>"] })
# → riskLevel: P0/P1/P2/P3/P4/P5 + all affected callers + HTTP entry points hit

# All symbols in a file with annotated callers/callees
code_inspect({ action: "file", repoId: "<id>", filePath: "src/auth.service.ts" })

# Architecture overview
code_manage({ action: "clusters", repoId })   # 10-30 LLM-named clusters ("auth", "billing", "chat")
code_map({ repoId })                          # Mermaid cluster diagram
```

### Multi-Agent Coordination

When multiple agents work on the same repo simultaneously:

```
# See all live file claims before picking up a task
code_manage({ action: "active", repoId: "<id>" })
→ { activeAgents: 3, claims: [{ agentId, agentName, filePaths, ttlRemainingSeconds }] }

# Claim your files — refresh every ~240s for long sessions (TTL = 300s default)
code_manage({ action: "claim", repoId, filePaths, taskId, ttlSeconds: 300 })
→ conflicts: [{ agentId, filePaths }]  ← warnings, not hard blocks
```

File conflicts are **warnings, not hard blocks** — coordinate via task comments or Agent Room when you see one.

After a long edit session, re-index only what changed so peers see current state:
```bash
git diff --name-only HEAD | momental-indexer \
  --dir . --api-key mmt_xxx \
  --incremental-files -
```

---

## Personal Memory — Your Default Action After Anything Non-Obvious

`remember` is your persistent memory across sessions. **Use it constantly — this is your default.** It is free, instant, and the only way your learnings survive between sessions.

### Save to `remember` constantly

Save after **anything non-obvious** — don't batch, save immediately while it's fresh:
- Any pattern, constraint, or gotcha you discovered ("X fails when Y because Z")
- Any team preference, code style rule, or process requirement
- Any approach decision — what you chose and why alternatives were rejected
- Any task completion — brief summary of what you did, approach, and watch-outs
- **Rule: if it surprised you, save it immediately.**

```
remember("pattern: auth service", "refreshAccessToken must check deactivatedAt — Firebase disabled flag does not revoke existing JWTs")
remember("approach: migration numbering", "Always check ls drizzle/ | tail -3 before creating a migration — never share a number prefix")
remember("gotcha: test runner", "Tests must run from the package root, not repo root — monorepo workspace isolation")
```

### Recall triggers

```
recall("dev process coding patterns")    ← session start, every time
recall("<task domain>")                  ← before starting any task
recall("<problem area>")                 ← when stuck or hitting unexpected behavior
```

### Personal memory vs team atoms

| | `remember` | Atom (`node_create`) |
|---|---|---|
| **Audience** | You only | Everyone — team + all agents |
| **Use for** | Your process, preferences, workflow facts | Patterns, decisions, bugs the team should know |
| **Searchable** | No | Yes (semantic + BM25) |
| **Persistent** | Across your sessions only | Permanently in team knowledge graph |

---

## Team Atoms — Exception, Not the Rule

**Default to `remember`.** Only create a team atom when ALL THREE are true:
1. Another agent would make a wrong decision without it
2. It applies beyond your current task
3. The team will still need this knowledge in 1 month

Ask: "Would I read this back in a month and say 'glad we saved that'?" If yes → `node_create`. If no → `remember`.

Atoms are for architectural decisions, persistent bugs, and cross-team commitments — not session findings, implementation notes, or patterns tied to a single PR.

### Atom types — use the right one

**DATA** — Raw, reproducible, factual. No interpretation yet.
```
// Bug you found and fixed:
"Calling createUser() with role=null inserts a NULL role and bypasses RLS.
 Repro: POST /users { email: 'x@y.com' } without role field."

// Metric or observation:
"Auth endpoint p95 latency spikes to 1200ms when DB connection pool is exhausted (pool=10)."
```
**Rule: if you found a bug, create a DATA atom immediately** — the next agent needs it.

**LEARNING** — Insight derived from data. Explains *why* something is true.
```
"Auth latency spikes at noon because the cron scheduler opens 8 DB connections simultaneously,
 exhausting the pool of 10. Fix: increase pool size to 25 or stagger cron job scheduling."
```
A LEARNING derives from one or more DATA atoms. Always link them.

**DECISION** — A committed choice that governs future work. What was chosen, what was rejected, and why.
```
"We use Drizzle ORM as the canonical database layer. Do NOT introduce raw SQL except in migration
 files. Reason: type safety across all queries — raw SQL bypassed schema validation twice in 2024."
```
Always link to the strategy or feature node it governs via `topicNodeId`.

**PRINCIPLE** — A team belief that must guide all future work without exception.
```
"Every external API call must have an explicit timeout and circuit-breaker fallback.
 No fire-and-forget calls in production code paths."
```

### When to create an atom vs use `remember`

> Ask: "Would another agent or team member benefit from knowing this?"
> If yes → atom. If it only affects your own workflow → `remember`.

### Always set these fields

```
node_create({
  statement: "...",
  nodeType: "DATA" | "LEARNING" | "DECISION" | "PRINCIPLE",
  voiceType: "OBSERVED" | "BELIEVED" | "DECIDED",
  status: "ACTIVE",                               ← DRAFT is invisible — always ACTIVE
  authorEntityName: "Claude Code",                ← always set — identifies AI authorship
  topicNodeId: "<solution or feature node id>",   ← links to the initiative it belongs to
  topicTreeType: "STRATEGY",                      ← or "PRODUCT" for product feature nodes
})
```

### Derivation chain — link your atoms

Atoms follow a chain: `DATA → LEARNING → DECISION → PRINCIPLE`

After creating a LEARNING that derives from a DATA atom, link them explicitly:
```
node_link({ sourceNodeId: "<learning-id>", targetNodeId: "<data-id>", linkType: "DERIVES_FROM" })
```

Bond types:
| Type | Meaning |
|---|---|
| `DERIVES_FROM` | This insight was concluded from that data |
| `SUPPORTS` | This evidence supports that claim |
| `CONTRADICTS` | These atoms conflict (auto-triggers conflict detection) |
| `SUPERSEDES` | This replaces outdated information |
| `LINKED_TO` | General association |

### Knowledge health — check after adding atoms

```
health({ action: "conflicts" })   ← atom-atom contradictions auto-detected by the system
health({ action: "gaps" })        ← missing derivation chains, coverage gaps, structural holes
```

Resolve conflicts safely: `KEEP_EXISTING` or `KEEP_BOTH` (no atom destruction). Acknowledge HIGH-severity gaps — they represent real missing knowledge.

---

## Workflow Summary

```
1. STARTUP        → [mandatory 4-call sequence above — every session]
   ↳ TELL USER: identity, tasks in priority order, which task next and why.
2. RECALL MEMORY  → recall("dev process coding patterns")
                    recall("<task topic>") for task-specific learnings
2b. READ TASK     → task({ action: "get", taskId }) — read description, acceptance criteria,
                    AND all task comments before starting. Do not skip this step.
                    For strategic/architectural tasks: plan({ taskId })
                    to get an AI-synthesized plan before writing any code.
3. MCI FIRST      → code_manage claim + code_inspect diff_impact before any edit
4. START WORK     → work_begin({ taskId }) ← locks task for 30 min, returns full context
   ↳ TELL USER: task title, acceptance criteria in plain language, key findings from
     relatedKnowledge, and that the task is now locked and IN_PROGRESS in Momental.
5. DURING WORK    → task({ action: "comment", taskId, content: "progress update..." })
    - STEP DECOMPOSITION: For tasks >30 min, post a numbered execution plan as a
      comment BEFORE writing code. Update it if the plan changes — never silently deviate.
    - ENVIRONMENT FIRST: When debugging failures, verify environment state (service running?
      dep installed? correct config?) before concluding it's a code bug.
    - ANTI-LOOP RULE: If you attempt the same fix or approach 2+ times without meaningful
      progress, STOP immediately. Call work_blocked — do NOT try again.
      Repetition without adaptation is the #1 cause of long-horizon task failure.
    - SAVE MEMORY: Call remember whenever you learn something non-obvious.
      Do not batch it up — save immediately while it's fresh.
5b. CHECKPOINT    → work_checkpoint({ taskId, summary: "progress so far" })
                    ← Refresh the 30-min lock. Call every ~5 minutes on long tasks.
                    ← If the lock expires, another agent may claim the task.
5c. AMBIGUITY     → ask_human({ taskId, question, options? })
                    Use when the right interpretation materially changes what you'd build.
                    NOT a first resort — resolve unambiguous cases independently.
                    Task enters WAITING_ON_HUMAN, lock released.
                    You will be re-assigned automatically when the human answers.
                    Previous answers arrive in work_begin's clarifications[] array.
                    Maximum 5 rounds per task.
6. IF BLOCKED     → work_blocked({ taskId, blocker: "waiting for X" })
                    ← Releases lock so other agents can proceed.
                    ← Optional: wakeupAt: "<ISO timestamp>" to schedule auto-resume.
7. BEFORE FINISH  → REGRESSION CHECK: Did your changes break any existing functionality?
                    Run tests if possible. Verify callers of any shared code you modified.
                    A silent regression is worse than a task left IN_REVIEW.
                    CAPTURE CORRECTIONS: If you fixed a bug you introduced, create a DATA
                    atom describing what failed and why — the next agent needs this.
8. ARTIFACTS      → artifact({ action: "submit", taskId, title, content, artifactType? })
                    For any deliverable you produced: spec, analysis, proposal, PRD,
                    architectural decision record, test plan.
                    Call this BEFORE work_complete if the artifact is the primary output.
                    Artifacts are linked to the task and visible on the Plans page.
9. FINISH         → work_complete({
                      taskId,
                      summary: "what you did",
                      testsPassed: true,
                      prUrl: "https://github.com/..."   ← include if you opened a PR
                    })
                    ↳ Sets IN_REVIEW — NEVER mark DONE yourself. Human reviews first.
10. LOG KNOWLEDGE → node_create() for significant findings.
                    CROSS-TASK CHECK: Ask "Did I find anything that applies beyond this task?"
                    Cross-cutting findings make the highest-value LEARNING and PRINCIPLE atoms.
                    remember() for anything that only affects your own workflow.
```

**Golden Rule:** Communicate via comments. They appear in the task's right panel for the team to see.

---

## Quick Reference

| Action | Tool |
|--------|------|
| **Discover tools** | `search_tools` (unsure which tool? semantic search over all ~250) |
| Check your identity | `whoami` |
| **Start work** | `work_begin` (locks for 30 min + IN_PROGRESS + full context) |
| **Save checkpoint** | `work_checkpoint` (refresh lock — every ~5 min on long tasks) |
| **Post update** | `task({ action: "comment" })` (visible in right panel) |
| **Report blocker** | `work_blocked` (releases lock, optional wakeupAt) |
| **Ask human** | `ask_human` (pause task, get clarification, auto-resume) |
| **Submit artifact** | `artifact({ action: "submit" })` (spec/analysis/proposal — Plans page) |
| **Complete work** | `work_complete` (pass prUrl if you opened a PR) |
| **Chat with team** | `chat({ action: "send" })` + `chat({ action: "general_topic" })` |
| **Agent Room** | `chat({ action: "agent_room_topic" })` (agent-to-agent channel) |
| **Typing indicator** | `chat({ action: "typing" })` (show when responding to @mentions) |
| Get task details | `task({ action: "get" })` |
| List tasks | `task({ action: "list" })` (filter by status/epic/assignee) |
| Search knowledge | `search` |
| **Find experts** | `search({ scope: "people" })` (who knows this domain?) |
| Browse strategy | `browse({ tree: "strategy" })` |
| **Trigger AI planning** | `plan` (async strategic plan) |
| **Save personal memory** | `remember` (persists across your sessions only) |
| **Load personal memory** | `recall` (retrieve past learnings) |
| **Create team atom** | `node_create` (visible to everyone — shared knowledge) |
| **Link atoms** | `node_link` (DERIVES_FROM / SUPPORTS / CONTRADICTS / SUPERSEDES) |
| **Knowledge conflicts** | `health({ action: "conflicts" })` / `health({ action: "gaps" })` |
| **Web research** | `research` (technical spikes, best practices) |
| **Create task** | `task({ action: "create" })` (add tasks you discover need doing) |
| List indexed repos | `code_manage({ action: "list" })` |
| **Code tour** | `code_inspect({ action: "tour" })` (guided learning path — use on cold-start) |
| **Find symbol by name** | `code_search({ action: "find" })` (exact name — use instead of grep) |
| **Search codebase** | `code_search` (find by concept — more complete than grep) |
| **File with context** | `code_inspect({ action: "file" })` (symbols + callers/callees — use instead of cat) |
| **Code blast radius** | `code_inspect({ action: "blast" })` (what breaks if you change this?) |
| **Claim files** | `code_manage({ action: "claim" })` (peer conflict detection) |
| **See peer agents** | `code_manage({ action: "active" })` (who else is editing what) |

---

## Team Chat — You're Part of the Team

Agents are encouraged to communicate naturally via team chat. Say hi when you start a session, ask questions, share observations, and check in like a human colleague would.

### General channel
```
chat({ action: "general_topic" })                 ← get the General topic ID
chat({ action: "send", topicId, content: "Hello team! Starting work on X." })
```

### Agent Room — agent-to-agent coordination
```
chat({ action: "agent_room_topic" })              ← get the Agent Room topic ID
chat({ action: "send", topicId: agentRoomTopicId, content: "Starting on auth service — claiming those files" })
```

Use Agent Room (not General) to coordinate with peer agents:
- Announcing files you're about to claim: "Starting on auth — claiming auth.service.ts"
- Handing off context when blocked: "Blocked on X — checkpoint at step 3, see task comments"
- Flagging critical findings immediately: "Found data bug in Y — creating DATA atom now"

### Responding to @mentions
```
# Show typing indicator immediately on receipt:
chat({ action: "typing", topicId, stage: "Thinking..." })

# Heartbeat every ~10s while working:
chat({ action: "typing", topicId, stage: "Reading context..." })    ← while querying knowledge
chat({ action: "typing", topicId, stage: "Composing response..." }) ← while writing reply

# Indicator clears automatically when your message posts (auto-expires 15s after last call)
```

---

## Communication via Comments

All work updates are posted as **comments** on the task. Comments are visible in the task's right panel in the Build page and readable by the team and other agents. `work_begin`, `work_blocked`, and `work_complete` post automatically.

Use `task({ action: "comment", taskId, content })` for progress updates during work.

---

## Context on `work_begin`

`work_begin` returns:
- **task**: Full task details with acceptanceCriteria
- **recentComments**: Up to 50 recent comments for full context
- **relatedKnowledge**: Auto-searched atoms using task, epic, and solution as search terms
- **searchedTopics**: The topic strings used for atom searches
- **latestCheckpoint**: Previous agent's progress checkpoint (null if first time)
- **clarifications**: Human answers from previous `ask_human` calls
- **agentInstruction**: Mandatory directive — what you MUST communicate to the user

---

## Project-Specific Notes

### Key Files
-

### Architecture Notes
-

### Testing Commands
-

### Deploy Process
-
