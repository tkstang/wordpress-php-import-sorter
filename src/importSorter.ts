export interface ImportStatement {
  type: "class" | "function" | "constant";
  name: string;
  alias?: string;
  originalText: string;
  position: {
    start: number;
    end: number;
  };
}

export class ImportSorter {
  // Match use statements with optional type (const/function) and optional alias
  private static readonly USE_STATEMENT_REGEX =
    /^use\s+((?:const|function)\s+)?([\\a-zA-Z0-9_]+)(?:\s+as\s+([a-zA-Z0-9_]+))?;?/m;

  private static readonly NAMESPACE_REGEX = /^namespace\s+[^;]+;?\s*$/m;

  private static findImports(content: string): ImportStatement[] {
    const imports: ImportStatement[] = [];
    const lines = content.split("\n");
    let position = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = this.USE_STATEMENT_REGEX.exec(line);

      if (match) {
        const [fullMatch, typePrefix, name, alias] = match;
        const type =
          typePrefix?.trim() === "const"
            ? "constant"
            : typePrefix?.trim() === "function"
            ? "function"
            : "class";

        imports.push({
          type,
          name,
          alias,
          originalText: fullMatch,
          position: {
            start: position,
            end: position + fullMatch.length,
          },
        });
      }
      position += line.length + 1; // +1 for newline
    }

    return imports;
  }

  private static sortImports(imports: ImportStatement[]): ImportStatement[] {
    const typeOrder: ImportStatement["type"][] = [
      "class",
      "function",
      "constant",
    ];
    return [...imports].sort((a, b) => {
      // First, sort by type
      const typeOrderA = typeOrder.indexOf(a.type);
      const typeOrderB = typeOrder.indexOf(b.type);
      if (typeOrderA !== typeOrderB) {
        return typeOrderA - typeOrderB;
      }

      // Then sort by namespace depth (shorter paths come first)
      const aDepth = a.name.split("\\").length;
      const bDepth = b.name.split("\\").length;
      if (aDepth !== bDepth) {
        return aDepth - bDepth;
      }

      // Finally, sort alphabetically
      return a.name.localeCompare(b.name);
    });
  }

  public static sortImportsInCode(content: string): string {
    try {
      // Find all imports
      const imports = this.findImports(content);
      if (imports.length === 0) {
        return content;
      }

      // Sort the imports
      const sortedImports = this.sortImports(imports);

      // Build the result
      const parts: string[] = [];

      // Add everything before the first import
      const startPos = Math.min(...imports.map((imp) => imp.position.start));
      const beforeImports = content.substring(0, startPos);

      // Check if there's a namespace declaration
      const hasNamespace = this.NAMESPACE_REGEX.test(beforeImports);

      // Handle the content before imports
      if (beforeImports.trim()) {
        parts.push(beforeImports.trimRight() + "\n");
      } else {
        parts.push("");
      }

      // Add sorted imports with proper grouping
      let currentType: ImportStatement["type"] | null = null;
      sortedImports.forEach((importStmt, index) => {
        // Add newline between different types
        if (currentType !== importStmt.type) {
          if (currentType !== null) {
            parts.push("");
          }
          currentType = importStmt.type;
        }

        // Add the import statement, ensuring it ends with a semicolon
        const importText = importStmt.originalText.trimRight();
        parts.push(importText.endsWith(";") ? importText : importText + ";");
      });

      // Add everything after the last import
      const endPos = Math.max(...imports.map((imp) => imp.position.end));
      const afterImports = content.substring(endPos);
      parts.push("");
      parts.push(afterImports.trimLeft());

      return parts.join("\n");
    } catch (error) {
      console.error("Error sorting imports:", error);
      return content;
    }
  }
}
