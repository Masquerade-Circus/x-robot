/**
 * @module x-robot
 * @description X-Robot is a finite state machine library for nodejs and for the web.
 * */

import {
  context,
  dangerState,
  description,
  exitPulse,
  getState,
  guard,
  immediate,
  infoState,
  init,
  initial,
  machine,
  nested,
  nestedGuard,
  parallel,
  primaryState,
  pulse,
  state,
  successState,
  transition,
  warningState
} from "./machine/create";
import { invoke, start } from "./machine/invoke";

export {
  machine,
  nested,
  context,
  init,
  initial,
  parallel,
  state,
  infoState,
  warningState,
  successState,
  dangerState,
  primaryState,
  description,
  guard,
  nestedGuard,
  pulse,
  exitPulse,
  transition,
  immediate,
  invoke,
  start,
  getState,
};
