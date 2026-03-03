import { toSCXML, fromSCXML, serialize, machine, init, initial, state, transition, nested, parallel, entry, exit, guard, immediate, primaryState, infoState, successState, warningState, dangerState, description } from "../lib";
import { describe, it } from "mocha";

import expect from "expect";

describe("SCXML Export", () => {
  it("should export simple machine to SCXML", () => {
    const myMachine = serialize(
      machine(
        "Test",
        init(initial("idle")),
        state("idle", transition("start", "running")),
        state("running", transition("stop", "idle"))
      )
    );

    const scxml = toSCXML(myMachine);

    expect(scxml).toContain('<?xml version="1.0"');
    expect(scxml).toContain("<scxml");
    expect(scxml).toContain('initial="idle"');
    expect(scxml).toContain('id="idle"');
    expect(scxml).toContain('id="running"');
    expect(scxml).toContain('event="start"');
    expect(scxml).toContain('event="stop"');
  });

  it("should export machine with guards", () => {
    const myMachine = serialize(
      machine(
        "Test",
        init(initial("idle")),
        state("idle", transition("login", "checking", guard((ctx: any) => true, "error"))),
        state("checking", transition("success", "authenticated")),
        state("authenticated"),
        state("error")
      )
    );

    const scxml = toSCXML(myMachine);

    expect(scxml).toContain('cond="');
  });

  it("should export final states", () => {
    const myMachine = serialize(
      machine(
        "Test",
        init(initial("idle")),
        state("idle", transition("complete", "done")),
        state("done")
      )
    );

    const scxml = toSCXML(myMachine);

    expect(scxml).toContain('id="done"');
  });

  it("should export parallel states", () => {
    const timerMachine = machine(
      "Timer",
      init(initial("stopped")),
      state("stopped", transition("start", "started")),
      state("started", transition("stop", "stopped"))
    );

    const myMachine = serialize(
      machine(
        "Test",
        init(initial("idle")),
        state("idle", transition("start", "running")),
        state("running", transition("stop", "idle")),
        parallel(timerMachine)
      )
    );

    const scxml = toSCXML(myMachine);

    expect(scxml).toContain("<parallel");
    expect(scxml).toContain('id="Timer"');
  });

  it("should export nested machines", () => {
    const childMachine = machine(
      "Child",
      init(initial("a")),
      state("a", transition("go", "b")),
      state("b")
    );

    const myMachine = serialize(
      machine(
        "Test",
        init(initial("idle")),
        state("idle", transition("start", "parent")),
        state("parent", nested(childMachine, "a"))
      )
    );

    const scxml = toSCXML(myMachine);

    expect(scxml).toContain("<state");
    expect(scxml).toContain('id="parent"');
  });

  it("should export entry actions", () => {
    const myMachine = serialize(
      machine(
        "Test",
        init(initial("idle")),
        state("idle", entry(() => {}), transition("start", "running")),
        state("running")
      )
    );

    const scxml = toSCXML(myMachine);

    expect(scxml).toContain("<onentry>");
  });

  it("should export exit actions", () => {
    const myMachine = serialize(
      machine(
        "Test",
        init(initial("idle")),
        state("idle", transition("start", "running", exit(() => {}))),
        state("running")
      )
    );

    const scxml = toSCXML(myMachine);

    expect(scxml).toContain("<onexit>");
  });

  it("should export immediate transitions", () => {
    const myMachine = serialize(
      machine(
        "Test",
        init(initial("idle")),
        state("idle", immediate("running")),
        state("running")
      )
    );

    const scxml = toSCXML(myMachine);

    expect(scxml).toContain('type="internal"');
    expect(scxml).toContain('event="');
  });

  it("should export multiple guards", () => {
    const myMachine = serialize(
      machine(
        "Test",
        init(initial("idle")),
        state("idle", transition("check", "running", 
          guard((ctx: any) => true, "error1"),
          guard((ctx: any) => true, "error2")
        )),
        state("running"),
        state("error1"),
        state("error2")
      )
    );

    const scxml = toSCXML(myMachine);

    expect(scxml).toMatch(/cond="/g);
  });

  it("should export all state types", () => {
    const myMachine = serialize(
      machine(
        "Test",
        init(initial("idle")),
        primaryState("idle", description("Primary state"), transition("next", "info")),
        infoState("info", description("Info state"), transition("next", "success")),
        successState("success", description("Success state"), transition("next", "warning")),
        warningState("warning", description("Warning state"), transition("next", "danger")),
        dangerState("danger", description("Danger state"))
      )
    );

    const scxml = toSCXML(myMachine);

    expect(scxml).toContain('id="idle"');
    expect(scxml).toContain('id="info"');
    expect(scxml).toContain('id="success"');
    expect(scxml).toContain('id="warning"');
    expect(scxml).toContain('id="danger"');
    expect(scxml).toContain("description");
  });

  it("should export machine with context", () => {
    const myMachine = serialize(
      machine(
        "Test",
        init(initial("idle"), { context: { count: 0, name: "" } }),
        state("idle", transition("next", "active")),
        state("active")
      )
    );

    const scxml = toSCXML(myMachine);

    expect(scxml).toContain("Test");
    expect(scxml).toContain('initial="idle"');
  });
});

describe("SCXML Import", () => {
  it("should import simple SCXML", () => {
    const scxml = `<?xml version="1.0" encoding="UTF-8"?>
<scxml xmlns="http://www.w3.org/2005/07/scxml" version="1.0" initial="idle" name="Test">
  <state id="idle">
    <transition event="start" target="running"/>
  </state>
  <state id="running">
    <transition event="stop" target="idle"/>
  </state>
</scxml>`;

    const machine = fromSCXML(scxml);

    expect(machine.initial).toEqual("idle");
    expect(machine.states.idle).toBeDefined();
    expect(machine.states.running).toBeDefined();
    expect(machine.states.idle.on!.start.target).toEqual("running");
  });

  it("should import machine with guards", () => {
    const scxml = `<?xml version="1.0" encoding="UTF-8"?>
<scxml xmlns="http://www.w3.org/2005/07/scxml" version="1.0" initial="idle">
  <state id="idle">
    <transition event="login" target="checking" cond="checkAuth()"/>
  </state>
  <state id="checking">
    <transition event="success" target="authenticated"/>
  </state>
  <state id="authenticated"/>
</scxml>`;

    const machine = fromSCXML(scxml);

    expect(machine.states.idle.on!.login.guards).toBeDefined();
    expect(machine.states.idle.on!.login.guards![0].guard).toContain("checkAuth");
  });

  it("should import parallel states", () => {
    const scxml = `<?xml version="1.0" encoding="UTF-8"?>
<scxml xmlns="http://www.w3.org/2005/07/scxml" version="1.0" initial="idle">
  <state id="idle">
    <transition event="start" target="running"/>
  </state>
  <state id="running"/>
  <parallel id="Timer">
    <state id="stopped">
      <transition event="start" target="started"/>
    </state>
    <state id="started">
      <transition event="stop" target="stopped"/>
    </state>
  </parallel>
</scxml>`;

    const machine = fromSCXML(scxml);

    expect(machine.parallel).toBeDefined();
    expect(machine.parallel.Timer).toBeDefined();
  });

  it("should import nested states", () => {
    const scxml = `<?xml version="1.0" encoding="UTF-8"?>
<scxml xmlns="http://www.w3.org/2005/07/scxml" version="1.0" initial="idle">
  <state id="idle">
    <transition event="start" target="parent"/>
  </state>
  <state id="parent">
    <state id="a">
      <transition event="go" target="b"/>
    </state>
    <state id="b"/>
  </state>
</scxml>`;

    const machine = fromSCXML(scxml);

    expect(machine.states.parent).toBeDefined();
    expect(machine.states.parent.nested).toBeDefined();
  });

  it("should import entry actions", () => {
    const scxml = `<?xml version="1.0" encoding="UTF-8"?>
<scxml xmlns="http://www.w3.org/2005/07/scxml" version="1.0" initial="idle">
  <state id="idle">
    <onentry>
      <script>console.log('entry')</script>
    </onentry>
    <transition event="start" target="running"/>
  </state>
  <state id="running"/>
</scxml>`;

    const machine = fromSCXML(scxml);

    expect(machine.states.idle.run).toBeDefined();
    expect(machine.states.idle.run!.length).toBeGreaterThan(0);
  });

  it("should import exit actions", () => {
    const scxml = `<?xml version="1.0" encoding="UTF-8"?>
<scxml xmlns="http://www.w3.org/2005/07/scxml" version="1.0" initial="idle">
  <state id="idle">
    <transition event="start" target="running">
      <onexit>
        <script>console.log('exit')</script>
      </onexit>
    </transition>
  </state>
  <state id="running"/>
</scxml>`;

    const machine = fromSCXML(scxml);

    expect(machine.states.idle.on!.start.exit).toBeDefined();
    expect(machine.states.idle.on!.start.exit!.length).toBeGreaterThan(0);
  });

  it("should import immediate transitions", () => {
    const scxml = `<?xml version="1.0" encoding="UTF-8"?>
<scxml xmlns="http://www.w3.org/2005/07/scxml" version="1.0" initial="idle">
  <state id="idle">
    <transition type="internal" target="running"/>
  </state>
  <state id="running"/>
</scxml>`;

    const machine = fromSCXML(scxml);

    expect(machine.states.idle.immediate).toBeDefined();
    expect(machine.states.idle.immediate![0].immediate).toEqual("running");
  });

  it("should import machine title", () => {
    const scxml = `<?xml version="1.0" encoding="UTF-8"?>
<scxml xmlns="http://www.w3.org/2005/07/scxml" version="1.0" initial="idle" name="MyTestMachine">
  <state id="idle"/>
</scxml>`;

    const machine = fromSCXML(scxml);

    expect(machine.title).toEqual("MyTestMachine");
  });
});

describe("SCXML Roundtrip", () => {
  it("should preserve machine structure through export/import", () => {
    const originalMachine = serialize(
      machine(
        "Test",
        init(initial("idle")),
        state("idle", transition("start", "running")),
        state("running", transition("stop", "idle"))
      )
    );

    const scxml = toSCXML(originalMachine);
    const importedMachine = fromSCXML(scxml);

    expect(importedMachine.initial).toEqual(originalMachine.initial);
    expect(Object.keys(importedMachine.states)).toEqual(Object.keys(originalMachine.states));
  });

  it("should preserve parallel states through roundtrip", () => {
    const timerMachine = machine(
      "Timer",
      init(initial("stopped")),
      state("stopped", transition("start", "started")),
      state("started", transition("stop", "stopped"))
    );

    const originalMachine = serialize(
      machine(
        "Test",
        init(initial("idle")),
        state("idle", transition("start", "running")),
        state("running", transition("stop", "idle")),
        parallel(timerMachine)
      )
    );

    const scxml = toSCXML(originalMachine);
    const importedMachine = fromSCXML(scxml);

    expect(importedMachine.parallel).toBeDefined();
    expect(Object.keys(importedMachine.parallel)).toContain("Timer");
  });

  it("should preserve nested states through roundtrip", () => {
    const childMachine = machine(
      "Child",
      init(initial("a")),
      state("a", transition("go", "b")),
      state("b")
    );

    const originalMachine = serialize(
      machine(
        "Test",
        init(initial("idle")),
        state("idle", transition("start", "parent")),
        state("parent", nested(childMachine, "a"))
      )
    );

    const scxml = toSCXML(originalMachine);
    const importedMachine = fromSCXML(scxml);

    expect(importedMachine.states.parent).toBeDefined();
    expect(importedMachine.states.parent.nested).toBeDefined();
  });

  it("should preserve guards through roundtrip", () => {
    const scxml = `<?xml version="1.0" encoding="UTF-8"?>
<scxml xmlns="http://www.w3.org/2005/07/scxml" version="1.0" initial="idle">
  <state id="idle">
    <transition event="check" target="running" cond="checkAuth()"/>
  </state>
  <state id="running"/>
</scxml>`;

    const importedMachine = fromSCXML(scxml);

    expect(importedMachine.states.idle.on!.check.guards).toBeDefined();
    expect(importedMachine.states.idle.on!.check.guards![0]).toBeDefined();
  });

  it("should preserve context through roundtrip", () => {
    const scxml = `<?xml version="1.0" encoding="UTF-8"?>
<scxml xmlns="http://www.w3.org/2005/07/scxml" version="1.0" initial="idle" name="Test">
  <datamodel>
    <data id="context">{"count":0,"name":"test"}</data>
  </datamodel>
  <state id="idle">
    <transition event="next" target="active"/>
  </state>
  <state id="active"/>
</scxml>`;

    const importedMachine = fromSCXML(scxml);

    expect(importedMachine.context).toBeDefined();
  });
});
