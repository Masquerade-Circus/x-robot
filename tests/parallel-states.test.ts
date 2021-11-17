import {
  context,
  description,
  getState,
  guard,
  immediate,
  initial,
  invoke,
  machine,
  nested,
  nestedGuard,
  parallel,
  producer,
  state,
  states,
  transition
} from '../lib';
import { describe, it } from 'mocha';

import expect from 'expect';
import { validate } from '../lib/validate';

describe('Parallel States', () => {
  it('should create a machine with parallel states', async () => {
    const wordMachine = machine(
      'Word Machine',
      parallel(
        machine('Bold', states(state('on', transition('off', 'off')), state('off', transition('on', 'on'))), initial('off')),
        machine('Underline', states(state('on', transition('off', 'off')), state('off', transition('on', 'on'))), initial('off')),
        machine('Italics', states(state('on', transition('off', 'off')), state('off', transition('on', 'on'))), initial('off')),
        machine(
          'List',
          states(
            state('none', transition('bullets', 'bullets'), transition('numbers', 'numbers')),
            state('bullets', transition('none', 'none')),
            state('numbers', transition('none', 'none'))
          ),
          initial('none')
        )
      )
    );

    validate(wordMachine);

    expect(getState(wordMachine, 'bold')).toEqual('off');
    expect(getState(wordMachine, 'underline')).toEqual('off');
    expect(getState(wordMachine, 'italics')).toEqual('off');
    expect(getState(wordMachine, 'list')).toEqual('none');

    invoke(wordMachine, 'bold/on');
    invoke(wordMachine, 'underline/on');
    invoke(wordMachine, 'italics/on');
    invoke(wordMachine, 'list/bullets');

    expect(getState(wordMachine, 'bold')).toEqual('on');
    expect(getState(wordMachine, 'underline')).toEqual('on');
    expect(getState(wordMachine, 'italics')).toEqual('on');
    expect(getState(wordMachine, 'list')).toEqual('bullets');

    expect(getState(wordMachine)).toEqual({
      bold: 'on',
      underline: 'on',
      italics: 'on',
      list: 'bullets'
    });
  });
});
