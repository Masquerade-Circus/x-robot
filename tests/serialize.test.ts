import {
  action,
  context,
  dangerState,
  guard,
  immediate,
  infoState,
  initial,
  machine,
  primaryState,
  producer,
  states,
  successState,
  transition,
  warningState
} from '../lib';
import { describe, it } from 'mocha';

import expect from 'expect';
import { serialize } from '../lib/serialize';

// Serialize
describe('Serialize', () => {
  it('should serialize a machine correctly', () => {
    const getState = () => ({
      title: 'Ok',
      error: null
    });

    const titleIsValid = (context) => {
      if (context.title.length > 0) {
        return true;
      }
      return [{ message: 'Title is required' }];
    };

    async function saveTitle(context) {
      // Save the title
      await new Promise((resolve) => setTimeout(resolve, 100));
      return;
    }

    function cacheTitle(context) {
      return { ...context, oldTitle: context.title };
    }

    function updateTitle(context, event) {
      if (!event) {
        return context;
      }

      return { ...context, title: event.target.value };
    }

    function restoreTitle(context) {
      return { ...context, title: context.oldTitle };
    }

    function updateError(context, error) {
      return { ...context, error };
    }

    const myMachine = machine(
      'Title component',
      states(
        successState(
          'preview',
          // Save the current title as oldTitle so we can reset later.
          producer(cacheTitle),
          transition('edit', 'editMode')
        ),
        infoState(
          'editMode',
          // Update title with the event value
          producer(updateTitle),
          transition('input', 'editMode'),
          transition('cancel', 'cancel'),
          transition(
            'save',
            'save',
            // Check if the title is valid. If so continue with the state.
            // If not, the machine keeps its current state.
            // In this case we came from editMode, so we keep the editMode state and update the context with the validation error.
            guard(titleIsValid, producer(updateError))
          )
        ),
        warningState(
          'cancel',
          // Reset the title back to oldTitle
          producer(restoreTitle),
          immediate('preview')
        ),
        primaryState(
          'save',
          // If the guard is true, we try to save the title.
          // If the save action succeeds, we immediately go to the preview state.
          // If the save action fails, we update the context with the error and go to the error state.
          action(saveTitle, 'preview', producer(updateError, 'error'))
        ),
        dangerState('error')
        // Should we provide a retry or...?
      ),
      context(getState),
      initial('preview')
    );

    let serializedMachine = {
      states: {
        preview: {
          run: [
            {
              producer: 'cacheTitle'
            }
          ],
          on: {
            edit: { target: 'editMode' }
          },
          type: 'success'
        },
        editMode: {
          run: [
            {
              producer: 'updateTitle'
            }
          ],
          on: {
            input: { target: 'editMode' },
            cancel: { target: 'cancel' },
            save: {
              target: 'save',
              guards: [
                {
                  guard: 'titleIsValid',
                  failure: {
                    producer: 'updateError'
                  }
                }
              ]
            }
          },
          type: 'info'
        },
        cancel: {
          run: [
            {
              producer: 'restoreTitle'
            }
          ],
          on: {
            preview: { target: 'preview' }
          },
          immediate: [{ immediate: 'preview' }],
          type: 'warning'
        },
        save: {
          run: [
            {
              action: 'saveTitle',
              success: 'preview',
              failure: {
                producer: 'updateError',
                transition: 'error'
              }
            }
          ],
          on: {
            preview: { target: 'preview' },
            error: { target: 'error' }
          },
          type: 'primary'
        },
        error: {
          type: 'danger'
        }
      },
      parallel: {},
      title: 'Title component',
      initial: 'preview',
      context: getState()
    };

    expect(serialize(myMachine)).toEqual(serializedMachine);
  });
});
