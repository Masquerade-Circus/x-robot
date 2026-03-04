# X-Robot Documentation Restructure Plan

## Overview

This plan outlines a comprehensive documentation restructure for X-Robot, modeled after best practices from XState and Robot3, optimized for developer experience and conversion.

**Inspired by:**

- XState: Enterprise features, visualizer, templates, comprehensive docs
- Robot3: Minimalist approach, clear "Why" section, thisrobot.life (Astro-based docs)

**Goals:**

1. README serves as quick entry point (~50 lines max)
2. Separate documentation files for deep dives
3. Clear "Why X-Robot" messaging
4. Emphasize the "Pulse" concept as key differentiator
5. Support multiple formats: Markdown (user contribution) + Generated API docs
6. Single entry point: `documentate()` function for all documentation/serialization needs

**Related Skills to use**

- **copywriting**: For README, why.md, guides
- **copy-editing**: Review all content using 7-sweep framework
- **page-cro**: Structure for conversion (entry → deeper docs)

---

## Current State Analysis

### Files to Keep/Modify:

- `README.md` (472 lines) → Reduce to ~50 lines
- `API.md` (467 lines) → Updated with documentate() API
- `PERFORMANCE.md` (74 lines) → Updated with new bundle sizes

### Completed Changes:

- ✅ Migrated `serialize`, `generate`, `visualize`, `scxml` into unified `documentate()` function
- ✅ `documentate()` accepts: Machine, SerializedMachine, SCXML string, PlantUML string
- ✅ `documentate()` outputs: ts, mjs, cjs, json, scxml, plantuml, svg, png, serialized
- ✅ Full interoperability between all input/output formats
- ✅ Tests migrated to use documentate() API

### New Structure:

```
docs/
├── README.md                    # Entry point (current README content restructured)
├── why.md                      # Why Finite State Machines (inspired by Robot3)
├── concepts/
│   ├── pulse.md                # The Pulse concept (X-Robot's differentiator)
│   ├── guards.md               # Guards (sync/async)
│   ├── context.md              # Context management (frozen state)
│   ├── nested.md               # Nested state machines
│   ├── parallel.md             # Parallel state machines
│   └── history.md              # History tracking
├── guides/
│   ├── getting-started.md       # Quick start guide
│   ├── basics.md               # Basic state machine creation
│   ├── async.md                # Async operations with Pulse
│   ├── guards.md               # Using guards effectively
│   ├── nested-machines.md      # Nesting machines
│   ├── parallel-states.md      # Parallel states
│   ├── serialization.md         # Serialize/restore machines (via documentate())
│   ├── scxml.md               # SCXML import/export (via documentate())
│   └── code-generation.md     # Generating TS/ESM/CJS code (via documentate())
├── api/
│   ├── index.md               # Core API overview
│   ├── machine.md              # machine() function
│   ├── state.md                # state() function
│   ├── transition.md           # transition() function
│   ├── entry.md                # entry() / pulse
│   ├── exit.md                 # exit() function
│   ├── guard.md                # guard() function
│   ├── invoke.md               # invoke() function
│   ├── invoke-after.md         # invokeAfter() function
│   ├── snapshot.md             # snapshot/restore
│   └── documentate.md          # documentate() function (unified API)
├── recipes/
│   ├── login-flow.md           # Common: Login flow
│   ├── form-validation.md      # Common: Form validation
│   ├── api-fetch.md            # Common: API data fetching
│   ├── modal-dialog.md         # Common: Modal state
│   └── wizard.md               # Common: Multi-step wizard
├── comparison/
│   ├── xstate.md              # XState vs X-Robot
│   ├── robot3.md              # Robot3 vs X-Robot
│   └── redux.md               # Redux vs X-Robot
├── resources/
│   ├── examples.md             # External examples
│   ├── tools.md                # Related tools (visualizers, etc.)
│   └── contributing.md         # How to contribute
└── performance.md              # Performance benchmarks (from PERFORMANCE.md)
```

---

## Phase 1: README Redesign

### Current README Analysis

**Size:** 472 lines
**Content:**

