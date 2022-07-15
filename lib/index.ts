/**
 * @module x-robot
 * @description A finite state machine library for nodejs and the web
 * */

import {
  action,
  context,
  dangerState,
  description,
  getState,
  guard,
  immediate,
  infoState,
  initial,
  machine,
  nested,
  nestedGuard,
  parallel,
  primaryState,
  producer,
  state,
  states,
  successState,
  transition,
  warningState
} from "./machine/create";
import { invoke, start } from "./machine/invoke";

export {
  machine,
  nested,
  context,
  initial,
  parallel,
  states,
  state,
  infoState,
  warningState,
  successState,
  dangerState,
  primaryState,
  description,
  guard,
  nestedGuard,
  producer,
  action,
  transition,
  immediate,
  invoke,
  start,
  getState,
};
