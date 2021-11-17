import { VISUALIZATION_LEVEL, createSvgFromPlantUmlCode, getPlantUmlCode } from '../dist/visualize/index.mjs';
import { BirdMachine as bird, LeftWingMachine as leftWing, RightWingMachine as rightWing } from './bird-machine-esm.mjs';
import { describe, it } from 'mocha';
import { getState, invoke } from '../dist/index.mjs';

import expect from 'expect';
import fs from 'fs';
import { serialize } from '../dist/serialize/index.mjs';

// Generate a diagram from a serialized machine
describe('Esm version test', () => {
  // With this test we are testing the creation, serialization and visualization of a machine with all the features of the library
  it('should generate a diagram for a serialized machine with all features available', async () => {
    const plantUmlCode = getPlantUmlCode(serialize(bird), {
      level: VISUALIZATION_LEVEL.HIGH
    });

    let expectedPlantUmlCode = `
@startuml

title Bird

state land<<primary>>
state takingoff<<info>>
state flying<<success>>
state landing<<warning>>
state fatal<<danger>>

state takingoff {
  note "Left wing" as NTakingoffLeftWing

  state "closed" as TakingoffLeftWingClosed<<default>>
  state "opened" as TakingoffLeftWingOpened<<default>>
  state "fatal" as TakingoffLeftWingFatal<<default>>

  TakingoffLeftWingClosed: The left wing is closed
  TakingoffLeftWingOpened: The left wing is opened
  TakingoffLeftWingFatal: Is the left wing injured?

  TakingoffLeftWingClosed: ├┬ A:sendStateToApiForLeftWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateLeftWingToClosed
  TakingoffLeftWingOpened: ├┬ A:sendStateToApiForLeftWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateLeftWingToOpened
  TakingoffLeftWingFatal: ├┬ A:sendStateToApiForLeftWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n├ P:updateLeftWingToFatal\\n└ P:updateError

  [*] --> TakingoffLeftWingClosed
  TakingoffLeftWingClosed -[#slategray]-> TakingoffLeftWingFatal: fatal
  TakingoffLeftWingClosed -[#slategray]-> TakingoffLeftWingOpened: open\\n└┬ G:isLeftWingClosed\\n └┬ failure\\n  └ P:updateError
  TakingoffLeftWingOpened -[#slategray]-> TakingoffLeftWingFatal: fatal
  TakingoffLeftWingOpened -[#slategray]-> TakingoffLeftWingClosed: close\\n└┬ G:isLeftWingOpened\\n └┬ failure\\n  └ P:updateError
  TakingoffLeftWingFatal -[#slategray]-> TakingoffLeftWingFatal: fatal

  ||

  note "Right wing" as NTakingoffRightWing

  state "closed" as TakingoffRightWingClosed<<default>>
  state "opened" as TakingoffRightWingOpened<<default>>
  state "fatal" as TakingoffRightWingFatal<<default>>

  TakingoffRightWingClosed: The right wing is closed
  TakingoffRightWingOpened: The right wing is opened
  TakingoffRightWingFatal: Is the right wing injured?

  TakingoffRightWingClosed: ├┬ A:sendStateToApiForRightWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateRightWingToClosed
  TakingoffRightWingOpened: ├┬ A:sendStateToApiForRightWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateRightWingToOpened
  TakingoffRightWingFatal: ├┬ A:sendStateToApiForRightWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n├ P:updateRightWingToFatal\\n└ P:updateError

  [*] --> TakingoffRightWingClosed
  TakingoffRightWingClosed -[#slategray]-> TakingoffRightWingFatal: fatal
  TakingoffRightWingClosed -[#slategray]-> TakingoffRightWingOpened: open\\n└┬ G:isRightWingClosed\\n └┬ failure\\n  └ P:updateError
  TakingoffRightWingOpened -[#slategray]-> TakingoffRightWingFatal: fatal
  TakingoffRightWingOpened -[#slategray]-> TakingoffRightWingClosed: close\\n└┬ G:isRightWingOpened\\n └┬ failure\\n  └ P:updateError
  TakingoffRightWingFatal -[#slategray]-> TakingoffRightWingFatal: fatal
}

state landing {
  note "Left wing" as NLandingLeftWing

  state "closed" as LandingLeftWingClosed<<default>>
  state "opened" as LandingLeftWingOpened<<default>>
  state "fatal" as LandingLeftWingFatal<<default>>

  LandingLeftWingClosed: The left wing is closed
  LandingLeftWingOpened: The left wing is opened
  LandingLeftWingFatal: Is the left wing injured?

  LandingLeftWingClosed: ├┬ A:sendStateToApiForLeftWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateLeftWingToClosed
  LandingLeftWingOpened: ├┬ A:sendStateToApiForLeftWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateLeftWingToOpened
  LandingLeftWingFatal: ├┬ A:sendStateToApiForLeftWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n├ P:updateLeftWingToFatal\\n└ P:updateError

  [*] --> LandingLeftWingClosed
  LandingLeftWingClosed -[#slategray]-> LandingLeftWingFatal: fatal
  LandingLeftWingClosed -[#slategray]-> LandingLeftWingOpened: open\\n└┬ G:isLeftWingClosed\\n └┬ failure\\n  └ P:updateError
  LandingLeftWingOpened -[#slategray]-> LandingLeftWingFatal: fatal
  LandingLeftWingOpened -[#slategray]-> LandingLeftWingClosed: close\\n└┬ G:isLeftWingOpened\\n └┬ failure\\n  └ P:updateError
  LandingLeftWingFatal -[#slategray]-> LandingLeftWingFatal: fatal

  ||

  note "Right wing" as NLandingRightWing

  state "closed" as LandingRightWingClosed<<default>>
  state "opened" as LandingRightWingOpened<<default>>
  state "fatal" as LandingRightWingFatal<<default>>

  LandingRightWingClosed: The right wing is closed
  LandingRightWingOpened: The right wing is opened
  LandingRightWingFatal: Is the right wing injured?

  LandingRightWingClosed: ├┬ A:sendStateToApiForRightWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateRightWingToClosed
  LandingRightWingOpened: ├┬ A:sendStateToApiForRightWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateRightWingToOpened
  LandingRightWingFatal: ├┬ A:sendStateToApiForRightWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n├ P:updateRightWingToFatal\\n└ P:updateError

  [*] --> LandingRightWingClosed
  LandingRightWingClosed -[#slategray]-> LandingRightWingFatal: fatal
  LandingRightWingClosed -[#slategray]-> LandingRightWingOpened: open\\n└┬ G:isRightWingClosed\\n └┬ failure\\n  └ P:updateError
  LandingRightWingOpened -[#slategray]-> LandingRightWingFatal: fatal
  LandingRightWingOpened -[#slategray]-> LandingRightWingClosed: close\\n└┬ G:isRightWingOpened\\n └┬ failure\\n  └ P:updateError
  LandingRightWingFatal -[#slategray]-> LandingRightWingFatal: fatal
}

state "Parallel states" as BirdParallelStates {
  note "Flying time" as NBirdFlyingTime

  state "stopped" as BirdFlyingTimeStopped<<default>>
  state "started" as BirdFlyingTimeStarted<<default>>

  BirdFlyingTimeStopped: The bird is not flying
  BirdFlyingTimeStarted: The bird is flying

  BirdFlyingTimeStopped: └ P:stopTimer
  BirdFlyingTimeStarted: └ P:startTimer

  [*] --> BirdFlyingTimeStopped
  BirdFlyingTimeStopped -[#slategray]-> BirdFlyingTimeStarted: start\\n└ G:isTimeStopped
  BirdFlyingTimeStarted -[#slategray]-> BirdFlyingTimeStopped: stop\\n└ G:isTimeStarted

  --

  note "Walking time" as NBirdWalkingTime

  state "stopped" as BirdWalkingTimeStopped<<default>>
  state "started" as BirdWalkingTimeStarted<<default>>

  BirdWalkingTimeStopped: The bird is not walking
  BirdWalkingTimeStarted: The bird is walking

  BirdWalkingTimeStopped: └ P:stopTimer
  BirdWalkingTimeStarted: └ P:startTimer

  [*] --> BirdWalkingTimeStopped
  BirdWalkingTimeStopped -[#slategray]-> BirdWalkingTimeStarted: start\\n└ G:isTimeStopped
  BirdWalkingTimeStarted -[#slategray]-> BirdWalkingTimeStopped: stop\\n└ G:isTimeStarted
}

land: The bird is on the ground
takingoff: The bird is taking off
flying: The bird is on the air
landing: The bird is landing
fatal: Is the bird dead?

land: ├┬ A:sendStateToApiForBird\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n├ P:updateBirdToLand\\n├ T:flyingtime/stop\\n└ T:walkingtime/start
takingoff: ├ T:leftwing.open\\n├ T:rightwing.open\\n├┬ A:sendStateToApiForBird\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateBirdToTakingoff
flying: ├┬ A:sendStateToApiForBird\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n├ P:updateBirdToFlying\\n├ T:flyingtime/start\\n└ T:walkingtime/stop
landing: ├ T:leftwing.close\\n├ T:rightwing.close\\n├┬ A:sendStateToApiForBird\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateBirdToLanding
fatal: ├┬ A:sendStateToApiForBird\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n├ P:updateBirdToFatal\\n└ P:updateError

[*] --> land
land -[#indianred]-> fatal: fatal
land -[#skyblue]-> takingoff: takeoff
takingoff -[#indianred]-> fatal: fatal
takingoff -[#mediumseagreen,dashed]-> flying: flying\\n├┬ G:isLeftWingOpened\\n│└┬ failure\\n│ └ P:updateError\\n└┬ G:isRightWingOpened\\n └┬ failure\\n  └ P:updateError
flying -[#indianred]-> fatal: fatal
flying -[#tan]-> landing: land
landing -[#indianred]-> fatal: fatal
landing -[#lightsteelblue,dashed]-> land: land\\n├┬ G:isLeftWingClosed\\n│└┬ failure\\n│ └ P:updateError\\n└┬ G:isRightWingClosed\\n └┬ failure\\n  └ P:updateError
fatal -[#indianred]-> fatal: fatal

hide empty description
skinparam backgroundColor white
skinparam shadowing false
skinparam note {
  BackgroundColor white
  BorderColor slategray
  FontName monospaced
}
skinparam ArrowFontName monospaced
skinparam state {
  FontName monospaced
  AttributeFontName monospaced
  BackgroundColor white
  BorderColor slategray
  ArrowColor slategray
  ArrowThickness 2
  MessageAlignment left
  BackgroundColor<<danger>> Implementation
  BorderColor<<danger>> indianred
  BackgroundColor<<info>> Application
  BorderColor<<info>> skyblue
  BackgroundColor<<warning>> Strategy
  BorderColor<<warning>> tan
  BackgroundColor<<success>> Technology
  BorderColor<<success>> mediumseagreen
  BackgroundColor<<primary>> Motivation
  BorderColor<<primary>> lightsteelblue
}
@enduml
`;

    expect(plantUmlCode).toEqual(expectedPlantUmlCode);

    const svg = await createSvgFromPlantUmlCode(plantUmlCode, {
      outDir: './tmp',
      fileName: 'bird-machine-diagram'
    });

    expect(svg).toBeDefined();

    // expect that the file exists and is not empty
    expect(fs.existsSync(svg)).toBeTruthy();

    // Remove the file
    fs.unlinkSync(svg);
  });

  it('should move the bird states with transitions', async () => {
    // The bird is on the ground
    expect(getState(bird)).toEqual('land');
    expect(getState(leftWing)).toEqual('closed');
    expect(getState(rightWing)).toEqual('closed');

    // The bird is taking off
    invoke(bird, 'takeoff');
    expect(getState(bird)).toEqual('takingoff');
    expect(getState(leftWing)).toEqual('closed');
    expect(getState(rightWing)).toEqual('closed');

    // Await for the bird to take off
    await new Promise((resolve) => setTimeout(resolve, 100));

    // The bird is on the air
    expect(getState(bird)).toEqual('flying');
    expect(getState(leftWing)).toEqual('opened');
    expect(getState(rightWing)).toEqual('opened');

    // The bird is landing
    invoke(bird, 'land');
    expect(getState(bird)).toEqual('landing');
    expect(getState(leftWing)).toEqual('opened');
    expect(getState(rightWing)).toEqual('opened');

    // Await for the bird to land
    await new Promise((resolve) => setTimeout(resolve, 100));

    // The bird is on the ground
    expect(getState(bird)).toEqual('land');
    expect(getState(leftWing)).toEqual('closed');
    expect(getState(rightWing)).toEqual('closed');

    // The bird is takingoff and immediately on the air
    await invoke(bird, 'takeoff');
    expect(getState(bird)).toEqual('flying');
    expect(getState(leftWing)).toEqual('opened');
    expect(getState(rightWing)).toEqual('opened');

    // The bird is landing and immediately on the ground
    await invoke(bird, 'land');
    expect(getState(bird)).toEqual('land');
    expect(getState(leftWing)).toEqual('closed');
    expect(getState(rightWing)).toEqual('closed');
  });
});