- Installation (npm/bun)
- What is a Pulse (detailed comparison table)
- Concepts comparison (reducer vs mutation vs producer vs pulse)
- Use cases (simple, async, nested, parallel, exit pulse, async guards, guard with failure)
- Code generation
- SCXML import/export

### Redesign Goals

**Target Size:** ~50 lines

**Structure:**

1. **Hero Section** (1-2 lines)
   - One-liner describing X-Robot

2. **Quick Start** (5-10 lines)
   - Minimal working example

3. **Why X-Robot?** (3-5 lines)
   - Key differentiators:
     - Pulse concept (async made simple)
     - Frozen state by default
     - Small bundle (16KB core / 112KB with modules)
     - Native async guards
     - Unified documentate() API for code gen, diagrams, serialization

4. **Installation** (2 lines)
   - npm install command

5. **Key Features** (5-7 lines bullet points)
   - Nested states
   - Parallel states
   - Guards (sync/async)
   - Serialization (via documentate())
   - Code generation (via documentate())
   - SCXML support (via documentate())
   - Machine validation (via validate())

6. **Links to Full Docs** (1 line)
   - Link to docs/

### Copywriting Principles Applied

**Headline:**

> "A lightweight, developer-friendly state machine library"

**Subheadline:**

> "Pulse-first API makes async state management simple. 13KB with full TypeScript support."

**Quick Start Example:**

```javascript
import { machine, state, transition, invoke } from "x-robot";

const toggle = machine(
  "Toggle",
  state("off", transition("toggle", "on")),
  state("on", transition("toggle", "off"))
);

invoke(toggle, "toggle"); // on
```

**CTA:**

- "Get Started →" → docs/guides/getting-started.html

### Page-CRO Applied

**Value Proposition Clarity:**

- Lead with "lightweight" and "developer-friendly"
- Emphasize "Pulse" as unique differentiator

**CTA Hierarchy:**

- Primary: "Get Started"
- Secondary: "View API", "Compare with XState"

---

## Phase 2: "Why" Section (why.md)

### Purpose

Inspired by Robot3's "Why Finite State Machines" section - explain the problem before the solution.

### Structure

**1. The Problem with Booleans** (200-300 words)

- Show the anti-pattern: multiple booleans for state

```javascript
// BAD: Multiple booleans
let isEditing = false;
let isSaving = false;
let isValid = false;
let hasError = false;
```

**2. The Solution: State Machines** (200-300 words)

- Explain how FSM eliminates invalid states
- Visual diagram (optional)

**3. Why X-Robot?** (300-400 words)

- Compare with other approaches
- Emphasize Pulse concept
- Bundle size advantage

**4. Use Cases** (200-300 words)

- Form validation
- API calls
- UI workflows
- Game state

### Tone

- Educational, not salesy
- Use Robot3's tone as reference: clear, approachable, slightly playful

---

## Phase 3: Concepts Deep-Dive

### 3.1 pulse.md (PRIMARY DIFFERENTIATOR)

**Purpose:** Explain the Pulse concept - X-Robot's key innovation

**Structure:**

1. **What is a Pulse?** (100 words)
   - Definition: execution unit for state updates
   - Receives context + optional payload
   - Can be sync or async
   - Can mutate context directly

2. **Why Not Reducers?** (200 words)
   - Show reducer boilerplate
   - Show equivalent Pulse
   - Highlight reduced code

3. **Basic Pulse** (code example)

```javascript
function fetchData(context) {
  context.data = "loaded";
}

state("loading", entry(fetchData, "success"));
```

4. **Async Pulse** (code example)

```javascript
async function fetchAPI(context) {
  const res = await fetch("/api/data");
  context.data = await res.json();
}

state("loading", entry(fetchAPI, "success", "error"));
```

5. **Pulse with Transitions** (code example)

```javascript
entry(fetchData, "success", "failure");
// success → transition on resolve
// failure → transition on reject
```

6. **Throw After Mutate** (code example)
   - Show frozen mode safety

### 3.2 guards.md

**Structure:**

1. **Sync Guards**
   - Basic guard function
   - Multiple guards

