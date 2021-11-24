import { Machine } from "./interfaces";
export declare function invoke(machine: Machine, transition: string, payload?: any): Promise<void> | void;
export declare function start(machine: Machine, payload?: any): Promise<void> | void;
