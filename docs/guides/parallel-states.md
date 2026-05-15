# Parallel States

Parallel states allow multiple independent states to be active simultaneously.

## Basic Parallel Machine

```mermaid
---
title: Word Machine
---

stateDiagram-v2
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "Parallel states" as WordMachineParallelStates
state WordMachineParallelStates {
  state "off" as WordMachineBoldOff
  state "on" as WordMachineBoldOn


  [*] --> WordMachineBoldOff
  WordMachineBoldOff --> WordMachineBoldOn: on
  WordMachineBoldOn --> WordMachineBoldOff: off
  --
  state "off" as WordMachineUnderlineOff
  state "on" as WordMachineUnderlineOn


  [*] --> WordMachineUnderlineOff
  WordMachineUnderlineOff --> WordMachineUnderlineOn: on
  WordMachineUnderlineOn --> WordMachineUnderlineOff: off
  --
  state "off" as WordMachineItalicsOff
  state "on" as WordMachineItalicsOn


  [*] --> WordMachineItalicsOff
  WordMachineItalicsOff --> WordMachineItalicsOn: on
  WordMachineItalicsOn --> WordMachineItalicsOff: off
  --
  state "none" as WordMachineListNone
  state "bullets" as WordMachineListBullets
  state "numbers" as WordMachineListNumbers


  [*] --> WordMachineListNone
  WordMachineListNone --> WordMachineListBullets: bullets
  WordMachineListNone --> WordMachineListNumbers: numbers
  WordMachineListBullets --> WordMachineListNone: none
  WordMachineListNumbers --> WordMachineListNone: none
}
```
```javascript
import { getState, init, initial, invoke, machine, parallel, state, transition } from "x-robot";

const boldMachine = machine(
  "Bold",
  init(initial("off")),
  state("off", transition("on", "on")),
  state("on", transition("off", "off"))
);

const underlineMachine = machine(
  "Underline",
  init(initial("off")),
  state("off", transition("on", "on")),
  state("on", transition("off", "off"))
);

const italicsMachine = machine(
  "Italics",
  init(initial("off")),
  state("off", transition("on", "on")),
  state("on", transition("off", "off"))
);

const listMachine = machine(
  "List",
  init(initial("none")),
  state("none", transition("bullets", "bullets"), transition("numbers", "numbers")),
  state("bullets", transition("none", "none")),
  state("numbers", transition("none", "none"))
);

const wordMachine = machine(
  "Word Machine",
  parallel(boldMachine, underlineMachine, italicsMachine, listMachine)
);
```

## Accessing State

### getState()

```javascript
const state = getState(wordMachine);
// { bold: "off", underline: "off", italics: "off", list: "none" }
```

### Direct Access

```javascript
console.log(boldMachine.current);    // "off"
console.log(italicsMachine.current); // "off"
```

## Invoking Transitions

Target specific regions with slash notation:

```javascript
invoke(wordMachine, "bold/on");      // bold: off -> on
invoke(wordMachine, "italics/on");   // italics: off -> on
```

## Complete Example: Text Editor

```mermaid
---
title: Editor
---

stateDiagram-v2
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "Parallel states" as EditorParallelStates
state EditorParallelStates {
  state "off" as EditorBoldOff
  state "on" as EditorBoldOn


  [*] --> EditorBoldOff
  EditorBoldOff --> EditorBoldOn: toggle
  EditorBoldOn --> EditorBoldOff: toggle
  --
  state "off" as EditorItalicOff
  state "on" as EditorItalicOn


  [*] --> EditorItalicOff
  EditorItalicOff --> EditorItalicOn: toggle
  EditorItalicOn --> EditorItalicOff: toggle
  --
  state "off" as EditorUnderlineOff
  state "on" as EditorUnderlineOn


  [*] --> EditorUnderlineOff
  EditorUnderlineOff --> EditorUnderlineOn: toggle
  EditorUnderlineOn --> EditorUnderlineOff: toggle
  --
  state "left" as EditorAlignmentLeft
  state "center" as EditorAlignmentCenter
  state "right" as EditorAlignmentRight


  [*] --> EditorAlignmentLeft
  EditorAlignmentLeft --> EditorAlignmentCenter: align
  EditorAlignmentCenter --> EditorAlignmentRight: align
  EditorAlignmentRight --> EditorAlignmentLeft: align
}
```
```javascript
const bold = machine("Bold", init(initial("off")),
  state("off", transition("toggle", "on")),
  state("on", transition("toggle", "off"))
);

const italic = machine("Italic", init(initial("off")),
  state("off", transition("toggle", "on")),
  state("on", transition("toggle", "off"))
);

const underline = machine("Underline", init(initial("off")),
  state("off", transition("toggle", "on")),
  state("on", transition("toggle", "off"))
);

const alignment = machine("Alignment", init(initial("left")),
  state("left", transition("align", "center")),
  state("center", transition("align", "right")),
  state("right", transition("align", "left"))
);

const editor = machine(
  "Editor",
  parallel(bold, italic, underline, alignment)
);
```

