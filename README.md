## X-Robot

X-Robot is a finite state machine library for nodejs and for the web.
Intended to be used for high complex state machines with an easy to use API.
Not only for user interfaces but also for server side applications.

## Use cases

### Simple example

![Toggle machine diagram](./media/toggle-machine-diagram.svg)

```javascript 
import {machine, states, state, initial, transition, invoke} from 'x-robot';

const stoplight = machine(
  'Stoplight',
  states(
    state('green', transition('next', 'yellow')),
    state('yellow', transition('next', 'red')),
    state('red', transition('next', 'green'))
  ),
  initial('green')
);

// stoplight.current === 'green' because is the initial state
invoke(stoplight, 'next'); // stoplight.current === 'yellow'
invoke(stoplight, 'next'); // stoplight.current === 'red'
invoke(stoplight, 'next'); // stoplight.current === 'green' 
```

### Async example

![Fetch machine diagram](./media/fetch-machine-diagram.svg)

```javascript
import {machine, states, state, initial, transition, invoke, action, producer} from 'x-robot';

// Action
async function fetchDog() {
  let response = await fetch('https://dog.ceo/api/breeds/image/random');
  let json = await response.json();
  return json.data;
}

// Producers
function assignDog(context, dog) {
  context.dog = dog;
}

function assignError(context, error) {
  context.error = error;
}

// Machine definition
const fetchMachine = machine(
  'Dog API',
  initial('idle'),
  context({
    dog: null,
    error: null
  }),
  states(
    state('idle', transition('fetch', 'loading')),
    state(
      'loading',
      action(fetchDog, 
        producer(assignDog, 'resolved'), 
        producer(assignError, 'rejected')
      ), 
      transition('cancel', 'idle')
    ),
    state('resolved', immediate('idle')),
    state('rejected')
  )
);

// fetchMachine.current === 'idle' because is the initial state
await invoke(fetchMachine, 'fetch');
// fetchMachine.current === 'idle' because the action was resolved and transitioned to idle
```

### Nested machines

![Stoplight machine diagram](./media/stoplight-machine-diagram.svg)

```javascript
import {machine, states, state, initial, transition, invoke, nested, guard} from 'x-robot';

const stopwalk = machine(
  'Stopwalk',
  states(
    state('wait', transition('start', 'walk')), 
    state('walk', transition('stop', 'wait'))
  ),
  initial('wait')
);

// Guard to prevent the machine to transition to 'green' if the stopwalk machine is in 'walk' state
const canGoToGreen = () => {
  return stopwalk.current === 'wait';
};

const stoplight = machine(
  'Stoplight',
  states(
    state('green', transition('next', 'yellow')),
    state('yellow', transition('next', 'red')),
    state(
      'red', 
      nested(stopwalk, 'start'), 
      immediate('green', guard(canGoToGreen))
    )
  ),
  initial('green')
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
import {machine, states, state, initial, transition, invoke, parallel, getState} from 'x-robot';

const boldMachine = machine('Bold', states(state('on', transition('off', 'off')), state('off', transition('on', 'on'))), initial('off'));
const underlineMachine = machine('Underline', states(state('on', transition('off', 'off')), state('off', transition('on', 'on'))), initial('off'));
const italicsMachine = machine('Italics', states(state('on', transition('off', 'off')), state('off', transition('on', 'on'))), initial('off'));
const listMachine = machine(
  'List',
  states(
    state('none', transition('bullets', 'bullets'), transition('numbers', 'numbers')),
    state('bullets', transition('none', 'none')),
    state('numbers', transition('none', 'none'))
  ),
  initial('none')
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