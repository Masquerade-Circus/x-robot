import type {
  SerializedMachine,
  SerializedGuard,
  SerializedState,
  SerializedTransition
} from "./types";

export interface DiagramMachine {
  id: string;
  alias: string;
  path: string;
  label: string;
  initial?: string;
  stateCount: number;
}

export interface DiagramEvent {
  id: string;
  alias: string;
  name: string;
}

export interface DiagramState {
  id: string;
  alias: string;
  label: string;
  name: string;
  machinePath: string;
  type: string;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label: string;
  kind: string;
}

export interface EventEdge {
  event: string;
  eventId: string;
  from: string;
  to: string;
  label: string;
}

export interface GuardDecision {
  id: string;
  sourceStateId: string;
  sourceLabel: string;
  triggerLabel: string;
  guardName: string;
  successTargetId?: string;
  successTargetLabel?: string;
  failureTargetId?: string;
  failureTargetLabel?: string;
  kind: "transition" | "immediate";
}

export interface ComplexityPoint {
  stateId: string;
  label: string;
  transitionLoad: number;
  actionLoad: number;
  x: number;
  y: number;
}

interface MachineVisit {
  machine: SerializedMachine;
  path: string;
  parentMachinePath?: string;
  parentStateId?: string;
  relation?: string;
}

interface MachineScope {
  path: string;
  machine: SerializedMachine;
  states: DiagramState[];
  byName: Record<string, DiagramState>;
}

export interface AdditionalDiagramModel {
  machines: DiagramMachine[];
  states: DiagramState[];
  pulseEdges: DiagramEdge[];
  events: DiagramEvent[];
  eventEdges: EventEdge[];
  outcomeEdges: DiagramEdge[];
  immediateEdges: DiagramEdge[];
  guardDecisions: GuardDecision[];
  compositionEdges: DiagramEdge[];
  complexityPoints: ComplexityPoint[];
  aliases: Record<string, string>;
}

export function toDiagramAlias(id: string): string {
  const alias = id.replace(/[^A-Za-z0-9]/g, "_").replace(/^_+|_+$/g, "");
  return alias.length > 0 ? alias : "node";
}

function createAliasRegistry(): {
  aliases: Record<string, string>;
  aliasForId: (id: string) => string;
} {
  const aliases: Record<string, string> = {};
  const used: Record<string, boolean> = {};

  function aliasForId(id: string): string {
    if (aliases[id]) {
      return aliases[id];
    }
    const base = toDiagramAlias(id);
    let alias = base;
    let suffix = 2;
    while (used[alias]) {
      alias = `${base}_${suffix}`;
      suffix += 1;
    }
    used[alias] = true;
    aliases[id] = alias;
    return alias;
  }

  return { aliases, aliasForId };
}

