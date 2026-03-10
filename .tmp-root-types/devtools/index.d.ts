import { MachineSnapshot } from "../machine/invoke";
import { Machine } from "../machine/interfaces";
export interface XRobotDevtoolsOptions {
    name?: string;
    [key: string]: any;
}
export interface XRobotDevtoolsFatalState {
    name: string;
    message: string;
}
export interface XRobotDevtoolsState extends MachineSnapshot {
    id: string;
    title: string | null;
    isAsync: boolean;
    fatal?: XRobotDevtoolsFatalState;
}
export interface XRobotDevtoolsConnection {
    machine: Machine;
    start(snapshotOrPayload?: MachineSnapshot | any): Promise<void> | void;
    invoke(transition: string, payload?: any): Promise<void> | void;
    invokeAfter(timeInMilliseconds: number, transition: string, payload?: any): () => void;
    snapshot(): XRobotDevtoolsState;
    disconnect(): void;
    cleanup(): void;
}
export declare function getXRobotDevtoolsState(machine: Machine): XRobotDevtoolsState;
export declare function connectXRobot(machine: Machine, options?: XRobotDevtoolsOptions): XRobotDevtoolsConnection;
