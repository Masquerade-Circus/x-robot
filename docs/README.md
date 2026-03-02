x-robot - v0.3.0 / [Modules](modules.md)

## X-Robot

X-Robot is a finite state machine library for nodejs and for the web.
Intended to be used for high complex state machines with an easy to use API.
Not only for user interfaces but also for server side applications.

## Installation

`x-robot` is published as an npm module: https://www.npmjs.com/package/x-robot

### npm

```bash
npm install x-robot
```

### bun

```bash
bun add x-robot
```

## What is a Pulse?

A pulse is the execution unit in x-robot for state updates and side effects.
It receives `context` plus an optional payload, can be sync or async, and can
mutate `context` directly.

In frozen mode (enabled by default), pulses receive a cloned context, so you do
not need to clone state manually before updating it.

```javascript
pulse(fn) // pulse with no transitions
pulse(fn, 'success') // transition on success
pulse(fn, 'success', 'failure') // transitions on success or failure
```

### Concepts comparison

| Concept | Can run async | Manual state clone | Must return new state | Event/type discrimination | Async update needs two functions | Boilerplate complexity |
| --- | --- | --- | --- | --- | --- | --- |
| Reducer | No | Yes | Yes | Yes | Yes | High |
| Mutation | No | Yes | Yes | No | Yes | Medium |
| Producer | No | No | No | No | Yes | Low |
| Action + Mutation | Yes | Yes | Yes | No | Yes | High |
| Action + Producer | Yes | No | No | No | Yes | Medium |
| Pulse | Yes | No | No | No | No | Minimal |

### Reducer example (discriminates by event type)

```javascript
function titleReducer(state, action) {
  if (action.type === 'TITLE/SET') {
    return { ...state, title: action.payload };
  }

  if (action.type === 'TITLE/CLEAR') {
    return { ...state, title: '' };
  }

  return state;
}
```

### Action + Mutation example

```javascript
async function fetchTitleAction(state) {
  const response = await fetch('/api/title');
  const data = await response.json();
  return setTitleMutation(state, data.title);
}

function setTitleMutation(state, title) {
  return { ...state, title };
}
```

### Action + Producer example

```javascript
async function fetchTitleAction(context) {
  const response = await fetch('/api/title');
  const data = await response.json();
  setTitleProducer(context, data.title);
}

function setTitleProducer(context, title) {
  context.title = title;
}
```

### Pulse example (single function)

```javascript
async function fetchTitle(context) {
  const response = await fetch('/api/title');
  const data = await response.json();
  context.title = data.title;
}

state('loading', pulse(fetchTitle, 'resolved', 'rejected'));
```

### Throw after mutating context

```javascript
function validateAndFail(context) {
  context.lastAttempt = Date.now();
  throw new Error('Validation failed');
}

state('saving', pulse(validateAndFail, undefined, 'error'));
```

In frozen mode (default), the pulse writes to a cloned context, so mutating
then throwing is safe and does not attempt to mutate the original frozen object.

## Use cases

### Simple example

![Toggle machine diagram](./media/toggle-machine-diagram.svg)

```javascript 
import {machine, state, initial, init, transition, invoke} from 'x-robot';

const stoplight = machine(
  'Stoplight',
  init(initial('green')),
  state('green', transition('next', 'yellow')),
  state('yellow', transition('next', 'red')),
  state('red', transition('next', 'green'))
);

// stoplight.current === 'green' because is the initial state
invoke(stoplight, 'next'); // stoplight.current === 'yellow'
invoke(stoplight, 'next'); // stoplight.current === 'red'
invoke(stoplight, 'next'); // stoplight.current === 'green' 
```

### Async example

![Fetch machine diagram](./media/fetch-machine-diagram.svg)

```javascript
import {machine, state, initial, init, context, transition, immediate, invoke, pulse} from 'x-robot';

// Pulse
async function fetchDog(context) {
  let response = await fetch('https://dog.ceo/api/breeds/image/random');
  let json = await response.json();
  context.dog = json.data;
}

// Error pulse
function assignError(context, error) {
  context.error = error;
}

// Machine definition
const fetchMachine = machine(
  'Dog API',
  init(initial('idle'), context({
    dog: null,
    error: null
  })),
  state('idle', transition('fetch', 'loading')),
  state(
    'loading',
    pulse(fetchDog, 'resolved', 'rejected'),
    transition('cancel', 'idle')
  ),
  state('resolved', immediate('idle')),
  state('rejected', pulse(assignError))
);

// fetchMachine.current === 'idle' because is the initial state
await invoke(fetchMachine, 'fetch');
// fetchMachine.current === 'idle' if the pulse succeeds (resolved -> idle)
// fetchMachine.current === 'rejected' if the pulse fails
```

### Nested machines

![Stoplight machine diagram](./media/stoplight-machine-diagram.svg)

