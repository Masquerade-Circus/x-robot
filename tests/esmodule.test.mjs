import { VISUALIZATION_LEVEL, createSvgFromPlantUmlCode, getPlantUmlCode } from '../dist/visualize/index.mjs';
import { BirdMachine as bird, LeftWingMachine as leftWing, RightWingMachine as rightWing } from './bird-machine-esm.mjs';
import { describe, it } from 'mocha';

import expect from 'expect';
import fs from 'fs';
import { invoke } from '../dist/index.mjs';
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

  TakingoffLeftWingClosed: ├┬ A:sendStateToApiForLeftWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateLeftWingToclosed
  TakingoffLeftWingOpened: ├┬ A:sendStateToApiForLeftWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateLeftWingToopened
  TakingoffLeftWingFatal: ├┬ A:sendStateToApiForLeftWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n├ P:updateLeftWingTofatal\\n└ P:updateError

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

  TakingoffRightWingClosed: ├┬ A:sendStateToApiForRightWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateRightWingToclosed
  TakingoffRightWingOpened: ├┬ A:sendStateToApiForRightWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateRightWingToopened
  TakingoffRightWingFatal: ├┬ A:sendStateToApiForRightWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n├ P:updateRightWingTofatal\\n└ P:updateError

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

  LandingLeftWingClosed: ├┬ A:sendStateToApiForLeftWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateLeftWingToclosed
  LandingLeftWingOpened: ├┬ A:sendStateToApiForLeftWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateLeftWingToopened
  LandingLeftWingFatal: ├┬ A:sendStateToApiForLeftWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n├ P:updateLeftWingTofatal\\n└ P:updateError

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

  LandingRightWingClosed: ├┬ A:sendStateToApiForRightWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateRightWingToclosed
  LandingRightWingOpened: ├┬ A:sendStateToApiForRightWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateRightWingToopened
  LandingRightWingFatal: ├┬ A:sendStateToApiForRightWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n├ P:updateRightWingTofatal\\n└ P:updateError

  [*] --> LandingRightWingClosed
  LandingRightWingClosed -[#slategray]-> LandingRightWingFatal: fatal
  LandingRightWingClosed -[#slategray]-> LandingRightWingOpened: open\\n└┬ G:isRightWingClosed\\n └┬ failure\\n  └ P:updateError
  LandingRightWingOpened -[#slategray]-> LandingRightWingFatal: fatal
  LandingRightWingOpened -[#slategray]-> LandingRightWingClosed: close\\n└┬ G:isRightWingOpened\\n └┬ failure\\n  └ P:updateError
  LandingRightWingFatal -[#slategray]-> LandingRightWingFatal: fatal
}

land: The bird is on the ground
takingoff: The bird is taking off
flying: The bird is on the air
landing: The bird is landing
fatal: Is the bird dead?

land: ├┬ A:sendStateToApiForBird\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateBirdToland
takingoff: ├ T:LeftWing.open\\n├ T:RightWing.open\\n├┬ A:sendStateToApiForBird\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n├ P:updateBirdTotakingoff\\n└ P:updateBirdToland
flying: ├┬ A:sendStateToApiForBird\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateBirdToflying
landing: ├ T:LeftWing.close\\n├ T:RightWing.close\\n├┬ A:sendStateToApiForBird\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateBirdTolanding
fatal: ├┬ A:sendStateToApiForBird\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n├ P:updateBirdTofatal\\n└ P:updateError

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
    expect(bird.current).toEqual('land');
    expect(leftWing.current).toEqual('closed');
    expect(rightWing.current).toEqual('closed');

    // The bird is taking off
    invoke(bird, 'takeoff');
    expect(bird.current).toEqual('takingoff');
    expect(leftWing.current).toEqual('closed');
    expect(rightWing.current).toEqual('closed');

    // Await for the bird to take off
    await new Promise((resolve) => setTimeout(resolve, 100));

    // The bird is on the air
    expect(bird.current).toEqual('flying');
    expect(leftWing.current).toEqual('opened');
    expect(rightWing.current).toEqual('opened');

    // The bird is landing
    invoke(bird, 'land');
    expect(bird.current).toEqual('landing');
    expect(leftWing.current).toEqual('opened');
    expect(rightWing.current).toEqual('opened');

    // Await for the bird to land
    await new Promise((resolve) => setTimeout(resolve, 100));

    // The bird is on the ground
    expect(bird.current).toEqual('land');
    expect(leftWing.current).toEqual('closed');
    expect(rightWing.current).toEqual('closed');

    // The bird is takingoff and immediately on the air
    await invoke(bird, 'takeoff');
    expect(bird.current).toEqual('flying');
    expect(leftWing.current).toEqual('opened');
    expect(rightWing.current).toEqual('opened');

    // The bird is landing and immediately on the ground
    await invoke(bird, 'land');
    expect(bird.current).toEqual('land');
    expect(leftWing.current).toEqual('closed');
    expect(rightWing.current).toEqual('closed');
  });
});
