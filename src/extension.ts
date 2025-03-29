// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ImportSorter } from "./importSorter";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "wordpress-php-import-sorter" is now active!'
  );

  // Register the sort imports command
  const disposable = vscode.commands.registerCommand(
    "wordpress-php-import-sorter.sortImports",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== "php") {
        vscode.window.showInformationMessage(
          "Please open a PHP file to sort imports."
        );
        return;
      }

      const document = editor.document;
      const text = document.getText();
      const sortedText = ImportSorter.sortImportsInCode(text);

      // Create a workspace edit
      const edit = new vscode.WorkspaceEdit();
      edit.replace(
        document.uri,
        new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(
            document.lineCount - 1,
            document.lineAt(document.lineCount - 1).text.length
          )
        ),
        sortedText
      );

      // Apply the edit
      await vscode.workspace.applyEdit(edit);
    }
  );

  // Add command registration to subscriptions immediately
  context.subscriptions.push(disposable);

  // Function to handle format on save
  let saveHandler: vscode.Disposable | undefined;

  function updateFormattingProvider() {
    // Remove existing handler if any
    if (saveHandler) {
      saveHandler.dispose();
      saveHandler = undefined;
    }

    // Get current configuration
    const config = vscode.workspace.getConfiguration(
      "wordpress-php-import-sorter"
    );
    const formatOnSave = config.get<boolean>("formatOnSave");

    // Register save handler if enabled
    if (formatOnSave) {
      console.log("Registering PHP import formatter for save");
      saveHandler = vscode.workspace.onWillSaveTextDocument((event) => {
        if (event.document.languageId === "php") {
          const text = event.document.getText();
          const sortedText = ImportSorter.sortImportsInCode(text);

          if (sortedText !== text) {
            const fullRange = new vscode.Range(
              new vscode.Position(0, 0),
              new vscode.Position(
                event.document.lineCount - 1,
                event.document.lineAt(event.document.lineCount - 1).text.length
              )
            );

            // Create a TextEdit for the save operation
            const edit = new vscode.TextEdit(fullRange, sortedText);
            event.waitUntil(Promise.resolve([edit]));
          }
        }
      });
      context.subscriptions.push(saveHandler);
    }
  }

  // Initial setup
  updateFormattingProvider();

  // Listen for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("wordpress-php-import-sorter.formatOnSave")) {
        console.log("Format on save configuration changed");
        updateFormattingProvider();
      }
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