export function escapeDiagramLabel(value: string): string {
  return value
    .replace(/[\r\n]+/g, " ")
    .replace(/\\/g, "＼")
    .replace(/"/g, "＂")
    .replace(/\|/g, "｜")
    .replace(/\(/g, "（")
    .replace(/\)/g, "）")
    .replace(/\[/g, "［")
    .replace(/\]/g, "］")
    .replace(/\{/g, "｛")
    .replace(/\}/g, "｝");
}

function stateId(machinePath: string, stateName: string): string {
  return `${machinePath}:${stateName}`;
}

function machineId(machinePath: string): string {
  return `machine:${machinePath}`;
}

function eventId(eventName: string): string {
  return `event:${eventName}`;
}

function displayStateLabel(machinePath: string, stateName: string): string {
  return machinePath === "root"
    ? stateName
    : `${machinePath.replace(/^root\.?/, "")}.${stateName}`;
}

function complexityMachineLabel(scope: MachineScope): string {
  if (scope.path === "root") {
    return "root";
  }
  if (scope.machine.title) {
    return scope.machine.title;
  }
  const parallelMatch = scope.path.match(/\.parallel\.([^.]+)$/);
  if (parallelMatch) {
    return parallelMatch[1];
  }
  return scope.path.replace(/^root\.?/, "");
}

function resolveState(
  scope: MachineScope,
  target?: string
): DiagramState | undefined {
  if (!target) {
    return;
  }
  return scope.byName[target];
}

function collectScopes(
  serializedMachine: SerializedMachine,
  aliasForId: (id: string) => string
): { visits: MachineVisit[]; scopes: MachineScope[] } {
  const visits: MachineVisit[] = [];
  const scopes: MachineScope[] = [];

  function visit(
    machine: SerializedMachine,
    path: string,
    parentMachinePath?: string,
    parentStateId?: string,
    relation?: string
  ): void {
    visits.push({ machine, path, parentMachinePath, parentStateId, relation });

    const states: DiagramState[] = [];
    const byName: Record<string, DiagramState> = {};
    for (const name in machine.states) {
      const current: DiagramState = {
        id: stateId(path, name),
        alias: aliasForId(stateId(path, name)),
        label: displayStateLabel(path, name),
        name,
        machinePath: path,
        type: machine.states[name].type || "default"
      };
      states.push(current);
      byName[name] = current;
    }
    scopes.push({ path, machine, states, byName });

    for (const name in machine.states) {
      const state = machine.states[name];
      if (!state.nested) {
        continue;
      }
      for (let i = 0; i < state.nested.length; i++) {
        visit(
          state.nested[i].machine,
          `${path}.state.${name}.nested.${i}`,
          path,
          stateId(path, name),
          state.nested[i].transition
            ? `nested outcome: ${state.nested[i].transition}`
            : "nested"
        );
      }
    }

    for (const key in machine.parallel) {
      visit(
        machine.parallel[key],
        `${path}.parallel.${key}`,
        path,
        undefined,
        `parallel: ${key}`
      );
    }
  }

  visit(serializedMachine, "root");
  return { visits, scopes };
}

function pushOutcome(
  edges: DiagramEdge[],
  from: DiagramState,
  to: DiagramState | undefined,
  label: string
): void {
  if (!to) {
    return;
  }
  edges.push({ from: from.id, to: to.id, label, kind: "outcome" });
}

function pushGuardDecision(
  guardDecisions: GuardDecision[],
  outcomeEdges: DiagramEdge[],
  scope: MachineScope,
  source: DiagramState,
  target: DiagramState | undefined,
  guard: SerializedGuard,
  triggerLabel: string,
  kind: GuardDecision["kind"]
): void {
  const failure = resolveState(scope, guard.failure);
  if (failure) {
    outcomeEdges.push({
      from: source.id,
      to: failure.id,
      label: `guard failure: ${guard.guard}`,
      kind: "guard-failure"
    });
  }
  guardDecisions.push({
    id: `guard:${guardDecisions.length}`,
    sourceStateId: source.id,
    sourceLabel: source.label,
    triggerLabel,
    guardName: guard.guard,
    successTargetId: target?.id,
    successTargetLabel: target?.label,
    failureTargetId: failure?.id,
    failureTargetLabel: failure?.label,
    kind
  });
}

function addIncoming(
  incoming: Record<string, number>,
  state: DiagramState | undefined
): void {
  if (!state) {
    return;
  }
  incoming[state.id] = (incoming[state.id] || 0) + 1;
}

function collectComplexity(scopes: MachineScope[]): ComplexityPoint[] {
  const outgoing: Record<string, number> = {};
  const incoming: Record<string, number> = {};
  const immediateCount: Record<string, number> = {};
  const entryPulses: Record<string, number> = {};
  const exitPulses: Record<string, number> = {};
  const pulseFailures: Record<string, number> = {};
  const points: ComplexityPoint[] = [];

  for (const scope of scopes) {
    for (const stateInfo of scope.states) {
      const state = scope.machine.states[stateInfo.name];
      const transitions = state.on || {};
      outgoing[stateInfo.id] = Object.keys(transitions).length;
      immediateCount[stateInfo.id] = state.immediate
        ? state.immediate.length
        : 0;
      entryPulses[stateInfo.id] = state.run ? state.run.length : 0;
      exitPulses[stateInfo.id] = 0;
      pulseFailures[stateInfo.id] = 0;

      if (state.run) {
        for (const pulse of state.run) {
          addIncoming(incoming, resolveState(scope, pulse.success));
          addIncoming(incoming, resolveState(scope, pulse.failure));
          if (pulse.failure) {
            pulseFailures[stateInfo.id] += 1;
          }
        }
      }

      for (const event in transitions) {
        const transition = transitions[event];
        addIncoming(incoming, resolveState(scope, transition.target));
        if (transition.guards) {
          for (const guard of transition.guards) {
            addIncoming(incoming, resolveState(scope, guard.failure));
          }
        }
        if (transition.exit) {
          exitPulses[stateInfo.id] += transition.exit.length;
          for (const pulse of transition.exit) {
            addIncoming(incoming, resolveState(scope, pulse.success));
            addIncoming(incoming, resolveState(scope, pulse.failure));
            if (pulse.failure) {
              pulseFailures[stateInfo.id] += 1;
            }
          }
        }
      }

      if (state.immediate) {
        for (const immediate of state.immediate) {
          addIncoming(incoming, resolveState(scope, immediate.immediate));
          if (immediate.guards) {
            for (const guard of immediate.guards) {
              addIncoming(incoming, resolveState(scope, guard.failure));
            }
          }
        }
      }

      if (state.nested) {
        for (const nested of state.nested) {
          addIncoming(incoming, resolveState(scope, nested.transition));
        }
      }
    }
  }

  for (const scope of scopes) {
    const machineLabel = complexityMachineLabel(scope);
    for (const state of scope.states) {
      points.push({
        stateId: state.id,
        label: `${machineLabel}.${state.name}`,
        transitionLoad:
          (outgoing[state.id] || 0) +
          (incoming[state.id] || 0) +
          (immediateCount[state.id] || 0),
        actionLoad:
          (entryPulses[state.id] || 0) +
          (exitPulses[state.id] || 0) +
          (pulseFailures[state.id] || 0),
        x: 0,
        y: 0
      });
    }
  }

  let maxTransitionLoad = 1;
  let maxActionLoad = 1;
  for (const point of points) {
    if (point.transitionLoad > maxTransitionLoad) {
      maxTransitionLoad = point.transitionLoad;
    }
    if (point.actionLoad > maxActionLoad) {
      maxActionLoad = point.actionLoad;
    }
  }

  for (const point of points) {
    point.x = point.transitionLoad / maxTransitionLoad;
    point.y = point.actionLoad / maxActionLoad;
  }

  return points;
}

export function collectAdditionalDiagramModel(
  serializedMachine: SerializedMachine
): AdditionalDiagramModel {
  const { aliases, aliasForId } = createAliasRegistry();
  const { visits, scopes } = collectScopes(serializedMachine, aliasForId);
  const machines: DiagramMachine[] = [];
  const states: DiagramState[] = [];
  const pulseEdges: DiagramEdge[] = [];
  const eventMap: Record<string, DiagramEvent> = {};
  const eventEdges: EventEdge[] = [];
  const outcomeEdges: DiagramEdge[] = [];
  const immediateEdges: DiagramEdge[] = [];
  const guardDecisions: GuardDecision[] = [];
  const compositionEdges: DiagramEdge[] = [];

  for (const visit of visits) {
    machines.push({
      id: machineId(visit.path),
      alias: aliasForId(machineId(visit.path)),
      path: visit.path,
      label:
        visit.machine.title || (visit.path === "root" ? "Machine" : visit.path),
      initial:
        typeof visit.machine.initial === "string"
          ? visit.machine.initial
          : undefined,
      stateCount: Object.keys(visit.machine.states).length
    });
    if (visit.parentMachinePath && visit.relation) {
      compositionEdges.push({
        from: visit.parentStateId || machineId(visit.parentMachinePath),
        to: machineId(visit.path),
        label: visit.relation,
        kind: visit.relation.indexOf("parallel") === 0 ? "parallel" : "nested"
      });
    }
  }

  for (const scope of scopes) {
    for (const stateInfo of scope.states) {
      states.push(stateInfo);
      compositionEdges.push({
        from: machineId(scope.path),
        to: stateInfo.id,
        label: "has state",
        kind: "state"
      });
      const state: SerializedState = scope.machine.states[stateInfo.name];

      if (state.run) {
        for (const pulse of state.run) {
          const success = resolveState(scope, pulse.success);
          const failure = resolveState(scope, pulse.failure);
          if (success) {
            pulseEdges.push({
              from: stateInfo.id,
              to: success.id,
              label: `entry: ${pulse.pulse} ✓`,
              kind: "entry-success"
            });
            outcomeEdges.push({
              from: stateInfo.id,
              to: success.id,
              label: `entry success: ${pulse.pulse}`,
              kind: "entry-success"
            });
          }
          if (failure) {
            pulseEdges.push({
              from: stateInfo.id,
              to: failure.id,
              label: `entry: ${pulse.pulse} ✗`,
              kind: "entry-failure"
            });
            outcomeEdges.push({
              from: stateInfo.id,
              to: failure.id,
              label: `entry failure: ${pulse.pulse}`,
              kind: "entry-failure"
            });
          }
        }
      }

      const transitions = state.on || {};
      for (const event in transitions) {
        const transition: SerializedTransition = transitions[event];
        if (!eventMap[event]) {
          eventMap[event] = {
            id: eventId(event),
            alias: aliasForId(eventId(event)),
            name: event
          };
        }
        const target = resolveState(scope, transition.target);
        if (target) {
          let label = "target";
          if (transition.guards && transition.guards.length > 0) {
            const guards = transition.guards
              .map((guard) =>
                guard.failure
                  ? `${guard.guard} -> ${guard.failure}`
                  : guard.guard
              )
              .join(", ");
            label += ` [guard: ${guards}]`;
          }
          eventEdges.push({
            event,
            eventId: eventId(event),
            from: stateInfo.id,
            to: target.id,
            label
          });
          outcomeEdges.push({
            from: stateInfo.id,
            to: target.id,
            label: event,
            kind: "transition"
          });
        }
        if (transition.guards) {
          for (const guard of transition.guards) {
            pushGuardDecision(
              guardDecisions,
              outcomeEdges,
              scope,
              stateInfo,
              target,
              guard,
              `event: ${event}`,
              "transition"
            );
          }
        }
        if (transition.exit) {
          for (const pulse of transition.exit) {
            const to = resolveState(scope, transition.target);
            if (to) {
              pulseEdges.push({
                from: stateInfo.id,
                to: to.id,
                label: `exit: ${pulse.pulse} on ${event}`,
                kind: "exit"
              });
            }
            pushOutcome(
              outcomeEdges,
              stateInfo,
              resolveState(scope, pulse.failure),
              `exit failure: ${pulse.pulse}`
            );
          }
        }
      }

      if (state.immediate) {
        for (const immediate of state.immediate) {
          const target = resolveState(scope, immediate.immediate);
          const guardText =
            immediate.guards && immediate.guards.length > 0
              ? ` [guard: ${immediate.guards.map((guard) => (guard.failure ? `${guard.guard}; failure: ${guard.failure}` : guard.guard)).join(", ")}]`
              : "";
          if (target) {
            immediateEdges.push({
              from: stateInfo.id,
              to: target.id,
              label: `immediate${guardText}`,
              kind: "immediate"
            });
          }
          if (immediate.guards) {
            for (const guard of immediate.guards) {
              pushGuardDecision(
                guardDecisions,
                outcomeEdges,
                scope,
                stateInfo,
                target,
                guard,
                "immediate",
                "immediate"
              );
            }
          }
        }
      }
    }
  }

  return {
    machines,
    states,
    pulseEdges,
    events: Object.keys(eventMap).map((name) => eventMap[name]),
    eventEdges,
    outcomeEdges,
    immediateEdges,
    guardDecisions,
    compositionEdges,
    complexityPoints: collectComplexity(scopes),
    aliases
  };
}
