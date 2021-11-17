import { context, getState, guard, immediate, initial, invoke, machine, nested, nestedGuard, producer, state, states, transition } from '../lib';
import { describe, it } from 'mocha';

import expect from 'expect';

describe('Nested states', () => {
  it('should create a machine with a state with a nested machine', () => {
    const stopwalk = machine('Stopwalk', states(state('wait', transition('start', 'walk')), state('walk', transition('stop', 'wait'))), initial('wait'));

    const stoplight = machine(
      'Stoplight',
      states(
        state('green', nested(stopwalk, 'stop'), transition('next', 'yellow')),
        state('yellow', transition('next', 'red')),
        state('red', nested(stopwalk, 'start'), transition('next', 'green'))
      ),
      initial('green')
    );

    expect(stoplight.states.red.nested).toHaveLength(1);
    expect(stoplight.states.red.nested[0].machine).toEqual(stopwalk);
  });

  it('should allow to move the nested machine when enters the state', () => {
    const stopwalk = machine('Stopwalk', states(state('wait', transition('start', 'walk')), state('walk', transition('stop', 'wait'))), initial('wait'));

    const stoplight = machine(
      'Stoplight',
      states(
        state('green', nested(stopwalk, 'stop'), transition('next', 'yellow')),
        state('yellow', transition('next', 'red')),
        state('red', nested(stopwalk, 'start'), transition('next', 'green'))
      ),
      initial('green')
    );

    expect(getState(stoplight)).toEqual('green');
    expect(getState(stoplight, 'green')).toEqual('wait');
    expect(getState(stoplight, 'stopwalk')).toEqual('wait');
    expect(getState(stopwalk)).toEqual('wait');

    invoke(stoplight, 'next');
    expect(getState(stoplight)).toEqual('yellow');
    expect(getState(stoplight, 'yellow')).toEqual(null);
    expect(getState(stoplight, 'stopwalk')).toEqual('wait');
    expect(getState(stopwalk)).toEqual('wait');

    invoke(stoplight, 'next');
    expect(getState(stoplight)).toEqual('red');
    expect(getState(stoplight, 'red')).toEqual('walk');
    expect(getState(stoplight, 'stopwalk')).toEqual('walk');
    expect(getState(stopwalk)).toEqual('walk');

    invoke(stoplight, 'next');
    expect(getState(stoplight)).toEqual('green');
    expect(getState(stoplight, 'green')).toEqual('wait');
    expect(getState(stoplight, 'stopwalk')).toEqual('wait');
    expect(getState(stopwalk)).toEqual('wait');
  });

  it('should allow to move the nested machine if it is in the correct state', () => {
    function doorWayIsEmpty(context) {
      return context.doorWayCount === 0;
    }

    function doorWayIsNotEmpty(context) {
      return !doorWayIsEmpty(context);
    }

    function aPersonEnters(context) {
      return { doorWayCount: context.doorWayCount + 1 };
    }

    function aPersonLeaves(context) {
      return { doorWayCount: context.doorWayCount - 1 };
    }

    let doorWayMachine = machine(
      'doorWay',
      states(
        state('idle', transition('enter', 'enter'), transition('leave', 'leave', guard(doorWayIsNotEmpty))),
        state('enter', producer(aPersonEnters), immediate('idle')),
        state('leave', producer(aPersonLeaves), immediate('idle'))
      ),
      context({
        doorWayCount: 0
      }),
      initial('idle')
    );

    let doorMachine = machine(
      'door',
      states(
        state('opened', nested(doorWayMachine), transition('close', 'closed', nestedGuard(doorWayMachine, doorWayIsEmpty))),
        state('closed', transition('open', 'opened'), transition('lock', 'locked')),
        state('locked', transition('unlock', 'closed'))
      ),
      context({}),
      initial('closed')
    );

    // Door is closed
    expect(getState(doorMachine)).toEqual('closed');
    expect(getState(doorWayMachine)).toEqual('idle');
    expect(doorWayMachine.context.doorWayCount).toEqual(0);

    // Open the door
    invoke(doorMachine, 'open');
    expect(getState(doorMachine)).toEqual('opened');
    expect(getState(doorWayMachine)).toEqual('idle');
    expect(doorWayMachine.context.doorWayCount).toEqual(0);

    // Person enters the door
    invoke(doorMachine, 'opened.enter');
    expect(getState(doorMachine)).toEqual('opened');
    expect(getState(doorWayMachine)).toEqual('idle');
    expect(doorWayMachine.context.doorWayCount).toEqual(1);
  });

  it('should not allow to move the nested machine if it is in the wrong state', () => {
    function doorWayIsEmpty(context) {
      return context.doorWayCount === 0;
    }

    function doorWayIsNotEmpty(context) {
      return !doorWayIsEmpty(context);
    }

    function aPersonEnters(context) {
      return { doorWayCount: context.doorWayCount + 1 };
    }

    function aPersonLeaves(context) {
      return { doorWayCount: context.doorWayCount - 1 };
    }

    let doorWayMachine = machine(
      'doorWay',
      states(
        state('idle', transition('enter', 'enter'), transition('leave', 'leave', guard(doorWayIsNotEmpty))),
        state('enter', producer(aPersonEnters), immediate('idle')),
        state('leave', producer(aPersonLeaves), immediate('idle'))
      ),
      context({
        doorWayCount: 0
      }),
      initial('idle')
    );

    let doorMachine = machine(
      'door',
      states(
        state('opened', nested(doorWayMachine), transition('close', 'closed', nestedGuard(doorWayMachine, doorWayIsEmpty))),
        state('closed', transition('open', 'opened'), transition('lock', 'locked')),
        state('locked', transition('unlock', 'closed'))
      ),
      context({}),
      initial('closed')
    );

    // Door is closed
    expect(getState(doorMachine)).toEqual('closed');
    expect(getState(doorWayMachine)).toEqual('idle');
    expect(doorWayMachine.context.doorWayCount).toEqual(0);

    // Person enters the door
    expect(() => invoke(doorMachine, 'opened.enter')).toThrow("The transition 'opened.enter' does not exist in the current state 'closed'");
    expect(getState(doorMachine)).toEqual('closed');
    expect(getState(doorWayMachine)).toEqual('idle');
    expect(doorWayMachine.context.doorWayCount).toEqual(0);
  });

  it('should allow to use a nested guard in the parent machine', () => {
    function doorWayIsEmpty(context) {
      return context.doorWayCount === 0 ? true : 'Doorway is not empty';
    }

    function doorWayIsNotEmpty(context) {
      return doorWayIsEmpty(context) !== true;
    }

    function aPersonEnters(context) {
      return { doorWayCount: context.doorWayCount + 1 };
    }

    function aPersonLeaves(context) {
      return { doorWayCount: context.doorWayCount - 1 };
    }

    function updateError(context, error) {
      return { error };
    }

    let doorWayMachine = machine(
      'doorWay',
      states(
        state('idle', transition('enter', 'enter'), transition('leave', 'leave', guard(doorWayIsNotEmpty))),
        state('enter', producer(aPersonEnters), immediate('idle')),
        state('leave', producer(aPersonLeaves), immediate('idle'))
      ),
      context({
        doorWayCount: 0
      }),
      initial('idle')
    );

    let doorMachine = machine(
      'door',
      states(
        state('opened', nested(doorWayMachine), transition('close', 'closed', nestedGuard(doorWayMachine, doorWayIsEmpty, producer(updateError)))),
        state('closed', transition('open', 'opened'), transition('lock', 'locked')),
        state('locked', transition('unlock', 'closed'))
      ),
      context({
        error: null
      }),
      initial('closed')
    );

    // Door is closed
    expect(getState(doorMachine)).toEqual('closed');
    expect(getState(doorWayMachine)).toEqual('idle');
    expect(doorWayMachine.context.doorWayCount).toEqual(0);
    expect(doorMachine.context.error).toBeNull();

    // Open the door
    invoke(doorMachine, 'open');
    expect(getState(doorMachine)).toEqual('opened');
    expect(getState(doorWayMachine)).toEqual('idle');
    expect(doorWayMachine.context.doorWayCount).toEqual(0);
    expect(doorMachine.context.error).toBeNull();

    // Person enters the door
    invoke(doorMachine, 'opened.enter');
    expect(getState(doorMachine)).toEqual('opened');
    expect(getState(doorWayMachine)).toEqual('idle');
    expect(doorWayMachine.context.doorWayCount).toEqual(1);
    expect(doorMachine.context.error).toBeNull();

    // Close the door
    invoke(doorMachine, 'close');
    expect(getState(doorMachine)).toEqual('opened');
    expect(getState(doorWayMachine)).toEqual('idle');
    expect(doorWayMachine.context.doorWayCount).toEqual(1);
    expect(doorMachine.context.error).toEqual('Doorway is not empty');
  });

  it('should allow to immediately move the machine when a nestedGuard returns true', () => {
    const stopwalk = machine('Stopwalk', states(state('wait', transition('start', 'walk')), state('walk', transition('stop', 'wait'))), initial('wait'));

    const canGoToGreen = (context) => {
      return stopwalk.current === 'wait';
    };

    const stoplight = machine(
      'Stoplight',
      states(
        state('green', transition('next', 'yellow')),
        state('yellow', transition('next', 'red')),
        state('red', nested(stopwalk, 'start'), immediate('green', nestedGuard(stopwalk, canGoToGreen)))
      ),
      initial('green')
    );

    expect(getState(stoplight)).toEqual('green');
    expect(getState(stopwalk)).toEqual('wait');

    invoke(stoplight, 'next');
    expect(getState(stoplight)).toEqual('yellow');
    expect(getState(stopwalk)).toEqual('wait');

    invoke(stoplight, 'next');
    expect(getState(stoplight)).toEqual('red');
    expect(getState(stopwalk)).toEqual('walk');

    invoke(stoplight, 'red.stop');
    expect(getState(stoplight)).toEqual('green');
    expect(getState(stopwalk)).toEqual('wait');
  });

  it('should allow to move multiple nested machines if they have the same event', () => {
    let leftWingMachine = machine(
      'Left wing',
      states(state('closed', transition('open', 'opened')), state('opened', transition('close', 'closed'))),
      initial('closed')
    );
    let rightWingMachine = machine(
      'Right wing',
      states(state('closed', transition('open', 'opened')), state('opened', transition('close', 'closed'))),
      initial('closed')
    );

    function wingsAreOpened(context) {
      return leftWingMachine.current === 'opened' && rightWingMachine.current === 'opened';
    }

    function wingsAreClosed(context) {
      return !wingsAreOpened(context);
    }

    let bird = machine(
      'Bird',
      states(
        state('land', transition('takeoff', 'takingoff')),
        state('takingoff', nested(leftWingMachine), nested(rightWingMachine), immediate('flying', guard(wingsAreOpened))),
        state('flying', transition('land', 'landing')),
        state('landing', nested(leftWingMachine), nested(rightWingMachine), immediate('land', guard(wingsAreClosed)))
      ),
      initial('land')
    );

    expect(getState(bird)).toEqual('land');
    expect(getState(bird, 'land')).toEqual(null);
    expect(getState(bird, 'leftwing')).toEqual('closed');
    expect(getState(bird, 'rightwing')).toEqual('closed');
    expect(getState(leftWingMachine)).toEqual('closed');
    expect(getState(rightWingMachine)).toEqual('closed');

    invoke(bird, 'takeoff');
    expect(getState(bird)).toEqual('takingoff');
    expect(getState(bird, 'takingoff')).toEqual({
      leftwing: 'closed',
      rightwing: 'closed'
    });
    expect(getState(bird, 'leftwing')).toEqual('closed');
    expect(getState(bird, 'rightwing')).toEqual('closed');
    expect(getState(leftWingMachine)).toEqual('closed');
    expect(getState(rightWingMachine)).toEqual('closed');

    invoke(bird, 'takingoff.open');
    expect(getState(bird)).toEqual('flying');
    expect(getState(bird, 'flying')).toEqual(null);
    expect(getState(bird, 'leftwing')).toEqual('opened');
    expect(getState(bird, 'rightwing')).toEqual('opened');
    expect(getState(leftWingMachine)).toEqual('opened');
    expect(getState(rightWingMachine)).toEqual('opened');

    invoke(bird, 'land');
    expect(getState(bird)).toEqual('landing');
    expect(getState(bird, 'landing')).toEqual({
      leftwing: 'opened',
      rightwing: 'opened'
    });
    expect(getState(bird, 'leftwing')).toEqual('opened');
    expect(getState(bird, 'rightwing')).toEqual('opened');
    expect(getState(leftWingMachine)).toEqual('opened');
    expect(getState(rightWingMachine)).toEqual('opened');

    invoke(bird, 'landing.close');
    expect(getState(bird)).toEqual('land');
    expect(getState(bird, 'land')).toEqual(null);
    expect(getState(bird, 'leftwing')).toEqual('closed');
    expect(getState(bird, 'rightwing')).toEqual('closed');
    expect(getState(leftWingMachine)).toEqual('closed');
    expect(getState(rightWingMachine)).toEqual('closed');
  });
});