2. **Async Guards** (key differentiator)
   - Native async support
   - No workarounds needed

3. **Guard with Failure**
   - Transition on false result

### 3.3 context.md

**Structure:**

1. **Frozen State by Default**
   - Why immutability matters
   - No manual cloning

2. **Context Updates**
   - Direct mutation (in frozen mode: cloned)
   - Object spread alternative

---

## Phase 4: Guides

### 4.1 getting-started.md

**Structure:**

1. **Installation** (50 words)
   - npm install

2. **Your First Machine** (200 words)
   - Step-by-step
   - Full code example

3. **Understanding the Parts** (300 words)
   - machine()
   - state()
   - transition()
   - invoke()

4. **Next Steps** (50 words)
   - Links to other guides

### 4.2 async.md

**Purpose:** Show how Pulse simplifies async

**Structure:**

1. **The Old Way: Actions + Producers** (200 words)
   - Show Redux-like approach

2. **The X-Robot Way: Pulse** (200 words)
   - Single function handles both

3. **Error Handling** (200 words)
   - Success/failure transitions
   - Try/catch in Pulse

4. **Real-World Example** (300 words)
   - API fetch with loading state

### 4.3 serialization.md

**Structure:**

1. **documentate() with format: 'serialized'** (150 words)
   - Using documentate() to get SerializedMachine
2. **documentate() with format: 'json'** (150 words)
   - JSON representation
3. **Use cases** (200 words)
   - Save/load state
   - Server-side state
   - Debugging

### 4.4 code-generation.md (NEW)

**Structure:**

1. **documentate() with format: 'ts'** (150 words)
   - TypeScript code generation
2. **documentate() with format: 'mjs'** (150 words)
   - ES Modules generation
3. **documentate() with format: 'cjs'** (150 words)
   - CommonJS generation

### 4.5 scxml.md (NEW)

**Structure:**

1. **documentate() with format: 'scxml'** (150 words)
   - Export to SCXML
2. **documentate() with format: 'serialized' from SCXML** (150 words)
   - Import from SCXML

---

## Phase 5: API Documentation

### Approach

- Generate from TypeScript types using typedoc
- Supplement with markdown guides

### documentate() - Unified API

The `documentate()` function is the single entry point for:

- Code generation (ts, mjs, cjs)
- Serialization (json, serialized)
- SCXML import/export
- Diagram generation (plantuml, svg, png)

**Example:**

```javascript
import { documentate } from "x-robot";

// Generate all formats
const result = await documentate(myMachine, { format: "all" });

// Generate from SCXML
const result = await documentate(scxmlString, { format: "ts" });

// Generate SVG from PlantUML
const result = await documentate(plantUmlCode, { format: "svg" });
```

### Per-Function Docs

Each API function gets:

- Signature
- Parameters
- Return value
- Code example
- Related functions

---

## Phase 6: Recipes

### Purpose

Copy common patterns, inspire developers

### Each Recipe Structure

1. **Problem** (50 words)
2. **Solution** (50 words)
3. **Code** (50-100 lines)
4. **Key Takeaways** (50 words)

### Recipe Ideas

1. **Login Flow**
   - States: idle, authenticating, authenticated, error
   - Transitions: login, logout, success, failure

2. **Form Validation**
   - States: pristine, validating, valid, invalid, submitting
   - Guards for validation
   - Error display

3. **API Data Fetch**
   - States: idle, loading, success, error
   - Async Pulse for fetch
   - Retry logic

4. **Modal Dialog**
   - States: closed, opening, open, closing
   - Entry/exit animations

5. **Multi-Step Wizard**
   - Nested states per step
   - Progress tracking

---

## Phase 7: Comparison Docs

### comparison/xstate.md

**Purpose:** Help users choose between XState and X-Robot

**Structure:**

1. **Quick Comparison Table**
   | Feature | X-Robot Core | X-Robot + Modules | XState |
   |---------|--------------|-------------------|--------|
   | Bundle | 16KB | 112KB | 30-59KB |
   | Async guards | Native | Native | Workaround |
   | Frozen state | Default | Default | Optional |
   | Code gen | documentate() | documentate() | No |
   | SCXML | documentate() | documentate() | Partial |
   | Machine validation | No | validate() | No |

