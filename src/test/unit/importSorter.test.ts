import { ImportSorter } from "../../importSorter";
import { describe, it } from "mocha";
import assert from "assert";

describe("ImportSorter", () => {
  it("should sort basic imports alphabetically (without backslashes)", () => {
    const input = `
namespace Project;

use ProjectClassB;
use ProjectClassA;
use ProjectClassC;

// Rest of the code
`;

    const expected = `
namespace Project;

use ProjectClassA;
use ProjectClassB;
use ProjectClassC;

// Rest of the code
`;

    const result = ImportSorter.sortImportsInCode(input);
    assert.strictEqual(result, expected);
  });

  it("should sort basic imports alphabetically (with backslashes)", () => {
    const input = `
namespace Project;

use Project\\ClassB;
use Project\\ClassA;
use Project\\ClassC;

// Rest of the code
`;

    const expected = `
namespace Project;

use Project\\ClassA;
use Project\\ClassB;
use Project\\ClassC;

// Rest of the code
`;

    const result = ImportSorter.sortImportsInCode(input);
    assert.strictEqual(result, expected);
  });

  it("should sort different import types in correct order (without backslashes)", () => {
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

    const expected = `
namespace Project;

use ProjectClassA;
use ProjectClassB;

use function Project\\functionA;
use function Project\\functionB;

use const ProjectCONSTANT_A;
use const ProjectCONSTANT_B;

// Rest of the code
`;

    const result = ImportSorter.sortImportsInCode(input);
    assert.strictEqual(result, expected);
  });

  it("should sort different import types in correct order (with backslashes)", () => {
    const input = `
namespace Project;

use const Project\\CONSTANT_B;
use Project\\ClassA;
use function Project\\functionA;
use Project\\ClassB;
use const Project\\CONSTANT_A;
use function Project\\functionB;

// Rest of the code
`;

    const expected = `
namespace Project;

use Project\\ClassA;
use Project\\ClassB;

use function Project\\functionA;
use function Project\\functionB;

use const Project\\CONSTANT_A;
use const Project\\CONSTANT_B;

// Rest of the code
`;

    const result = ImportSorter.sortImportsInCode(input);
    assert.strictEqual(result, expected);
  });

  it("should handle aliases (without backslashes)", () => {
    const input = `
namespace Project;

use ProjectClassB as B;
use ProjectClassA as A;
use ProjectClassC as C;

// Rest of the code
`;

    const expected = `
namespace Project;

use ProjectClassA as A;
use ProjectClassB as B;
use ProjectClassC as C;

// Rest of the code
`;

    const result = ImportSorter.sortImportsInCode(input);
    assert.strictEqual(result, expected);
  });

  it("should handle aliases (with backslashes)", () => {
    const input = `
namespace Project;

use Project\\ClassB as B;
use Project\\ClassA as A;
use Project\\ClassC as C;

// Rest of the code
`;

    const expected = `
namespace Project;

use Project\\ClassA as A;
use Project\\ClassB as B;
use Project\\ClassC as C;

// Rest of the code
`;

    const result = ImportSorter.sortImportsInCode(input);
    assert.strictEqual(result, expected);
  });

  it("should handle files without namespace (without backslashes)", () => {
    const input = `
use ProjectClassB;
use ProjectClassA;
use ProjectClassC;

// Rest of the code
`;

    const expected = `
use ProjectClassA;
use ProjectClassB;
use ProjectClassC;

// Rest of the code
`;

    const result = ImportSorter.sortImportsInCode(input);
    assert.strictEqual(result, expected);
  });

  it("should handle files without namespace (with backslashes)", () => {
    const input = `
use Project\\ClassB;
use Project\\ClassA;
use Project\\ClassC;

// Rest of the code
`;

    const expected = `
use Project\\ClassA;
use Project\\ClassB;
use Project\\ClassC;

// Rest of the code
`;

    const result = ImportSorter.sortImportsInCode(input);
    assert.strictEqual(result, expected);
  });

  it("should handle mixed namespace types", () => {
    const input = `
namespace Project;

use Project\\SubNamespace\\ClassB;
use Project\\ClassA;
use function Project\\SubNamespace\\functionA;
use function Project\\functionB;
use const Project\\SubNamespace\\CONSTANT_B;
use const Project\\CONSTANT_A;

// Rest of the code
`;

    const expected = `
namespace Project;

use Project\\ClassA;
use Project\\SubNamespace\\ClassB;

use function Project\\functionB;
use function Project\\SubNamespace\\functionA;

use const Project\\CONSTANT_A;
use const Project\\SubNamespace\\CONSTANT_B;

// Rest of the code
`;

    const result = ImportSorter.sortImportsInCode(input);
    assert.strictEqual(result, expected);
  });

  it("should handle deeply nested namespaces", () => {
    const input = `
namespace Project\\SubNamespace\\Deep;

use Project\\SubNamespace\\Deep\\Deeper\\ClassB;
use Project\\SubNamespace\\ClassA;
use Project\\ClassC;
use function Project\\SubNamespace\\Deep\\Deeper\\functionA;
use function Project\\SubNamespace\\functionB;
use function Project\\functionC;
use const Project\\SubNamespace\\Deep\\Deeper\\CONSTANT_B;
use const Project\\SubNamespace\\CONSTANT_A;
use const Project\\CONSTANT_C;

// Rest of the code
`;

    const expected = `
namespace Project\\SubNamespace\\Deep;

use Project\\ClassC;
use Project\\SubNamespace\\ClassA;
use Project\\SubNamespace\\Deep\\Deeper\\ClassB;

use function Project\\functionC;
use function Project\\SubNamespace\\functionB;
use function Project\\SubNamespace\\Deep\\Deeper\\functionA;

use const Project\\CONSTANT_C;
use const Project\\SubNamespace\\CONSTANT_A;
use const Project\\SubNamespace\\Deep\\Deeper\\CONSTANT_B;

// Rest of the code
`;

    const result = ImportSorter.sortImportsInCode(input);
    assert.strictEqual(result, expected);
  });

  it("should handle files without imports", () => {
    const input = `
namespace Project;

class MyClass {
    // Class code
}
`;

    const result = ImportSorter.sortImportsInCode(input);
    assert.strictEqual(result, input);
  });

  it("should handle malformed PHP files gracefully", () => {
    const input = `
namespace Project

use Project\\ClassB
use Project\\ClassA;
use Project\\ClassC;

// Rest of the code
`;

    const expected = `
namespace Project

use Project\\ClassA;
use Project\\ClassB;
use Project\\ClassC;

// Rest of the code
`;

    const result = ImportSorter.sortImportsInCode(input);
    assert.strictEqual(result, expected);
  });
});