```javascript
import {machine, state, initial, init, transition, invoke, nested, guard, immediate} from 'x-robot';

const stopwalk = machine(
  'Stopwalk',
  init(initial('wait')),
  state('wait', transition('start', 'walk')), 
  state('walk', transition('stop', 'wait'))
);

// Guard to prevent the machine to transition to 'green' if the stopwalk machine is in 'walk' state
const canGoToGreen = () => {
  return stopwalk.current === 'wait';
};

const stoplight = machine(
  'Stoplight',
  init(initial('green')),
  state('green', transition('next', 'yellow')),
  state('yellow', transition('next', 'red')),
  state(
    'red', 
    nested(stopwalk, 'start'), 
    immediate('green', guard(canGoToGreen))
  )
);

// stopwalk.current === 'wait' because is the initial state
// stoplight.current === 'green' because is the initial state

invoke(stoplight, 'next');
// stopwalk.current === 'wait'
// stoplight.current === 'yellow' because the transition was invoked

invoke(stoplight, 'next');
// stopwalk.current === 'walk' because the stoplight transition invoked the stopwalk transition `start`
// stoplight.current === 'red' because the transition was invoked

invoke(stoplight, 'red.stop'); // Invoke the stopwalk transition stop from the stoplight machine
// stopwalk.current === 'wait' because the stop transition was invoked
// stoplight.current === 'green' because the immediate transition was invoked and the guard was true
```

### Parallel states

![Word machine diagram](./media/word-machine-diagram.svg)

```javascript
import {machine, state, initial, init, transition, invoke, parallel, getState} from 'x-robot';

const boldMachine = machine('Bold', init(initial('off')), state('on', transition('off', 'off')), state('off', transition('on', 'on')));
const underlineMachine = machine('Underline', init(initial('off')), state('on', transition('off', 'off')), state('off', transition('on', 'on')));
const italicsMachine = machine('Italics', init(initial('off')), state('on', transition('off', 'off')), state('off', transition('on', 'on')));
const listMachine = machine(
  'List',
  init(initial('none')),
  state('none', transition('bullets', 'bullets'), transition('numbers', 'numbers')),
  state('bullets', transition('none', 'none')),
  state('numbers', transition('none', 'none'))
);

const wordMachine = machine(
  'Word Machine',
  parallel(
    boldMachine,
    underlineMachine,
    italicsMachine,
    listMachine
  )
);

invoke(wordMachine, 'bold/on'); // boldMachine.current === 'on'
invoke(wordMachine, 'underline/on'); // underlineMachine.current === 'on'
invoke(wordMachine, 'italics/on'); // italicsMachine.current === 'on'
invoke(wordMachine, 'list/bullets'); // listMachine.current === 'bullets'

getState(wordMachine); // { bold: 'on', underline: 'on', italics: 'on', list: 'bullets' }
```

### Exit Pulse

The `exitPulse` is executed when leaving a state, after guards pass and before transitioning to the new state. It's useful for cleanup tasks.

![Exit Pulse machine diagram](./media/exit-pulse-machine-diagram.svg)

```javascript
import {machine, state, initial, init, transition, invoke, pulse, exitPulse} from 'x-robot';

function cleanup(context) {
  context.cleaned = true;
}

function saveData(context) {
  context.saved = true;
}

const myMachine = machine(
  'My Machine',
  init(initial('idle')),
  state('idle', 
    transition('start', 'loading', exitPulse(cleanup))
  ),
  state('loading',
    pulse(saveData),
    transition('complete', 'idle')
  )
);

// myMachine.current === 'idle'
invoke(myMachine, 'start');
// myMachine.context.cleaned === true (exitPulse executed)
// myMachine.current === 'loading'
```

### Async Guards

Guards can be async functions, allowing you to perform async validation before transitioning.

```javascript
import {machine, state, initial, init, transition, invoke, guard} from 'x-robot';

async function checkPermission(context) {
  const response = await fetch('/api/permission');
  const data = await response.json();
  return data.allowed;
}

const myMachine = machine(
  'My Machine',
  init(initial('idle')),
  state('idle', transition('start', 'loading', guard(checkPermission))),
  state('loading')
);

// myMachine.current === 'idle'
await invoke(myMachine, 'start');
// If checkPermission returns true, transitions to 'loading'
// If checkPermission returns false, stays in 'idle'
```

### Guard with failure transition

Guards can have a failure transition that is invoked when the guard returns false.

```javascript
import {machine, state, initial, init, transition, invoke, guard} from 'x-robot';

function validateInput(context, payload) {
  return payload.length > 0;
}

const myMachine = machine(
  'My Machine',
  init(initial('idle')),
  state('idle', transition('submit', 'success', guard(validateInput, 'error'))),
  state('success'),
  state('error')
);

// With valid payload
invoke(myMachine, 'submit', 'hello'); // myMachine.current === 'success'

// With invalid payload
invoke(myMachine, 'submit', ''); // myMachine.current === 'error'
```
