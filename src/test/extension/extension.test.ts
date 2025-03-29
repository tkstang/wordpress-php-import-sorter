import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import { ImportSorter } from "../../importSorter";

suite("Extension Test Suite", function () {
  // Increase timeout for all tests
  this.timeout(10000);

  let extension: vscode.Extension<any> | undefined;
  let workspaceDir: string;

  suiteSetup(async () => {
    // Create temporary workspace directory
    workspaceDir = fs.mkdtempSync(path.join(os.tmpdir(), "wp-import-sorter-"));

    // Get the extension
    extension = vscode.extensions.getExtension(
      "tkstang.wordpress-php-import-sorter"
    );
    if (!extension) {
      // Try without publisher as a fallback for local development
      extension = vscode.extensions.getExtension("wordpress-php-import-sorter");
      if (!extension) {
        throw new Error(
          "Extension not found. Make sure the extension is properly loaded."
        );
      }
    }

    // Wait for extension to activate
    if (!extension.isActive) {
      await extension.activate();
    }

    // Wait for the extension to be ready by checking for the command
    let attempts = 0;
    while (attempts < 10) {
      const commands = await vscode.commands.getCommands(true);
      if (commands.includes("wordpress-php-import-sorter.sortImports")) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }
  });

  suiteTeardown(async () => {
    try {
      fs.rmSync(workspaceDir, { recursive: true, force: true });
    } catch (e) {
      console.warn("Failed to delete temporary workspace:", e);
    }
  });

  test("Command is registered", async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(
      commands.includes("wordpress-php-import-sorter.sortImports"),
      "Command 'wordpress-php-import-sorter.sortImports' not found in: " +
        commands.join(", ")
    );
  });

  test("Sort imports command works", async () => {
    // Create a new PHP file in the workspace
    const filePath = path.join(workspaceDir, "test.php");
    fs.writeFileSync(
      filePath,
      `
namespace Project;

use ProjectClassB;
use ProjectClassA;
use ProjectClassC;

// Rest of the code
`
    );

    // Open the file
    const document = await vscode.workspace.openTextDocument(filePath);
    const editor = await vscode.window.showTextDocument(document);

    // Run the command
    await vscode.commands.executeCommand(
      "wordpress-php-import-sorter.sortImports"
    );

    // Get the result
    const text = editor.document.getText();
    const expected = `
namespace Project;

use ProjectClassA;
use ProjectClassB;
use ProjectClassC;

// Rest of the code
`;
    assert.strictEqual(text, expected);

    // Clean up
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
    fs.unlinkSync(filePath);
  });

  test("Format on save works when enabled", async function () {
    // Increase timeout for this specific test
    this.timeout(15000);

    let document: vscode.TextDocument | undefined;
    const testFile = path.join(workspaceDir, "format-test.php");
    const testFileUri = vscode.Uri.file(testFile);

    try {
      // Enable format on save
      await vscode.workspace
        .getConfiguration("wordpress-php-import-sorter")
        .update("formatOnSave", true, vscode.ConfigurationTarget.Global);

      // Create the test file
      const initialContent = Buffer.from(`<?php
namespace Project;

use ProjectClassB;
use ProjectClassA;
use ProjectClassC;

// Rest of the code
`);
      await vscode.workspace.fs.writeFile(testFileUri, initialContent);

      // Open the file
      document = await vscode.workspace.openTextDocument(testFileUri);
      await vscode.window.showTextDocument(document);

      // Verify initial state has unsorted imports
      assert.ok(
        document.getText().includes("use ProjectClassB;\nuse ProjectClassA;"),
        "Initial imports should be unsorted"
      );

      // Create a promise that resolves when the document is saved
      const savePromise = new Promise<void>((resolve) => {
        const disposable = vscode.workspace.onDidSaveTextDocument((doc) => {
          if (doc.uri.fsPath === testFile) {
            disposable.dispose();
            resolve();
          }
        });
      });

      // Trigger save using VS Code's command
      await vscode.commands.executeCommand("workbench.action.files.save");
      await savePromise;

      // Get the final result
      const finalText = document.getText();
      const expected = `<?php
namespace Project;

use ProjectClassA;
use ProjectClassB;
use ProjectClassC;

// Rest of the code
`;
      assert.strictEqual(
        finalText,
        expected,
        "Imports should be sorted after save"
      );
    } finally {
      // Clean up
      if (document) {
        await vscode.commands.executeCommand(
          "workbench.action.closeActiveEditor"
        );
      }
      try {
        await vscode.workspace.fs.delete(testFileUri);
      } catch (e) {
        console.warn("Failed to delete test file:", e);
      }
      // Reset format on save setting
      await vscode.workspace
        .getConfiguration("wordpress-php-import-sorter")
        .update("formatOnSave", undefined, vscode.ConfigurationTarget.Global);
    }
  });
});
