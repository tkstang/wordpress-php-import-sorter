import { ImportSorter } from "../importSorter";
import { describe, it } from "mocha";
import assert from "assert";
import { ImportStatement } from "../types";

describe("ImportSorter Debug", () => {
  it("should debug basic import parsing and sorting", () => {
    const input = `
namespace Project;

use ProjectClassB;
use ProjectClassA;
use ProjectClassC;

// Rest of the code
`;

    // Step 1: Find imports
    const imports = (ImportSorter as any).findImports(input);
    console.log("\nFound Imports:", imports);

    // Step 2: Sort the imports
    const sortedImports = (ImportSorter as any).sortImports(imports);
    console.log("\nSorted Imports:", sortedImports);

    // Step 3: Show the final result
    const result = ImportSorter.sortImportsInCode(input);
    console.log("\nInput File:");
    console.log(input);
    console.log("\nOutput File:");
    console.log(result);

    // Add detailed assertions
    assert.strictEqual(imports.length, 3, "Should find exactly 3 imports");
    assert.strictEqual(sortedImports.length, 3, "Should have 3 sorted imports");

    // Check the order of sorted imports
    assert.strictEqual(
      sortedImports[0].name,
      "ProjectClassA",
      "First import should be ProjectClassA"
    );
    assert.strictEqual(
      sortedImports[1].name,
      "ProjectClassB",
      "Second import should be ProjectClassB"
    );
    assert.strictEqual(
      sortedImports[2].name,
      "ProjectClassC",
      "Third import should be ProjectClassC"
    );
  });

  it("should debug type-based sorting", () => {
    const input = `
namespace Project;

use const ProjectCONSTANT_B;
use ProjectClassA;
use function Project\\functionA;
use ProjectClassB;
use const ProjectCONSTANT_A;
use function Project\\functionB;

// Rest of the code
`;

    // Step 1: Find imports
    const imports = (ImportSorter as any).findImports(input);
    console.log("\nFound Imports:", imports);

    // Step 2: Sort the imports
    const sortedImports = (ImportSorter as any).sortImports(imports);
    console.log("\nImports by Type:");
    const byType: { [key: string]: ImportStatement[] } = {
      class: [],
      function: [],
      constant: [],
    };

    sortedImports.forEach((imp: ImportStatement) => {
      byType[imp.type].push(imp);
    });

    Object.entries(byType).forEach(([type, imps]) => {
      console.log(`\n${type.toUpperCase()} imports:`);
      imps.forEach((imp: ImportStatement) => {
        console.log({
          originalText: imp.originalText,
          name: imp.name,
          position: imp.position,
        });
      });
    });

    // Step 3: Show the final result
    const result = ImportSorter.sortImportsInCode(input);
    console.log("\nInput File:");
    console.log(input);
    console.log("\nOutput File:");
    console.log(result);

    // Add detailed assertions
    assert.strictEqual(imports.length, 6, "Should find exactly 6 imports");
    assert.strictEqual(sortedImports.length, 6, "Should have 6 sorted imports");

    // Check type grouping
    const types = sortedImports.map((imp: ImportStatement) => imp.type);
    assert.deepStrictEqual(
      types,
      ["class", "class", "function", "function", "constant", "constant"],
      "Imports should be grouped by type"
    );
  });

  it("should debug file reconstruction", () => {
    const input = `
namespace Project;

use ProjectClassB;
use ProjectClassA;
use ProjectClassC;

// Rest of the code
`;

    // Step 1: Find imports
    const imports = (ImportSorter as any).findImports(input);
    console.log("\nFound Imports:", imports);

    // Step 2: Check the reconstruction boundaries
    const startPos = Math.min(
      ...imports.map((imp: ImportStatement) => imp.position.start)
    );
    const endPos = Math.max(
      ...imports.map((imp: ImportStatement) => imp.position.end)
    );

    console.log("\nReconstruction Boundaries:");
    console.log("Start position:", startPos);
    console.log("End position:", endPos);
    console.log(
      "Content before imports:",
      JSON.stringify(input.substring(0, startPos))
    );
    console.log(
      "Content after imports:",
      JSON.stringify(input.substring(endPos))
    );

    // Step 3: Show the final result
    const result = ImportSorter.sortImportsInCode(input);
    console.log("\nFinal Result:");
    console.log(result);

    // Add assertions about the reconstruction
    assert.ok(
      result.includes("namespace Project;"),
      "Should preserve namespace declaration"
    );
    assert.ok(
      result.includes("// Rest of the code"),
      "Should preserve code after imports"
    );
    assert.ok(
      result.split("\n").some((line) => line.trim() === ""),
      "Should have empty lines between sections"
    );
  });
});
