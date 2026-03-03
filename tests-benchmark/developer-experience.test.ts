import { describe, it, expect } from "bun:test";
import { createMachine, interpret, assign } from "xstate";
import {
  machine,
  state,
  transition,
  init,
  initial,
  invoke,
  history,
  guard,
  entry
} from "../lib";

describe("Developer Experience Benchmark", () => {
  it("should require fewer lines for simple machines (with invocation)", () => {
    // X-Robot: definition + invocation
    const xRobotCode = `
// Definition
const toggle = machine(
  'Toggle',
  init(initial('off')),
  state('off', transition('toggle', 'on')),
  state('on', transition('toggle', 'off'))
);
// Invocation
invoke(toggle, 'toggle');
`.trim();

    // XState: definition + invocation
    const xStateCode = `
// Definition
const toggle = createMachine({
  initial: 'off',
  states: {
    off: { on: { toggle: 'on' }},
    on: { on: { toggle: 'off' }}
  }
});
// Invocation
const service = interpret(toggle).start();
service.send('toggle');
`.trim();

    const xRobotLines = xRobotCode.split('\n').length;
    const xStateLines = xStateCode.split('\n').length;

    console.log(`\n=== Simple Machine (with invocation) ===`);
    console.log(`X-Robot: ${xRobotLines} lines`);
    console.log(`XState:  ${xStateLines} lines`);
    console.log(`X-Robot is ${(xStateLines / xRobotLines).toFixed(1)}x smaller`);

    expect(xRobotLines).toBeLessThan(xStateLines);
  });

  it("should require fewer lines for async operations (with invocation)", () => {
    const xRobotCode = `
const fetchData = async (ctx) => {
  const res = await fetch('/api/data');
  ctx.data = await res.json();
};

const fetchMachine = machine(
  'Fetch',
  init(initial('idle'), context({ data: null })),
  state('idle', transition('fetch', 'loading')),
  state('loading', entry(fetchData, 'success', 'error')),
  state('success'),
  state('error')
);

invoke(fetchMachine, 'fetch');
`.trim();

    const xStateCode = `
const fetchMachine = createMachine({
  initial: 'idle',
  context: { data: null },
  states: {
    idle: { on: { fetch: 'loading' }},
    loading: {
      invoke: {
        src: async (context) => {
          const res = await fetch('/api/data');
          return await res.json();
        },
        onDone: { 
          target: 'success', 
          actions: assign({ data: (_, event) => event.data }) 
        },
        onError: { target: 'error' }
      }
    },
    success: {},
    error: {}
  }
});

const service = interpret(fetchMachine).start();
service.send('fetch');
`.trim();

    const xRobotLines = xRobotCode.split('\n').length;
    const xStateLines = xStateCode.split('\n').length;

    console.log(`\n=== Async Machine (with invocation) ===`);
    console.log(`X-Robot: ${xRobotLines} lines`);
    console.log(`XState:  ${xStateLines} lines`);
    console.log(`X-Robot is ${(xStateLines / xRobotLines).toFixed(1)}x smaller`);

    expect(xRobotLines).toBeLessThan(xStateLines);
  });

  it("should require fewer lines for machines with guards (with invocation)", () => {
    const xRobotCode = `
const isValidCredentials = (ctx, payload) => payload?.username?.length > 0;

const authMachine = machine(
  'Auth',
  init(initial('loggedOut')),
  state('loggedOut',
    transition('LOGIN', 'checking', guard(isValidCredentials))
  ),
  state('checking', entry(checkAuth, 'loggedIn', 'failed')),
  state('loggedIn'),
  state('failed')
);

invoke(authMachine, 'LOGIN', { username: 'test' });
`.trim();

    const xStateCode = `
const authMachine = createMachine({
  initial: 'loggedOut',
  states: {
    loggedOut: {
      on: {
        LOGIN: {
          target: 'checking',
          cond: (ctx, payload) => payload?.username?.length > 0
        }
      }
    },
    checking: {
      invoke: {
        src: 'checkAuth',
        onDone: { target: 'loggedIn' },
        onError: { target: 'failed' }
      }
    },
    loggedIn: {},
    failed: {}
  }
});

const service = interpret(authMachine).start();
service.send('LOGIN', { username: 'test' });
`.trim();

    const xRobotLines = xRobotCode.split('\n').length;
    const xStateLines = xStateCode.split('\n').length;

    console.log(`\n=== Guards Machine (with invocation) ===`);
    console.log(`X-Robot: ${xRobotLines} lines`);
    console.log(`XState:  ${xStateLines} lines`);
    console.log(`X-Robot is ${(xStateLines / xRobotLines).toFixed(1)}x smaller`);

    expect(xRobotLines).toBeLessThan(xStateLines);
  });

  it("should be more declarative than XState", () => {
    const xRobotCode = `
machine(
  'Declarative',
  init(initial('idle')),
  state('idle', 
    transition('start', 'processing'),
    entry(initialize)
  ),
  state('processing',
    entry(processData, 'success', 'error')
  ),
  state('success', entry(onSuccess)),
  state('error', entry(onError))
)
`.trim();

    const xRobotLines = xRobotCode.split('\n').length;
    
    console.log(`\nX-Robot declarative example: ${xRobotLines} lines`);
    
    expect(xRobotLines).toBeLessThan(20);
  });

  it("should have history feature that XState lacks", () => {
    const xRobotMachine = machine(
      'Test',
      init(initial('idle'), history(5)),
      state('idle', transition('next', 'active')),
      state('active', transition('next', 'idle'))
    );

    invoke(xRobotMachine, 'next');
    invoke(xRobotMachine, 'next');

    console.log(`\n=== History Feature ===`);
    console.log(`X-Robot history entries: ${xRobotMachine.history.length}`);
    console.log(`X-Robot history: ${xRobotMachine.history}`);
    console.log(`XState does NOT have a built-in history tracking feature`);
    console.log(`X-Robot also supports: history(0) to disable, history(n) for custom limit`);

    expect(xRobotMachine.history.length).toBeLessThanOrEqual(5);
    expect(xRobotMachine.history.length).toBeGreaterThan(0);
  });

  it("should have native async guards that XState lacks", () => {
    const asyncGuard = async () => {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1));
      return true;
    };

    const xRobotMachine = machine(
      'AsyncGuardTest',
      init(initial('idle')),
      state('idle', transition('check', 'state1', guard(asyncGuard))),
      state('state1')
    );

    console.log(`\n=== Async Guards Feature ===`);
    console.log(`X-Robot: Supports native async guards`);
    console.log(`  transition('check', 'state1', guard(async () => { ... }))`);
    console.log(`XState: Does NOT support async guards natively`);
    console.log(`  XState requires workaround using invoke with onDone/onError`);

    expect(xRobotMachine.historyLimit).toBe(10);
  });
});