2. **When to Choose X-Robot** (200 words)
   - Small bundle important
   - Simple API preferred
   - Async guards needed
   - Code generation needed
   - Machine validation needed

3. **When to Choose XState** (200 words)
   - Larger ecosystem needed
   - Visual editor required
   - Enterprise support needed

### comparison/robot3.md

**Purpose:** Position against smaller competitor

**Structure:**

1. **Quick Comparison**
   | Feature | X-Robot Core | X-Robot + Modules | Robot3 |
   |---------|---------------|-------------------|--------|
   | Bundle | 16KB | 112KB | 1KB |
   | TypeScript | Full | Full | Basic |
   | Nested states | Yes | Yes | No |
   | Parallel states | Yes | Yes | No |
   | Guards | Yes | Yes | Limited |
   | Code gen | No | documentate() | No |

2. **When Each Wins**
   - Robot3: Extreme minimalism
   - X-Robot: More features, still small

---

## Phase 8: Performance Documentation

### From PERFORMANCE.md

Move current PERFORMANCE.md content to `docs/performance.md`

**Structure:**

1. **Bundle Size** (with comparison table)
2. **Benchmarks** (with methodology)
3. **Why It Matters** (100 words)

---

## Implementation Order

### Phase 1: README (Priority: HIGH)

- [ ] Rewrite README to ~50 lines
- [ ] Keep quick start example
- [ ] Add links to docs/
- [x] Update examples to use documentate() API

### Phase 2: Why Section (Priority: HIGH)

- [ ] Create docs/why.md
- [ ] Explain FSM value
- [ ] Position X-Robot

### Phase 3: Core Concepts (Priority: HIGH)

- [ ] docs/concepts/pulse.md
- [ ] docs/concepts/guards.md
- [ ] docs/concepts/context.md

### Phase 4: Guides (Priority: MEDIUM)

- [ ] docs/guides/getting-started.md
- [ ] docs/guides/async.md
- [x] docs/guides/serialization.md (use documentate())
- [x] docs/guides/code-generation.md (use documentate())
- [x] docs/guides/scxml.md (use documentate())

### Phase 5: API Docs (Priority: MEDIUM)

- [x] Generate from typedoc
- [x] Create overview pages
- [x] documentate() function documented in API.md

### Phase 6: Recipes (Priority: LOW)

- [ ] 2-3 initial recipes
- [ ] Expand over time

### Phase 7: Comparisons (Priority: LOW)

- [x] docs/comparison/xstate.md (updated sizes)
- [x] docs/comparison/robot3.md (updated sizes)

---

## Content Guidelines

### Tone

- **Technical but approachable**
- Avoid corporate jargon
- Use "you" (second person)
- Active voice

### Code Examples

- Include imports
- Show complete examples
- Comment complex parts
- Use consistent formatting

### Visual Elements

- State diagrams where helpful
- Comparison tables
- Flowcharts for complex logic

---

## Success Metrics

1. **README bounce rate** - Decrease time on page (quick entry → docs)
2. **Docs engagement** - Track which pages are most visited
3. **Conversion** - npm downloads
4. **User feedback** - Issues and discussions

---

## Maintenance

1. **API docs** - Auto-generate from typedoc on release
2. **Performance** - Update benchmarks on significant changes
3. **Recipes** - Community contributions welcome
4. **Examples** - External links to real-world usage

---

## Related Skills Used

- **copywriting**: For README, why.md, guides
- **copy-editing**: Review all content using 7-sweep framework
- **page-cro**: Structure for conversion (entry → deeper docs)

---

## Changelog

### 2026-03-04

- Updated bundle sizes: 16KB (core), 112KB (with modules)
- Replaced serialize(), generateFromSerializedMachine(), toSCXML(), fromSCXML() with unified documentate() API
- Added Machine validation feature (via validate())
- Updated API section to document documentate() function
- Updated comparison tables with new bundle sizes
- Added code-generation.md and scxml.md to guides

---

_Last Updated: 2026-03-04_