## Parallel with Context

```mermaid
---
title: Search
---

stateDiagram-v2
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "Parallel states" as SearchParallelStates
state SearchParallelStates {
  state "empty" as SearchQueryEmpty
  state "active" as SearchQueryActive


  [*] --> SearchQueryEmpty
  SearchQueryEmpty --> SearchQueryActive: type
  SearchQueryActive --> SearchQueryEmpty: clear
  SearchQueryActive --> searching: submit
  --
  state "none" as SearchResultsNone
  state "some" as SearchResultsSome


  [*] --> SearchResultsNone
  SearchResultsNone --> SearchResultsSome: found
  SearchResultsSome --> SearchResultsNone: clear
}


[*] --> ready
```
```javascript
const search = machine(
  "Search",
  init(initial("ready"), context({ query: "", results: [] })),
  parallel(
    machine("Query", init(initial("empty")),
      state("empty", transition("type", "active")),
      state("active", transition("clear", "empty"), transition("submit", "searching"))
    ),
    machine("Results", init(initial("none")),
      state("none", transition("found", "some")),
      state("some", transition("clear", "none"))
    )
  )
);
```

## Use Cases

### Multi-Filter Panel

```mermaid
---
title: Filters
---

stateDiagram-v2
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "Parallel states" as FiltersParallelStates
state FiltersParallelStates {
  state "all" as FiltersCategoryAll
  state "electronics" as FiltersCategoryElectronics


  [*] --> FiltersCategoryAll
  FiltersCategoryAll --> FiltersCategoryElectronics: select
  FiltersCategoryElectronics --> FiltersCategoryAll: select
  --
  state "any" as FiltersPriceRangeAny
  state "range1" as FiltersPriceRangeRange1


  [*] --> FiltersPriceRangeAny
  FiltersPriceRangeAny --> FiltersPriceRangeRange1: select
  FiltersPriceRangeRange1 --> FiltersPriceRangeAny: select
  --
  state "relevance" as FiltersSortByRelevance
  state "price" as FiltersSortByPrice


  [*] --> FiltersSortByRelevance
  FiltersSortByRelevance --> FiltersSortByPrice: select
  FiltersSortByPrice --> FiltersSortByRelevance: select
}
```
```javascript
const category = machine("Category", init(initial("all")),
  state("all", transition("select", "electronics")),
  state("electronics", transition("select", "all"))
);

const priceRange = machine("PriceRange", init(initial("any")),
  state("any", transition("select", "range1")),
  state("range1", transition("select", "any"))
);

const sortBy = machine("SortBy", init(initial("relevance")),
  state("relevance", transition("select", "price")),
  state("price", transition("select", "relevance"))
);

const filters = machine("Filters", parallel(category, priceRange, sortBy));
```

### Dashboard Panels

```mermaid
---
title: Dashboard
---

stateDiagram-v2
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "Parallel states" as DashboardParallelStates
state DashboardParallelStates {
  state "expanded" as DashboardSidebarExpanded
  state "collapsed" as DashboardSidebarCollapsed


  [*] --> DashboardSidebarExpanded
  DashboardSidebarExpanded --> DashboardSidebarCollapsed: toggle
  DashboardSidebarCollapsed --> DashboardSidebarExpanded: toggle
  --
  state "visible" as DashboardHeaderVisible
  state "hidden" as DashboardHeaderHidden


  [*] --> DashboardHeaderVisible
  DashboardHeaderVisible --> DashboardHeaderHidden: toggle
  DashboardHeaderHidden --> DashboardHeaderVisible: toggle
  --
  state "list" as DashboardContentList
  state "grid" as DashboardContentGrid


  [*] --> DashboardContentList
  DashboardContentList --> DashboardContentGrid: view
  DashboardContentGrid --> DashboardContentList: view
}
```
```javascript
const sidebar = machine("Sidebar", init(initial("expanded")),
  state("expanded", transition("toggle", "collapsed")),
  state("collapsed", transition("toggle", "expanded"))
);

const header = machine("Header", init(initial("visible")),
  state("visible", transition("toggle", "hidden")),
  state("hidden", transition("toggle", "visible"))
);

const content = machine("Content", init(initial("list")),
  state("list", transition("view", "grid")),
  state("grid", transition("view", "list"))
);

const dashboard = machine("Dashboard", parallel(sidebar, header, content));
```

## Best Practices

1.  **Keep regions independent** — No cross-region dependencies
2.  **Use meaningful names** — Easy to identify regions
3.  **Consider performance** — Many parallel regions may slow transitions

## Next Steps

*   [Nested Machines](./nested-machines.md) — Hierarchical states
*   [Concepts: Parallel](../concepts/parallel.md) — Deep dive
*   [Recipes: Modal Dialog](../recipes/modal-dialog.md) — UI state
