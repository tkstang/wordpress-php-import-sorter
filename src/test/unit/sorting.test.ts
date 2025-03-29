import { describe, it } from "mocha";
import assert from "assert";

// Types for our test data
type ImportType = "class" | "function" | "constant";

interface ImportStatement {
  type: ImportType;
  name: string;
  originalText: string;
}

// The actual sorting function we'll implement in ImportSorter
function sortImports(imports: ImportStatement[]): ImportStatement[] {
  const typeOrder: ImportType[] = ["class", "function", "constant"];
  return [...imports].sort((a, b) => {
    const typeOrderA = typeOrder.indexOf(a.type);
    const typeOrderB = typeOrder.indexOf(b.type);
    if (typeOrderA !== typeOrderB) {
      return typeOrderA - typeOrderB;
    }
    return a.name.localeCompare(b.name);
  });
}

describe("Import Sorting Tests", () => {
  // Test basic sorting
  it("should sort basic imports alphabetically", () => {
    const imports: ImportStatement[] = [
      {
        type: "class",
        name: "ProjectClassB",
        originalText: "use ProjectClassB;",
      },
      {
        type: "class",
        name: "ProjectClassA",
        originalText: "use ProjectClassA;",
      },
      {
        type: "class",
        name: "ProjectClassC",
        originalText: "use ProjectClassC;",
      },
    ];

    const sorted = sortImports(imports);

    console.log(
      "Original order:",
      imports.map((i) => i.name)
    );
    console.log(
      "Sorted order:",
      sorted.map((i) => i.name)
    );

    assert.deepStrictEqual(
      sorted.map((i) => i.originalText),
      ["use ProjectClassA;", "use ProjectClassB;", "use ProjectClassC;"]
    );
  });

  // Test grouped imports
  it("should sort grouped imports alphabetically", () => {
    const imports: ImportStatement[] = [
      { type: "class", name: "ClassB", originalText: "    ClassB," },
      { type: "class", name: "ClassA", originalText: "    ClassA," },
      { type: "class", name: "ClassC", originalText: "    ClassC" },
    ];

    const sorted = sortImports(imports);

    console.log(
      "Original order:",
      imports.map((i) => i.name)
    );
    console.log(
      "Sorted order:",
      sorted.map((i) => i.name)
    );

    assert.deepStrictEqual(
      sorted.map((i) => i.originalText),
      ["    ClassA,", "    ClassB,", "    ClassC"]
    );
  });

  // Test different types
  it("should sort different import types in correct order", () => {
    const imports: ImportStatement[] = [
      {
        type: "constant",
        name: "CONSTANT_B",
        originalText: "use const ProjectCONSTANT_B;",
      },
      { type: "class", name: "ClassA", originalText: "use ProjectClassA;" },
      {
        type: "function",
        name: "functionA",
        originalText: "use function ProjectfunctionA;",
      },
      { type: "class", name: "ClassB", originalText: "use ProjectClassB;" },
      {
        type: "constant",
        name: "CONSTANT_A",
        originalText: "use const ProjectCONSTANT_A;",
      },
      {
        type: "function",
        name: "functionB",
        originalText: "use function ProjectfunctionB;",
      },
    ];

    const sorted = sortImports(imports);

    console.log(
      "Original order:",
      imports.map((i) => `${i.type}:${i.name}`)
    );
    console.log(
      "Sorted order:",
      sorted.map((i) => `${i.type}:${i.name}`)
    );

    assert.deepStrictEqual(
      sorted.map((i) => i.originalText),
      [
        "use ProjectClassA;",
        "use ProjectClassB;",
        "use function ProjectfunctionA;",
        "use function ProjectfunctionB;",
        "use const ProjectCONSTANT_A;",
        "use const ProjectCONSTANT_B;",
      ]
    );
  });
});
