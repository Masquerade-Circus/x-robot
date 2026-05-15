const { describe, it } = require("mocha");
const { expect } = require("expect");
const fs = require("fs");
const path = require("path");

describe("diagram alias safety", () => {
  it("should not silently re-sanitize IDs when a model alias is missing", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "lib/documentate/visualize.ts"), "utf8");
    const modelAlias = source.match(/function modelAlias[\s\S]*?\n}/);

    expect(modelAlias).not.toBeNull();
    expect(modelAlias![0]).toContain("Missing diagram alias for id");
    expect(modelAlias![0]).not.toContain("toDiagramAlias");
  });
});
